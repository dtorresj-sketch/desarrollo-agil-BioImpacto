import React, { useState } from 'react';
import { 
  Filter, 
  CheckCircle2, 
} from 'lucide-react';
import { ContaminantProfile, ContaminantId } from '../types';
import { soundFX } from '../utils/audio';

interface RemediationEngineeringPageProps {
  contaminant: ContaminantProfile;
  dischargeRateKgDay: number;
  onDischargeRateChange: (val: number) => void;
  filtrationEfficiency: number;
  onFiltrationEfficiencyChange: (val: number) => void;
  waterConcentrationPpm: number;
}

interface TechnologyStage {
  id: string;
  name: string;
  category: 'chemical' | 'physical' | 'biological' | 'membrane';
  description: string;
  efficiencyGain: number; // Percentage removal
  capexUsd: number;
  opexUsdYear: number;
  sludgeGenerated: string;
  chemicalReaction?: string;
  active: boolean;
}

export const RemediationEngineeringPage: React.FC<RemediationEngineeringPageProps> = ({
  contaminant,
  dischargeRateKgDay,
  filtrationEfficiency,
  onFiltrationEfficiencyChange,
}) => {
  // Configurable treatment stages
  const [stages, setStages] = useState<TechnologyStage[]>([
    {
      id: 'neutralization',
      name: '1. Reactor de Precipitación con Cal Apagada (Ca(OH)₂)',
      category: 'chemical',
      description: 'Ajuste de pH a 9.5-10.5 para precipitar cationes metálicos (Cd²⁺, Pb²⁺, Cu²⁺) como hidróxidos insolubles M(OH)₂.',
      efficiencyGain: 45,
      capexUsd: 120000,
      opexUsdYear: 28000,
      sludgeGenerated: 'Lodo inorgánico denso (hidróxidos metálicos)',
      chemicalReaction: 'M²⁺ + Ca(OH)₂ ⟶ M(OH)₂↓ + Ca²⁺',
      active: true
    },
    {
      id: 'coagulation',
      name: '2. Floculación con Cloruro Férrico (FeCl₃) + Polielectrolito',
      category: 'chemical',
      description: 'Aglomeración de microflóculos coloidales y partículas suspendidas para clarificación por sedimentación acelerada.',
      efficiencyGain: 20,
      capexUsd: 65000,
      opexUsdYear: 18000,
      sludgeGenerated: 'Floculados de Fe(OH)₃ con iones adsorbidos',
      chemicalReaction: 'Fe³⁺ + 3H₂O ⟶ Fe(OH)₃(s) + 3H⁺',
      active: true
    },
    {
      id: 'zeolite',
      name: '3. Columnas de Intercambio Iónico con Zeolitas Naturales (Clinoptilolita)',
      category: 'physical',
      description: 'Lechos porosos de aluminosilicatos microporosos con alta selectividad hacia Pb²⁺, Cd²⁺ y Hg²⁺ mediante intercambio con Na⁺.',
      efficiencyGain: 18,
      capexUsd: 95000,
      opexUsdYear: 14000,
      sludgeGenerated: 'Regeneración con salmuera concentrada (NaCl)',
      chemicalReaction: '2Na⁺-Zeolita + M²⁺ ⟶ M²⁺-(Zeolita)₂ + 2Na⁺',
      active: filtrationEfficiency > 60
    },
    {
      id: 'activated_carbon',
      name: '4. Filtros de Carbón Activado Impregnado con Azufre (GAC-S)',
      category: 'physical',
      description: 'Adsorción específica para especies organometálicas solubles como metilmercurio (CH₃Hg⁺) y complejos de arsénico.',
      efficiencyGain: 10,
      capexUsd: 80000,
      opexUsdYear: 22000,
      sludgeGenerated: 'Carbón agotado enviado a incineración pirolítica',
      chemicalReaction: 'C-S + CH₃Hg⁺ ⟶ C-S-HgCH₃ (Quimisorción)',
      active: filtrationEfficiency > 75
    },
    {
      id: 'wetland',
      name: '5. Humedal Artificial de Pulido Biológico (Typha & Scirpus)',
      category: 'biological',
      description: 'Fitorremediación y bioacumulación en rizosfera vegetal para remoción final de trazas residuales (<0.001 ppm).',
      efficiencyGain: 5,
      capexUsd: 45000,
      opexUsdYear: 5000,
      sludgeGenerated: 'Biomasa vegetal cosechable periódica',
      chemicalReaction: 'Absorción radicular y fitoquelatinas vegetales',
      active: filtrationEfficiency > 85
    }
  ]);

  // Toggle stage
  const toggleStage = (id: string) => {
    soundFX.playPhaseStep();
    const updated = stages.map(st => st.id === id ? { ...st, active: !st.active } : st);
    setStages(updated);

    // Calculate new total efficiency
    const totalEff = updated
      .filter(s => s.active)
      .reduce((sum, s) => sum + s.efficiencyGain, 0);
    
    const cappedEff = Math.min(99, Math.max(0, totalEff));
    onFiltrationEfficiencyChange(cappedEff);
  };

  // Financial and Environmental Calculations
  const totalCapex = stages.filter(s => s.active).reduce((sum, s) => sum + s.capexUsd, 0);
  const totalOpex = stages.filter(s => s.active).reduce((sum, s) => sum + s.opexUsdYear, 0);
  const activeCount = stages.filter(s => s.active).length;

  const rawDischargeEffluentPpm = (dischargeRateKgDay / 1000) * 0.1; // Base ppm without treatment
  const treatedEffluentPpm = rawDischargeEffluentPpm * (1 - filtrationEfficiency / 100);

  // Regulatory limits (DS90 Chile: 0.001 ppm for Hg, 0.05 for Pb/Cd/As)
  const normLimit = contaminant.id === 'mercury' ? 0.001 : 0.05;
  const compliesWithDS90 = treatedEffluentPpm <= normLimit;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
              Categoría 6: Ingeniería Ambiental & Remediación
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Tratamiento de: {contaminant.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Planta de Tratamiento de RILes & Tren de Filtración Industrial
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Diseña y optimiza el tren de tratamiento fisicoquímico y biológico para abatir metales pesados en el vertido de fundición según norma chilena DS 90 / OMS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-right font-mono text-xs">
            <div className="text-slate-400">Eficiencia Global</div>
            <div className="text-base font-black text-emerald-400">{filtrationEfficiency}% Remoción</div>
          </div>
        </div>
      </div>

      {/* 2. Executive Status & Compliance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Efluente Tratado (Descarga)</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {(treatedEffluentPpm ?? 0).toFixed(4)} <span className="text-xs font-normal text-slate-400">ppm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Crudo sin filtro: <strong>{(rawDischargeEffluentPpm ?? 0).toFixed(3)} ppm</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Norma DS 90 (Aguas Fluviales)</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-base font-black ${compliesWithDS90 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {compliesWithDS90 ? '✓ CUMPLE NORMATIVA' : '✗ EXCEDE NORMA'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Límite legal: <strong>{normLimit} ppm</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Inversión Inicial (CAPEX)</span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
            ${totalCapex.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeCount} de {stages.length} etapas activas
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Costo Operativo (OPEX Anual)</span>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            ${totalOpex.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD/año</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Reactivos químicos y reposición
          </div>
        </div>

      </div>

      {/* 3. Interactive Filtration Train (Stages) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              <span>Configuración del Tren Tecnológico de Tratamiento</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en cualquier etapa para activar o desactivar reactores y filtros en el proceso.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allActive = stages.map(s => ({ ...s, active: true }));
                setStages(allActive);
                onFiltrationEfficiencyChange(98);
                soundFX.playFanfare();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Activar Todas las Etapas (98% Abatimiento)
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              onClick={() => toggleStage(stage.id)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                stage.active
                  ? 'bg-emerald-950/25 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  stage.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{stage.name}</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      stage.category === 'chemical' ? 'bg-amber-500/20 text-amber-300' : stage.category === 'physical' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {stage.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      +{stage.efficiencyGain}% Eficiencia
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{stage.description}</p>
                  
                  {stage.chemicalReaction && (
                    <div className="mt-2 text-[11px] font-mono bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-cyan-300 inline-block">
                      Reacción: {stage.chemicalReaction}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right text-xs">
                  <div className="text-slate-400">CAPEX: <strong className="text-white font-mono">${stage.capexUsd.toLocaleString()}</strong></div>
                  <div className="text-slate-400">OPEX: <strong className="text-amber-300 font-mono">${stage.opexUsdYear.toLocaleString()}/a</strong></div>
                </div>

                <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 ${
                  stage.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{stage.active ? 'Activo' : 'Desactivado'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
