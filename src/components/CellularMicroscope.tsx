import React, { useState } from 'react';
import { 
  Microscope, 
  Sliders,
  HelpCircle,
  Play,
  Pause,
} from 'lucide-react';
import { ContaminantProfile } from '../types';

interface CellularMicroscopeProps {
  organId: string;
  contaminant: ContaminantProfile;
  tissuePpm: number;
  criticalDosePpm: number;
}

export const CellularMicroscope: React.FC<CellularMicroscopeProps> = ({
  organId,
  contaminant,
  tissuePpm,
  criticalDosePpm
}) => {
  const [zoomLevel, setZoomLevel] = useState<'100x' | '400x' | '1000x'>('400x');
  const [filterMode, setFilterMode] = useState<'brightfield' | 'fluorescence' | 'molecular'>('fluorescence');
  const [sharpnessLevel, setSharpnessLevel] = useState<number>(100);
  const [activeCellHotspot, setActiveCellHotspot] = useState<string | null>(null);
  const [isHistologyAnimated, setIsHistologyAnimated] = useState<boolean>(true);

  const toxicityRatio = Math.min(2.5, tissuePpm / Math.max(0.01, criticalDosePpm));
  const isSeverelyDamaged = toxicityRatio >= 1.0;

  // Render ultra-sharp crisp vector graphics per organ tissue according to Morfología Humana II
  const renderCellularSVG = () => {
    switch (organId) {
      case 'brain':
      case 'nervous_system':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <radialGradient id="somaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={filterMode === 'fluorescence' ? '#38bdf8' : '#60a5fa'} stopOpacity="0.9" />
                <stop offset="70%" stopColor={filterMode === 'fluorescence' ? '#0284c7' : '#2563eb'} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="axonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor={isSeverelyDamaged ? '#ef4444' : '#0ea5e9'} />
              </linearGradient>
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Microscopic Grid Background */}
            <rect width="400" height="300" fill="url(#gridPattern)" />

            {/* Astrocytes & Blood-Brain Barrier (BHE) Capillary Foot Processes */}
            <g stroke="#0284c7" strokeWidth="1.2" opacity="0.7">
              {/* Capillary vessel */}
              <line x1="20" y1="260" x2="380" y2="260" stroke="#f43f5e" strokeWidth="6" strokeOpacity="0.6" />
              {/* Astrocyte Perivascular Endfeet (Podocitos Gliales) */}
              <path d="M 70 210 L 60 256 M 150 200 L 160 256 M 270 210 L 260 256" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="70" cy="205" r="7" fill="#0369a1" stroke="#38bdf8" />
              <circle cx="270" cy="205" r="7" fill="#0369a1" stroke="#38bdf8" />
            </g>

            {/* Primary Multipolar Neuron Soma */}
            <g id="neuron-soma" className="cursor-pointer" onClick={() => setActiveCellHotspot('Soma Neuronal: Pérdida de sustancia de Nissl (Cromatolisis) y despolarización por metales pesados')}>
              {/* Dendritic Arborization (Celulípetas con espinas) */}
              <path d="M 120 120 Q 80 80 40 70 M 120 120 Q 90 40 70 20 M 120 120 Q 140 50 160 30 M 120 120 Q 60 140 30 160 M 120 120 Q 70 190 50 230" 
                fill="none" 
                stroke={filterMode === 'fluorescence' ? '#38bdf8' : '#94a3b8'} 
                strokeWidth={zoomLevel === '1000x' ? '4' : '2.5'} 
                strokeLinecap="round" 
              />
              
              {/* Dendritic Spines (Espinas Dendríticas - Puntos de contacto sináptico) */}
              <circle cx="40" cy="70" r="2.5" fill="#38bdf8" />
              <circle cx="70" cy="20" r="2.5" fill="#38bdf8" />
              <circle cx="160" cy="30" r="2.5" fill="#38bdf8" />
              <circle cx="30" cy="160" r="2.5" fill="#38bdf8" />
              
              {/* Soma Body */}
              <circle cx="130" cy="130" r="28" fill="url(#somaGlow)" />
              <circle cx="130" cy="130" r="24" fill={filterMode === 'fluorescence' ? '#0369a1' : '#1e3a8a'} stroke="#38bdf8" strokeWidth="1.5" />
              
              {/* Nucleus & Nucleolus */}
              <circle cx="128" cy="128" r="12" fill={filterMode === 'fluorescence' ? '#0284c7' : '#172554'} stroke="#7dd3fc" strokeWidth="1" />
              <circle cx="126" cy="126" r="4.5" fill={isSeverelyDamaged ? '#ef4444' : '#bae6fd'} className={isHistologyAnimated ? 'animate-pulse' : ''} />
              
              {/* Nissl Substance (Cuerpos Tigroides / RER) */}
              <circle cx="118" cy="120" r="1.5" fill="#e0f2fe" opacity="0.8" />
              <circle cx="140" cy="124" r="1.5" fill="#e0f2fe" opacity="0.8" />
              <circle cx="124" cy="140" r="1.5" fill="#e0f2fe" opacity="0.8" />
              <circle cx="136" cy="138" r="1.5" fill="#e0f2fe" opacity="0.8" />
            </g>

            {/* Axon Hillock & Myelinated Axon with Animated Saltatory Wave */}
            <g id="axon-pathway" className="cursor-pointer" onClick={() => setActiveCellHotspot('Axón & Mielina: Conducción saltatoria en Nódulos de Ranvier alterada por degeneración walleriana')}>
              {/* Core Axon Cilindroeje */}
              <path d="M 152 140 C 200 170 240 130 290 170 S 340 190 370 200" 
                fill="none" 
                stroke="url(#axonGrad)" 
                strokeWidth={zoomLevel === '1000x' ? '5' : '3.5'} 
                strokeLinecap="round" 
              />

              {/* Saltatory Wave Action Potential Overlay */}
              <path d="M 152 140 C 200 170 240 130 290 170 S 340 190 370 200" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2" 
                className={isHistologyAnimated ? 'animate-saltatory' : ''}
              />

              {/* Myelin Sheath Segments (Células de Schwann / Oligodendrocitos) */}
              <rect x="180" y="142" width="28" height="14" rx="4" transform="rotate(15, 180, 142)" 
                fill={isSeverelyDamaged ? '#7f1d1d' : '#047857'} 
                stroke={isSeverelyDamaged ? '#ef4444' : '#10b981'} 
                strokeWidth="1.2" 
              />
              <rect x="230" y="140" width="28" height="14" rx="4" transform="rotate(-10, 230, 140)" 
                fill={isSeverelyDamaged ? '#7f1d1d' : '#047857'} 
                stroke={isSeverelyDamaged ? '#ef4444' : '#10b981'} 
                strokeWidth="1.2" 
              />
              <rect x="280" y="160" width="28" height="14" rx="4" transform="rotate(20, 280, 160)" 
                fill={isSeverelyDamaged ? '#7f1d1d' : '#047857'} 
                stroke={isSeverelyDamaged ? '#ef4444' : '#10b981'} 
                strokeWidth="1.2" 
              />

              {/* Nodes of Ranvier (Nódulos de la Neurofibra) */}
              <line x1="216" y1="147" x2="222" y2="153" stroke="#f59e0b" strokeWidth="2.5" />
              <line x1="266" y1="154" x2="272" y2="160" stroke="#f59e0b" strokeWidth="2.5" />
            </g>

            {/* Synaptic Terminal Bouton & Vesicles (Telodendrón & Sinapsis) */}
            <g id="synapse-bouton" className="cursor-pointer" onClick={() => setActiveCellHotspot('Sinapsis Interneuronal: Bloqueo de canales de calcio y recaptación de glutamato por metales')}>
              <circle cx="370" cy="200" r="14" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
              <circle cx="366" cy="196" r="2.5" fill="#f43f5e" />
              <circle cx="372" cy="198" r="2.5" fill="#f43f5e" />
              <circle cx="368" cy="204" r="2.5" fill="#f43f5e" />
              <circle cx="375" cy="205" r="2" fill="#a855f7" />
              
              {/* Animated Neurotransmitter Vesicle Release in Synaptic Cleft */}
              <circle cx="386" cy="204" r="2" fill="#38bdf8" className={isHistologyAnimated ? 'animate-vesicle' : ''} />
              <circle cx="390" cy="200" r="1.5" fill="#38bdf8" />
              <path d="M 386 185 Q 390 200 386 215" fill="none" stroke="#a855f7" strokeWidth="2" />
            </g>

            {/* Heavy Metal Ion Contaminant Particles (Fluorescent Tagged) */}
            <g id="contaminant-ions">
              {Array.from({ length: Math.min(24, Math.floor(toxicityRatio * 10) + 4) }).map((_, i) => {
                const px = 80 + (i * 27) % 290;
                const py = 60 + (i * 37) % 180;
                return (
                  <g key={i} className={isHistologyAnimated ? 'animate-pulse' : ''} style={{ animationDelay: `${i * 0.15}s` }}>
                    <circle 
                      cx={px} 
                      cy={py} 
                      r={filterMode === 'molecular' ? 4.5 : 3} 
                      fill={contaminant.color} 
                      stroke="#ffffff" 
                      strokeWidth="0.8" 
                    />
                    <circle cx={px} cy={py} r={7} fill="none" stroke={contaminant.color} strokeWidth="0.5" strokeOpacity="0.7" />
                  </g>
                );
              })}
            </g>

            {/* Anatomical Label Pin */}
            <g transform="translate(130, 85)">
              <rect x="-40" y="-12" width="80" height="16" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.75" />
              <text x="0" y="0" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SOMA NEURONAL</text>
            </g>

            {/* High-Tech HUD Target Crosshair */}
            <g transform="translate(130, 130)">
              <circle cx="0" cy="0" r="38" fill="none" stroke="#06b6d4" strokeWidth="0.75" strokeDasharray="4 4" />
              <line x1="-44" y1="0" x2="-32" y2="0" stroke="#06b6d4" strokeWidth="1" />
              <line x1="32" y1="0" x2="44" y2="0" stroke="#06b6d4" strokeWidth="1" />
              <line x1="0" y1="-44" x2="0" y2="-32" stroke="#06b6d4" strokeWidth="1" />
              <line x1="0" y1="32" x2="0" y2="44" stroke="#06b6d4" strokeWidth="1" />
            </g>
          </svg>
        );

      case 'kidneys':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="renalGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#renalGrid)" />

            {/* Proximal Convoluted Tubule Cross Section (Morfología Humana II - Fig. 39.5) */}
            <g transform="translate(200, 150)">
              {/* Tubular Lumen */}
              <ellipse cx="0" cy="0" rx="140" ry="95" fill="#090d16" stroke="#475569" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="80" ry="45" fill="#020617" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="4 3" className={isHistologyAnimated ? 'animate-glomerular' : ''} />
              
              {/* Microvilli Brush Border (Ribete en Cepillo - 75% Resorción) */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i / 36) * Math.PI * 2;
                const rx1 = Math.cos(angle) * 78;
                const ry1 = Math.sin(angle) * 44;
                const rx2 = Math.cos(angle) * 94;
                const ry2 = Math.sin(angle) * 56;
                return (
                  <line 
                    key={i} 
                    x1={rx1} 
                    y1={ry1} 
                    x2={rx2} 
                    y2={ry2} 
                    stroke={isSeverelyDamaged ? '#f43f5e' : '#38bdf8'} 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className={isHistologyAnimated ? 'animate-pulse' : ''}
                  />
                );
              })}

              {/* Tubular Epithelial Cells with Basal Invaginations & Cristae Mitochondria */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const cx = Math.cos(angle) * 114;
                const cy = Math.sin(angle) * 72;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot('Célula Epitelial Tubular Simple Cilíndrica: Sobrecarga mitocondrial de complejos Cd-MT y pérdida de ribete en cepillo')}>
                    <circle cx={cx} cy={cy} r="18" fill={isSeverelyDamaged ? '#450a0a' : '#0f172a'} stroke="#0284c7" strokeWidth="1" />
                    {/* Nucleus */}
                    <circle cx={cx} cy={cy} r="8" fill={isSeverelyDamaged ? '#ef4444' : '#38bdf8'} />
                    {/* Mitochondria with ATP synthesis for active transport */}
                    <ellipse cx={cx + 7} cy={cy - 6} rx="4" ry="2" fill="#f59e0b" />
                    <ellipse cx={cx - 7} cy={cy + 6} rx="4" ry="2" fill="#f59e0b" />
                  </g>
                );
              })}

              {/* Heavy Metal Metallothionein Aggregates (Cd-MT) in Tubular Lumen & Lysosomes */}
              {Array.from({ length: Math.min(22, Math.floor(toxicityRatio * 9) + 4) }).map((_, i) => {
                const angle = (i * 0.7);
                const dist = 25 + (i * 14) % 95;
                const mx = Math.cos(angle) * dist;
                const my = Math.sin(angle) * (dist * 0.55);
                return (
                  <g key={i} className={isHistologyAnimated ? 'animate-pulse' : ''} style={{ animationDelay: `${i * 0.18}s` }}>
                    <circle cx={mx} cy={my} r="3.5" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.75" />
                  </g>
                );
              })}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 35)">
              <rect x="-95" y="-12" width="190" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.75" />
              <text x="0" y="0" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">TÚBULO CONTORNEADO PROXIMAL (TCP)</text>
            </g>

            {/* HUD Scale Label */}
            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              RIBETE EN CEPILLO + TRANSPORTE ACTIVO POR MITOCONDRIAS - {zoomLevel}
            </text>
          </svg>
        );

      case 'bones':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="boneGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#boneGrid)" />

            {/* Osteon (Sistema de Havers) */}
            <g transform="translate(200, 150)">
              {/* Concentric Lamellae Rings */}
              <circle cx="0" cy="0" r="130" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="5 3" />
              <circle cx="0" cy="0" r="105" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 2" />
              <circle cx="0" cy="0" r="80" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="5 3" />
              <circle cx="0" cy="0" r="55" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 2" />
              
              {/* Haversian Central Canal with Artery, Vein & Nerve */}
              <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="-10" cy="-6" r="8" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.75" className={isHistologyAnimated ? 'animate-pulse' : ''} /> {/* Artery */}
              <circle cx="8" cy="-6" r="9" fill="#0284c7" stroke="#93c5fd" strokeWidth="0.75" /> {/* Vein */}
              <circle cx="0" cy="12" r="5" fill="#eab308" stroke="#fef08a" strokeWidth="0.75" /> {/* Nerve */}

              {/* Osteocytes in Lacunae with Radiating Canaliculi */}
              {Array.from({ length: 18 }).map((_, i) => {
                const ring = (i % 3) + 1;
                const rRadius = ring === 1 ? 55 : ring === 2 ? 80 : 105;
                const angle = (i * 1.05);
                const ox = Math.cos(angle) * rRadius;
                const oy = Math.sin(angle) * rRadius;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot('Osteocito en Laguna: Sustitución de Ca²⁺ por Plomo/Cadmio en la matriz de Hidroxiapatita')}>
                    {/* Canaliculi (Micro-canales) */}
                    <line x1={ox} y1={oy} x2={ox + 8} y2={oy + 6} stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.8" />
                    <line x1={ox} y1={oy} x2={ox - 8} y2={oy - 6} stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.8" />
                    <line x1={ox} y1={oy} x2={ox - 6} y2={oy + 8} stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.8" />
                    
                    {/* Lacuna & Osteocyte Body */}
                    <ellipse cx={ox} cy={oy} rx="7" ry="4" transform={`rotate(${angle * 57}, ${ox}, ${oy})`} fill="#0284c7" stroke="#7dd3fc" strokeWidth="1" />
                    <circle cx={ox} cy={oy} r="2" fill={isSeverelyDamaged ? '#ef4444' : '#ffffff'} />
                  </g>
                );
              })}

              {/* Lead/Cadmium replacing Calcium in Hydroxyapatite Crystals */}
              {Array.from({ length: Math.min(22, Math.floor(toxicityRatio * 9) + 4) }).map((_, i) => {
                const angle = i * 0.85;
                const dist = 40 + (i * 15) % 85;
                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;
                return (
                  <g key={i} className={isHistologyAnimated ? 'animate-pulse' : ''} style={{ animationDelay: `${i * 0.1}s` }}>
                    <polygon 
                      points={`${px},${py - 3} ${px + 3},${py + 2} ${px - 3},${py + 2}`} 
                      fill={contaminant.color} 
                      stroke="#ffffff" 
                      strokeWidth="0.5" 
                    />
                  </g>
                );
              })}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 35)">
              <rect x="-85" y="-12" width="170" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="0.75" />
              <text x="0" y="0" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SISTEMA HAVERSIANO (OSTEONA)</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              CRISTALES DE HIDROXIAPATITA Ca₁₀(PO₄)₆(OH)₂ - {zoomLevel}
            </text>
          </svg>
        );

      case 'liver':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="liverGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#liverGrid)" />

            {/* Hexagonal Hepatic Lobule Cord (Morfología Humana II - Fig. 37.20 / 37.22) */}
            <g transform="translate(200, 150)">
              {/* Central Vein (Vena Central) */}
              <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
              <circle cx="0" cy="0" r="22" fill="#0284c7" opacity="0.3" className={isHistologyAnimated ? 'animate-pulse' : ''} />

              {/* Hepatocyte Cords (Cordones de Remak con Sinusoides Discontinuos Tipo III) */}
              {Array.from({ length: 6 }).map((_, spoke) => {
                const angle = (spoke / 6) * Math.PI * 2;
                return (
                  <g key={spoke}>
                    {/* Biliary Canaliculi (Centrífugos hacia la periferia) */}
                    <line x1="0" y1="0" x2={Math.cos(angle) * 125} y2={Math.sin(angle) * 125} stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" />
                    
                    {Array.from({ length: 4 }).map((_, step) => {
                      const dist = 45 + step * 25;
                      const hx = Math.cos(angle) * dist;
                      const hy = Math.sin(angle) * dist;
                      return (
                        <g key={step} className="cursor-pointer" onClick={() => setActiveCellHotspot('Hepatocito en Cordón de Remak: Degeneración vacuolar hidrópica, balonización celular y detoxificación citocromo P450')}>
                          {/* Hepatocyte Hexagon / Octagon */}
                          <polygon 
                            points={`${hx-10},${hy-6} ${hx},${hy-12} ${hx+10},${hy-6} ${hx+10},${hy+6} ${hx},${hy+12} ${hx-10},${hy+6}`} 
                            fill={isSeverelyDamaged ? '#78350f' : '#1e293b'} 
                            stroke="#ca8a04" 
                            strokeWidth="1" 
                          />
                          {/* Polyploid Nucleus */}
                          <circle cx={hx} cy={hy} r="4" fill={isSeverelyDamaged ? '#ef4444' : '#eab308'} />
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Kupffer Macrophages & Perisinusoidal Space of Disse */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 2) }).map((_, i) => {
                const angle = i * 1.1;
                const dist = 35 + (i * 18) % 90;
                const rx = Math.cos(angle) * dist;
                const ry = Math.sin(angle) * dist;
                return (
                  <g key={i} className={isHistologyAnimated ? 'animate-pulse' : ''} style={{ animationDelay: `${i * 0.12}s` }}>
                    <circle cx={rx} cy={ry} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" />
                  </g>
                );
              })}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 35)">
              <rect x="-95" y="-12" width="190" height="18" rx="4" fill="#0f172a" stroke="#ca8a04" strokeWidth="0.75" />
              <text x="0" y="0" fill="#facc15" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LOBULILLO HEPÁTICO & CORDONES DE REMAK</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              SINUSOIDES TIPO III + CÉLULAS DE KUPFFER EN ESPACIO DE DISSE - {zoomLevel}
            </text>
          </svg>
        );

      case 'skin':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="skinGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#skinGrid)" />

            {/* Epidermal Strata Layers (Corneum, Spinosum, Basale) */}
            <g transform="translate(50, 40)">
              {/* Stratum Corneum (Hyperkeratosis in Arsenic) */}
              <rect x="0" y="20" width="300" height={isSeverelyDamaged ? "35" : "18"} rx="4" fill={isSeverelyDamaged ? "#78350f" : "#ca8a04"} stroke="#f59e0b" strokeWidth="1.5" className="cursor-pointer" onClick={() => setActiveCellHotspot('Estrato Córneo: Hiperqueratosis palmoplantar verrugosa')} />
              <text x="150" y={isSeverelyDamaged ? "42" : "32"} fill="#fef08a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ESTRATO CÓRNEO (QUERATINA)</text>

              {/* Stratum Spinosum / Keratinocytes */}
              <g transform="translate(0, 65)">
                {Array.from({ length: 16 }).map((_, i) => {
                  const kx = 15 + (i % 8) * 36;
                  const ky = Math.floor(i / 8) * 32;
                  return (
                    <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot('Queratinocito: Mutaciones por unión a grupos sulfhidrilo (-SH)')}>
                      <rect x={kx} y={ky} width="28" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                      <circle cx={kx + 14} cy={ky + 12} r="5" fill={isSeverelyDamaged ? '#ef4444' : '#38bdf8'} />
                    </g>
                  );
                })}
              </g>

              {/* Stratum Basale & Melanocytes (Leucomelanodermia) */}
              <g transform="translate(0, 140)">
                <rect x="0" y="0" width="300" height="25" rx="3" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <circle key={i} cx={25 + i * 50} cy="12" r="7" fill={isSeverelyDamaged ? '#581c87' : '#a855f7'} stroke="#e9d5ff" strokeWidth="1" className="cursor-pointer" onClick={() => setActiveCellHotspot('Melanocito Basal: Dispersión aberrante de melanina (Gotas de Lluvia)')} />
                ))}
              </g>

              {/* Arsenic Toxic Crystals */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 2) }).map((_, i) => (
                <circle key={i} cx={20 + (i * 38) % 280} cy={30 + (i * 22) % 130} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              HISTOLOGÍA EPIDÉRMICA + QUERATINOCITOS - {zoomLevel}
            </text>
          </svg>
        );

      case 'heart':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="cardiacGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
              <linearGradient id="myocyteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#cardiacGrid)" />

            {/* Branching Cardiomyocytes (Fibras Miocárdicas Bifurcadas con Discos Intercalares) */}
            <g transform="translate(40, 50)">
              {/* Upper Cardiomyocyte Fiber */}
              <g className="cursor-pointer" onClick={() => setActiveCellHotspot('Cardiomiocito Ventricular: Fibras ramificadas con sarcómeros (Discos Z) y alta densidad mitocondrial')}>
                <path d="M 20 40 L 160 40 L 220 20 L 320 20 L 320 60 L 220 60 L 160 80 L 20 80 Z" fill="url(#myocyteGrad)" stroke="#f87171" strokeWidth="1.5" />
                
                {/* Sarcomere Cross-Striations (Estrías transversales / Bandas A e I) */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <line key={i} x1={30 + i * 12} y1="42" x2={30 + i * 12} y2={i > 10 && i < 16 ? "78" : "58"} stroke="#450a0a" strokeWidth="1.2" strokeDasharray="3 2" />
                ))}

                {/* Central Oval Nucleus */}
                <ellipse cx="90" cy="60" rx="14" ry="9" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
                <circle cx="90" cy="60" r="3.5" fill={isSeverelyDamaged ? '#ef4444' : '#c7d2fe'} />

                {/* Intercalated Discs (Discos Intercalares / Uniones GAP y Fascia Adherens) */}
                <path d="M 160 40 L 160 80" stroke="#fef08a" strokeWidth="3" strokeDasharray="4 2" className={isHistologyAnimated ? 'animate-pulse' : ''} />
                <path d="M 270 20 L 270 60" stroke="#fef08a" strokeWidth="3" strokeDasharray="4 2" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              </g>

              {/* Lower Cardiomyocyte Fiber */}
              <g className="cursor-pointer" onClick={() => setActiveCellHotspot('Discos Intercalares: Conducción eléctrica sincitial alterada por estrés oxidativo y disfunción de canales de calcio')}>
                <path d="M 20 110 L 180 110 L 240 130 L 320 130 L 320 170 L 240 170 L 180 150 L 20 150 Z" fill="url(#myocyteGrad)" stroke="#f87171" strokeWidth="1.5" />
                
                {/* Cross-Striations */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <line key={i} x1={30 + i * 12} y1={i > 12 ? "132" : "112"} x2={30 + i * 12} y2="168" stroke="#450a0a" strokeWidth="1.2" strokeDasharray="3 2" />
                ))}

                {/* Central Nucleus */}
                <ellipse cx="110" cy="130" rx="14" ry="9" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
                <circle cx="110" cy="130" r="3.5" fill={isSeverelyDamaged ? '#ef4444' : '#c7d2fe'} />

                <path d="M 180 110 L 180 150" stroke="#fef08a" strokeWidth="3" strokeDasharray="4 2" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              </g>

              {/* Interstitial Capillary with Erythrocytes */}
              <rect x="20" y="86" width="300" height="18" rx="3" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
              {Array.from({ length: 6 }).map((_, idx) => (
                <ellipse key={idx} cx={45 + idx * 48} cy="95" rx="8" ry="5" fill="#ef4444" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}

              {/* Toxic Heavy Metal Aggregates */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={40 + (i * 37) % 270} cy={30 + (i * 29) % 140} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 30)">
              <rect x="-105" y="-12" width="210" height="18" rx="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fca5a5" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CARDIOMIOCITOS & DISCOS INTERCALARES</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              DISCOS INTERCALARES + SARCÓMEROS + RETÍCULO SARCOPLÁSMICO - {zoomLevel}
            </text>
          </svg>
        );

      case 'lungs':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="lungGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#lungGrid)" />

            {/* Alveolar Sac & Alveolo-Capillary Barrier (Morfología Humana II) */}
            <g transform="translate(200, 145)">
              {/* Alveolar Lumen with Aeration */}
              <circle cx="0" cy="0" r="95" fill="#030712" stroke="#fda4af" strokeWidth="2" strokeDasharray="6 3" />

              {/* Interalveolar Septum / Capillary Wall Ring */}
              <circle cx="0" cy="0" r="115" fill="none" stroke="#38bdf8" strokeWidth="6" strokeOpacity="0.35" />

              {/* Type I Pneumocytes (Epitelio plano muy delgado para difusión de O2/CO2) */}
              {Array.from({ length: 12 }).map((_, i) => {
                const ang = (i / 12) * Math.PI * 2;
                const px = Math.cos(ang) * 95;
                const py = Math.sin(ang) * 95;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot('Neumocito Tipo I (95% superficie alveolar): Célula escamosa extremadamente delgada para hematosis')}>
                    <ellipse cx={px} cy={py} rx="12" ry="4" transform={`rotate(${ang * 57}, ${px}, ${py})`} fill="#0f172a" stroke="#fda4af" strokeWidth="1" />
                    <circle cx={px} cy={py} r="2" fill="#fda4af" />
                  </g>
                );
              })}

              {/* Type II Pneumocytes (Células cúbicas con cuerpos lamelares y Surfactante) */}
              {[0.4, 2.2, 4.3].map((ang, idx) => {
                const px = Math.cos(ang) * 95;
                const py = Math.sin(ang) * 95;
                return (
                  <g key={idx} className="cursor-pointer" onClick={() => setActiveCellHotspot('Neumocito Tipo II: Producción de surfactante dipalmitoilfosfatidilcolina para evitar colapso alveolar')}>
                    <rect x={px - 8} y={py - 8} width="16" height="16" rx="3" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1.5" />
                    <circle cx={px} cy={py} r="3" fill="#c084fc" />
                  </g>
                );
              })}

              {/* Alveolar Macrophage (Dust Cell) */}
              <g transform="translate(-25, 20)" className="cursor-pointer" onClick={() => setActiveCellHotspot('Macrófago Alveolar (Célula de polvo): Fagocitosis de partículas inhaladas y respuesta inflamatoria')}>
                <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
                <circle cx="-3" cy="-2" r="4" fill="#6ee7b7" />
                <circle cx="4" cy="3" r="2" fill="#047857" />
              </g>

              {/* Capillary Lumen with RBCs around Septum */}
              {Array.from({ length: 8 }).map((_, i) => {
                const ang = (i / 8) * Math.PI * 2 + 0.3;
                const cx = Math.cos(ang) * 115;
                const cy = Math.sin(ang) * 115;
                return (
                  <ellipse key={i} cx={cx} cy={cy} rx="7" ry="4" transform={`rotate(${ang * 57}, ${cx}, ${cy})`} fill="#ef4444" stroke="#fca5a5" strokeWidth="0.5" />
                );
              })}

              {/* Toxic Metal Dust / Inhaled Particles */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={Math.cos(i) * (30 + (i * 12) % 55)} cy={Math.sin(i) * (30 + (i * 12) % 55)} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 30)">
              <rect x="-105" y="-12" width="210" height="18" rx="4" fill="#0f172a" stroke="#fda4af" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fda4af" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BARRERA ALVEOLO-CAPILAR & NEUMOCITOS</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              NEUMOCITOS I/II + MEMBRANA BASAL FUSIONADA + SURFACTANTE - {zoomLevel}
            </text>
          </svg>
        );

      case 'stomach':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="stomachGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#stomachGrid)" />

            {/* Gastric Mucosa & Gastric Pit (Cripta y Glándula Oxíntica Fúndica) */}
            <g transform="translate(60, 40)">
              {/* Surface Mucus Layer */}
              <rect x="0" y="10" width="280" height="14" rx="3" fill="#047857" fillOpacity="0.6" stroke="#10b981" strokeWidth="1" className="cursor-pointer" onClick={() => setActiveCellHotspot('Barrera Mucosa de Bicarbonato: Protección contra el ácido clorhídrico (pH 1.5-2.0)')} />
              <text x="140" y="21" fill="#a7f3d0" fontSize="8" fontFamily="monospace" textAnchor="middle">BARRERA DE MOCO Y BICARBONATO (pH GÁSTRICO)</text>

              {/* Surface Epithelial Mucous Cells */}
              <g transform="translate(0, 30)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect key={i} x={i * 23} y="0" width="20" height="28" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
                ))}
              </g>

              {/* Gastric Pit Infolding with Parietal & Chief Cells */}
              <g transform="translate(0, 65)">
                {/* Parietal (Oxyntic) Cells - Fried-egg appearance with intracellular canaliculi for HCl */}
                {[20, 90, 160, 230].map((xPos, idx) => (
                  <g key={idx} transform={`translate(${xPos}, 15)`} className="cursor-pointer" onClick={() => setActiveCellHotspot('Célula Parietal (Oxíntica): Secreción de HCl por bomba H⁺/K⁺-ATPasa y Factor Intrínseco')}>
                    <circle cx="16" cy="16" r="16" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
                    <circle cx="16" cy="16" r="7" fill="#fef08a" />
                    {/* Intracellular Canaliculi Lines */}
                    <circle cx="16" cy="16" r="12" fill="none" stroke="#ca8a04" strokeWidth="1" strokeDasharray="3 2" />
                  </g>
                ))}

                {/* Chief (Zymogenic) Cells - Secreting Pepsinogen */}
                {[55, 125, 195].map((xPos, idx) => (
                  <g key={idx} transform={`translate(${xPos}, 20)`} className="cursor-pointer" onClick={() => setActiveCellHotspot('Célula Principal (Cimógena): Síntesis y secreción de pepsinógeno')}>
                    <rect x="0" y="0" width="26" height="26" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
                    <circle cx="13" cy="13" r="5" fill="#a5b4fc" />
                    {/* Zymogen Granules */}
                    <circle cx="8" cy="8" r="1.5" fill="#c7d2fe" />
                    <circle cx="18" cy="8" r="1.5" fill="#c7d2fe" />
                    <circle cx="13" cy="20" r="1.5" fill="#c7d2fe" />
                  </g>
                ))}
              </g>

              {/* Submucosa & Muscularis Mucosae */}
              <rect x="0" y="170" width="280" height="24" rx="3" fill="#450a0a" stroke="#f87171" strokeWidth="1" />
              <text x="140" y="185" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle">LÁMINA PROPIA & MUSCULARIS MUCOSAE</text>

              {/* Toxic Metal Ions */}
              {Array.from({ length: Math.min(16, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={15 + (i * 42) % 250} cy={45 + (i * 31) % 110} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 25)">
              <rect x="-105" y="-12" width="210" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fde68a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MUCOSA GÁSTRICA & CÉLULAS PARIETALES</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              GLÁNDULAS OXÍNTICAS + CÉLULAS PARIETALES (HCl) Y PRINCIPALES - {zoomLevel}
            </text>
          </svg>
        );

      case 'pancreas':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="pancGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#pancGrid)" />

            {/* Islet of Langerhans surrounded by Exocrine Acini (Morfología Humana II) */}
            <g transform="translate(200, 145)">
              {/* Exocrine Acini in background */}
              {Array.from({ length: 8 }).map((_, i) => {
                const ang = (i / 8) * Math.PI * 2;
                const ax = Math.cos(ang) * 115;
                const ay = Math.sin(ang) * 85;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot('Acino Pancreático Exocrino: Síntesis de tripsinógeno, lipasa y amilasa pancreática')}>
                    <circle cx={ax} cy={ay} r="22" fill="#1e293b" stroke="#ca8a04" strokeWidth="1" />
                    {/* Zymogen Granules */}
                    <circle cx={ax - 5} cy={ay - 5} r="2" fill="#facc15" />
                    <circle cx={ax + 5} cy={ay - 5} r="2" fill="#facc15" />
                    <circle cx={ax} cy={ay + 6} r="2" fill="#facc15" />
                  </g>
                );
              })}

              {/* Central Endocrine Islet of Langerhans (Islote de Langerhans) */}
              <ellipse cx="0" cy="0" rx="80" ry="55" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" className="cursor-pointer" onClick={() => setActiveCellHotspot('Islote de Langerhans: Células Beta (65-70% productoras de Insulina) y Alfa (Glucagón)')} />

              {/* Beta Cells (Insulin producers - stained Cyan/Blue) */}
              {Array.from({ length: 14 }).map((_, i) => {
                const bx = -45 + (i * 24) % 90;
                const by = -25 + (i * 18) % 55;
                return (
                  <g key={i}>
                    <circle cx={bx} cy={by} r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.8" />
                    <circle cx={bx} cy={by} r="3" fill={isSeverelyDamaged ? '#ef4444' : '#bae6fd'} className={isHistologyAnimated ? 'animate-pulse' : ''} />
                  </g>
                );
              })}

              {/* Alpha Cells (Glucagon producers - stained Amber) */}
              {[-60, 55, -40, 45].map((pos, idx) => (
                <circle key={idx} cx={pos} cy={idx % 2 === 0 ? -35 : 35} r="8" fill="#78350f" stroke="#f59e0b" strokeWidth="0.8" />
              ))}

              {/* Fenestrated Capillary in Islet */}
              <path d="M -70 0 Q 0 -15 70 0" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 2" />

              {/* Toxic Metal Ions */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={-50 + (i * 28) % 100} cy={-30 + (i * 22) % 65} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 25)">
              <rect x="-105" y="-12" width="210" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.75" />
              <text x="0" y="0" fill="#7dd3fc" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ISLOTE DE LANGERHANS & CÉLULAS BETA</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              CÉLULAS BETA (INSULINA) + ALFA (GLUCAGÓN) + ACINOS SEROSOS - {zoomLevel}
            </text>
          </svg>
        );

      case 'spleen':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="spleenGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#spleenGrid)" />

            {/* White Pulp (Pulpa Blanca) vs Red Pulp (Pulpa Roja) */}
            <g transform="translate(200, 145)">
              {/* Red Pulp Background with Splenic Cords of Billroth */}
              <rect x="-160" y="-105" width="320" height="210" rx="8" fill="#450a0a" stroke="#7f1d1d" strokeWidth="1.5" />

              {/* White Pulp Lymphoid Nodule (Nódulo Linfático Esplénico con Arteria Central) */}
              <circle cx="-50" cy="0" r="70" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" className="cursor-pointer" onClick={() => setActiveCellHotspot('Pulpa Blanca: Manguito linfoide periarteriolar (PALS) con linfocitos T y B inmunocompetentes')} />
              
              {/* Central Arteriole (Arteriola Central) */}
              <circle cx="-50" cy="-20" r="14" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
              <circle cx="-50" cy="-20" r="8" fill="#ef4444" />

              {/* Lymphocytes in White Pulp */}
              {Array.from({ length: 22 }).map((_, i) => {
                const lx = -50 + Math.cos(i * 0.7) * (20 + (i * 7) % 45);
                const ly = Math.sin(i * 0.7) * (20 + (i * 7) % 45);
                return (
                  <circle key={i} cx={lx} cy={ly} r="3.5" fill="#a5b4fc" />
                );
              })}

              {/* Splenic Sinusoids in Red Pulp (Sinusoides esplénicos con células en duelas de barril) */}
              <g transform="translate(60, 0)">
                <path d="M 0 -70 Q 30 0 0 70" fill="none" stroke="#fda4af" strokeWidth="6" strokeDasharray="6 3" />
                <path d="M 40 -70 Q 70 0 40 70" fill="none" stroke="#fda4af" strokeWidth="6" strokeDasharray="6 3" />
                
                {/* Macrophages clearing senescent RBCs */}
                <circle cx="20" cy="-20" r="10" fill="#064e3b" stroke="#34d399" strokeWidth="1" className="cursor-pointer" onClick={() => setActiveCellHotspot('Macrófago Esplénico (Hemocateresis): Destrucción fisiológica de eritrocitos envejecidos')} />
                <circle cx="20" cy="30" r="10" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
              </g>

              {/* Toxic Metal Ions */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={-120 + (i * 35) % 240} cy={-70 + (i * 27) % 150} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 25)">
              <rect x="-105" y="-12" width="210" height="18" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="0.75" />
              <text x="0" y="0" fill="#c7d2fe" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PULPA BLANCA & PULPA ROJA ESPLÉNICA</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              CORDONES DE BILLROTH + ARTERIOLA CENTRAL + SINUSOIDES - {zoomLevel}
            </text>
          </svg>
        );

      case 'thyroid':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="thyGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#thyGrid)" />

            {/* Thyroid Follicles with Central Colloid (Morfología Humana II) */}
            <g transform="translate(200, 145)">
              {/* Primary Large Thyroid Follicle */}
              <g className="cursor-pointer" onClick={() => setActiveCellHotspot('Folículo Tiroideo: Coloide rico en Tiroglobulina y células foliculares cúbicas para síntesis de T3 y T4')}>
                {/* Colloid Core */}
                <ellipse cx="-40" cy="0" rx="75" ry="60" fill="#831843" fillOpacity="0.8" stroke="#f472b6" strokeWidth="1.2" />
                <text x="-40" y="4" fill="#fbcfe8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">COLOIDE (TIROGLOBULINA)</text>

                {/* Follicular Epithelial Cells (Simple Cuboidal Ring) */}
                {Array.from({ length: 18 }).map((_, i) => {
                  const ang = (i / 18) * Math.PI * 2;
                  const fx = -40 + Math.cos(ang) * 78;
                  const fy = Math.sin(ang) * 63;
                  return (
                    <g key={i}>
                      <circle cx={fx} cy={fy} r="9" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1" />
                      <circle cx={fx} cy={fy} r="3" fill="#e9d5ff" />
                    </g>
                  );
                })}
              </g>

              {/* Smaller Adjacent Follicle */}
              <g transform="translate(100, -20)">
                <ellipse cx="0" cy="0" rx="45" ry="38" fill="#831843" fillOpacity="0.8" stroke="#f472b6" strokeWidth="1" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const ang = (i / 12) * Math.PI * 2;
                  const fx = Math.cos(ang) * 48;
                  const fy = Math.sin(ang) * 41;
                  return (
                    <circle key={i} cx={fx} cy={fy} r="7" fill="#1e1b4b" stroke="#a855f7" strokeWidth="0.8" />
                  );
                })}
              </g>

              {/* Parafollicular C-Cells (Calcitonin producers) */}
              <g transform="translate(45, 50)" className="cursor-pointer" onClick={() => setActiveCellHotspot('Célula Parafolicular C: Secreción de calcitonina para regular niveles de calcio sérico')}>
                <circle cx="0" cy="0" r="10" fill="#065f46" stroke="#34d399" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="3" fill="#a7f3d0" />
              </g>

              {/* Toxic Metal Ions */}
              {Array.from({ length: Math.min(16, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={-80 + (i * 32) % 180} cy={-50 + (i * 24) % 110} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 25)">
              <rect x="-105" y="-12" width="210" height="18" rx="4" fill="#0f172a" stroke="#f472b6" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fbcfe8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">FOLÍCULOS TIROIDEOS & COLOIDE</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              EPITELIO CÚBICO SIMPLE + TIROGLOBULINA + CÉLULAS C - {zoomLevel}
            </text>
          </svg>
        );

      case 'gallbladder':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="gbGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#gbGrid)" />
            <g transform="translate(60, 50)">
              {/* Mucosal Folds (Pliegues Mucosos Vesiculares) */}
              <path d="M 20 180 Q 60 40 100 120 T 180 80 T 260 180" fill="none" stroke="#10b981" strokeWidth="4" />
              {/* Tall Simple Columnar Epithelium */}
              {Array.from({ length: 16 }).map((_, i) => (
                <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot('Colangiocito & Epitelio Cilíndrico Simple: Microvellosidades apicales y transporte de agua/sales biliares')}>
                  <rect x={20 + i * 15} y="110" width="13" height="40" rx="2" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
                  <ellipse cx={26.5 + i * 15} cy="138" rx="4" ry="7" fill="#6ee7b7" />
                </g>
              ))}
              {/* Lamina Propia & Smooth Muscle */}
              <rect x="10" y="160" width="260" height="25" rx="3" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
              <text x="140" y="176" fill="#bbf7d0" fontSize="8" fontFamily="monospace" textAnchor="middle">LÁMINA PROPIA & CAPA MUSCULAR LISA</text>
              {/* Toxic Metal Precipitates */}
              {Array.from({ length: Math.min(16, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={20 + (i * 35) % 240} cy={70 + (i * 25) % 80} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>
            <g transform="translate(200, 25)">
              <rect x="-110" y="-12" width="220" height="18" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="0.75" />
              <text x="0" y="0" fill="#a7f3d0" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VESÍCULA BILIAR & EPITELIO CILÍNDRICO</text>
            </g>
            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              COLANGIOCITOS + PLIEGUES MUCOSOS + BILIS CONCENTRADA - {zoomLevel}
            </text>
          </svg>
        );

      case 'small_intestine':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="siGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#siGrid)" />
            <g transform="translate(40, 45)">
              {/* Intestinal Villi (Vellosidades Intestinales) */}
              {[40, 110, 180, 250].map((vx, idx) => (
                <g key={idx} className="cursor-pointer" onClick={() => setActiveCellHotspot('Vellosidad Intestinal: Enterocitos con chapa estriada (microvellosidades) para absorción masiva de nutrientes')}>
                  {/* Villus Projection */}
                  <path d={`M ${vx} 170 C ${vx - 5} 70 ${vx + 15} 40 ${vx + 25} 40 C ${vx + 35} 40 ${vx + 55} 70 ${vx + 50} 170 Z`} fill="#1e293b" stroke="#f43f5e" strokeWidth="1.5" />
                  {/* Central Lacteal & Capillary */}
                  <line x1={vx + 25} y1="60" x2={vx + 25} y2="165" stroke="#38bdf8" strokeWidth="2" />
                  {/* Enterocytes / Goblet cells */}
                  <circle cx={vx + 10} cy="75" r="3" fill="#fca5a5" />
                  <circle cx={vx + 40} cy="75" r="3" fill="#fca5a5" />
                  <circle cx={vx + 12} cy="115" r="3.5" fill="#38bdf8" />
                </g>
              ))}
              {/* Crypts of Lieberkühn (Criptas basales) */}
              <rect x="20" y="170" width="280" height="30" rx="3" fill="#3f1d2e" stroke="#fb7185" strokeWidth="1" />
              <text x="160" y="190" fill="#fda4af" fontSize="8" fontFamily="monospace" textAnchor="middle">CRIPTAS DE LIEBERKÜHN & CÉLULAS DE PANETH</text>
              {/* Toxic Heavy Metals Absorbing via LAT1 / DMT1 */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={30 + (i * 38) % 260} cy={50 + (i * 24) % 110} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>
            <g transform="translate(200, 25)">
              <rect x="-115" y="-12" width="230" height="18" rx="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fda4af" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VELLOSIDADES & ENTEROCITOS (DMT1)</text>
            </g>
            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              MICROVELLOSIDADES EN CEPILLO + VASO QUILÍFERO CENTRAL - {zoomLevel}
            </text>
          </svg>
        );

      case 'large_intestine':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="liGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#liGrid)" />
            <g transform="translate(50, 45)">
              {/* Colon Tubular Crypts with Abundant Goblet Cells */}
              <g className="cursor-pointer" onClick={() => setActiveCellHotspot('Células Caliciformes del Colon: Secreción masiva de mucina ácida para lubricación de heces y protección')}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <g key={i} transform={`translate(${i * 38}, 0)`}>
                    <rect x="0" y="20" width="30" height="120" rx="4" fill="#1e293b" stroke="#e11d48" strokeWidth="1.2" />
                    {/* Goblet mucus cells (cáliz) */}
                    <circle cx="15" cy="40" r="5" fill="#38bdf8" />
                    <circle cx="15" cy="70" r="5" fill="#38bdf8" />
                    <circle cx="15" cy="100" r="5" fill="#38bdf8" />
                  </g>
                ))}
              </g>
              {/* Muscularis Externa (Taeniae Coli) */}
              <rect x="0" y="150" width="300" height="35" rx="3" fill="#4c0519" stroke="#f43f5e" strokeWidth="1" />
              <text x="150" y="172" fill="#fecdd3" fontSize="8" fontFamily="monospace" textAnchor="middle">TENIAS DEL COLON & PLEXO MIENTÉRICO DE AUERBACH</text>
              {/* Toxic Metal Ions */}
              {Array.from({ length: Math.min(16, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={15 + (i * 42) % 270} cy={30 + (i * 22) % 110} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>
            <g transform="translate(200, 25)">
              <rect x="-110" y="-12" width="220" height="18" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fda4af" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MUCOSA COLÓNICA & CÉLULAS CALICIFORMES</text>
            </g>
            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              CRIPTAS TUBULARES RECTAS + SECRECIÓN DE MUCINA - {zoomLevel}
            </text>
          </svg>
        );

      case 'bladder':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="bladGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#bladGrid)" />
            <g transform="translate(50, 45)">
              {/* Transitional Epithelium / Urothelium (Urotelio) */}
              <g className="cursor-pointer" onClick={() => setActiveCellHotspot('Célula en Paraguas (Urotelio): Placas de uroplaquina impermeables a toxinas urinarias y orina hiperosmolar')}>
                {/* Umbrella Cells (Células en Paraguas / Superficiales) */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <g key={i} transform={`translate(${i * 50}, 20)`}>
                    <path d="M 5 25 Q 25 5 45 25 L 45 38 L 5 38 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
                    {/* Binucleated appearance */}
                    <circle cx="20" cy="24" r="3.5" fill="#fef08a" />
                    <circle cx="30" cy="24" r="3.5" fill="#fef08a" />
                  </g>
                ))}
                {/* Intermediate Piriform Cells */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <g key={i} transform={`translate(${i * 25}, 60)`}>
                    <ellipse cx="12" cy="15" rx="10" ry="12" fill="#1e293b" stroke="#ca8a04" strokeWidth="1" />
                    <circle cx="12" cy="15" r="3.5" fill="#fde047" />
                  </g>
                ))}
              </g>
              {/* Lamina Propia & Detrusor Smooth Muscle */}
              <rect x="0" y="130" width="300" height="55" rx="3" fill="#450a0a" stroke="#f87171" strokeWidth="1.2" />
              <text x="150" y="160" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle">MÚSCULO DETRUSOR (3 CAPAS DE MÚSCULO LISO)</text>
              {/* Toxic Metabolites in Concentrated Urine */}
              {Array.from({ length: Math.min(18, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={15 + (i * 39) % 270} cy={10 + (i * 18) % 65} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>
            <g transform="translate(200, 25)">
              <rect x="-110" y="-12" width="220" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fde68a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">UROTELIO & CÉLULAS EN PARAGUAS</text>
            </g>
            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              EPITELIO DE TRANSICIÓN + UROPLAQUINAS + DETRUSOR - {zoomLevel}
            </text>
          </svg>
        );

      case 'reproductive':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="repGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#repGrid)" />
            <g transform="translate(200, 145)">
              {/* Primary Ovarian Follicle (Folículo Ovárico Primordial/Secundario) */}
              <g className="cursor-pointer" onClick={() => setActiveCellHotspot('Folículo Ovárico: Oocito con Zona Pelúcida y Células de la Granulosa para síntesis de estrógenos')}>
                <circle cx="-50" cy="0" r="60" fill="#831843" stroke="#f472b6" strokeWidth="1.5" />
                {/* Oocyte */}
                <circle cx="-50" cy="0" r="22" fill="#be185d" stroke="#fbcfe8" strokeWidth="1.5" />
                <circle cx="-50" cy="0" r="8" fill="#fdf2f8" />
                {/* Granulosa Cells Ring */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const ang = (i / 16) * Math.PI * 2;
                  return (
                    <circle key={i} cx={-50 + Math.cos(ang) * 45} cy={Math.sin(ang) * 45} r="5" fill="#f472b6" stroke="#ffffff" strokeWidth="0.5" />
                  );
                })}
              </g>
              {/* Endometrial Glands & Stroma */}
              <g transform="translate(60, -50)" className="cursor-pointer" onClick={() => setActiveCellHotspot('Endometrio: Glándulas secretoras tubulares tortuosas y arterias espirales deciduales')}>
                <rect x="0" y="0" width="80" height="100" rx="4" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1" />
                <path d="M 20 15 Q 40 40 20 65 Q 40 90 20 95" fill="none" stroke="#f472b6" strokeWidth="3" />
                <path d="M 55 15 Q 70 40 55 65 Q 70 90 55 95" fill="none" stroke="#f472b6" strokeWidth="3" />
              </g>
              {/* Toxic Metal Ions */}
              {Array.from({ length: Math.min(16, Math.floor(toxicityRatio * 8) + 3) }).map((_, i) => (
                <circle key={i} cx={-100 + (i * 36) % 200} cy={-60 + (i * 26) % 120} r="3" fill={contaminant.color} stroke="#ffffff" strokeWidth="0.5" className={isHistologyAnimated ? 'animate-pulse' : ''} />
              ))}
            </g>
            <g transform="translate(200, 25)">
              <rect x="-110" y="-12" width="220" height="18" rx="4" fill="#0f172a" stroke="#f472b6" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fbcfe8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">FOLÍCULO OVÁRICO & ENDOMETRIO</text>
            </g>
            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              OOCITO + ZONA PELÚCIDA + CÉLULAS DE LA GRANULOSA - {zoomLevel}
            </text>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full select-none" style={{ filter: `contrast(${100 + sharpnessLevel * 0.2}%)` }}>
            <defs>
              <pattern id="bloodGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#bloodGrid)" />

            {/* Blood Smear / Erythrocytes & Hemodynamics (Morfología Humana II - Fig. 46.1) */}
            <g>
              {/* Healthy & Basophilic Stippled RBCs */}
              {Array.from({ length: 14 }).map((_, i) => {
                const bx = 60 + (i * 68) % 310;
                const by = 60 + (i * 53) % 200;
                const isBasophilic = i % 2 === 0 && isSeverelyDamaged;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setActiveCellHotspot(isBasophilic ? 'Eritrocito con Punteado Basófilo: Agregados de ARN ribosomal por inhibición de pirimidina-5-nucleotidasa en Saturnismo' : 'Eritrocito Disco Bicóncavo Anucleado (7 µm): Alta elasticidad para microcirculación capilar')}>
                    {/* Biconcave Disc Shape */}
                    <ellipse cx={bx} cy={by} rx="24" ry="18" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" />
                    <ellipse cx={bx} cy={by} rx="12" ry="8" fill="#7f1d1d" opacity="0.8" />
                    
                    {/* Basophilic Stippling Granules in Saturnism (Lead/Mercury) */}
                    {isBasophilic && (
                      <g fill="#38bdf8" className={isHistologyAnimated ? 'animate-pulse' : ''}>
                        <circle cx={bx - 4} cy={by - 3} r="1.5" />
                        <circle cx={bx + 5} cy={by - 2} r="1.5" />
                        <circle cx={bx - 2} cy={by + 4} r="1.5" />
                        <circle cx={bx + 3} cy={by + 3} r="1.5" />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Leukocyte: Neutrophil Polimorfonuclear (3-5 Lobulillos Nucleares) */}
              <g transform="translate(310, 100)" className="cursor-pointer" onClick={() => setActiveCellHotspot('Neutrófilo Polimorfonuclear (60-70% Leucocitos): Fagocitosis activa y respuesta inmunológica')}>
                <circle cx="0" cy="0" r="22" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
                {/* Multi-lobed Nucleus */}
                <ellipse cx="-6" cy="-6" rx="6" ry="4" fill="#a5b4fc" />
                <ellipse cx="6" cy="-4" rx="5" ry="5" fill="#a5b4fc" />
                <ellipse cx="0" cy="7" rx="7" ry="4" fill="#a5b4fc" />
              </g>

              {/* Thrombocytes / Platelets (Fragmentos de Megacariocitos - Granulómera y Hialómera) */}
              <g transform="translate(80, 220)" className="cursor-pointer" onClick={() => setActiveCellHotspot('Trombocitos / Plaquetas (2-3 µm): Detención de hemorragia y formación de tapón hemostático')}>
                <ellipse cx="0" cy="0" rx="5" ry="3" fill="#6366f1" stroke="#a5b4fc" strokeWidth="0.5" />
                <ellipse cx="14" cy="8" rx="6" ry="4" fill="#6366f1" stroke="#a5b4fc" strokeWidth="0.5" />
              </g>

              {/* Free Heavy Metal Toxic Ions */}
              {Array.from({ length: Math.min(20, Math.floor(toxicityRatio * 8) + 4) }).map((_, i) => {
                const ix = 40 + (i * 47) % 320;
                const iy = 40 + (i * 39) % 220;
                return (
                  <circle 
                    key={i} 
                    cx={ix} 
                    cy={iy} 
                    r="3.5" 
                    fill={contaminant.color} 
                    stroke="#ffffff" 
                    strokeWidth="0.8" 
                    className={isHistologyAnimated ? 'animate-pulse' : ''} 
                  />
                );
              })}
            </g>

            {/* Anatomical Label */}
            <g transform="translate(200, 35)">
              <rect x="-85" y="-12" width="170" height="18" rx="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.75" />
              <text x="0" y="0" fill="#fca5a5" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">FROTIS SANGUÍNEO & HEMATOLOGÍA</text>
            </g>

            <text x="20" y="280" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              INHIBICIÓN DE ALAD + PUNTEADO BASÓFILO ERITROCITARIO - {zoomLevel}
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-950 border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Microscope Top HUD Bar */}
      <div className="bg-slate-900/95 px-3.5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
            <Microscope className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              Microscopio Histológico & Morfopatológico
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Resolución Óptica: 4K Crisp Vector Sub-Píxel (Morfología Humana II)
            </span>
          </div>
        </div>

        {/* Magnification & Mode Selectors */}
        <div className="flex items-center gap-1.5">
          {/* Animation Play/Pause for Histology */}
          <button
            id="btn-toggle-micro-anim"
            onClick={() => setIsHistologyAnimated(!isHistologyAnimated)}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border transition-all flex items-center gap-1 ${
              isHistologyAnimated
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {isHistologyAnimated ? <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
            <span>{isHistologyAnimated ? 'Animado' : 'Pausado'}</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {(['100x', '400x', '1000x'] as const).map((lvl) => (
              <button
                key={lvl}
                id={`btn-micro-zoom-${lvl}`}
                onClick={() => setZoomLevel(lvl)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                  zoomLevel === lvl
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Staining / Fluorochrome Mode */}
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              id="btn-filter-fluor"
              onClick={() => setFilterMode('fluorescence')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                filterMode === 'fluorescence'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fluorescencia
            </button>
            <button
              id="btn-filter-bright"
              onClick={() => setFilterMode('brightfield')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                filterMode === 'brightfield'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Óptico
            </button>
          </div>
        </div>
      </div>

      {/* Main Optical Stage & Visual Display */}
      <div className="relative h-64 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        {/* Reticle Optical Lens Ring Overlay */}
        <div className="absolute inset-2 rounded-xl border border-cyan-500/20 pointer-events-none z-10" />
        
        {/* Crisp Laser Scan Bar Animation */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse pointer-events-none z-10 shadow-[0_0_12px_#06b6d4]" />

        {/* Telemetry Corner Overlays */}
        <div className="absolute top-2 right-2 text-right font-mono text-[9px] text-cyan-400/80 z-10 bg-slate-950/70 px-1.5 py-0.5 rounded border border-cyan-900/40 pointer-events-none">
          <span>MAG: {zoomLevel} | CONTRAST: {sharpnessLevel}%</span>
        </div>

        <div className="absolute bottom-2 left-2 font-mono text-[9px] text-slate-400 z-10 bg-slate-950/70 px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
          <span>PARTÍCULAS {contaminant?.chemicalSymbol || 'ION'}: {((toxicityRatio || 1) * 14).toFixed(0)} / CAMPO</span>
        </div>

        {/* Interactive Vector Graphic */}
        {renderCellularSVG()}
      </div>

      {/* Hotspot Structure Interactive Explanation Card */}
      {activeCellHotspot && (
        <div className="bg-slate-900/95 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-cyan-200 font-mono">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{activeCellHotspot}</span>
          </div>
          <button 
            onClick={() => setActiveCellHotspot(null)}
            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Interactive Sharpness Slider & Fine-Tuning Controls */}
      <div className="bg-slate-900/90 px-3 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-300 font-semibold">
            Calibración de Enfoque y Nitidez Óptica:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="input-microscope-sharpness"
            type="range"
            min="60"
            max="140"
            value={sharpnessLevel}
            onChange={(e) => setSharpnessLevel(Number(e.target.value))}
            className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-[10px] font-bold text-cyan-300 w-10 text-right">
            {sharpnessLevel}%
          </span>
        </div>
      </div>
    </div>
  );
};
