import React from 'react';
import { 
  Sparkles,
} from 'lucide-react';
import { ContaminantProfile, FishEntity, SimPhase } from '../types';
import { PhaseGuide } from '../components/PhaseGuide';
import { EcosystemCanvas } from '../components/EcosystemCanvas';
import { ControlPanel } from '../components/ControlPanel';

interface SimulationPageProps {
  contaminant: ContaminantProfile;
  phase: SimPhase;
  onPhaseChange: (phase: SimPhase) => void;
  guidedMode: boolean;
  onToggleGuidedMode: () => void;
  dischargeRateKgDay: number;
  onDischargeRateChange: (val: number) => void;
  filtrationEfficiency: number;
  onFiltrationEfficiencyChange: (val: number) => void;
  fishPortionsPerWeek: number;
  onFishPortionsChange: (val: number) => void;
  humanWeightKg: number;
  onHumanWeightChange: (val: number) => void;
  exposureMonths: number;
  onExposureMonthsChange: (val: number) => void;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  waterConcentrationPpm: number;
  smallFishPpm: number;
  largeFishPpm: number;
  onFeedHuman: (amountPpm: number) => void;
  onFishPpmUpdate: (small: number, large: number, water: number) => void;
  onSelectFishToInspect: (fish: FishEntity) => void;
  onNavigateToAnatomy: () => void;
  onNavigateToMotionLab?: () => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  contaminant,
  phase,
  onPhaseChange,
  guidedMode,
  onToggleGuidedMode,
  dischargeRateKgDay,
  onDischargeRateChange,
  filtrationEfficiency,
  onFiltrationEfficiencyChange,
  fishPortionsPerWeek,
  onFishPortionsChange,
  humanWeightKg,
  onHumanWeightChange,
  exposureMonths,
  onExposureMonthsChange,
  humanAccumulatedDoseMg,
  humanTissueConcentrationPpm,
  fishConsumedCount,
  waterConcentrationPpm,
  smallFishPpm,
  largeFishPpm,
  onFeedHuman,
  onFishPpmUpdate,
  onSelectFishToInspect,
  onNavigateToAnatomy,
  onNavigateToMotionLab
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header matching Design Variation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-black/10 pb-6">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-1">
            [02] Simulación Activa
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#111113] tracking-tight font-sans">
            Diorama Fluvial
          </h2>
          <p className="text-xs sm:text-sm text-[#111113]/70 mt-1 max-w-xl">
            Simulador hidrológico 2D y modelo cinético trófico para <strong className="text-[#111113]">{contaminant.name} ({contaminant.chemicalFormula})</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToMotionLab && (
            <button
              onClick={onNavigateToMotionLab}
              className="px-4 py-2.5 bg-white border border-black/10 hover:bg-neutral-100 text-[#111113] font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#E11D48]" />
              <span>Estudio Motion 2D</span>
            </button>
          )}

          <button
            onClick={onToggleGuidedMode}
            className={`px-4 py-2.5 text-xs font-semibold border transition-all flex items-center gap-2 ${
              guidedMode
                ? 'bg-[#111113] text-white border-[#111113]'
                : 'bg-white text-[#111113] border-black/10 hover:bg-neutral-100'
            }`}
          >
            <span>{guidedMode ? 'Modo Guiado (Activo)' : 'Modo Libre'}</span>
          </button>
        </div>
      </header>

      {/* 2. Step-by-Step Guided Wizard */}
      {guidedMode && (
        <PhaseGuide
          currentPhase={phase}
          onSelectPhase={onPhaseChange}
          contaminant={contaminant}
          waterConcentrationPpm={waterConcentrationPpm}
          smallFishPpm={smallFishPpm}
          largeFishPpm={largeFishPpm}
          humanTissuePpm={humanTissueConcentrationPpm}
          onOpenRemediation={() => {}}
        />
      )}

      {/* 3. Central Scenic Interactive Diorama Canvas */}
      <div className="bg-white border border-black/10 overflow-hidden shadow-sm">
        <EcosystemCanvas
          contaminant={contaminant}
          dischargeRateKgDay={dischargeRateKgDay}
          filtrationEfficiency={filtrationEfficiency}
          phase={phase}
          onFeedHuman={onFeedHuman}
          onFishPpmUpdate={onFishPpmUpdate}
          onSelectFishToInspect={onSelectFishToInspect}
          onDischargeRateChange={onDischargeRateChange}
          onFiltrationEfficiencyChange={onFiltrationEfficiencyChange}
          fishPortionsPerWeek={fishPortionsPerWeek}
          onFishPortionsChange={onFishPortionsChange}
          humanWeightKg={humanWeightKg}
          onHumanWeightChange={onHumanWeightChange}
          exposureMonths={exposureMonths}
          onExposureMonthsChange={onExposureMonthsChange}
          humanAccumulatedDoseMg={humanAccumulatedDoseMg}
          humanTissueConcentrationPpm={humanTissueConcentrationPpm}
          fishConsumedCount={fishConsumedCount}
          onNavigateToHumanAnatomy={onNavigateToAnatomy}
        />
      </div>

      {/* 4. Stat Cards Grid matching Design Variation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-2">
            [Stat 01]
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#111113] font-mono">
            {(largeFishPpm ?? 0).toFixed(3)} <span className="text-sm font-normal text-neutral-500">ppm</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Concentración en Peces (Predador)
          </p>
        </div>

        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-2">
            [Stat 02]
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#111113] font-mono">
            {(waterConcentrationPpm ?? 0).toFixed(4)} <span className="text-sm font-normal text-neutral-500">ppm</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Nivel de Agua Fluvial
          </p>
        </div>

        <div className="bg-white border border-black/10 p-6 shadow-sm">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-2">
            [Stat 03]
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E11D48] font-mono">
            {(humanAccumulatedDoseMg ?? 0).toFixed(2)} <span className="text-sm font-normal text-neutral-500">mg</span>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]/60 font-semibold mt-2">
            Dosis Humana Ingerida ({fishConsumedCount} porciones)
          </p>
        </div>
      </section>

      {/* 5. Fine-tuning Control Sliders Panel */}
      <ControlPanel
        contaminant={contaminant}
        dischargeRateKgDay={dischargeRateKgDay}
        onDischargeRateChange={onDischargeRateChange}
        filtrationEfficiency={filtrationEfficiency}
        onFiltrationEfficiencyChange={onFiltrationEfficiencyChange}
        fishPortionsPerWeek={fishPortionsPerWeek}
        onFishPortionsChange={onFishPortionsChange}
        humanWeightKg={humanWeightKg}
        onHumanWeightChange={onHumanWeightChange}
        exposureMonths={exposureMonths}
        onExposureMonthsChange={onExposureMonthsChange}
      />

    </div>
  );
};
