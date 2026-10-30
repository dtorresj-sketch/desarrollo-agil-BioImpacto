import React from 'react';
import { 
  ArrowRight
} from 'lucide-react';
import { ContaminantProfile } from '../types';
import { MathematicalLab } from '../components/MathematicalLab';
import { SystemPageId } from '../types/navigation';

interface MathematicalLabPageProps {
  contaminant: ContaminantProfile;
  largeFishPpm: number;
  fishPortionsPerWeek: number;
  humanWeightKg: number;
  exposureMonths: number;
  onNavigate: (page: SystemPageId) => void;
}

export const MathematicalLabPage: React.FC<MathematicalLabPageProps> = ({
  contaminant,
  largeFishPpm,
  fishPortionsPerWeek,
  humanWeightKg,
  exposureMonths,
  onNavigate
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
              Categoría 4: Biofísica & Modelado Matemático
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Constantes Cinéticas: {contaminant.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Laboratorio Matemático & Modelado Toxicocinético
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Simula ecuaciones diferenciales de primer orden, estado estacionario (Css), vida media de eliminación biológica (t½) y factores BCF/BMF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('diorama')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Ver Simulador Fluvial</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Mathematical Lab Suite */}
      <MathematicalLab
        contaminant={contaminant}
        fishConcentrationPpm={largeFishPpm}
        fishPortionsPerWeek={fishPortionsPerWeek}
        humanWeightKg={humanWeightKg}
        exposureMonths={exposureMonths}
      />

    </div>
  );
};
