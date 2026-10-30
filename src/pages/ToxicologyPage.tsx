import React from 'react';
import { 
  Microscope,
  Pill
} from 'lucide-react';
import { ContaminantProfile } from '../types';
import { HumanAnatomySection } from '../components/HumanAnatomySection';
import { SystemPageId } from '../types/navigation';

interface ToxicologyPageProps {
  contaminant: ContaminantProfile;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  selectedOrganId: string | null;
  onSelectOrgan: (organId: string | null) => void;
  onNavigate: (page: SystemPageId) => void;
  onOpenRemediation: () => void;
}

export const ToxicologyPage: React.FC<ToxicologyPageProps> = ({
  contaminant,
  humanAccumulatedDoseMg,
  humanTissueConcentrationPpm,
  fishConsumedCount,
  selectedOrganId,
  onSelectOrgan,
  onNavigate,
  onOpenRemediation
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider">
              Categoría 3: Toxicología Humana & Anatomía
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Elemento Activo: {contaminant.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Atlas Anatómico 3D & Impacto en Órganos Diana
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Exploración histopatológica, afinidad tisular y progresión de síntomas clínicos en los 18 órganos y sistemas fisiológicos del cuerpo humano.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('cellular')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Microscope className="w-4 h-4" />
            <span>Ver Microscopio Celular</span>
          </button>
          <button
            onClick={() => onNavigate('remediation_plant')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Pill className="w-4 h-4" />
            <span>Protocolo de Quelación</span>
          </button>
        </div>
      </div>

      {/* Main Anatomy Section */}
      <HumanAnatomySection
        contaminant={contaminant}
        humanAccumulatedDoseMg={humanAccumulatedDoseMg}
        humanTissueConcentrationPpm={humanTissueConcentrationPpm}
        fishConsumedCount={fishConsumedCount}
        selectedOrganId={selectedOrganId}
        onSelectOrgan={onSelectOrgan}
        onOpenRemediation={onOpenRemediation}
      />

    </div>
  );
};
