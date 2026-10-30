import React from 'react';
import { 
  LayoutDashboard, 
  Waves, 
  Film,
  Activity, 
  Microscope, 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  ChevronRight, 
  Layers,
  X,
  FolderArchive,
  Download
} from 'lucide-react';
import { SystemPageId, SystemCategory, SYSTEM_CATEGORIES, SYSTEM_PAGES } from '../types/navigation';
import { ContaminantProfile, ContaminantId } from '../types';
import { CONTAMINANT_PROFILES } from '../data/contaminants';
import { soundFX } from '../utils/audio';

interface NavigationSidebarProps {
  activePage: SystemPageId;
  onSelectPage: (page: SystemPageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentContaminant: ContaminantProfile;
  onSelectContaminant: (id: ContaminantId) => void;
  humanTissueConcentrationPpm: number;
  onOpenSourceCode?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activePage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
  currentContaminant,
  onSelectContaminant,
  humanTissueConcentrationPpm,
  onOpenSourceCode
}) => {
  const isCritical = humanTissueConcentrationPpm >= currentContaminant.criticalDosePpm;

  // Icon resolver
  const renderIcon = (name: string, className = 'w-4 h-4') => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className={className} />;
      case 'Waves': return <Waves className={className} />;
      case 'Film': return <Film className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Microscope': return <Microscope className={className} />;
      case 'Calculator': return <Calculator className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      default: return <Layers className={className} />;
    }
  };

  const handlePageClick = (pageId: SystemPageId) => {
    soundFX.playPhaseStep();
    onSelectPage(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container: 320px, crisp border, light background */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-80 bg-white border-r border-black/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Top Section */}
        <div className="flex-1 overflow-y-auto p-6 md:p-7 space-y-6">
          
          {/* Header Branding */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                [01] Sistema
              </div>
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded bg-neutral-100 text-neutral-600 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-3xl font-black text-[#111113] tracking-tight font-sans">
              BioTrófica
            </h1>
            <p className="text-xs text-[#111113]/70 mt-2 leading-relaxed font-sans">
              Simulador de bioacumulación de metales pesados. Analiza el flujo de contaminantes en cadenas tróficas.
            </p>
          </div>

          {/* Metal Pesado Activo Selector */}
          <div className="p-3 bg-[#F8F7F4] border border-black/8 rounded-none">
            <div className="font-mono text-[0.65rem] uppercase tracking-wider text-[#111113]/60 font-bold mb-2 flex items-center justify-between">
              <span>Metal Activo:</span>
              <span className="text-[#E11D48] font-bold">{currentContaminant.chemicalFormula}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(CONTAMINANT_PROFILES) as ContaminantId[]).map((id) => {
                const prof = CONTAMINANT_PROFILES[id];
                const isSelected = currentContaminant.id === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      soundFX.playPhaseStep();
                      onSelectContaminant(id);
                    }}
                    className={`py-1.5 px-1 font-mono font-bold text-xs transition-all flex flex-col items-center justify-center border ${
                      isSelected
                        ? 'bg-[#111113] text-white border-[#111113]'
                        : 'bg-white text-[#111113] border-black/10 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mb-0.5" style={{ backgroundColor: prof.color }} />
                    <span>{prof.chemicalSymbol}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[#111113]/50 font-bold mb-1">
              Módulos de Simulación
            </div>
            
            {/* Primary Action Buttons styled in variation high-contrast design */}
            <button
              onClick={() => handlePageClick('dashboard')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'dashboard'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Principal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('diorama')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'diorama'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Waves className="w-4 h-4" />
                <span>Simulador Fluvial</span>
              </div>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#E11D48] text-white font-bold">2D</span>
            </button>

            <button
              onClick={() => handlePageClick('motion_lab')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'motion_lab'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4" />
                <span>Estudio Motion Graphics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('anatomy')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'anatomy'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Atlas Anatómico</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('cellular')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'cellular'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Microscope className="w-4 h-4" />
                <span>Microscopio Celular</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('kinetics')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'kinetics'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4" />
                <span>Laboratorio Matemático</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('remediation_plant')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'remediation_plant'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Planta de Tratamiento</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('audit_reports')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'audit_reports'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Informes DS 90</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handlePageClick('twinkl_hub')}
              className={`w-full text-left p-3.5 text-xs font-semibold transition-all border flex items-center justify-between ${
                activePage === 'twinkl_hub'
                  ? 'bg-[#111113] text-white border-[#111113]'
                  : 'bg-transparent border-black/10 text-[#111113] hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#E11D48]" />
                <span>Twinkl Go! Misiones</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* Source Code Direct Download Trigger */}
            {onOpenSourceCode && (
              <button
                onClick={() => {
                  soundFX.playCorrect();
                  onOpenSourceCode();
                  onCloseMobile();
                }}
                className="w-full text-left p-3 text-xs font-mono font-bold transition-all border border-black/20 bg-[#111113] text-white hover:bg-neutral-800 flex items-center justify-between shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FolderArchive className="w-4 h-4 text-[#E11D48]" />
                  <span>Descargar Código (.ZIP)</span>
                </div>
                <Download className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Panel: Matches Design HTML Panel with Big Space Mono Readout */}
        <div className="p-6 border-t border-black/10 bg-white">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-1">
            Nivel Biológico
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#111113] tracking-tight flex items-baseline gap-1.5">
            {(humanTissueConcentrationPpm ?? 0).toFixed(3)}
            <span className="text-sm font-normal text-[#111113]/60 font-mono">ppm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#111113]/60">Dosis Crítica: {currentContaminant.criticalDosePpm} ppm</span>
            <span className={`font-bold px-1.5 py-0.5 text-[10px] ${
              isCritical ? 'bg-[#E11D48] text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isCritical ? 'CRÍTICO' : 'SEGURO'}
            </span>
          </div>
        </div>

      </aside>
    </>
  );
};
