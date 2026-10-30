import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Sparkles, 
  Eye, 
  Droplets, 
  Compass, 
  Wind, 
  ShieldAlert, 
  Atom, 
  Trash2,
  FastForward,
} from 'lucide-react';
import { ContaminantProfile } from '../types';
import { soundFX } from '../utils/audio';

interface MotionGraphicsStageProps {
  contaminant: ContaminantProfile;
  onNavigateToAnatomy?: () => void;
  onNavigateToDiorama?: () => void;
}

interface MotionParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  type: 'pollutant' | 'plankton' | 'chelator' | 'ion' | 'ros';
  trophicLevel: number; // 0: water, 1: algae, 2: zooplankton, 3: small fish, 4: predator
  concentration: number;
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
  pulsePhase: number;
}

interface ForceFieldObject {
  id: string;
  type: 'emitter' | 'vortex' | 'barrier' | 'chelator_sponge' | 'attractor';
  x: number;
  y: number;
  radius: number;
  strength: number; // Positive = attract, negative = repel, or vortex angular velocity
  color: string;
  name: string;
}

interface TrophicNode {
  id: string;
  name: string;
  level: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  bcfFactor: number;
  currentPpm: number;
  capacityPpm: number;
  pulseAnim: number;
  icon: string;
}

export const MotionGraphicsStage: React.FC<MotionGraphicsStageProps> = ({
  contaminant,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback & Physics State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [turbulenceLevel, setTurbulenceLevel] = useState<number>(35);
  const [flowVelocity, setFlowVelocity] = useState<number>(2.2);
  const [particleDensity, setParticleDensity] = useState<number>(90);
  const [viewMode, setViewMode] = useState<'neon' | 'heatmap' | 'vectors' | 'bio'>('neon');
  const [activeSimulationMode, setActiveSimulationMode] = useState<'trophic_cascade' | 'fluid_vortex' | 'membrane_ion'>('trophic_cascade');

  // Interactive Tools & Mouse
  const [selectedTool, setSelectedTool] = useState<'probe' | 'add_vortex' | 'add_barrier' | 'add_sponge' | 'gravity'>('probe');
  const [activeProbe, setActiveProbe] = useState<{ x: number; y: number; active: boolean; readingPpm: number } | null>(null);
  const [activeForces, setActiveForces] = useState<ForceFieldObject[]>([
    { id: 'force-1', type: 'emitter', x: 80, y: 150, radius: 45, strength: 1.5, color: '#f59e0b', name: 'Emisor Efluente' },
    { id: 'force-2', type: 'vortex', x: 420, y: 220, radius: 65, strength: 2.8, color: '#06b6d4', name: 'Vórtice Fluvial' },
    { id: 'force-3', type: 'chelator_sponge', x: 740, y: 180, radius: 55, strength: -1.2, color: '#10b981', name: 'Filtro Quelante EDTA' }
  ]);

  // Telemetry KPIs
  const [telemetry, setTelemetry] = useState({
    fps: 60,
    activeParticles: 0,
    maxConcentrationPpm: 0.12,
    bmfTotalMultiplier: 10000,
    reynoldsNumber: 2450
  });

  // Trophic chain nodes
  const trophicNodesRef = useRef<TrophicNode[]>([
    { id: 't1', name: 'Efluente Industrial', level: 0, x: 100, y: 320, radius: 30, color: '#f59e0b', bcfFactor: 1, currentPpm: 0.002, capacityPpm: 0.01, pulseAnim: 0, icon: '🏭' },
    { id: 't2', name: 'Micro-Algas (Diatomeas)', level: 1, x: 280, y: 260, radius: 28, color: '#10b981', bcfFactor: 100, currentPpm: 0.02, capacityPpm: 0.05, pulseAnim: 0, icon: '🌱' },
    { id: 't3', name: 'Zooplancton (Daphnia)', level: 2, x: 460, y: 340, radius: 32, color: '#06b6d4', bcfFactor: 1000, currentPpm: 0.25, capacityPpm: 0.60, pulseAnim: 0, icon: '🦐' },
    { id: 't4', name: 'Pez Forrajero (Gambusia)', level: 3, x: 650, y: 240, radius: 38, color: '#8b5cf6', bcfFactor: 4500, currentPpm: 1.15, capacityPpm: 2.50, pulseAnim: 0, icon: '🐟' },
    { id: 't5', name: 'Trucha Fario (Predador)', level: 4, x: 840, y: 330, radius: 46, color: '#ec4899', bcfFactor: 10000, currentPpm: 5.80, capacityPpm: 8.00, pulseAnim: 0, icon: '🦈' }
  ]);

  // Motion Particles Reference
  const particlesRef = useRef<MotionParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Initialize particles
  const initParticles = useCallback(() => {
    const particles: MotionParticle[] = [];
    const count = particleDensity * 2;
    for (let i = 0; i < count; i++) {
      const isIon = i % 5 === 0;
      particles.push({
        id: i,
        x: Math.random() * 950 + 50,
        y: Math.random() * 400 + 50,
        vx: (Math.random() * 1.5 + 0.8) * flowVelocity,
        vy: (Math.random() - 0.5) * (turbulenceLevel * 0.05),
        radius: isIon ? 3.5 : 2.0,
        baseRadius: isIon ? 3.5 : 2.0,
        color: isIon ? contaminant.color : '#38bdf8',
        type: isIon ? 'pollutant' : 'ion',
        trophicLevel: Math.floor(Math.random() * 5),
        concentration: Math.random() * 0.05 + 0.001,
        trail: [],
        life: Math.random() * 200 + 50,
        maxLife: 250,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;
  }, [contaminant.color, flowVelocity, particleDensity, turbulenceLevel]);

  // Safe round rect helper for compatibility
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

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  // Trigger Trophic Feeding Burst Animation
  const handleTriggerFeedingBurst = () => {
    soundFX.playPhaseStep();
    const nodes = trophicNodesRef.current;
    
    // Wave animation along trophic chain
    nodes.forEach((node, idx) => {
      setTimeout(() => {
        node.pulseAnim = 1.0;
        node.currentPpm = Math.min(node.capacityPpm, node.currentPpm * 1.25);
        
        // Spawn burst particles towards next node
        if (idx < nodes.length - 1) {
          const nextNode = nodes[idx + 1];
          for (let p = 0; p < 18; p++) {
            const angle = Math.atan2(nextNode.y - node.y, nextNode.x - node.x) + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 3 + 2;
            particlesRef.current.push({
              id: Date.now() + Math.random(),
              x: node.x,
              y: node.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: 4,
              baseRadius: 4,
              color: node.color,
              type: 'pollutant',
              trophicLevel: node.level + 1,
              concentration: node.currentPpm * 0.2,
              trail: [],
              life: 120,
              maxLife: 120,
              pulsePhase: 0
            });
          }
        }
      }, idx * 280);
    });
  };

  // Main Canvas Render & Physics Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = (timestamp: number) => {
      if (!running) return;

      // Handle FPS counter
      frameCountRef.current++;
      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        setTelemetry(prev => ({
          ...prev,
          fps: frameCountRef.current,
          activeParticles: particlesRef.current.length,
          reynoldsNumber: Math.round(flowVelocity * 800 + turbulenceLevel * 25)
        }));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = timestamp;
      }

      timeRef.current += 0.016 * playbackSpeed;
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear with gradient background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Subtle Vector Grid & Streamlines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Draw Fluid Velocity Vectors (if enabled in viewMode)
      if (viewMode === 'vectors' || viewMode === 'neon') {
        const vStep = 60;
        ctx.lineWidth = 1;
        for (let gx = 40; gx < width; gx += vStep) {
          for (let gy = 40; gy < height; gy += vStep) {
            // Calculate local vector
            let vx = flowVelocity;
            let vy = Math.sin(gx * 0.01 + t * 2) * (turbulenceLevel * 0.03);

            // Influence from force fields
            activeForces.forEach(force => {
              const dx = gx - force.x;
              const dy = gy - force.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < force.radius * 2.5 && dist > 5) {
                if (force.type === 'vortex') {
                  const angle = Math.atan2(dy, dx) + Math.PI / 2;
                  const forceMag = (force.strength * 40) / dist;
                  vx += Math.cos(angle) * forceMag;
                  vy += Math.sin(angle) * forceMag;
                } else if (force.type === 'attractor') {
                  vx -= (dx / dist) * force.strength * 2;
                  vy -= (dy / dist) * force.strength * 2;
                }
              }
            });

            const arrowLen = Math.min(22, Math.sqrt(vx * vx + vy * vy) * 4);
            const angle = Math.atan2(vy, vx);

            ctx.strokeStyle = viewMode === 'neon' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(56, 189, 248, 0.5)';
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + Math.cos(angle) * arrowLen, gy + Math.sin(angle) * arrowLen);
            ctx.stroke();

            // Arrow head
            ctx.fillStyle = viewMode === 'neon' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(56, 189, 248, 0.7)';
            ctx.beginPath();
            ctx.arc(gx + Math.cos(angle) * arrowLen, gy + Math.sin(angle) * arrowLen, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Draw Active Force Fields & Interactive Objects
      activeForces.forEach(force => {
        // Glowing halo ring
        const pulse = Math.sin(t * 4 + force.x) * 4;
        const grad = ctx.createRadialGradient(force.x, force.y, 5, force.x, force.y, force.radius + pulse);
        grad.addColorStop(0, force.color + '66');
        grad.addColorStop(0.7, force.color + '18');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(force.x, force.y, force.radius + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Stroke ring
        ctx.strokeStyle = force.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(force.x, force.y, force.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center icon / anchor
        ctx.fillStyle = force.color;
        ctx.beginPath();
        ctx.arc(force.x, force.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(force.name, force.x, force.y + force.radius + 14);
      });

      // 5. Draw Trophic Chain Links & Springs
      if (activeSimulationMode === 'trophic_cascade') {
        const nodes = trophicNodesRef.current;
        for (let i = 0; i < nodes.length - 1; i++) {
          const n1 = nodes[i];
          const n2 = nodes[i + 1];

          // Animated energy flow line
          ctx.lineWidth = 3;
          const lineGrad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
          lineGrad.addColorStop(0, n1.color);
          lineGrad.addColorStop(1, n2.color);
          ctx.strokeStyle = lineGrad;

          // Wavy sine curve connection
          ctx.beginPath();
          const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);
          const steps = 30;
          for (let s = 0; s <= steps; s++) {
            const frac = s / steps;
            const px = n1.x + (n2.x - n1.x) * frac;
            const py = n1.y + (n2.y - n1.y) * frac + Math.sin(frac * Math.PI * 4 - t * 6) * 5;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Transfer Particle along connection
          const particleFrac = (t * 0.8 + i * 0.3) % 1;
          const ppx = n1.x + (n2.x - n1.x) * particleFrac;
          const ppy = n1.y + (n2.y - n1.y) * particleFrac + Math.sin(particleFrac * Math.PI * 4 - t * 6) * 5;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = n2.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ppx, ppy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Magnification label pill
          const mx = (n1.x + n2.x) / 2;
          const my = (n1.y + n2.y) / 2 - 12;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1;
          drawSafeRoundRect(ctx, mx - 30, my - 9, 60, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 9px ui-sans-serif, system-ui';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText(`BMF ×${Math.round(n2.bcfFactor / n1.bcfFactor)}`, mx, my + 3);
        }

        // Render Trophic Nodes
        nodes.forEach(node => {
          // Pulse decay
          if (node.pulseAnim > 0) {
            node.pulseAnim = Math.max(0, node.pulseAnim - 0.02 * playbackSpeed);
          }

          // Node body glow
          const glow = ctx.createRadialGradient(node.x, node.y, 5, node.x, node.y, node.radius + 10 + node.pulseAnim * 15);
          glow.addColorStop(0, node.color + '88');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10 + node.pulseAnim * 15, 0, Math.PI * 2);
          ctx.fill();

          // Outer Circle
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 3 + node.pulseAnim * 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Progress Arc (Concentration vs Capacity)
          const fillRatio = Math.min(1.0, node.currentPpm / node.capacityPpm);
          ctx.strokeStyle = contaminant.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fillRatio);
          ctx.stroke();

          // Emoji Icon
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.icon, node.x, node.y - 2);

          // Node Label
          ctx.font = 'bold 11px ui-sans-serif, system-ui';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(node.name, node.x, node.y + node.radius + 16);

          // Concentration readout
          ctx.font = '10px ui-monospace, monospace';
          ctx.fillStyle = fillRatio > 0.8 ? '#ef4444' : '#38bdf8';
          ctx.fillText(`${node.currentPpm.toFixed(3)} ppm`, node.x, node.y + node.radius + 28);
        });
      }

      // 6. Update & Render 2D Motion Particles (Physics Engine)
      if (isPlaying) {
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Store trail
          p.trail.unshift({ x: p.x, y: p.y });
          if (p.trail.length > 8) p.trail.pop();

          // Basic advection velocity
          let targetVx = flowVelocity;
          let targetVy = Math.sin(p.x * 0.015 + t * 3) * (turbulenceLevel * 0.05);

          // Apply forces from active interactive objects
          activeForces.forEach(force => {
            const dx = p.x - force.x;
            const dy = p.y - force.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < force.radius * 2.2 && dist > 4) {
              if (force.type === 'vortex') {
                const angle = Math.atan2(dy, dx) + Math.PI / 2;
                const speed = (force.strength * 60) / dist;
                targetVx += Math.cos(angle) * speed;
                targetVy += Math.sin(angle) * speed;
              } else if (force.type === 'attractor') {
                targetVx -= (dx / dist) * force.strength * 3;
                targetVy -= (dy / dist) * force.strength * 3;
              } else if (force.type === 'chelator_sponge') {
                // Trap pollutant
                if (p.type === 'pollutant') {
                  p.color = '#10b981';
                  p.vx *= 0.85;
                  p.vy *= 0.85;
                }
              }
            }
          });

          // Smooth interpolation
          p.vx += (targetVx - p.vx) * 0.1 * playbackSpeed;
          p.vy += (targetVy - p.vy) * 0.1 * playbackSpeed;

          p.x += p.vx * playbackSpeed;
          p.y += p.vy * playbackSpeed;

          // Wrap edges
          if (p.x > width + 20) {
            p.x = -10;
            p.y = Math.random() * (height - 60) + 30;
            p.trail = [];
          }
          if (p.y < 10) p.y = height - 20;
          if (p.y > height - 10) p.y = 20;

          // Render Particle Trail (Motion Graphics Effect)
          if (p.trail.length > 2) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let tr = 1; tr < p.trail.length; tr++) {
              ctx.lineTo(p.trail[tr].x, p.trail[tr].y);
            }
            ctx.strokeStyle = p.color + '44';
            ctx.lineWidth = p.radius * 0.8;
            ctx.stroke();
          }

          // Render Particle Core
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Interactive Sonar Probe Overlay (if active)
      if (activeProbe && activeProbe.active) {
        const px = activeProbe.x;
        const py = activeProbe.y;
        const sonarRadius = (t * 60) % 70;

        // Sonar expanding ring
        ctx.strokeStyle = 'rgba(6, 182, 212, ' + (1 - sonarRadius / 70) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, sonarRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Target reticle
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.moveTo(px - 20, py); ctx.lineTo(px + 20, py);
        ctx.moveTo(px, py - 20); ctx.lineTo(px, py + 20);
        ctx.stroke();

        // HUD Reading Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        drawSafeRoundRect(ctx, px + 22, py - 30, 150, 60, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px ui-sans-serif, system-ui';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('SONDA ESPECTROMÉTRICA', px + 30, py - 14);

        ctx.font = '10px ui-monospace, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`C(x,y): ${activeProbe.readingPpm.toFixed(4)} ppm`, px + 30, py);
        ctx.fillStyle = activeProbe.readingPpm > 0.01 ? '#ef4444' : '#10b981';
        ctx.fillText(`Estado: ${activeProbe.readingPpm > 0.01 ? 'TÓXICO CRÍTICO' : 'LÍMITE SEGURO'}`, px + 30, py + 14);
      }

      if (running) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, turbulenceLevel, flowVelocity, viewMode, activeSimulationMode, activeForces, activeProbe, contaminant]);

  // Canvas Mouse Click / Drag Interaction
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedTool === 'probe') {
      soundFX.playFishEat(0.5);
      // Calculate local concentration based on proximity to forces
      let localPpm = 0.002;
      activeForces.forEach(f => {
        const d = Math.hypot(x - f.x, y - f.y);
        if (d < 150) localPpm += (0.05 * (1 - d / 150));
      });
      setActiveProbe({ x, y, active: true, readingPpm: localPpm });
    } else if (selectedTool === 'add_vortex') {
      soundFX.playPhaseStep();
      const newVortex: ForceFieldObject = {
        id: `vortex-${Date.now()}`,
        type: 'vortex',
        x,
        y,
        radius: 60,
        strength: (Math.random() > 0.5 ? 1 : -1) * 3.0,
        color: '#06b6d4',
        name: 'Vórtice Dinámico'
      };
      setActiveForces(prev => [...prev, newVortex]);
    } else if (selectedTool === 'add_sponge') {
      soundFX.playPhaseStep();
      const newSponge: ForceFieldObject = {
        id: `sponge-${Date.now()}`,
        type: 'chelator_sponge',
        x,
        y,
        radius: 50,
        strength: -1.5,
        color: '#10b981',
        name: 'Filtro Quelante Bio-adsorbente'
      };
      setActiveForces(prev => [...prev, newSponge]);
    } else if (selectedTool === 'gravity') {
      soundFX.playPhaseStep();
      const newAttractor: ForceFieldObject = {
        id: `attractor-${Date.now()}`,
        type: 'attractor',
        x,
        y,
        radius: 70,
        strength: 2.5,
        color: '#8b5cf6',
        name: 'Pozo de Decantación'
      };
      setActiveForces(prev => [...prev, newAttractor]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Controls & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Motion Graphics & Dinámica 2D
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              60 FPS Vector Engine
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Lienzo Interactivo de Cinemática & Cadena Trófica
          </h2>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
              isPlaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={() => setPlaybackSpeed(prev => (prev === 1.0 ? 2.5 : prev === 2.5 ? 0.25 : 1.0))}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>{playbackSpeed}x Velocidad</span>
          </button>

          <button
            onClick={initParticles}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reiniciar Partículas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Main Canvas Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl" ref={containerRef}>
        
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          onClick={handleCanvasInteraction}
          className="w-full h-auto cursor-crosshair block"
        />

        {/* Top Overlay HUD Bar */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* View Mode Switcher (Pointer events auto) */}
          <div className="flex items-center gap-1 bg-slate-950/85 p-1 rounded-xl border border-slate-800 backdrop-blur-md pointer-events-auto">
            <button
              onClick={() => setViewMode('neon')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'neon' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Neon FX
            </button>
            <button
              onClick={() => setViewMode('vectors')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'vectors' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vectores de Flujo
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'heatmap' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mapa Térmico
            </button>
          </div>

          {/* Interactive Trigger for Trophic Cascade */}
          <button
            onClick={handleTriggerFeedingBurst}
            className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs shadow-lg shadow-rose-500/25 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Disparar Cascada Trófica</span>
          </button>
        </div>

        {/* Floating Tool Palette (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
          <span className="text-[10px] font-mono text-slate-400 font-bold px-2 uppercase">Herramienta:</span>
          <button
            onClick={() => setSelectedTool('probe')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'probe' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Sonda Espectrométrica (Clic en agua para medir)"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Sonda</span>
          </button>
          <button
            onClick={() => setSelectedTool('add_vortex')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'add_vortex' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Añadir Vórtice Hidrodinámico"
          >
            <Wind className="w-4 h-4" />
            <span className="hidden sm:inline">+ Vórtice</span>
          </button>
          <button
            onClick={() => setSelectedTool('add_sponge')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'add_sponge' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Añadir Filtro Quelante Adsorbente"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">+ Filtro</span>
          </button>
          <button
            onClick={() => setSelectedTool('gravity')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'gravity' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Añadir Pozo Gravitatorio de Decantación"
          >
            <Atom className="w-4 h-4" />
            <span className="hidden sm:inline">+ Pozo</span>
          </button>
          {activeForces.length > 0 && (
            <button
              onClick={() => setActiveForces([])}
              className="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/50 text-xs"
              title="Limpiar todos los objetos interactivos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Telemetry Live Feed (Bottom Right) */}
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-400">
          <div>FPS: <span className="text-emerald-400 font-bold">{telemetry.fps}</span></div>
          <div>Partículas: <span className="text-cyan-400 font-bold">{telemetry.activeParticles}</span></div>
          <div>Reynolds: <span className="text-amber-400 font-bold">{telemetry.reynoldsNumber}</span></div>
        </div>
      </div>

      {/* 3. Physics & Dynamic Parameters Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Slider: Velocidad del Flujo Fluvial */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Velocidad de Corriente Fluvial
            </span>
            <span className="font-mono text-cyan-400 font-bold">{flowVelocity.toFixed(1)} m/s</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={6.0}
            step={0.1}
            value={flowVelocity}
            onChange={(e) => setFlowVelocity(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[11px] text-slate-400">
            Afecta el transporte advectivo y la dispersión hidrodinámica del vertido en la cuenca.
          </p>
        </div>

        {/* Slider: Turbulencia & Vórtices */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-amber-400" />
              Índice de Turbulencia (Re)
            </span>
            <span className="font-mono text-amber-400 font-bold">{turbulenceLevel}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={turbulenceLevel}
            onChange={(e) => setTurbulenceLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[11px] text-slate-400">
            Modela la agitación caótica y el mezclado turbulento de metales pesados disueltos.
          </p>
        </div>

        {/* Slider: Densidad de Partículas */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-purple-400" />
              Carga Iónica & Trazadores
            </span>
            <span className="font-mono text-purple-400 font-bold">{particleDensity} unidades</span>
          </div>
          <input
            type="range"
            min={30}
            max={200}
            step={10}
            value={particleDensity}
            onChange={(e) => setParticleDensity(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-[11px] text-slate-400">
            Regula la cantidad de iones de {contaminant.chemicalFormula} inyectados en la simulación 2D.
          </p>
        </div>

      </div>

    </div>
  );
};
