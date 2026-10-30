import React from 'react';
import { 
  Waves, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Fish, 
  Factory, 
  Droplet, 
  User, 
  ShieldAlert,
  FolderArchive,
  Download
} from 'lucide-react';
import { ContaminantProfile, ContaminantId } from '../types';
import { CONTAMINANT_PROFILES } from '../data/contaminants';
import { SystemPageId } from '../types/navigation';
import { soundFX } from '../utils/audio';
// Import dinámico: el módulo lleva el código fuente incrustado.

interface DashboardPageProps {
  currentContaminant: ContaminantProfile;
  onSelectContaminant: (id: ContaminantId) => void;
  onNavigate: (page: SystemPageId) => void;
  waterConcentrationPpm: number;
  smallFishPpm: number;
  largeFishPpm: number;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  dischargeRateKgDay: number;
  filtrationEfficiency: number;
  humanWeightKg: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentContaminant,
  onSelectContaminant,
  onNavigate,
  waterConcentrationPpm,
  largeFishPpm,
  humanTissueConcentrationPpm,
  fishConsumedCount,
  dischargeRateKgDay,
  filtrationEfficiency,
}) => {
  const isCritical = (humanTissueConcentrationPpm ?? 0) >= currentContaminant.criticalDosePpm;
  const isWarning = (humanTissueConcentrationPpm ?? 0) >= currentContaminant.criticalDosePpm * 0.5;

  // Real-time biomagnification factor
  const actualBMF = (waterConcentrationPpm ?? 0) > 0 
    ? Math.round((largeFishPpm ?? 0) / (waterConcentrationPpm ?? 0.0001)) 
    : currentContaminant.bmfPredator;

  // Regulatory limits (OMS / DS90 Chile)
  const normLimits: Record<ContaminantId, { water: number; fish: number; name: string }> = {
    mercury: { water: 0.001, fish: 0.5, name: 'DS 90 / OMS Mercurio' },
    lead: { water: 0.05, fish: 0.3, name: 'DS 90 / OMS Plomo' },
    cadmium: { water: 0.01, fish: 0.05, name: 'DS 90 / OMS Cadmio' },
    arsenic: { water: 0.05, fish: 1.0, name: 'DS 90 / OMS Arsénico' }
  };

  const currentLimit = normLimits[currentContaminant.id] || { water: 0.01, fish: 0.5, name: 'Estándar' };
  const waterExceeds = (waterConcentrationPpm ?? 0) > currentLimit.water;
  const fishExceeds = (largeFishPpm ?? 0) > currentLimit.fish;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header matching Design Variation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-black/10 pb-6">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-1">
            [01] Monitor Central
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#111113] tracking-tight font-sans">
            BioTrófica Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#111113]/70 mt-1 max-w-xl">
            Simulador hidrológico multicompartimental y modelo cinético de bioacumulación toxicológica en la cuenca fluvial.
          </p>
        </div>

        {/* Quick status & Launch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-4 py-2.5 border flex items-center gap-3 ${
            isCritical
              ? 'bg-rose-50 border-rose-300 text-[#E11D48]'
              : isWarning
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}>
            <div className={`p-1.5 ${
              isCritical ? 'bg-[#E11D48] text-white' : isWarning ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isCritical ? <ShieldAlert className="w-4 h-4" /> : isWarning ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase font-bold tracking-wider opacity-80">
                Estado Sanitario
              </div>
              <div className="text-xs font-black font-sans">
                {isCritical ? 'Alerta Crítica: Intoxicación' : isWarning ? 'Riesgo Moderado' : 'Nivel Seguro'}
              </div>
            </div>
          </div>

          <button
            id="btn-quick-launch-sim"
            onClick={() => {
              soundFX.playPhaseStep();
              onNavigate('diorama');
            }}
            className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <span>Lanzar Diorama Fluvial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Key Performance Indicators (KPIs) - Design Variation Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 01: Water Concentration */}
        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">[Stat 01]</span>
            <Droplet className="w-4 h-4 text-[#111113]/40" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#111113] font-mono">
            {(waterConcentrationPpm ?? 0).toFixed(4)} <span className="text-sm font-normal text-neutral-500">ppm</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Efluente en Agua Fluvial
          </p>
          <div className="mt-3 pt-3 border-t border-black/8 flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-500">DS90: {currentLimit.water} ppm</span>
            <span className={`font-bold ${waterExceeds ? 'text-[#E11D48]' : 'text-emerald-700'}`}>
              {waterExceeds ? 'Excede Norma' : 'Dentro de Norma'}
            </span>
          </div>
        </div>

        {/* Stat 02: Apex Predator Fish Concentration */}
        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">[Stat 02]</span>
            <Fish className="w-4 h-4 text-[#111113]/40" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#111113] font-mono">
            {(largeFishPpm ?? 0).toFixed(3)} <span className="text-sm font-normal text-neutral-500">ppm</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Trucha Fario ({actualBMF}x BMF)
          </p>
          <div className="mt-3 pt-3 border-t border-black/8 flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-500">FDA: {currentLimit.fish} ppm</span>
            <span className={`font-bold ${fishExceeds ? 'text-[#E11D48]' : 'text-emerald-700'}`}>
              {fishExceeds ? 'Riesgo Dietario' : 'Apto Consumo'}
            </span>
          </div>
        </div>

        {/* Stat 03: Human Tissue Bioburden */}
        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">[Stat 03]</span>
            <User className="w-4 h-4 text-[#111113]/40" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E11D48] font-mono">
            {(humanTissueConcentrationPpm ?? 0).toFixed(3)} <span className="text-sm font-normal text-neutral-500">ppm</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Carga Tisular Humana
          </p>
          <div className="mt-3 pt-3 border-t border-black/8 flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-500">Dosis Crítica: {currentContaminant.criticalDosePpm} ppm</span>
            <span className={`font-bold ${isCritical ? 'text-[#E11D48]' : 'text-[#111113]'}`}>
              {Math.min(100, Math.round(((humanTissueConcentrationPpm ?? 0) / currentContaminant.criticalDosePpm) * 100))}% Límite
            </span>
          </div>
        </div>

        {/* Stat 04: Industrial Effluent Discharge */}
        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">[Stat 04]</span>
            <Factory className="w-4 h-4 text-[#111113]/40" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#111113] font-mono">
            {dischargeRateKgDay} <span className="text-sm font-normal text-neutral-500">kg/día</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Descarga Planta ({filtrationEfficiency}% Filtro)
          </p>
          <div className="mt-3 pt-3 border-t border-black/8 flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-500">Porciones: {fishConsumedCount}</span>
            <button 
              onClick={() => onNavigate('remediation_plant')}
              className="text-[#E11D48] hover:underline font-bold"
            >
              Filtros →
            </button>
          </div>
        </div>

      </section>

      {/* 3. Contaminant Selector & Profile Overview */}
      <div className="bg-white border border-black/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-black/10">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-0.5">
              [Matriz Toxicológica]
            </div>
            <h3 className="text-lg font-black text-[#111113] font-sans">
              Metales Pesados & Metaloides Analizados
            </h3>
          </div>
          <div className="text-xs font-mono text-[#111113]/60 bg-[#F8F7F4] px-3 py-1 border border-black/10">
            Elemento Activo: <strong className="text-[#111113] font-bold">{currentContaminant.name} ({currentContaminant.chemicalSymbol})</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(CONTAMINANT_PROFILES) as ContaminantId[]).map((id) => {
            const prof = CONTAMINANT_PROFILES[id];
            const isSelected = currentContaminant.id === id;

            return (
              <div
                key={id}
                onClick={() => {
                  soundFX.playPhaseStep();
                  onSelectContaminant(id);
                }}
                className={`p-5 border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#111113] text-white border-[#111113] shadow-md'
                    : 'bg-[#F8F7F4] text-[#111113] border-black/10 hover:bg-neutral-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-black">{prof.chemicalFormula}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                      isSelected ? 'bg-white/10 text-white border-white/20' : 'bg-white text-[#111113] border-black/10'
                    }`}>
                      t½ {prof.halfLifeHumansDays}d
                    </span>
                  </div>
                  <h4 className="text-base font-bold font-sans mt-1">{prof.name}</h4>
                  <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-white/80' : 'text-[#111113]/70'
                  }`}>
                    {prof.description}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
                  isSelected ? 'border-white/20' : 'border-black/10'
                }`}>
                  <span>BMF: <strong>{prof.bmfPredator}x</strong></span>
                  <span className={`font-bold ${isSelected ? 'text-[#E11D48] bg-white px-2 py-0.5' : 'text-[#111113]/60'}`}>
                    {isSelected ? 'ACTIVO' : 'SELECCIONAR'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Modular System Categories - Quick Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-0.5">
              [Arquitectura del Sistema]
            </div>
            <h3 className="text-lg font-black text-[#111113] font-sans">
              Módulos Especializados
            </h3>
          </div>
          <span className="text-xs font-mono text-[#111113]/60">
            Explora las páginas especializadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Simulación Fluvial */}
          <div 
            onClick={() => onNavigate('diorama')}
            className="p-6 bg-white border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                  [Módulo 02]
                </span>
                <Waves className="w-5 h-5 text-[#111113]" />
              </div>
              <h4 className="text-lg font-black text-[#111113] font-sans group-hover:text-[#E11D48] transition-colors">
                Simulador Fluvial & Cadena Trófica
              </h4>
              <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed">
                Lienzo hidrológico interactivo con partículas de metales, absorción por fitoplancton, bioacumulación en truchas depredadoras y pesca.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold text-[#111113]">
              <span>Abrir Diorama</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E11D48]" />
            </div>
          </div>

          {/* Card 2: Estudio Motion 2D */}
          <div 
            onClick={() => onNavigate('motion_lab')}
            className="p-6 bg-white border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                  [Módulo Motion]
                </span>
                <Sparkles className="w-5 h-5 text-[#E11D48]" />
              </div>
              <h4 className="text-lg font-black text-[#111113] font-sans group-hover:text-[#E11D48] transition-colors">
                Estudio Motion Graphics 2D
              </h4>
              <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed">
                Animaciones vectoriales 2D a 60 FPS, física de partículas con vórtices interactivos, campos de velocidad y cascadas tróficas cinéticas.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold text-[#111113]">
              <span>Abrir Motion 2D</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E11D48]" />
            </div>
          </div>

          {/* Card 3: Toxicología y Anatomía */}
          <div 
            onClick={() => onNavigate('anatomy')}
            className="p-6 bg-white border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                  [Módulo 03]
                </span>
                <Activity className="w-5 h-5 text-[#111113]" />
              </div>
              <h4 className="text-lg font-black text-[#111113] font-sans group-hover:text-[#E11D48] transition-colors">
                Atlas Anatómico & Órganos Diana
              </h4>
              <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed">
                Visualizador interactivo de 18 órganos diana, mapa de calor de bioacumulación tisular y síntomas clínicos agudos vs. crónicos.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold text-[#111113]">
              <span>Explorar Atlas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E11D48]" />
            </div>
          </div>

          {/* Card 4: Laboratorio Matemático */}
          <div 
            onClick={() => onNavigate('kinetics')}
            className="p-6 bg-white border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                  [Módulo 04]
                </span>
                <Calculator className="w-5 h-5 text-[#111113]" />
              </div>
              <h4 className="text-lg font-black text-[#111113] font-sans group-hover:text-[#E11D48] transition-colors">
                Laboratorio Matemático & Toxicocinética
              </h4>
              <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed">
                Modelos de eliminación de primer orden, constantes k_e, curvas de decaimiento temporal y factores BCF y BMF.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold text-[#111113]">
              <span>Ver Modelos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E11D48]" />
            </div>
          </div>

          {/* Card 5: Twinkl Go! Gamificación */}
          <div 
            onClick={() => onNavigate('twinkl_hub')}
            className="p-6 bg-white border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                  [Módulo 05]
                </span>
                <Sparkles className="w-5 h-5 text-[#E11D48]" />
              </div>
              <h4 className="text-lg font-black text-[#111113] font-sans group-hover:text-[#E11D48] transition-colors">
                Misiones & Gamificación Twinkl Go!
              </h4>
              <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed">
                Centro interactivo con puzzle de cadena trófica, juego de memoria metal-órgano, trivia curricular con vidas y diploma digital.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold text-[#E11D48]">
              <span>Jugar Misiones</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Planta de Tratamiento */}
          <div 
            onClick={() => onNavigate('remediation_plant')}
            className="p-6 bg-white border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                  [Módulo 06]
                </span>
                <ShieldCheck className="w-5 h-5 text-[#111113]" />
              </div>
              <h4 className="text-lg font-black text-[#111113] font-sans group-hover:text-[#E11D48] transition-colors">
                Planta de Tratamiento & Filtros
              </h4>
              <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed">
                Ingeniería de remediación: reactores de precipitación Ca(OH)2, columnas de zeolitas, carbón activado y humedales de pulido.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold text-[#111113]">
              <span>Configurar Planta</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E11D48]" />
            </div>
          </div>

        </div>

        {/* Source Code & Downloads Quick Action Card */}
        <div className="mt-8 p-6 bg-[#111113] text-white border border-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E11D48] text-white shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#E11D48] font-bold">
                [Exportación de Código Fuente]
              </div>
              <h4 className="text-base sm:text-lg font-black font-sans text-white">
                Descarga Todo el Código de BioTrófica
              </h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                Archivos React, Canvas 2D, modelos toxicocinéticos y hojas de estilo listos para tu entorno local.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                soundFX.playCorrect();
                void import('../utils/exportProjectZip').then(m => m.downloadProjectSourceZip());
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              title="Descargar ZIP con todo el código"
            >
              <Download className="w-4 h-4" />
              <span>Descargar (.ZIP)</span>
            </button>
            <button
              onClick={() => {
                soundFX.playPhaseStep();
                onNavigate('audit_reports');
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-[#111113] hover:bg-neutral-200 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ver Más Formatos →</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
