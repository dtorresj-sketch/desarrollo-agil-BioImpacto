import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Waves, 
  ArrowRight, 
  TrendingUp,
} from 'lucide-react';
import { ContaminantProfile, ContaminantId } from '../types';
import { CONTAMINANT_PROFILES } from '../data/contaminants';
import { SystemPageId } from '../types/navigation';
import { MotionGraphicsStage } from '../components/MotionGraphicsStage';
import { soundFX } from '../utils/audio';

interface MotionGraphicsLabPageProps {
  contaminant: ContaminantProfile;
  onSelectContaminant: (id: ContaminantId) => void;
  onNavigate: (page: SystemPageId) => void;
}

export const MotionGraphicsLabPage: React.FC<MotionGraphicsLabPageProps> = ({
  contaminant,
  onNavigate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stage' | 'pyramid' | 'ion_kinetics'>('stage');
  const [pyramidTrophicStep, setPyramidTrophicStep] = useState<number>(3); // 0 to 4

  // Trophic levels data
  const trophicLevels = [
    { level: 1, name: 'Productores Primarios (Fitoplancton)', factor: '1×', conc: 0.002, icon: '🌿', desc: 'Absorción pasiva por gradiente osmótico y adsorción en pared celular de celulosa/sílice.' },
    { level: 2, name: 'Consumidores Primarios (Zooplancton/Dafnias)', factor: '10×', conc: 0.025, icon: '🦐', desc: 'Filtración activa de micro-algas contaminadas. Acumulación en lípidos corporales.' },
    { level: 3, name: 'Consumidores Secundarios (Peces Forrajeros)', factor: '100×', conc: 0.28, icon: '🐟', desc: 'Ingestión continua de zooplancton. Filtración branquial adicional con retención tisular.' },
    { level: 4, name: 'Consumidores Terciarios (Trucha Fario)', factor: '1,000×', conc: 2.85, icon: '🦈', desc: 'Predador ápice fluvial. Lenta tasa de depuración (t1/2 prolongado) y afinidad por miocitos.' },
    { level: 5, name: 'Consumidor Ápice (Humano)', factor: '10,000×', conc: 28.5, icon: '🧑', desc: 'Ingesta dietética concentrada. Daño neurológico, nefrotóxico y cardiovascular.' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Category Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              Categoría 2: Animaciones & Motion Graphics 2D
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Elemento Activo: {contaminant.name} ({contaminant.chemicalSymbol})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Estudio de Motion Graphics 2D & Cinemática Ambiental
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Explora gráficos en movimiento renderizados en tiempo real a 60 FPS con física de partículas, campos vectoriales de Navier-Stokes simplificados y transferencia cinética trófica.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => { soundFX.playPhaseStep(); setActiveSubTab('stage'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'stage' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Lienzo 2D Interactivo</span>
          </button>
          <button
            onClick={() => { soundFX.playPhaseStep(); setActiveSubTab('pyramid'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'pyramid' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pirámide Trófica Motion</span>
          </button>
        </div>
      </div>

      {/* 2. Main Tab View */}
      {activeSubTab === 'stage' && (
        <MotionGraphicsStage
          contaminant={contaminant}
          onNavigateToAnatomy={() => onNavigate('anatomy')}
          onNavigateToDiorama={() => onNavigate('diorama')}
        />
      )}

      {/* 3. Motion Graphics Trophic Pyramid View */}
      {activeSubTab === 'pyramid' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Animated Pyramid Graphic */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Magnificación Trófica Vectorial Interactiva
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Multiplicador Total: ×10.000
                </span>
              </div>

              {/* Stacked Animated Interactive Blocks */}
              <div className="space-y-2 py-4">
                {trophicLevels.map((lvl, index) => {
                  const isSelected = pyramidTrophicStep === index;
                  const widthPercent = 100 - index * 16;
                  
                  return (
                    <div 
                      key={lvl.level} 
                      className="flex justify-center"
                    >
                      <button
                        onClick={() => {
                          soundFX.playPhaseStep();
                          setPyramidTrophicStep(index);
                        }}
                        style={{ width: `${widthPercent}%` }}
                        className={`group relative p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/10 scale-102'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {lvl.icon}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                              {lvl.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Nivel Trófico {lvl.level}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-black ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-400'
                          }`}>
                            {lvl.factor}
                          </span>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {Number(lvl.conc * (contaminant.id === 'mercury' ? 1 : 1.5) || 0).toFixed(3)} ppm
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Control */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Haz clic en cualquier nivel trófico para inspeccionar la cinética de absorción</span>
                <button
                  onClick={() => {
                    soundFX.playPhaseStep();
                    setPyramidTrophicStep((prev) => (prev + 1) % 5);
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all"
                >
                  Siguiente Nivel ➔
                </button>
              </div>
            </div>

            {/* Right: Selected Level Deep Dive */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30">
                  {trophicLevels[pyramidTrophicStep]?.icon || '🔬'}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    Detalle de Biotransferencia Trófica
                  </span>
                  <h4 className="text-base font-black text-white">
                    {trophicLevels[pyramidTrophicStep]?.name || 'Nivel Trófico'}
                  </h4>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Mecanismo de Bioacumulación:</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {trophicLevels[pyramidTrophicStep]?.desc || ''}
                </p>
              </div>

              {/* Kinetic Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">Factor BMF Relativo</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {trophicLevels[pyramidTrophicStep]?.factor || '1x'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">Carga Tisular Estimada</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">
                    {(trophicLevels[pyramidTrophicStep]?.conc ?? 0).toFixed(3)} ppm
                  </span>
                </div>
              </div>

              {/* Jump Button to Toxicology */}
              <button
                onClick={() => onNavigate('anatomy')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
              >
                <span>Ver Impacto en Órganos Diana</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
