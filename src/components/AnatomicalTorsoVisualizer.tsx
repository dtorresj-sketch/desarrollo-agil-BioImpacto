import React, { useState } from 'react';
import { ContaminantProfile } from '../types';
import { 
  Activity, 
  ZoomIn, 
  ZoomOut,
  Sun,
  Moon,
  Crosshair,
} from 'lucide-react';
import { ALL_IMPORTANT_ORGANS } from '../data/organs';

interface AnatomicalTorsoVisualizerProps {
  contaminant: ContaminantProfile;
  activeSystem: string;
  selectedOrganId: string | null;
  humanTissueConcentrationPpm: number;
  onSelectOrgan: (organId: string) => void;
  hoveredStructure: string | null;
  setHoveredStructure: (name: string | null) => void;
  morphoAnimationActive: boolean;
}

interface OrganCardConfig {
  id: string;
  name: string;
  englishLabel: string;
  side: 'left' | 'right' | 'top';
  targetX: number;
  targetY: number;
  cardX: number;
  cardY: number;
  system: string;
}

export const AnatomicalTorsoVisualizer: React.FC<AnatomicalTorsoVisualizerProps> = ({
  contaminant,
  selectedOrganId,
  humanTissueConcentrationPpm,
  onSelectOrgan,
  hoveredStructure,
  setHoveredStructure,
  morphoAnimationActive
}) => {
  const [themeMode, setThemeMode] = useState<'clinical_light' | 'scanner_dark'>('clinical_light');
  const [showRibs, setShowRibs] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showLeaderLines, setShowLeaderLines] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const toxicityRatio = humanTissueConcentrationPpm / Math.max(0.001, contaminant.criticalDosePpm);
  const isToxic = toxicityRatio >= 1.0;
  const isModerate = toxicityRatio >= 0.4 && toxicityRatio < 1.0;

  // Organ target coordinates inside central torso and card placement matching user reference infographic
  const ORGAN_CALLOUTS: OrganCardConfig[] = [
    // TOP
    {
      id: 'brain',
      name: 'Cerebro (SNC)',
      englishLabel: 'BRAIN',
      side: 'top',
      targetX: 450,
      targetY: 105,
      cardX: 620,
      cardY: 65,
      system: 'nervous'
    },
    // LEFT COLUMN
    {
      id: 'thyroid',
      name: 'Glándula Tiroides',
      englishLabel: 'THYROID',
      side: 'left',
      targetX: 450,
      targetY: 260,
      cardX: 130,
      cardY: 70,
      system: 'endocrine'
    },
    {
      id: 'heart',
      name: 'Corazón',
      englishLabel: 'HEART',
      side: 'left',
      targetX: 458,
      targetY: 420,
      cardX: 130,
      cardY: 200,
      system: 'circulatory'
    },
    {
      id: 'liver',
      name: 'Hígado',
      englishLabel: 'LIVER',
      side: 'left',
      targetX: 425,
      targetY: 535,
      cardX: 130,
      cardY: 330,
      system: 'digestive'
    },
    {
      id: 'gallbladder',
      name: 'Vesícula Biliar',
      englishLabel: 'GALLBLADDER',
      side: 'left',
      targetX: 405,
      targetY: 550,
      cardX: 130,
      cardY: 460,
      system: 'digestive'
    },
    {
      id: 'kidneys',
      name: 'Riñones',
      englishLabel: 'KIDNEYS',
      side: 'left',
      targetX: 415,
      targetY: 625,
      cardX: 130,
      cardY: 590,
      system: 'renal'
    },
    {
      id: 'small_intestine',
      name: 'Intestino Delgado',
      englishLabel: 'SMALL INTESTINE',
      side: 'left',
      targetX: 450,
      targetY: 685,
      cardX: 130,
      cardY: 730,
      system: 'digestive'
    },
    {
      id: 'bladder',
      name: 'Vejiga Urinaria',
      englishLabel: 'BLADDER',
      side: 'left',
      targetX: 450,
      targetY: 775,
      cardX: 130,
      cardY: 870,
      system: 'renal'
    },
    // RIGHT COLUMN
    {
      id: 'lungs',
      name: 'Pulmones',
      englishLabel: 'LUNGS',
      side: 'right',
      targetX: 490,
      targetY: 395,
      cardX: 770,
      cardY: 175,
      system: 'respiratory'
    },
    {
      id: 'stomach',
      name: 'Estómago',
      englishLabel: 'STOMACH',
      side: 'right',
      targetX: 480,
      targetY: 520,
      cardX: 770,
      cardY: 310,
      system: 'digestive'
    },
    {
      id: 'spleen',
      name: 'Bazo',
      englishLabel: 'SPLEEN',
      side: 'right',
      targetX: 508,
      targetY: 540,
      cardX: 770,
      cardY: 445,
      system: 'immune'
    },
    {
      id: 'pancreas',
      name: 'Páncreas',
      englishLabel: 'PANCREAS',
      side: 'right',
      targetX: 465,
      targetY: 565,
      cardX: 770,
      cardY: 580,
      system: 'digestive'
    },
    {
      id: 'large_intestine',
      name: 'Intestino Grueso (Colon)',
      englishLabel: 'LARGE INTESTINE',
      side: 'right',
      targetX: 485,
      targetY: 660,
      cardX: 770,
      cardY: 715,
      system: 'digestive'
    },
    {
      id: 'reproductive',
      name: 'Útero & Ovarios',
      englishLabel: 'UTERUS & OVARY',
      side: 'right',
      targetX: 450,
      targetY: 755,
      cardX: 770,
      cardY: 855,
      system: 'reproductive'
    }
  ];

  // Helper to get organ toxicology for current metal
  const getOrganToxInfo = (organId: string) => {
    const master = ALL_IMPORTANT_ORGANS.find(o => o.id === organId);
    if (!master) return { severity: 'low', isPrimary: false, affinity: 0.5 };
    const tox = master.toxicology[contaminant.id] || master.toxicology.mercury;
    return {
      severity: tox.severity,
      isPrimary: tox.isPrimaryTarget,
      affinity: tox.affinityFactor
    };
  };

  // Helper to determine organ color/highlight inside silhouette
  const getOrganStyle = (organId: string, defaultColor: string, defaultStroke: string = '#ffffff') => {
    const isSelected = selectedOrganId === organId;
    const tox = getOrganToxInfo(organId);
    const isTarget = tox.isPrimary || tox.severity === 'critical' || tox.severity === 'high';

    if (isSelected) {
      return {
        fill: '#0284c7',
        stroke: '#38bdf8',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.9))',
        opacity: 1
      };
    }

    if (isTarget) {
      if (isToxic) {
        return {
          fill: '#dc2626',
          stroke: '#fca5a5',
          strokeWidth: 1.8,
          filter: 'drop-shadow(0 0 6px rgba(225,29,72,0.7))',
          opacity: 0.95
        };
      }
      if (isModerate) {
        return {
          fill: '#d97706',
          stroke: '#fde68a',
          strokeWidth: 1.5,
          filter: 'drop-shadow(0 0 4px rgba(217,119,6,0.5))',
          opacity: 0.9
        };
      }
    }

    return {
      fill: defaultColor,
      stroke: defaultStroke,
      strokeWidth: 1,
      filter: 'none',
      opacity: 0.95
    };
  };

  const isLight = themeMode === 'clinical_light';

  return (
    <div className={`relative w-full flex flex-col items-center rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
      isLight 
        ? 'bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-100 border-sky-200 text-slate-900' 
        : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-slate-100'
    }`}>
      
      {/* Top Header & Interactive Toolbar */}
      <div className={`w-full flex flex-wrap items-center justify-between px-4 py-2.5 border-b backdrop-blur-md text-xs font-mono gap-2 ${
        isLight 
          ? 'bg-white/85 border-slate-200 text-slate-700 shadow-sm' 
          : 'bg-slate-950/90 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sky-700 dark:text-sky-300 tracking-wide text-xs">
              INFOGRAFÍA ANATÓMICA & ÓRGANOS DIANA
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 ml-2">
              (Directrices & Morfología Humana II)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Selector Button */}
          <button
            id="btn-toggle-anatomy-theme"
            onClick={() => setThemeMode(isLight ? 'scanner_dark' : 'clinical_light')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
              isLight 
                ? 'bg-sky-100/80 border-sky-300 text-sky-800 hover:bg-sky-200/80' 
                : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
            }`}
            title="Cambiar entre diseño infográfico claro y modo escáner oscuro"
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isLight ? 'Clínico Claro' : 'Modo Oscuro'}</span>
          </button>

          {/* Leader lines toggle */}
          <button
            id="btn-toggle-leader-lines"
            onClick={() => setShowLeaderLines(!showLeaderLines)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              showLeaderLines
                ? isLight 
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-rose-950/40 border-rose-700 text-rose-300'
                : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-500'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Mostrar / Ocultar líneas directrices"
          >
            Guías: {showLeaderLines ? 'ON' : 'OFF'}
          </button>

          {/* Ribs Toggle */}
          <button
            id="btn-toggle-ribs"
            onClick={() => setShowRibs(!showRibs)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              showRibs 
                ? isLight 
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-amber-950/40 border-amber-700 text-amber-300' 
                : isLight 
                  ? 'bg-slate-100 border-slate-300 text-slate-500'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Costillas: {showRibs ? 'ON' : 'OFF'}
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(0.85, zoomLevel - 0.1))}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-sky-600 rounded"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-sky-600 rounded"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className={`w-full px-4 py-1.5 border-b flex items-center justify-between text-xs font-mono transition-colors ${
        isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-slate-900/80 border-slate-800 text-cyan-300'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <Crosshair className="w-3.5 h-3.5 text-sky-500 animate-pulse shrink-0" />
          <span className="font-bold">Estructura Seleccionada:</span>
          <span className="text-slate-700 dark:text-slate-300 truncate">
            {hoveredStructure || (selectedOrganId ? ALL_IMPORTANT_ORGANS.find(o => o.id === selectedOrganId)?.name : 'Pase el cursor o haga clic en un órgano o tarjeta')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>Contaminante:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">{contaminant.name} ({contaminant.chemicalSymbol})</span>
        </div>
      </div>

      {/* Main Infographic Stage (Full SVG Canvas: Central Silhouette + Flanking Callout Cards + Leader Lines) */}
      <div className="relative w-full h-[640px] flex items-center justify-center select-none overflow-hidden p-1">
        
        {/* Subtle Background Aesthetic Grids */}
        {isLight ? (
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.08)_0%,transparent_75%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
          </>
        )}

        <svg
          viewBox="0 0 900 960"
          className="w-full h-full max-h-[640px] drop-shadow-xl"
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
        >
          <defs>
            {/* Gradients for Organs */}
            <linearGradient id="bodySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              {isLight ? (
                <>
                  <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.7" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#1e293b" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.8" />
                </>
              )}
            </linearGradient>

            {/* Brain Tan Gradient */}
            <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Thyroid Coral Gradient */}
            <linearGradient id="thyroidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>

            {/* Lungs Peach Gradient */}
            <linearGradient id="lungsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>

            {/* Heart Crimson Gradient */}
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Liver Terracotta Gradient */}
            <linearGradient id="liverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="50%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>

            {/* Gallbladder Vivid Green Gradient */}
            <linearGradient id="gallbladderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            {/* Stomach Pink Gradient */}
            <linearGradient id="stomachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Spleen Deep Maroon/Purple Gradient */}
            <linearGradient id="spleenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9f1239" />
              <stop offset="50%" stopColor="#881337" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>

            {/* Pancreas Golden-Tan Gradient */}
            <linearGradient id="pancreasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            {/* Kidneys Deep Red-Brown Gradient */}
            <linearGradient id="kidneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* Large Intestine Pink-Tan Gradient */}
            <linearGradient id="largeIntestineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>

            {/* Small Intestine Coral Coils */}
            <linearGradient id="smallIntestineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="50%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Bladder Amber Gradient */}
            <linearGradient id="bladderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Reproductive Coral-Pink Gradient */}
            <linearGradient id="reproductiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* 1. CENTRAL HUMAN BODY SILHOUETTE (Light Cyan / Semi-Transparent) */}
          {/* ======================================================== */}
          <g id="human-body-silhouette" className="transition-opacity duration-300">
            {/* Outer Body Contour (Head, Neck, Torso, Arms, Pelvis, Thighs) */}
            <path
              d="
                M 450 40
                C 490 40 520 70 520 115
                C 520 145 500 170 480 185
                C 475 195 475 220 480 235
                C 515 250 565 270 590 320
                C 605 355 615 410 610 470
                C 605 525 595 580 585 640
                C 575 690 565 745 550 800
                C 540 835 530 870 520 920
                L 490 920
                C 485 860 475 805 450 790
                C 425 805 415 860 410 920
                L 380 920
                C 370 870 360 835 350 800
                C 335 745 325 690 315 640
                C 305 580 295 525 290 470
                C 285 410 295 355 310 320
                C 335 270 385 250 420 235
                C 425 220 425 195 420 185
                C 400 170 380 145 380 115
                C 380 70 410 40 450 40 Z
              "
              fill="url(#bodySkinGrad)"
              stroke={isLight ? '#38bdf8' : '#0284c7'}
              strokeWidth={isLight ? '2' : '1.5'}
              strokeOpacity="0.75"
              filter={isLight ? 'drop-shadow(0 4px 12px rgba(186,230,253,0.6))' : 'none'}
            />

            {/* Inner Skeletal / Rib Cage Lines (Subtle) */}
            {showRibs && (
              <g id="anatomical-ribs" stroke={isLight ? '#94a3b8' : '#475569'} strokeWidth="1.2" strokeOpacity="0.4" fill="none">
                {/* Sternum */}
                <path d="M 450 280 L 450 450" strokeWidth="2.5" />
                {/* Rib Arches */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <g key={i}>
                    <path d={`M 450 ${300 + i * 24} Q 400 ${290 + i * 24} 370 ${325 + i * 24}`} />
                    <path d={`M 450 ${300 + i * 24} Q 500 ${290 + i * 24} 530 ${325 + i * 24}`} />
                  </g>
                ))}
              </g>
            )}
          </g>

          {/* ======================================================== */}
          {/* 2. INTERNAL ORGANS INSIDE SILHOUETTE */}
          {/* ======================================================== */}

          {/* Brain inside Cranium */}
          <g 
            id="torso-organ-brain"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('brain')}
            onMouseEnter={() => setHoveredStructure('Cerebro & Sistema Nervioso Central (Encéfalo)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 425 105
                C 420 80 435 60 455 60
                C 475 60 488 75 488 95
                C 492 115 480 135 460 140
                C 440 145 425 130 425 105 Z
              "
              {...getOrganStyle('brain', 'url(#brainGrad)', '#fed7aa')}
            />
            {/* Brain Sulci / Gyri folds */}
            <path d="M 438 80 Q 455 85 465 75" fill="none" stroke="#7c2d12" strokeWidth="1" opacity="0.6" />
            <path d="M 435 100 Q 455 95 475 105" fill="none" stroke="#7c2d12" strokeWidth="1" opacity="0.6" />
            <path d="M 440 120 Q 460 115 470 128" fill="none" stroke="#7c2d12" strokeWidth="1" opacity="0.6" />
          </g>

          {/* Trachea & Larynx */}
          <g id="torso-organ-trachea">
            <rect x="444" y="195" width="12" height="75" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line key={i} x1="444" y1={202 + i * 11} x2="456" y2={202 + i * 11} stroke="#64748b" strokeWidth="0.8" />
            ))}
          </g>

          {/* Thyroid Gland in Neck */}
          <g 
            id="torso-organ-thyroid"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('thyroid')}
            onMouseEnter={() => setHoveredStructure('Glándula Tiroides (Folículos Tiroideos & Síntesis de T3/T4)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 440 248
                C 432 245 428 258 433 270
                C 438 276 446 270 450 262
                C 454 270 462 276 467 270
                C 472 258 468 245 460 248
                C 456 254 444 254 440 248 Z
              "
              {...getOrganStyle('thyroid', 'url(#thyroidGrad)', '#fca5a5')}
            />
          </g>

          {/* Lungs (Bilateral peach lobes) */}
          <g 
            id="torso-organ-lungs"
            className={`cursor-pointer group ${morphoAnimationActive ? 'animate-pulse' : ''}`}
            onClick={() => onSelectOrgan('lungs')}
            onMouseEnter={() => setHoveredStructure('Pulmones (Lóbulos Pulmonares & Barrera Alveolocapilar)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            {/* Right Lung (Anatomical Right = Screen Left) */}
            <path
              d="
                M 436 300
                C 410 310 385 340 380 395
                C 375 440 390 475 425 470
                C 435 450 436 380 436 300 Z
              "
              {...getOrganStyle('lungs', 'url(#lungsGrad)', '#fda4af')}
            />
            {/* Left Lung (Anatomical Left = Screen Right with Cardiac Notch) */}
            <path
              d="
                M 464 300
                C 490 310 515 340 520 395
                C 525 440 510 475 475 470
                C 460 445 464 380 464 300 Z
              "
              {...getOrganStyle('lungs', 'url(#lungsGrad)', '#fda4af')}
            />
          </g>

          {/* Heart in Mediastinum */}
          <g 
            id="torso-organ-heart"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('heart')}
            onMouseEnter={() => setHoveredStructure('Corazón & Grandes Vasos (Miocardio & Discos Intercalares)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            {/* Ascending Aorta & Pulmonary Trunk */}
            <path d="M 448 350 C 448 330 465 330 465 355" fill="none" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            <path d="M 440 355 C 440 338 452 338 455 358" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
            {/* Cardiac Muscle */}
            <path
              d="
                M 444 365
                C 430 365 425 385 435 410
                C 445 435 458 450 465 448
                C 475 445 485 415 480 385
                C 475 365 458 365 444 365 Z
              "
              {...getOrganStyle('heart', 'url(#heartGrad)', '#fca5a5')}
            />
          </g>

          {/* Liver (Large terracotta organ on anatomical right) */}
          <g 
            id="torso-organ-liver"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('liver')}
            onMouseEnter={() => setHoveredStructure('Hígado (Lobulillos Hepáticos & Vena Porta)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 390 485
                C 425 470 475 480 490 515
                C 485 540 455 560 410 560
                C 385 550 380 510 390 485 Z
              "
              {...getOrganStyle('liver', 'url(#liverGrad)', '#fed7aa')}
            />
          </g>

          {/* Gallbladder (Bright green pear under liver) */}
          <g 
            id="torso-organ-gallbladder"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('gallbladder')}
            onMouseEnter={() => setHoveredStructure('Vesícula Biliar (Reservorio Biliar & Conducto Cístico)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <ellipse
              cx="405"
              cy="550"
              rx="9"
              ry="14"
              transform="rotate(-25 405 550)"
              {...getOrganStyle('gallbladder', 'url(#gallbladderGrad)', '#bbf7d0')}
            />
          </g>

          {/* Stomach (J-shaped pink organ on anatomical left) */}
          <g 
            id="torso-organ-stomach"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('stomach')}
            onMouseEnter={() => setHoveredStructure('Estómago (Cuerpo Gástrico & Glándulas Oxínticas)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 465 485
                C 495 485 515 510 510 540
                C 505 565 475 575 450 565
                C 440 555 445 530 455 515
                C 460 500 458 490 465 485 Z
              "
              {...getOrganStyle('stomach', 'url(#stomachGrad)', '#fecdd3')}
            />
          </g>

          {/* Spleen (Deep maroon/violet bean behind stomach) */}
          <g 
            id="torso-organ-spleen"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('spleen')}
            onMouseEnter={() => setHoveredStructure('Bazo (Pulpa Blanca & Roja, Hemocateresis)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <ellipse
              cx="515"
              cy="535"
              rx="8"
              ry="15"
              transform="rotate(25 515 535)"
              {...getOrganStyle('spleen', 'url(#spleenGrad)', '#fbcfe8')}
            />
          </g>

          {/* Pancreas (Elongated yellow-tan gland behind stomach) */}
          <g 
            id="torso-organ-pancreas"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('pancreas')}
            onMouseEnter={() => setHoveredStructure('Páncreas (Islotes de Langerhans & Acinos Exocrinos)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="M 430 565 C 455 555 490 555 505 565 C 495 575 465 580 430 570 Z"
              {...getOrganStyle('pancreas', 'url(#pancreasGrad)', '#fef08a')}
            />
          </g>

          {/* Kidneys (Bilateral retroperitoneal beans + ureters) */}
          <g 
            id="torso-organ-kidneys"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('kidneys')}
            onMouseEnter={() => setHoveredStructure('Riñones (Nefronas & Túbulos Contorneados Proximales)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            {/* Ureters descending to pelvis */}
            <path d="M 412 630 Q 425 700 445 770" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 1" />
            <path d="M 488 630 Q 475 700 455 770" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 1" />

            {/* Right Kidney */}
            <ellipse cx="408" cy="620" rx="11" ry="18" transform="rotate(-15 408 620)" {...getOrganStyle('kidneys', 'url(#kidneyGrad)', '#fca5a5')} />
            {/* Left Kidney */}
            <ellipse cx="492" cy="615" rx="11" ry="18" transform="rotate(15 492 615)" {...getOrganStyle('kidneys', 'url(#kidneyGrad)', '#fca5a5')} />
          </g>

          {/* Large Intestine / Colon (Outer frame with haustra) */}
          <g 
            id="torso-organ-large-intestine"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('large_intestine')}
            onMouseEnter={() => setHoveredStructure('Intestino Grueso (Marco Colónico & Tenias del Colon)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 405 730
                L 400 620
                C 400 600 420 595 440 600
                L 460 600
                C 485 595 500 605 500 625
                L 495 725
                C 495 745 470 755 450 750
              "
              fill="none"
              stroke="url(#largeIntestineGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={selectedOrganId === 'large_intestine' ? 1 : 0.9}
            />
          </g>

          {/* Small Intestine (Central convoluted jejunum/ileum loops) */}
          <g 
            id="torso-organ-small-intestine"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('small_intestine')}
            onMouseEnter={() => setHoveredStructure('Intestino Delgado (Yeyuno & Íleon con Vellosidades Absortivas)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 430 635 Q 470 630 470 645
                Q 430 655 430 670
                Q 470 680 470 695
                Q 430 705 450 725
              "
              fill="none"
              stroke="url(#smallIntestineGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity={selectedOrganId === 'small_intestine' ? 1 : 0.95}
            />
          </g>

          {/* Bladder (Pelvic golden-amber sac) */}
          <g 
            id="torso-organ-bladder"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('bladder')}
            onMouseEnter={() => setHoveredStructure('Vejiga Urinaria (Urotelio & Músculo Detrusor)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 435 770
                C 430 790 440 810 450 810
                C 460 810 470 790 465 770
                C 455 765 445 765 435 770 Z
              "
              {...getOrganStyle('bladder', 'url(#bladderGrad)', '#fde68a')}
            />
          </g>

          {/* Uterus & Ovaries / Reproductive system */}
          <g 
            id="torso-organ-reproductive"
            className="cursor-pointer group"
            onClick={() => onSelectOrgan('reproductive')}
            onMouseEnter={() => setHoveredStructure('Sistema Reproductor (Útero, Trompas de Falopio & Ovarios)')}
            onMouseLeave={() => setHoveredStructure(null)}
          >
            <path
              d="
                M 450 740
                L 435 730
                C 425 730 425 745 435 745
                L 445 750
                L 445 765
                L 455 765
                L 455 750
                L 465 745
                C 475 745 475 730 465 730
                L 450 740 Z
              "
              {...getOrganStyle('reproductive', 'url(#reproductiveGrad)', '#fbcfe8')}
            />
          </g>

          {/* ======================================================== */}
          {/* 3. DYNAMIC LEADER LINES (Red/Brown lines matching reference) */}
          {/* ======================================================== */}
          {showLeaderLines && (
            <g id="anatomical-leader-lines">
              {ORGAN_CALLOUTS.map((callout) => {
                const isSelected = selectedOrganId === callout.id;
                const tox = getOrganToxInfo(callout.id);
                const isTarget = tox.isPrimary || tox.severity === 'critical';

                const lineColor = isSelected 
                  ? '#0284c7' 
                  : isTarget && isToxic 
                    ? '#e11d48' 
                    : isLight 
                      ? '#991b1b' 
                      : '#f43f5e';

                const strokeWidth = isSelected ? 2.5 : isTarget ? 1.8 : 1.2;

                return (
                  <g key={callout.id} className="transition-all duration-200">
                    {/* Anchor Dot on Organ */}
                    <circle
                      cx={callout.targetX}
                      cy={callout.targetY}
                      r={isSelected ? 4.5 : 3}
                      fill={lineColor}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className={isSelected ? 'animate-ping' : ''}
                    />

                    {/* Diagonal Leader Line */}
                    <path
                      d={`M ${callout.targetX} ${callout.targetY} L ${callout.cardX + (callout.side === 'left' ? 75 : callout.side === 'right' ? -75 : 0)} ${callout.cardY}`}
                      fill="none"
                      stroke={lineColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isSelected ? 'none' : 'none'}
                      opacity={isSelected ? 1 : isLight ? 0.75 : 0.65}
                    />

                    {/* Anchor Dot on Card */}
                    <circle
                      cx={callout.cardX + (callout.side === 'left' ? 75 : callout.side === 'right' ? -75 : 0)}
                      cy={callout.cardY}
                      r="2.5"
                      fill={lineColor}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ======================================================== */}
          {/* 4. FLANKING ISOLATED ORGAN CARDS (Matching user reference layout) */}
          {/* ======================================================== */}
          <g id="flanking-organ-cards">
            {ORGAN_CALLOUTS.map((callout) => {
              const isSelected = selectedOrganId === callout.id;
              const tox = getOrganToxInfo(callout.id);
              const isPrimary = tox.isPrimary;

              return (
                <g
                  key={callout.id}
                  id={`card-organ-${callout.id}`}
                  transform={`translate(${callout.cardX}, ${callout.cardY})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectOrgan(callout.id)}
                  onMouseEnter={() => setHoveredStructure(`${callout.name} (${callout.englishLabel})`)}
                  onMouseLeave={() => setHoveredStructure(null)}
                >
                  {/* Card Background Plate */}
                  <rect
                    x="-65"
                    y="-42"
                    width="130"
                    height="84"
                    rx="10"
                    fill={
                      isSelected
                        ? isLight ? '#f0f9ff' : '#082f49'
                        : isLight ? '#ffffff' : '#0f172a'
                    }
                    stroke={
                      isSelected
                        ? '#0284c7'
                        : isPrimary
                          ? '#f43f5e'
                          : isLight ? '#e2e8f0' : '#1e293b'
                    }
                    strokeWidth={isSelected ? '2' : isPrimary ? '1.5' : '1'}
                    filter={isLight ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'}
                  />

                  {/* Organ Illustration Graphic Mini-SVG */}
                  <g transform="translate(0, -10)">
                    {callout.id === 'brain' && (
                      <g>
                        <ellipse cx="0" cy="0" rx="18" ry="14" fill="url(#brainGrad)" stroke="#ea580c" strokeWidth="1" />
                        <path d="M -12 -4 Q 0 -8 12 -4" fill="none" stroke="#9a3412" strokeWidth="1" />
                        <path d="M -14 3 Q 0 0 14 3" fill="none" stroke="#9a3412" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'thyroid' && (
                      <g>
                        <path d="M -12 -12 C -20 -15 -22 5 -12 12 C -4 10 4 10 12 12 C 22 5 20 -15 12 -12 C 5 -4 -5 -4 -12 -12 Z" fill="url(#thyroidGrad)" stroke="#f43f5e" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'heart' && (
                      <g>
                        <path d="M -6 -14 C -6 -20 6 -20 6 -14" fill="none" stroke="#ef4444" strokeWidth="3.5" />
                        <path d="M 0 -8 C -14 -8 -18 4 -6 14 C 0 18 6 18 12 12 C 18 4 12 -8 0 -8 Z" fill="url(#heartGrad)" stroke="#f87171" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'liver' && (
                      <g>
                        <path d="M -16 -6 C 0 -14 16 -8 18 4 C 16 12 0 14 -14 12 C -18 6 -18 -2 -16 -6 Z" fill="url(#liverGrad)" stroke="#ea580c" strokeWidth="1" />
                        <path d="M -4 4 L -6 10" stroke="#22c55e" strokeWidth="2" />
                      </g>
                    )}

                    {callout.id === 'gallbladder' && (
                      <g>
                        <path d="M 0 -14 Q 4 -8 0 0" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                        <ellipse cx="0" cy="4" rx="10" ry="12" fill="url(#gallbladderGrad)" stroke="#22c55e" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'kidneys' && (
                      <g>
                        <ellipse cx="-8" cy="0" rx="6" ry="10" transform="rotate(-15 -8 0)" fill="url(#kidneyGrad)" stroke="#f87171" strokeWidth="1" />
                        <ellipse cx="8" cy="0" rx="6" ry="10" transform="rotate(15 8 0)" fill="url(#kidneyGrad)" stroke="#f87171" strokeWidth="1" />
                        <path d="M -6 6 L -3 14" stroke="#eab308" strokeWidth="1.5" />
                        <path d="M 6 6 L 3 14" stroke="#eab308" strokeWidth="1.5" />
                      </g>
                    )}

                    {callout.id === 'small_intestine' && (
                      <g>
                        <path d="M -12 -6 Q 0 -12 12 -6 Q 0 0 -12 6 Q 0 12 12 6" fill="none" stroke="url(#smallIntestineGrad)" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    )}

                    {callout.id === 'bladder' && (
                      <g>
                        <path d="M -8 -8 C -12 4 -4 14 0 14 C 4 14 12 4 8 -8 C 0 -12 0 -12 -8 -8 Z" fill="url(#bladderGrad)" stroke="#f59e0b" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'lungs' && (
                      <g>
                        <path d="M -12 -12 C -18 -8 -20 6 -12 12 C -8 10 -6 0 -8 -12 Z" fill="url(#lungsGrad)" stroke="#fb7185" strokeWidth="1" />
                        <path d="M 12 -12 C 18 -8 20 6 12 12 C 8 10 6 0 8 -12 Z" fill="url(#lungsGrad)" stroke="#fb7185" strokeWidth="1" />
                        <line x1="0" y1="-14" x2="0" y2="-6" stroke="#94a3b8" strokeWidth="2" />
                      </g>
                    )}

                    {callout.id === 'stomach' && (
                      <g>
                        <path d="M -4 -12 C 8 -12 14 -4 12 6 C 10 14 0 16 -8 12 C -12 8 -8 0 0 -2 Z" fill="url(#stomachGrad)" stroke="#f43f5e" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'spleen' && (
                      <g>
                        <ellipse cx="0" cy="0" rx="8" ry="14" transform="rotate(25 0 0)" fill="url(#spleenGrad)" stroke="#e11d48" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'pancreas' && (
                      <g>
                        <path d="M -14 0 C -6 -6 10 -6 16 0 C 12 6 -6 6 -14 0 Z" fill="url(#pancreasGrad)" stroke="#ca8a04" strokeWidth="1" />
                      </g>
                    )}

                    {callout.id === 'large_intestine' && (
                      <g>
                        <path d="M -10 10 L -10 -8 Q 0 -12 10 -8 L 10 10" fill="none" stroke="url(#largeIntestineGrad)" strokeWidth="5" strokeLinecap="round" />
                      </g>
                    )}

                    {callout.id === 'reproductive' && (
                      <g>
                        <path d="M 0 -4 L -10 -10 Q -14 -4 -6 0 L 0 8 L 6 0 Q 14 -4 10 -10 Z" fill="url(#reproductiveGrad)" stroke="#f43f5e" strokeWidth="1" />
                        <circle cx="-12" cy="-6" r="3" fill="#f472b6" />
                        <circle cx="12" cy="-6" r="3" fill="#f472b6" />
                      </g>
                    )}
                  </g>

                  {/* Organ English Label (Matching reference infographic) */}
                  <text
                    x="0"
                    y="22"
                    fill={isSelected ? '#0284c7' : isLight ? '#475569' : '#cbd5e1'}
                    fontSize="8.5"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="0.5"
                  >
                    {callout.englishLabel}
                  </text>

                  {/* Toxicity Badge / Affinity Tag */}
                  {isPrimary && (
                    <g transform="translate(42, -32)">
                      <circle cx="0" cy="0" r="6" fill="#e11d48" />
                      <text x="0" y="2.5" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">★</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Footer Legend Bar */}
      <div className={`w-full px-4 py-2 border-t flex flex-wrap items-center justify-between text-[11px] font-mono gap-2 ${
        isLight ? 'bg-slate-100/90 border-slate-200 text-slate-600' : 'bg-slate-950/90 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Órgano Diana Primario (★)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Impacto Moderado</span>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-500">
          Haga clic en cualquier órgano para enfocar el microscopio celular 1000x
        </div>
      </div>

    </div>
  );
};
