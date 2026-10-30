import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Flame
} from 'lucide-react';
import { ContaminantProfile, OrganIdentifier } from '../types';
import { CellularMicroscope } from '../components/CellularMicroscope';
import { SystemPageId } from '../types/navigation';
import { getOrganMaster, getOrganImpactForContaminant } from '../data/organs';

interface CellularPageProps {
  contaminant: ContaminantProfile;
  /** Carga tisular humana actual (ppm), necesaria para el microscopio. */
  humanTissueConcentrationPpm?: number;
  selectedOrganId: string | null;
  onSelectOrgan: (id: string | null) => void;
  onNavigate: (page: SystemPageId) => void;
}

export const CellularPage: React.FC<CellularPageProps> = ({
  contaminant,
  humanTissueConcentrationPpm = 0,
  selectedOrganId,
  onNavigate
}) => {
  const activeOrganId: OrganIdentifier = (selectedOrganId as OrganIdentifier) || 'brain';
  const organData = getOrganMaster(activeOrganId);
  const impactData = getOrganImpactForContaminant(activeOrganId, contaminant.id);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
              Categoría 3: Toxicología & Microscopía
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Mecanismo Molecular: {contaminant.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Microscopio Celular & Dinámica Biofísica Subcelular
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Visualización interactiva a escala de membrana: translocación de iones, unión a grupos sulfhidrilo (-SH), desacoplamiento mitocondrial y quelación terapéutica.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('anatomy')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Volver al Atlas Anatómico 3D</span>
          </button>
        </div>
      </div>

      {/* Main Cellular Microscope Component */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <CellularMicroscope
          contaminant={contaminant}
          organId={activeOrganId}
          tissuePpm={humanTissueConcentrationPpm}
          criticalDosePpm={contaminant.criticalDosePpm}
        />
      </div>

      {/* Detailed Biochemistry Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1.5">
            <Zap className="w-4 h-4" />
            <span>1. Mimetismo Catiónico</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Metales divalentes como el <strong className="text-cyan-300">Pb²⁺</strong> y el <strong className="text-cyan-300">Cd²⁺</strong> sustituyen al Calcio (Ca²⁺) y al Zinc (Zn²⁺) en sitios activos de metaloproteínas y canales iónicos voltaje-dependientes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
            <Flame className="w-4 h-4" />
            <span>2. Afinidad Sulfhidrilo (-SH)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El <strong className="text-amber-300">CH₃Hg⁺</strong> y el <strong className="text-amber-300">As³⁺</strong> poseen afinidad extrema por grupos tiol (-SH) de cisteína y glutatión, inactivando enzimas antioxidantes clave como la glutatión peroxidasa.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Mecanismo de Quelación</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Fármacos quelantes (<strong className="text-emerald-300">DMSA, CaNa₂EDTA</strong>) forman anillos polidentados heterocíclicos estables y solubles en agua que atrapan el catión tóxico y favorecen su rápida excreción renal.
          </p>
        </div>

      </div>

    </div>
  );
};
