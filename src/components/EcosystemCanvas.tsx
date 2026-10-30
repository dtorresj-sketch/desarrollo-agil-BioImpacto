import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Factory, 
  Droplet, 
  Fish, 
  Sliders,
  Play,
  Pause,
  RotateCcw,
  User,
  Stethoscope,
  Radio
} from 'lucide-react';
import { ContaminantProfile, FishEntity, Particle, SimPhase } from '../types';
import { soundFX } from '../utils/audio';
import {
  calculateWaterConcentration,
  eliminationConstantFromHalfLife,
  stepFirstOrderKinetics,
  calculateBCF,
  DEFAULT_BACKGROUND_PPM,
} from '../utils/mathModels';

/**
 * Escala pedagógica: 1 segundo de animación equivale a este número de días
 * simulados. Sin ella, la cinética real (semividas de días a décadas) sería
 * invisible en pantalla.
 */
const SIM_DAYS_PER_SECOND = 3;

interface EcosystemCanvasProps {
  contaminant: ContaminantProfile;
  dischargeRateKgDay: number;
  filtrationEfficiency: number;
  phase: SimPhase;
  onFeedHuman: (amountPpm: number) => void;
  onFishPpmUpdate: (smallFishPpm: number, largeFishPpm: number, waterPpm: number) => void;
  onSelectFishToInspect: (fish: FishEntity) => void;
  // Optional expanded controls for all-in-one grouped interaction
  onDischargeRateChange?: (val: number) => void;
  onFiltrationEfficiencyChange?: (val: number) => void;
  fishPortionsPerWeek?: number;
  onFishPortionsChange?: (val: number) => void;
  humanWeightKg?: number;
  onHumanWeightChange?: (val: number) => void;
  exposureMonths?: number;
  onExposureMonthsChange?: (val: number) => void;
  humanAccumulatedDoseMg?: number;
  humanTissueConcentrationPpm?: number;
  fishConsumedCount?: number;
  onNavigateToHumanAnatomy?: () => void;
}

