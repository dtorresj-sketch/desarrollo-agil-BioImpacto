import React from 'react';
import { 
  ArrowRight,
} from 'lucide-react';
import { ContaminantProfile, ContaminantId } from '../types';
import { TwinklGoEducationHub } from '../components/TwinklGoEducationHub';
import { SystemPageId } from '../types/navigation';

interface TwinklGoHubPageProps {
  contaminant: ContaminantProfile;
  onSelectContaminant: (id: ContaminantId) => void;
  onNavigate: (page: SystemPageId) => void;
}

export const TwinklGoHubPage: React.FC<TwinklGoHubPageProps> = ({
  contaminant,
  onSelectContaminant,
  onNavigate
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-cyan-950 to-indigo-950 border border-cyan-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
              Categoría 5: Twinkl Go! Chile
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 font-mono text-xs">
              Misiones Gamificadas & Diploma de Logro
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Centro de Misiones Educativas & Desafíos Interactivos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Aprende sobre bioacumulación marina, cadenas tróficas, toxicocinética y remediación mediante minijuegos, trivia curricular, puzzles y expedientes históricos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('diorama')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Ver Diorama Fluvial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Twinkl Go Component */}
      <TwinklGoEducationHub
        contaminant={contaminant}
        onSelectContaminant={onSelectContaminant}
        onNavigateToDiorama={() => onNavigate('diorama')}
      />

    </div>
  );
};
