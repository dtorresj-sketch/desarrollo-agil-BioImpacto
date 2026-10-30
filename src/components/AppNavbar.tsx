import React from 'react';
import { 
  Menu, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronRight, 
  FolderArchive
} from 'lucide-react';
import { SystemPageId, SYSTEM_CATEGORIES, SYSTEM_PAGES, SystemCategory } from '../types/navigation';
import { ContaminantProfile, ContaminantId } from '../types';
import { CONTAMINANT_PROFILES } from '../data/contaminants';
import { soundFX } from '../utils/audio';

/**
 * Índice de la miga de pan por categoría. Antes era un ternario que comparaba
 * contra la categoría inexistente 'clinical', de modo que todas las páginas
 * salvo las de simulación mostraban siempre "04".
 */
const CATEGORY_INDEX: Record<SystemCategory, string> = {
  monitoring: '01',
  simulation: '02',
  toxicology: '03',
  modeling: '04',
  education: '05',
  engineering: '06',
  documentation: '07',
};

interface AppNavbarProps {
  activePage: SystemPageId;
  onSelectPage: (page: SystemPageId) => void;
  onOpenMobileMenu: () => void;
  currentContaminant: ContaminantProfile;
  onSelectContaminant: (id: ContaminantId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  onOpenRemediation: () => void;
  onOpenReport: () => void;
  onOpenSourceCode: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activePage,
  onSelectPage,
  onOpenMobileMenu,
  soundEnabled,
  onToggleSound,
  onReset,
  onOpenSourceCode
}) => {
  const currentPage = SYSTEM_PAGES[activePage];
  const currentCat = SYSTEM_CATEGORIES[currentPage.category];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 bg-[#F8F7F4] text-[#111113] border border-black/10 hover:bg-neutral-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs min-w-0 font-mono">
            <span className="text-[#111113]/50 uppercase tracking-wider text-[11px] hidden sm:inline">
              [{CATEGORY_INDEX[currentCat.id] ?? '00'}] {currentCat.name.split('.')[1] || currentCat.name}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-black/30 hidden sm:inline shrink-0" />
            <span className="font-bold text-[#111113] truncate font-sans text-sm">
              {currentPage.title}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Quick Tab Jump for Desktop */}
          <div className="hidden xl:flex items-center gap-1 bg-[#F8F7F4] p-1 border border-black/10">
            <button
              onClick={() => { soundFX.playPhaseStep(); onSelectPage('dashboard'); }}
              className={`px-3 py-1 text-xs font-semibold transition-all ${
                activePage === 'dashboard' ? 'bg-[#111113] text-white shadow-sm' : 'text-[#111113]/70 hover:text-black'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { soundFX.playPhaseStep(); onSelectPage('diorama'); }}
              className={`px-3 py-1 text-xs font-semibold transition-all ${
                activePage === 'diorama' ? 'bg-[#111113] text-white shadow-sm' : 'text-[#111113]/70 hover:text-black'
              }`}
            >
              Simulador Fluvial
            </button>
            <button
              onClick={() => { soundFX.playPhaseStep(); onSelectPage('motion_lab'); }}
              className={`px-3 py-1 text-xs font-semibold transition-all ${
                activePage === 'motion_lab' ? 'bg-[#111113] text-white shadow-sm' : 'text-[#111113]/70 hover:text-black'
              }`}
            >
              Motion 2D
            </button>
            <button
              onClick={() => { soundFX.playPhaseStep(); onSelectPage('anatomy'); }}
              className={`px-3 py-1 text-xs font-semibold transition-all ${
                activePage === 'anatomy' ? 'bg-[#111113] text-white shadow-sm' : 'text-[#111113]/70 hover:text-black'
              }`}
            >
              Atlas Anatómico
            </button>
            <button
              onClick={() => { soundFX.playPhaseStep(); onSelectPage('twinkl_hub'); }}
              className={`px-3 py-1 text-xs font-semibold transition-all ${
                activePage === 'twinkl_hub' ? 'bg-[#E11D48] text-white shadow-sm font-bold' : 'text-[#111113]/70 hover:text-black'
              }`}
            >
              Twinkl Go!
            </button>
          </div>

          {/* Download Source Code Button */}
          <button
            id="btn-nav-download-code"
            onClick={onOpenSourceCode}
            title="Descargar Código Fuente Completo (.ZIP / .TXT)"
            className="px-3.5 py-2 bg-[#111113] hover:bg-neutral-800 text-white font-mono font-semibold transition-all flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5 text-[#E11D48]" />
            <span className="hidden sm:inline">Código (.ZIP)</span>
          </button>

          {/* Audio FX Toggle */}
          <button
            id="btn-sound-toggle-nav"
            onClick={onToggleSound}
            title={soundEnabled ? "Desactivar Efectos de Sonido" : "Activar Efectos de Sonido"}
            className={`p-2 border transition-all ${
              soundEnabled
                ? 'bg-[#111113] text-white border-[#111113]'
                : 'bg-white text-neutral-400 border-black/10 hover:text-black'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Simulation (Accent Button styled in #E11D48 from Design HTML) */}
          <button
            id="btn-reset-nav"
            onClick={onReset}
            title="Reiniciar Simulación & Parámetros"
            className="px-3.5 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold transition-all flex items-center gap-1.5 text-xs shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Simulación</span>
          </button>

        </div>

      </div>
    </header>
  );
};