export const EcosystemCanvas: React.FC<EcosystemCanvasProps> = ({
  contaminant,
  dischargeRateKgDay,
  filtrationEfficiency,
  phase,
  onFeedHuman,
  onFishPpmUpdate,
  onSelectFishToInspect,
  onDischargeRateChange,
  onFiltrationEfficiencyChange,
  fishPortionsPerWeek = 4,
  onFishPortionsChange,
  humanWeightKg = 70,
  onHumanWeightChange,
  exposureMonths = 6,
  onExposureMonthsChange,
  humanAccumulatedDoseMg = 0,
  humanTissueConcentrationPpm = 0,
  fishConsumedCount = 0,
  onNavigateToHumanAnatomy
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isDischarging, setIsDischarging] = useState(false);
  const [isFishing, setIsFishing] = useState(false);
  const [hookedFish, setHookedFish] = useState<FishEntity | null>(null);
  const [draggedFish, setDraggedFish] = useState<FishEntity | null>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [showWaterProbe, setShowWaterProbe] = useState(false);
  const [probeCoords, setProbeCoords] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'industry' | 'river' | 'fish' | 'human'>('all');
  const [lastCaughtPpm, setLastCaughtPpm] = useState<number | null>(null);

  // Entities stored in refs for 60fps canvas loop
  const particlesRef = useRef<Particle[]>([]);
  const smokeParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }[]>([]);
  const planktonRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; glow: number }[]>([]);
  
  const fishListRef = useRef<FishEntity[]>([
    {
      id: 'fish-large-1',
      type: 'large',
      name: 'Trucha Fario / Salmo trutta (PEST)',
      x: 460,
      y: 290,
      targetX: 430,
      targetY: 280,
      vx: 0.9,
      vy: 0.15,
      size: 64, // Big realistic trout
      contaminationPpm: 0.045,
      maxHealthyPpm: 0.08,
      digestionTimer: 0,
      color: '#84cc16',
      tailAngle: 0,
      tailSpeed: 0.12,
      direction: -1
    },
    {
      id: 'fish-small-1',
      type: 'small',
      name: 'Alevín / Sardina Fluvial (Presa 1)',
      x: 280,
      y: 250,
      targetX: 300,
      targetY: 230,
      vx: 1.4,
      vy: 0.2,
      size: 24,
      contaminationPpm: 0.015,
      maxHealthyPpm: 0.05,
      digestionTimer: 0,
      color: '#38bdf8',
      tailAngle: 0,
      tailSpeed: 0.18,
      direction: 1
    },
    {
      id: 'fish-small-2',
      type: 'small',
      name: 'Alevín de Río (Presa 2)',
      x: 350,
      y: 350,
      targetX: 360,
      targetY: 340,
      vx: -1.2,
      vy: -0.15,
      size: 22,
      contaminationPpm: 0.012,
      maxHealthyPpm: 0.05,
      digestionTimer: 0,
      color: '#38bdf8',
      tailAngle: 0,
      tailSpeed: 0.2,
      direction: -1
    }
  ]);

  const waterToxicityPpmRef = useRef(DEFAULT_BACKGROUND_PPM);
  const lastPpmSyncRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  // Espejo en estado de la lectura del agua: los `ref` no re-renderizan, así que
  // leerlos directamente en el JSX mostraba valores congelados.
  const [waterPpmDisplay, setWaterPpmDisplay] = useState<number>(DEFAULT_BACKGROUND_PPM);

  // Safe round rect helper for universal browser and canvas compatibility
  const drawSafeRoundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (typeof c.roundRect === 'function') {
      c.beginPath();
      c.roundRect(x, y, w, h, r);
    } else {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }
  };

  // Initialize lively phytoplankton and baseline particles on mount so the canvas is immediately alive
  useEffect(() => {
    if (particlesRef.current.length === 0) {
      const initialParticles: Particle[] = [];
      for (let i = 0; i < 28; i++) {
        initialParticles.push({
          id: Math.random(),
          x: 200 + Math.random() * 420,
          y: 190 + Math.random() * 230,
          vx: 0.6 + Math.random() * 1.5,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 3.0 + Math.random() * 3.5,
          life: Math.floor(Math.random() * 300),
          maxLife: 700 + Math.random() * 400,
          alpha: 0.9,
          absorbed: false
        });
      }
      particlesRef.current = initialParticles;
    }

    if (planktonRef.current.length === 0) {
      const initialPlankton: { x: number; y: number; vx: number; vy: number; size: number; glow: number }[] = [];
      for (let k = 0; k < 35; k++) {
        initialPlankton.push({
          x: 180 + Math.random() * 520,
          y: 200 + Math.random() * 250,
          vx: 0.2 + Math.random() * 0.5,
          vy: (Math.random() - 0.5) * 0.2,
          size: 1.5 + Math.random() * 2.2,
          glow: Math.random()
        });
      }
      planktonRef.current = initialPlankton;
    }
  }, []);

  // Reset ecosystem to pristine baseline
  const handleResetEcosystem = useCallback(() => {
    soundFX.playClick();
    particlesRef.current = [];
    waterToxicityPpmRef.current = DEFAULT_BACKGROUND_PPM;
    setWaterPpmDisplay(DEFAULT_BACKGROUND_PPM);
    fishListRef.current.forEach(f => {
      f.contaminationPpm = calculateBCF(
        DEFAULT_BACKGROUND_PPM,
        f.type === 'large' ? contaminant.bcfSmallFish * contaminant.bmfPredator : contaminant.bcfSmallFish,
      );
      f.x = f.type === 'large' ? 440 : (f.id === 'fish-small-1' ? 280 : 350);
      f.y = f.type === 'large' ? 290 : (f.id === 'fish-small-1' ? 250 : 350);
    });
    setLastCaughtPpm(null);
  }, [contaminant.bcfSmallFish, contaminant.bmfPredator]);

  // Trigger burst of contaminant particles from the metallurgical discharge pipe
  const emitContaminantBurst = useCallback((count: number = 24) => {
    setIsDischarging(true);
    soundFX.playDischarge();
    soundFX.playSplash();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Filter reduces particles
    const effectiveCount = Math.max(4, Math.round(count * (1 - filtrationEfficiency / 100)));
    const pipeX = 180;
    const pipeY = canvas.height * 0.44;

    const newParticles: Particle[] = [];
    for (let i = 0; i < effectiveCount; i++) {
      const angle = (Math.random() * 0.7 - 0.15) * Math.PI; // Eject right and downwards into water
      const speed = 2.0 + Math.random() * 3.5;
      newParticles.push({
        id: Math.random(),
        x: pipeX + (Math.random() * 12 - 6),
        y: pipeY + (Math.random() * 10 - 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 + 0.3,
        radius: 3.5 + Math.random() * 4,
        life: 0,
        maxLife: 700 + Math.random() * 400,
        alpha: 0.95,
        absorbed: false
      });
    }

    particlesRef.current.push(...newParticles);
    // La concentración en agua ya no se acumula sin límite en cada pulso: el
    // bucle de simulación la relaja hacia el valor de balance de masa
    // C = E(1-eta)/Q + C_fondo. Aquí sólo se emiten las partículas visuales.

    setTimeout(() => {
      setIsDischarging(false);
    }, 900);
  }, [filtrationEfficiency]);

  // Hook & catch the trout with the fisherman's rod
  const handleCatchFishAction = useCallback(() => {
    if (isFishing) return;
    setIsFishing(true);
    soundFX.playFishingReel();

    const trout = fishListRef.current.find(f => f.type === 'large') || fishListRef.current[0];
    if (!trout) return;

    setHookedFish(trout);
    const caughtPpm = trout.contaminationPpm || 0.12;
    setLastCaughtPpm(caughtPpm);

    // Fishing line animation
    setTimeout(() => {
      soundFX.playSplash();
      soundFX.playHumanConsume();
      onFeedHuman(caughtPpm);

      // Reset trout contamination or reduce it after being caught, spawn refreshed trout
      trout.contaminationPpm = Math.max(0.01, trout.contaminationPpm * 0.3);
      trout.x = 320;
      trout.y = 300;

      setIsFishing(false);
      setHookedFish(null);
    }, 1200);
  }, [isFishing, onFeedHuman]);

  // Handle phase step triggers
  useEffect(() => {
    if (phase === 2) {
      emitContaminantBurst(28);
    }
  }, [phase, emitContaminantBurst]);

  // 60FPS Main Simulation & Environmental Renderer
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = rect.width > 0 ? rect.width : (typeof window !== 'undefined' ? Math.min(1200, window.innerWidth - 32) : 900);
      const displayHeight = 490;
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let time = 0;

    const render = (frameTime?: number) => {
      // --- Paso temporal real (delta-time) ---------------------------------
      // Antes todo avanzaba "por fotograma": la simulación corría al doble de
      // velocidad en pantallas de 120 Hz. Ahora el paso se mide en segundos.
      const now = frameTime ?? performance.now();
      const rawDt = lastFrameTimeRef.current ? (now - lastFrameTimeRef.current) / 1000 : 1 / 60;
      lastFrameTimeRef.current = now;
      // Se acota para que un cambio de pestaña no produzca un salto enorme.
      const dtSeconds = isPlaying ? Math.min(0.05, Math.max(0, rawDt)) * simSpeed : 0;
      const dtDays = dtSeconds * SIM_DAYS_PER_SECOND;
      // Factor de normalización: 1.0 a 60 fps, para conservar el "tacto" del
      // movimiento original sin depender de la tasa de refresco.
      const motion = dtSeconds * 60;

      if (isPlaying) {
        time += 1.5 * dtSeconds;
      }

      // --- Modelo ambiental -------------------------------------------------
      // Objetivo estacionario según balance de masa del efluente.
      const targetWaterPpm = calculateWaterConcentration({
        dischargeKgDay: dischargeRateKgDay,
        filtrationEfficiencyPct: filtrationEfficiency,
      });
      if (dtDays > 0) {
        // Relajación de primer orden del cuerpo de agua hacia el estacionario
        // (tiempo de residencia hidráulico ~2 días).
        const kWater = Math.LN2 / 2;
        waterToxicityPpmRef.current = stepFirstOrderKinetics(
          waterToxicityPpmRef.current,
          targetWaterPpm * kWater,
          kWater,
          dtDays,
        );
      }
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // Boundaries of landscape layout
      const leftBankWidth = Math.min(220, width * 0.22);
      const rightPierWidth = Math.min(220, width * 0.24);
      const riverLeft = leftBankWidth;
      const riverRight = width - rightPierWidth;
      const waterSurfaceY = height * 0.38; // Split-level waterline (approx 38% from top)

      // =========================================================================
      // 1. SKY & DISTANT MOUNTAINS BACKGROUND (Top)
      // =========================================================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, waterSurfaceY);
      skyGrad.addColorStop(0, '#334155'); // Overcast stormy grey
      skyGrad.addColorStop(0.5, '#475569');
      skyGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, waterSurfaceY);

      // Distant mountain silhouettes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, waterSurfaceY * 0.7);
      ctx.lineTo(width * 0.15, waterSurfaceY * 0.45);
      ctx.lineTo(width * 0.35, waterSurfaceY * 0.65);
      ctx.lineTo(width * 0.55, waterSurfaceY * 0.4);
      ctx.lineTo(width * 0.8, waterSurfaceY * 0.6);
      ctx.lineTo(width, waterSurfaceY * 0.48);
      ctx.lineTo(width, waterSurfaceY);
      ctx.lineTo(0, waterSurfaceY);
      ctx.closePath();
      ctx.fill();

      // Industrial haze layer
      ctx.fillStyle = 'rgba(203, 213, 225, 0.12)';
      ctx.fillRect(0, 0, width, waterSurfaceY);

      // =========================================================================
      // 2. UNDERWATER ENVIRONMENT (Below Waterline) - Cross-Section View
      // =========================================================================
      const waterGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, height);
      waterGrad.addColorStop(0, '#0c2238'); // Surface murky turquoise-grey
      waterGrad.addColorStop(0.3, '#081a2d');
      waterGrad.addColorStop(0.7, '#04101e');
      waterGrad.addColorStop(1, '#02060c'); // Deep dark sediment floor
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterSurfaceY, width, height - waterSurfaceY);

      // Underwater Light Caustics / Sun Rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 5; i++) {
        const rayX = riverLeft + 80 + i * 110 + Math.sin(time * 0.8 + i) * 25;
        const rayGrad = ctx.createLinearGradient(rayX, waterSurfaceY, rayX + 70, height);
        rayGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        rayGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.02)');
        rayGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(rayX, waterSurfaceY);
        ctx.lineTo(rayX + 35, waterSurfaceY);
        ctx.lineTo(rayX + 130, height - 30);
        ctx.lineTo(rayX + 50, height - 30);
        ctx.closePath();
        ctx.fillStyle = rayGrad;
        ctx.fill();
      }
      ctx.restore();

      // Murky suspended organic silt & detritus particles
      ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
      for (let s = 0; s < 25; s++) {
        const sx = riverLeft + ((s * 37 + time * 15) % (riverRight - riverLeft));
        const sy = waterSurfaceY + 20 + ((s * 23 + time * 8) % (height - waterSurfaceY - 60));
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (s % 3) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Microscopic Phytoplankton / Zooplankton drifting & pulsing
      const planktons = planktonRef.current;
      ctx.fillStyle = 'rgba(74, 222, 128, 0.45)';
      planktons.forEach(pk => {
        if (isPlaying) {
          pk.x += pk.vx * simSpeed;
          pk.y += Math.sin(time * 2 + pk.x * 0.01) * 0.2 * simSpeed;
          if (pk.x > riverRight - 20) pk.x = riverLeft + 20;
        }
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, pk.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Riverbed Sediment, Mossy Rocks, and Submerged Organic Debris (Bottom)
      const bedY = height - 45;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, bedY - 10);
      for (let x = 0; x <= width; x += 30) {
        const bump = Math.sin(x * 0.04) * 8 + Math.cos(x * 0.09) * 5;
        ctx.lineTo(x, bedY + bump);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Riverbed submerged stones and moss
      for (let b = 0; b < 9; b++) {
        const rockX = riverLeft + 40 + b * 75 + (b % 2) * 15;
        const rockY = height - 35 + (b % 3) * 4;
        ctx.fillStyle = b % 2 === 0 ? '#1e293b' : '#334155';
        ctx.beginPath();
        ctx.ellipse(rockX, rockY, 28 + (b % 4) * 6, 14 + (b % 3) * 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Mossy top
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.ellipse(rockX, rockY - 5, 20 + (b % 4) * 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aquatic river weeds / Algae swaying in current
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let w = 0; w < 12; w++) {
        const weedX = riverLeft + 30 + w * 55;
        const weedBaseY = height - 30;
        const weedHeight = 45 + (w % 4) * 18;
        ctx.beginPath();
        ctx.moveTo(weedX, weedBaseY);
        const sway = Math.sin(time * 2 + w * 0.6) * 15;
        ctx.quadraticCurveTo(weedX + sway * 0.5, weedBaseY - weedHeight * 0.5, weedX + sway, weedBaseY - weedHeight);
        ctx.stroke();
      }

      // =========================================================================
      // 3. LEFT BANK & METALLURGICAL SMELTER COMPLEX (Background Left)
      // =========================================================================
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, waterSurfaceY - 40);
      ctx.lineTo(riverLeft - 10, waterSurfaceY + 25);
      ctx.lineTo(riverLeft + 15, waterSurfaceY + 60);
      ctx.lineTo(riverLeft - 30, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Factory Smelting Sheds & Infrastructure
      ctx.fillStyle = '#334155';
      ctx.fillRect(15, waterSurfaceY - 140, 150, 100);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(10, waterSurfaceY - 140);
      ctx.lineTo(90, waterSurfaceY - 180);
      ctx.lineTo(170, waterSurfaceY - 140);
      ctx.closePath();
      ctx.fill();

      // High Chimney Stacks
      const stacks = [
        { x: 45, y: waterSurfaceY - 140, h: 80, w: 14 },
        { x: 95, y: waterSurfaceY - 140, h: 105, w: 16 },
        { x: 135, y: waterSurfaceY - 140, h: 70, w: 12 }
      ];
      stacks.forEach(st => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(st.x, st.y - st.h, st.w, st.h);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(st.x, st.y - st.h, st.w, 10);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(st.x, st.y - st.h + 10, st.w, 8);
      });

      // Animated Industrial Smoke Puffing from Stacks
      if (isPlaying && Math.random() < 0.3 * simSpeed) {
        stacks.forEach((st) => {
          smokeParticlesRef.current.push({
            x: st.x + st.w * 0.5,
            y: st.y - st.h,
            vx: 0.4 + Math.random() * 0.8,
            vy: -0.8 - Math.random() * 0.9,
            size: 6 + Math.random() * 6,
            alpha: 0.6
          });
        });
      }

      // Update and render smoke
      for (let s = smokeParticlesRef.current.length - 1; s >= 0; s--) {
        const sm = smokeParticlesRef.current[s];
        if (isPlaying) {
          sm.x += sm.vx * simSpeed;
          sm.y += sm.vy * simSpeed;
          sm.size += 0.25 * simSpeed;
          sm.alpha -= 0.005 * simSpeed;
        }
        if (sm.alpha <= 0 || sm.y < 0) {
          smokeParticlesRef.current.splice(s, 1);
          continue;
        }
        ctx.fillStyle = `rgba(148, 163, 184, ${sm.alpha})`;
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Concrete / Steel Effluent Discharge Pipe (Tubo de vertido)
      const pipeX = riverLeft - 25;
      const pipeY = waterSurfaceY + 15;
      ctx.fillStyle = '#475569';
      ctx.fillRect(pipeX - 50, pipeY - 18, 55, 36);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pipeX + 3, pipeY - 22, 10, 44);

      // Dark sludge flowing out of pipe into river
      const sludgeGrad = ctx.createLinearGradient(pipeX, pipeY, pipeX + 50, pipeY + 25);
      sludgeGrad.addColorStop(0, contaminant.particleColor);
      sludgeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = sludgeGrad;
      ctx.beginPath();
      ctx.moveTo(pipeX + 5, pipeY - 12);
      ctx.lineTo(pipeX + 45, pipeY + 25);
      ctx.lineTo(pipeX + 25, pipeY + 38);
      ctx.lineTo(pipeX + 5, pipeY + 14);
      ctx.closePath();
      ctx.fill();

      // Foaming water churn at pipe entrance
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let f = 0; f < 6; f++) {
        const fx = pipeX + 25 + Math.sin(time * 6 + f) * 18;
        const fy = pipeY + 20 + Math.cos(time * 5 + f) * 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 4 + (f % 3) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // =========================================================================
      // 4. CONTINUOUS INDUSTRIAL DISCHARGE STREAM (Auto-Spawn when Playing)
      // =========================================================================
      if (isPlaying && Math.random() < 0.22 * (dischargeRateKgDay / 30) * simSpeed) {
        const angle = (Math.random() * 0.6 - 0.1) * Math.PI;
        const speed = (1.5 + Math.random() * 2.8) * simSpeed;
        particlesRef.current.push({
          id: Math.random(),
          x: pipeX + 15 + Math.random() * 8,
          y: pipeY + Math.random() * 8 - 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.5 + 0.2,
          radius: 3.2 + Math.random() * 3.5,
          life: 0,
          maxLife: 650 + Math.random() * 400,
          alpha: 0.9,
          absorbed: false
        });
      }

      // =========================================================================
      // 5. WATER SURFACE LINE & WAVES
      // =========================================================================
      ctx.beginPath();
      ctx.moveTo(0, waterSurfaceY);
      for (let x = 0; x <= width; x += 15) {
        const wave = Math.sin(time * 2.5 + x * 0.03) * 3 + Math.cos(time * 1.5 + x * 0.02) * 2;
        ctx.lineTo(x, waterSurfaceY + wave);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // =========================================================================
      // 6. TOXIC PARTICLES PHYSICS & DISPERSION
      // =========================================================================
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isPlaying) {
          p.life++;
          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;

          // Current flows to the right
          p.vx *= 0.994;
          p.vx += 0.018 * simSpeed;
          p.vy += Math.sin(time * 3 + p.x * 0.02) * 0.06 * simSpeed;
        }

        // Bounds check
        if (p.x > riverRight - 20 || p.y > height - 40 || p.y < waterSurfaceY + 10 || p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Draw glowing heavy metal ion particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = contaminant.particleColor;
        ctx.shadowColor = contaminant.color;
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.restore();
      }

      // Render Active Ripples / Sonar Sampling rings
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const rip = ripplesRef.current[r];
        if (isPlaying) {
          rip.radius += 2.0 * simSpeed;
          rip.alpha -= 0.02 * simSpeed;
        }
        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          ripplesRef.current.splice(r, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // 7. SWIMMING TROUT (PEST) & FISH ENTITIES (Underwater)
      // =========================================================================
      const fishList = fishListRef.current;
      let smallPpmSum = 0;
      let smallCount = 0;
      let largePpmSum = 0;
      let largeCount = 0;

      fishList.forEach((fish) => {
        if (!fish.isDragging && !isFishing && isPlaying) {
          // AI seeking nearest particle or roaming smoothly
          let closestParticle: Particle | null = null;
          let minDist = 160;

          particles.forEach((p) => {
            const dist = Math.hypot(p.x - fish.x, p.y - fish.y);
            if (dist < minDist) {
              minDist = dist;
              closestParticle = p;
            }
          });

          if (closestParticle) {
            const p = closestParticle as Particle;
            const angle = Math.atan2(p.y - fish.y, p.x - fish.x);
            fish.vx += Math.cos(angle) * 0.06 * simSpeed;
            fish.vy += Math.sin(angle) * 0.06 * simSpeed;
          } else {
            if (Math.hypot(fish.targetX - fish.x, fish.targetY - fish.y) < 35 || Math.random() < 0.012) {
              fish.targetX = riverLeft + 60 + Math.random() * (riverRight - riverLeft - 120);
              fish.targetY = waterSurfaceY + 45 + Math.random() * (height - waterSurfaceY - 95);
            }
            const angle = Math.atan2(fish.targetY - fish.y, fish.targetX - fish.x);
            fish.vx += Math.cos(angle) * 0.035 * simSpeed;
            fish.vy += Math.sin(angle) * 0.035 * simSpeed;
          }

          // Speed Clamp
          const maxSpd = (fish.type === 'small' ? 2.0 : 1.4) * simSpeed;
          const spd = Math.hypot(fish.vx, fish.vy);
          if (spd > maxSpd) {
            fish.vx = (fish.vx / spd) * maxSpd;
            fish.vy = (fish.vy / spd) * maxSpd;
          }

          fish.x += fish.vx;
          fish.y += fish.vy;

          // Water boundaries
          if (fish.x < riverLeft + 35) { fish.x = riverLeft + 35; fish.vx *= -1; }
          if (fish.x > riverRight - 45) { fish.x = riverRight - 45; fish.vx *= -1; }
          if (fish.y < waterSurfaceY + 30) { fish.y = waterSurfaceY + 30; fish.vy *= -1; }
          if (fish.y > height - 55) { fish.y = height - 55; fish.vy *= -1; }

          fish.direction = fish.vx >= 0 ? 1 : -1;
        }

        // Particle Ingestion
        for (let j = particles.length - 1; j >= 0; j--) {
          const p = particles[j];
          const mouthX = fish.x + (fish.direction * fish.size * 0.5);
          const mouthY = fish.y;
          const dist = Math.hypot(p.x - mouthX, p.y - mouthY);

          if (dist < fish.size * 0.45) {
            particles.splice(j, 1);
            // La partícula es un evento visual de ingesta: añade un pulso
            // proporcional a la carga real del agua, no una constante fija.
            fish.contaminationPpm += waterToxicityPpmRef.current * contaminant.bcfSmallFish * 0.02;
            soundFX.playFishEat(fish.contaminationPpm / (fish.maxHealthyPpm * 2));
          }
        }

        // --- Cinética del organismo (captación branquial + depuración) -----
        // C_eq = C_agua x BCF  para el pez pequeño; el depredador suma su BMF.
        // Se integra con la solución exacta del ODE de primer orden, de modo
        // que la contaminación ya no crece de forma monótona: si el agua se
        // limpia, el pez se depura según su semivida biológica.
        if (dtDays > 0) {
          const keFish = eliminationConstantFromHalfLife(contaminant.halfLifeFishDays);
          const equilibriumPpm =
            fish.type === 'small'
              ? calculateBCF(waterToxicityPpmRef.current, contaminant.bcfSmallFish)
              : calculateBCF(waterToxicityPpmRef.current, contaminant.bcfSmallFish) * contaminant.bmfPredator;
          fish.contaminationPpm = stepFirstOrderKinetics(
            fish.contaminationPpm,
            equilibriumPpm * keFish,
            keFish,
            dtDays,
          );
        }

        // Depredación visible: el trucha se acerca al pez pequeño y transfiere
        // carga. La biomagnificación de estado estacionario ya está en el
        // término de equilibrio anterior, así que aquí sólo se conserva masa.
        if (fish.type === 'large') {
          fishList.filter(f => f.type === 'small').forEach(smFish => {
            const dist = Math.hypot(smFish.x - fish.x, smFish.y - fish.y);
            if (dist < 40 && smFish.contaminationPpm > 0.005) {
              const transfer = smFish.contaminationPpm * 0.06 * motion;
              fish.contaminationPpm += transfer;
              smFish.contaminationPpm = Math.max(0.002, smFish.contaminationPpm - transfer);
            }
          });
        }

        if (fish.type === 'small') {
          smallPpmSum += fish.contaminationPpm;
          smallCount++;
        } else {
          largePpmSum += fish.contaminationPpm;
          largeCount++;
        }

        // =======================================================================
        // DRAW REALISTIC TROUT / FISH VECTOR
        // =======================================================================
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.direction, 1);

        fish.tailAngle = Math.sin(time * (fish.tailSpeed * 60)) * 0.38;

        if (fish.type === 'large') {
          // REALISTIC BROWN TROUT (Salmo trutta)
          const s = fish.size;

          // Fish Body
          const troutGrad = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.35);
          troutGrad.addColorStop(0, '#3f4c28'); // Dark olive back
          troutGrad.addColorStop(0.4, '#78622c'); // Brown-gold flank
          troutGrad.addColorStop(0.85, '#d4a359'); // Golden belly
          troutGrad.addColorStop(1, '#fef08a'); // Cream ventral

          ctx.fillStyle = troutGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 0.65, s * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();

          // Lateral line
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-s * 0.5, 0);
          ctx.quadraticCurveTo(0, s * 0.05, s * 0.45, 0);
          ctx.stroke();

          // Realistic Trout Spots (Black and red dots on flank)
          ctx.fillStyle = '#1c1917';
          [-s * 0.3, -s * 0.15, 0, s * 0.15, s * 0.25].forEach((sx, idx) => {
            ctx.beginPath();
            ctx.arc(sx, -s * 0.12 + (idx % 2) * 6, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx + 8, s * 0.04 - (idx % 2) * 4, 1.8, 0, Math.PI * 2);
            ctx.fill();
          });
          // Red halo spots
          ctx.fillStyle = '#dc2626';
          [-s * 0.2, s * 0.05, s * 0.2].forEach(rx => {
            ctx.beginPath();
            ctx.arc(rx, s * 0.02, 1.6, 0, Math.PI * 2);
            ctx.fill();
          });

          // Head & Operculum
          ctx.strokeStyle = '#292524';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(s * 0.25, 0, s * 0.28, -Math.PI * 0.4, Math.PI * 0.4);
          ctx.stroke();

          // Realistic Trout Eye
          const eyeX = s * 0.42;
          const eyeY = -s * 0.08;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, s * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eyeX + 0.5, eyeY, s * 0.045, 0, Math.PI * 2);
          ctx.fill();

          // Dorsal Fin
          ctx.fillStyle = '#4a5532';
          ctx.beginPath();
          ctx.moveTo(-s * 0.1, -s * 0.3);
          ctx.quadraticCurveTo(s * 0.05, -s * 0.55, s * 0.15, -s * 0.32);
          ctx.lineTo(-s * 0.1, -s * 0.3);
          ctx.closePath();
          ctx.fill();

          // Pectoral Fin
          ctx.fillStyle = 'rgba(217, 119, 6, 0.85)';
          ctx.beginPath();
          ctx.moveTo(s * 0.15, s * 0.15);
          ctx.lineTo(s * 0.02, s * 0.38);
          ctx.lineTo(s * 0.25, s * 0.25);
          ctx.closePath();
          ctx.fill();

          // Tail (Caudal Fin) oscillating
          ctx.save();
          ctx.translate(-s * 0.58, 0);
          ctx.rotate(fish.tailAngle);
          ctx.fillStyle = '#4a5532';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-s * 0.35, -s * 0.32);
          ctx.lineTo(-s * 0.22, 0);
          ctx.lineTo(-s * 0.35, s * 0.32);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

        } else {
          // Smaller Minnow / Prey fish
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(0, 0, fish.size * 0.6, fish.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fish.size * 0.35, -fish.size * 0.08, fish.size * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(fish.size * 0.36, -fish.size * 0.08, fish.size * 0.05, 0, Math.PI * 2);
          ctx.fill();

          // Tail
          ctx.save();
          ctx.translate(-fish.size * 0.55, 0);
          ctx.rotate(fish.tailAngle);
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-fish.size * 0.35, -fish.size * 0.25);
          ctx.lineTo(-fish.size * 0.2, 0);
          ctx.lineTo(-fish.size * 0.35, fish.size * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();

        // Live PPM Telemetry Floating Tag
        ctx.save();
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        const isCritical = fish.contaminationPpm > fish.maxHealthyPpm * 1.5;
        const tagBg = isCritical ? 'rgba(225, 29, 72, 0.9)' : 'rgba(15, 23, 42, 0.85)';
        const tagBorder = isCritical ? '#f43f5e' : '#38bdf8';
        
        ctx.fillStyle = tagBg;
        drawSafeRoundRect(ctx, fish.x - 38, fish.y - fish.size * 0.65 - 18, 76, 17, 4);
        ctx.fill();
        ctx.strokeStyle = tagBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`${fish.contaminationPpm.toFixed(3)} ppm`, fish.x, fish.y - fish.size * 0.65 - 6);
        ctx.restore();
      });

      // Synchronize PPM to parent state throttled to avoid infinite React re-render loops
      if (now - lastPpmSyncRef.current > 400) {
        lastPpmSyncRef.current = now;
        const avgSmallPpm = smallCount > 0 ? smallPpmSum / smallCount : 0;
        const avgLargePpm = largeCount > 0 ? largePpmSum / largeCount : 0;
        onFishPpmUpdate(avgSmallPpm, avgLargePpm, waterToxicityPpmRef.current);
        setWaterPpmDisplay(waterToxicityPpmRef.current);
      }

      // =========================================================================
      // 8. RIGHT BANK & WOODEN FISHING PIER WITH FISHERMAN (Foreground Right)
      // =========================================================================
      const pierX = riverRight;
      const pierDeckY = waterSurfaceY + 20;

      // Wooden Pilings
      [pierX + 15, pierX + 75, pierX + 145].forEach(px => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(px, pierDeckY - 10, 16, height - pierDeckY);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(px - 1, waterSurfaceY - 5, 18, 20);
      });

      // Wooden Dock Planks
      ctx.fillStyle = '#78350f';
      ctx.fillRect(pierX - 25, pierDeckY - 12, rightPierWidth + 30, 22);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      for (let p = pierX - 20; p < width; p += 25) {
        ctx.beginPath();
        ctx.moveTo(p, pierDeckY - 12);
        ctx.lineTo(p, pierDeckY + 10);
        ctx.stroke();
      }

      // Galvanized Fish Bucket on the Dock
      const bucketX = pierX + 35;
      const bucketY = pierDeckY - 45;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(bucketX - 14, bucketY);
      ctx.lineTo(bucketX + 14, bucketY);
      ctx.lineTo(bucketX + 10, bucketY + 32);
      ctx.lineTo(bucketX - 10, bucketY + 32);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fish tails sticking out of bucket
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(bucketX - 6, bucketY);
      ctx.lineTo(bucketX - 12, bucketY - 14);
      ctx.lineTo(bucketX - 2, bucketY - 8);
      ctx.closePath();
      ctx.fill();

      // =========================================================================
      // 9. THE ARTISANAL FISHERMAN WITH FISHING ROD
      // =========================================================================
      const manX = pierX + 95;
      const manY = pierDeckY - 12;

      // Rubber Fishing Boots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(manX - 14, manY - 32, 11, 32);
      ctx.fillRect(manX + 3, manY - 32, 11, 32);

      // Fisherman Coat
      ctx.fillStyle = '#334155';
      ctx.fillRect(manX - 18, manY - 95, 36, 65);

      // Fisherman Head, Profile & Peaked Cap
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(manX - 2, manY - 110, 12, 0, Math.PI * 2);
      ctx.fill();
      // Peaked Cap
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(manX - 2, manY - 118, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(manX - 16, manY - 120, 16, 4);

      // Fishing Rod extending out over the water
      const rodBaseX = manX - 10;
      const rodBaseY = manY - 70;
      const rodTipX = pierX - 85;
      const rodTipY = waterSurfaceY - 110;

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rodBaseX, rodBaseY);
      ctx.quadraticCurveTo(rodTipX + 40, rodTipY + 20, rodTipX, rodTipY);
      ctx.stroke();

      // Fishing Reel Mechanism
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(rodBaseX - 5, rodBaseY + 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // Fishing Line hanging from rod tip into the water
      const hookX = isFishing && hookedFish ? hookedFish.x : pierX - 85;
      const hookY = isFishing && hookedFish ? hookedFish.y - 15 : waterSurfaceY + 70;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rodTipX, rodTipY);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();

      // Fishing Hook & Lure
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hookX, hookY, 4, 0, Math.PI);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [contaminant, dischargeRateKgDay, filtrationEfficiency, onFishPpmUpdate, isFishing, hookedFish, isPlaying, simSpeed]);

  // Click on Canvas to trigger direct interactions on the diorama
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const leftBankWidth = Math.min(220, width * 0.22);
    const rightPierWidth = Math.min(220, width * 0.24);
    const riverLeft = leftBankWidth;
    const riverRight = width - rightPierWidth;
    const waterSurfaceY = height * 0.38;

    // 1. Click on Factory / Discharge Pipe
    if (clickX <= riverLeft + 25 && clickY >= waterSurfaceY - 140) {
      emitContaminantBurst(25);
      return;
    }

    // 2. Click on Fisherman / Pier
    if (clickX >= riverRight - 25) {
      handleCatchFishAction();
      return;
    }

    // 3. Click on Trout or Fish
    const trout = fishListRef.current[0];
    if (trout && Math.hypot(trout.x - clickX, trout.y - clickY) < trout.size * 1.4) {
      soundFX.playClick();
      onSelectFishToInspect(trout);
      return;
    }

    // 4. Click in River Water: Drop Sampling Sonar
    if (clickX > riverLeft && clickX < riverRight && clickY > waterSurfaceY) {
      soundFX.playSplash();
      setProbeCoords({ x: clickX, y: clickY });
      setShowWaterProbe(true);
      ripplesRef.current.push({ x: clickX, y: clickY, radius: 5, maxRadius: 45, alpha: 1 });
    }
  };

  // Pointer Drag-and-Drop Handling
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const fishList = fishListRef.current;
    for (const fish of fishList) {
      const dist = Math.hypot(fish.x - clickX, fish.y - clickY);
      if (dist < fish.size * 1.2) {
        fish.isDragging = true;
        setDraggedFish(fish);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggedFish || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    draggedFish.x = curX;
    draggedFish.y = curY;

    const isOver = curX > rect.width - 200;
    setIsOverDropZone(isOver);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedFish) {
      draggedFish.isDragging = false;
      if (isOverDropZone) {
        soundFX.playFishingReel();
        soundFX.playHumanConsume();
        onFeedHuman(draggedFish.contaminationPpm || 0.12);
        draggedFish.contaminationPpm = Math.max(0.01, (draggedFish.contaminationPpm || 0.05) * 0.3);
      }
      setDraggedFish(null);
      setIsOverDropZone(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none"
    >
      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR & TELEMETRY: Play/Pause, Manual Actions, and Live Readings */}
      {/* ========================================================================= */}
      <div className="w-full bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Playback Controls & Status Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs shadow-md ${
              isPlaying
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
            title={isPlaying ? 'Pausar simulación' : 'Reanudar simulación'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Simulación Activa' : 'Pausado'}</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-0.5 rounded ${simSpeed === spd ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={handleResetEcosystem}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reiniciar ecosistema a valores limpios"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Trophic Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            🏭 Emisión: <strong className="text-amber-400">{dischargeRateKgDay} kg/d</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            💧 Río: <strong className="text-cyan-400">{waterPpmDisplay.toFixed(4)} ppm</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            🐟 Trucha: <strong className="text-emerald-400">{((fishListRef.current[0]?.contaminationPpm) ?? 0.05).toFixed(3)} ppm</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            👤 Dosis Ingerida: <strong className="text-rose-400">{(humanAccumulatedDoseMg ?? 0).toFixed(2)} mg</strong>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE MAIN DIORAMA CANVAS WITH OVERLAID LABELS & CALLOUTS                */}
      {/* ========================================================================= */}
      <div className="relative w-full">
        
        {/* Main Canvas rendering the 60fps environment */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-[490px] block cursor-crosshair active:cursor-grabbing"
        />

        {/* --------------------------------------------------------------------- */}
        {/* CALLOUT 1: INDUSTRIA METALÚRGICA - FUNDICIÓN (Top-Left)               */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute top-3 left-3 z-20 pointer-events-auto">
          <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-1.5 text-white font-mono text-[11px] font-bold tracking-wider">
              <Factory className="w-3.5 h-3.5 text-amber-400" />
              <span>INDUSTRIA METALÚRGICA - FUNDICIÓN</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Vertido continuo de <strong className="text-cyan-300">{contaminant.name} ({contaminant.chemicalSymbol})</strong>
            </p>
          </div>

          {/* Action Button: Manual Effluent Burst */}
          <div className="mt-2 flex items-center gap-1.5">
            <button
              id="btn-trigger-effluent-burst"
              onClick={() => emitContaminantBurst(26)}
              disabled={isDischarging}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
                isDischarging
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-amber-950/50 active:scale-95'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>{isDischarging ? 'Vertiendo...' : '⚡ Ráfaga de Vertido'}</span>
            </button>

            {onFiltrationEfficiencyChange && (
              <div className="bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1">
                <span>Filtro:</span>
                <strong className="text-emerald-400">{filtrationEfficiency}%</strong>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* CALLOUT 2: PELIGRO - AGUAS CONTAMINADAS (Center Billboard)            */}
        {/* --------------------------------------------------------------------- */}
        <div 
          onClick={() => setShowWaterProbe(prev => !prev)}
          className="absolute top-[32%] left-[44%] -translate-x-1/2 z-20 cursor-pointer group pointer-events-auto"
        >
          {/* Weathered Rustic Signboard */}
          <div className="bg-amber-50/95 text-slate-900 p-2.5 rounded-sm border-2 border-amber-900/80 shadow-2xl transform -rotate-1 group-hover:scale-105 transition-all w-[185px] text-center font-sans relative">
            <div className="border-b-2 border-rose-600 pb-1 mb-1">
              <span className="text-base font-black text-rose-700 tracking-wider block font-mono">
                PELIGRO
              </span>
            </div>
            <p className="text-[9.5px] font-extrabold uppercase leading-tight text-slate-900">
              - AGUAS CONTAMINADAS CON METALES PESADOS
            </p>
            <p className="text-[9px] font-bold uppercase leading-tight text-rose-800 mt-1">
              - PROHIBIDO PESCAR Y BAÑARSE
            </p>
            <span className="mt-1 text-[8.5px] font-mono text-slate-500 block">
              [Clic para medir agua]
            </span>

            {/* Wooden Stake post */}
            <div className="w-2.5 h-8 bg-amber-900 mx-auto absolute -bottom-8 left-1/2 -translate-x-1/2 -z-10 shadow-md" />
          </div>

          {/* Water Sensor Flyout Telemetry */}
          {showWaterProbe && (
            <div className="absolute top-full mt-10 left-1/2 -translate-x-1/2 w-64 bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 shadow-2xl text-xs font-mono z-30">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-cyan-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  SONDA HIDROLÓGICA
                </span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
                  {waterPpmDisplay > contaminant.regulatoryLimits.ds90WaterPpm ? 'EXCEDE DS 90' : 'CONFORME DS 90'}
                </span>
              </div>
              <div className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Concentración en Agua:</span>
                  <strong className="text-amber-400">{waterPpmDisplay.toFixed(4)} ppm</strong>
                </div>
                <div className="flex justify-between">
                  <span>Límite Seguro OMS / DS 90:</span>
                  <strong className="text-slate-400">{contaminant.regulatoryLimits.ds90WaterPpm} ppm</strong>
                </div>
                <div className="flex justify-between">
                  <span>pH Fluvial:</span>
                  <strong className="text-rose-400">5.6 (Acidificado)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sobre límite DS 90:</span>
                  <strong className="text-cyan-400">{(waterPpmDisplay / contaminant.regulatoryLimits.ds90WaterPpm).toFixed(1)}x límite</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* CALLOUT 3: PEST - BIOACUMULACIÓN DE METALES PESADOS (Center-Bottom)    */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute bottom-6 left-[34%] z-20 pointer-events-auto">
          <div className="bg-black/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 shadow-2xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white font-mono text-[11px] font-bold">
              <Fish className="w-4 h-4 text-emerald-400" />
              <span>PEST - BIOACUMULACIÓN DE METALES PESADOS</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
              <span>Especie: <strong className="text-cyan-300">Trucha Fario (Salmo trutta)</strong></span>
              <button
                id="btn-inspect-trout-anatomy"
                onClick={() => {
                  const trout = fishListRef.current[0];
                  if (trout) onSelectFishToInspect(trout);
                }}
                className="ml-3 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:text-white font-bold transition-colors"
              >
                🔬 Inspeccionar Órganos
              </button>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* CALLOUT 4: PESCADOR ARTESANAL & CONSUMO HUMANO (Right Foreground)     */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute top-3 right-3 z-20 pointer-events-auto w-[205px] flex flex-col gap-2">
          
          {/* Fisherman / Human Ingestion Card */}
          <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                PESCADOR / DIETA
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                {fishConsumedCount} 🐟
              </span>
            </div>

            {/* Quick Action Button: Cast Rod / Catch Fish */}
            <button
              id="btn-cast-fishing-rod"
              onClick={handleCatchFishAction}
              disabled={isFishing}
              className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                isFishing
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/60 active:scale-95'
              }`}
            >
              <Fish className="w-3.5 h-3.5" />
              <span>{isFishing ? '¡Pescando trucha...!' : '🎣 Pescar y Comer Trucha'}</span>
            </button>

            {/* Live human burden readout */}
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Dosis Ingerida:</span>
                <strong className="text-rose-400">{(humanAccumulatedDoseMg ?? 0).toFixed(2)} mg</strong>
              </div>
              <div className="flex justify-between">
                <span>Conc. en Sangre:</span>
                <strong className="text-amber-400">{((humanTissueConcentrationPpm ?? 0) * 100 * (contaminant.id === 'lead' ? 45 : 20)).toFixed(1)} µg/dL</strong>
              </div>
            </div>

            {/* Direct Jump to Human Anatomy Section */}
            {onNavigateToHumanAnatomy && (
              <button
                id="btn-jump-to-anatomy"
                onClick={onNavigateToHumanAnatomy}
                className="mt-2 w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Stethoscope className="w-3 h-3 text-cyan-400" />
                <span>🩻 Escanear Órganos Humanos</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. GROUPED INTERACTIVE CONTROLS DOCK (All Interaction Modules Together)   */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">
        
        {/* Navigation Tabs for Grouped Sub-Interactions */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Consola de Parámetros Dinámicos:
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              id="tab-btn-all"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'all' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas las Variables
            </button>
            <button
              id="tab-btn-industry"
              onClick={() => setActiveTab('industry')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'industry' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏭 Industria
            </button>
            <button
              id="tab-btn-fish"
              onClick={() => setActiveTab('fish')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'fish' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🐟 Bioacumulación
            </button>
            <button
              id="tab-btn-human"
              onClick={() => setActiveTab('human')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'human' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👤 Dieta & Humano
            </button>
          </div>
        </div>

        {/* Sliders and Grouped Interaction Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Module 1: Industrial Effluent Control */}
          {(activeTab === 'all' || activeTab === 'industry') && onDischargeRateChange && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-amber-400" />
                  Descarga Fabril
                </span>
                <span className="font-mono text-amber-400 font-bold">{dischargeRateKgDay} kg/día</span>
              </div>
              <input
                id="slider-diorama-discharge"
                type="range"
                min="5"
                max="100"
                step="5"
                value={dischargeRateKgDay}
                onChange={(e) => onDischargeRateChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Emisión de {contaminant.name} por fundición.
              </span>
            </div>
          )}

          {/* Module 2: Industrial Effluent Filtration */}
          {(activeTab === 'all' || activeTab === 'industry') && onFiltrationEfficiencyChange && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-emerald-400" />
                  Filtro de Planta
                </span>
                <span className="font-mono text-emerald-400 font-bold">{filtrationEfficiency}%</span>
              </div>
              <input
                id="slider-diorama-filter"
                type="range"
                min="0"
                max="95"
                step="5"
                value={filtrationEfficiency}
                onChange={(e) => onFiltrationEfficiencyChange(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Precipitación química y resinas quelantes.
              </span>
            </div>
          )}

          {/* Module 3: Fish Portions Consumed Per Week */}
          {(activeTab === 'all' || activeTab === 'human' || activeTab === 'fish') && onFishPortionsChange && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Fish className="w-3.5 h-3.5 text-cyan-400" />
                  Consumo Semanal
                </span>
                <span className="font-mono text-cyan-400 font-bold">{fishPortionsPerWeek} porc./sem</span>
              </div>
              <input
                id="slider-diorama-portions"
                type="range"
                min="1"
                max="14"
                step="1"
                value={fishPortionsPerWeek}
                onChange={(e) => onFishPortionsChange(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Porción estándar: 200 gramos de trucha fario.
              </span>
            </div>
          )}

          {/* Module 4: Human Body Weight & Exposure Time */}
          {(activeTab === 'all' || activeTab === 'human') && onHumanWeightChange && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  Peso & Exposición
                </span>
                <span className="font-mono text-rose-400 font-bold">{humanWeightKg} kg / {exposureMonths}m</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="slider-diorama-weight"
                  type="range"
                  min="40"
                  max="120"
                  step="5"
                  value={humanWeightKg}
                  onChange={(e) => onHumanWeightChange(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  title="Peso Corporal (kg)"
                />
                {onExposureMonthsChange && (
                  <input
                    id="slider-diorama-months"
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={exposureMonths}
                    onChange={(e) => onExposureMonthsChange(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    title="Meses de Exposición"
                  />
                )}
              </div>
              <span className="text-[10px] text-slate-400 block leading-tight">
                V_d = {contaminant.volumeDistributionL} L/kg | Semivida: {contaminant.halfLifeHumansDays} días.
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
