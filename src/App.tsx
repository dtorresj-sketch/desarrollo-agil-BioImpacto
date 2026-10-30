import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import { NavigationSidebar } from './components/NavigationSidebar';
import { AppNavbar } from './components/AppNavbar';
import { RemediationModal } from './components/RemediationModal';
import { ReportModal } from './components/ReportModal';
import { FishDetailsModal } from './components/FishDetailsModal';
// El modal de descarga incrusta una copia textual del código fuente:
// se carga sólo cuando el usuario lo abre.
const SourceCodeDownloadModal = lazy(() => import('./components/SourceCodeDownloadModal').then(m => ({ default: m.SourceCodeDownloadModal })));
import { ErrorBoundary } from './components/ErrorBoundary';

const PageFallback = () => (
  <div className="flex items-center justify-center py-24 text-sm text-black/50" role="status" aria-live="polite">
    Cargando módulo…
  </div>
);

// Pages — carga diferida: cada módulo pesa cientos de KB (canvas, atlas,
// microscopio) y antes viajaban todos en un único bundle de ~636 KB.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SimulationPage = lazy(() => import('./pages/SimulationPage').then(m => ({ default: m.SimulationPage })));
const MotionGraphicsLabPage = lazy(() => import('./pages/MotionGraphicsLabPage').then(m => ({ default: m.MotionGraphicsLabPage })));
const ToxicologyPage = lazy(() => import('./pages/ToxicologyPage').then(m => ({ default: m.ToxicologyPage })));
const CellularPage = lazy(() => import('./pages/CellularPage').then(m => ({ default: m.CellularPage })));
const MathematicalLabPage = lazy(() => import('./pages/MathematicalLabPage').then(m => ({ default: m.MathematicalLabPage })));
const TwinklGoHubPage = lazy(() => import('./pages/TwinklGoHubPage').then(m => ({ default: m.TwinklGoHubPage })));
const RemediationEngineeringPage = lazy(() => import('./pages/RemediationEngineeringPage').then(m => ({ default: m.RemediationEngineeringPage })));
const AuditReportsPage = lazy(() => import('./pages/AuditReportsPage').then(m => ({ default: m.AuditReportsPage })));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage').then(m => ({ default: m.KnowledgeBasePage })));

import { CONTAMINANT_PROFILES } from './data/contaminants';
import { ContaminantId, FishEntity, SimPhase } from './types';
import { SystemPageId } from './types/navigation';
import { soundFX } from './utils/audio';
import { decayConcentration, eliminationConstantFromHalfLife } from './utils/mathModels';

/** Peso de una porción estándar de pescado (kg). */
const PORTION_WEIGHT_KG = 0.2;
/** Escala temporal del compartimento humano: 1 s real = N días simulados. */
const HUMAN_SIM_DAYS_PER_SECOND = 3;

export default function App() {
  // Navigation & Page State (Defaults directly to the scenic live diorama simulator)
  const [activePage, setActivePage] = useState<SystemPageId>('diorama');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Simulation Parameters & State
  const [contaminantId, setContaminantId] = useState<ContaminantId>('mercury');
  const [phase, setPhase] = useState<SimPhase>(1);
  const [guidedMode, setGuidedMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Environmental Parameters
  const [dischargeRateKgDay, setDischargeRateKgDay] = useState<number>(30);
  const [filtrationEfficiency, setFiltrationEfficiency] = useState<number>(25);
  const [fishPortionsPerWeek, setFishPortionsPerWeek] = useState<number>(4);
  const [humanWeightKg, setHumanWeightKg] = useState<number>(70);
  const [exposureMonths, setExposureMonths] = useState<number>(6);

  // Ecosystem Readings
  const [waterConcentrationPpm, setWaterConcentrationPpm] = useState<number>(0.002);
  const [smallFishPpm, setSmallFishPpm] = useState<number>(0.025);
  const [largeFishPpm, setLargeFishPpm] = useState<number>(0.085);

  // Human Toxicological Burden
  const [humanAccumulatedDoseMg, setHumanAccumulatedDoseMg] = useState<number>(0);
  const [humanTissueConcentrationPpm, setHumanTissueConcentrationPpm] = useState<number>(0);
  const [fishConsumedCount, setFishConsumedCount] = useState<number>(0);

  // Interactive UI Selection & Modals
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>(null);
  const [isRemediationOpen, setIsRemediationOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSourceCodeModalOpen, setIsSourceCodeModalOpen] = useState<boolean>(false);
  const [inspectedFish, setInspectedFish] = useState<FishEntity | null>(null);

  const currentContaminant = CONTAMINANT_PROFILES[contaminantId];

  // Sync sound settings
  useEffect(() => {
    soundFX.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Feed human with fish contamination
  const handleFeedHuman = useCallback((amountPpm: number) => {
    // Antes se forzaba un piso de 0,08 ppm por porción: con eso, incluso un pez
    // limpio intoxicaba al comensal y la eficiencia de filtración no cambiaba
    // nada, que es justo la relación que el simulador pretende enseñar.
    const ingestedPpm = Math.max(0, amountPpm);
    const addedMg = ingestedPpm * PORTION_WEIGHT_KG;

    setFishConsumedCount(prev => prev + 1);
    setHumanAccumulatedDoseMg(prev => prev + addedMg);

    const vd = currentContaminant.volumeDistributionL * humanWeightKg; // L
    setHumanTissueConcentrationPpm(prev => {
      const nextVal = prev + addedMg / vd;
      if (prev < currentContaminant.criticalDosePpm && nextVal >= currentContaminant.criticalDosePpm) {
        soundFX.playToxAlert();
      }
      return nextVal;
    });

    // Particle celebration / effect
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x: 0.85, y: 0.4 },
        colors: [currentContaminant.color, '#ef4444', '#f59e0b']
      });
    } catch {
      // Ignore
    }
  }, [currentContaminant, humanWeightKg]);

  // Eliminación de primer orden del compartimento humano.
  // El modelo anterior sólo sumaba dosis: la carga corporal nunca bajaba, lo
  // que contradecía la propia calculadora toxicocinética de la app y hacía
  // imposible mostrar la recuperación tras dejar de consumir pescado.
  useEffect(() => {
    const ke = eliminationConstantFromHalfLife(currentContaminant.halfLifeHumansDays);
    if (ke <= 0) return;

    const intervalMs = 1000;
    const daysPerTick = (intervalMs / 1000) * HUMAN_SIM_DAYS_PER_SECOND;

    const id = window.setInterval(() => {
      setHumanTissueConcentrationPpm(prev =>
        prev > 1e-9 ? decayConcentration(prev, ke, daysPerTick) : 0,
      );
      setHumanAccumulatedDoseMg(prev =>
        prev > 1e-9 ? decayConcentration(prev, ke, daysPerTick) : 0,
      );
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [currentContaminant.halfLifeHumansDays]);

  // Update readings from canvas with delta threshold to avoid unnecessary re-renders
  const handleFishPpmUpdate = useCallback((smallPpm: number, largePpm: number, waterPpm: number) => {
    if (smallPpm > 0) setSmallFishPpm(prev => (Math.abs(prev - smallPpm) > 0.0005 ? smallPpm : prev));
    if (largePpm > 0) setLargeFishPpm(prev => (Math.abs(prev - largePpm) > 0.0005 ? largePpm : prev));
    if (waterPpm > 0) setWaterConcentrationPpm(prev => (Math.abs(prev - waterPpm) > 0.00005 ? waterPpm : prev));
  }, []);

  // Reset entire simulation
  const handleReset = () => {
    soundFX.playPhaseStep();
    setPhase(1);
    setHumanAccumulatedDoseMg(0);
    setHumanTissueConcentrationPpm(0);
    setFishConsumedCount(0);
    setWaterConcentrationPpm(0.002);
    setSmallFishPpm(0.025);
    setLargeFishPpm(0.085);
    setSelectedOrganId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] font-sans selection:bg-[#E11D48]/20 selection:text-[#E11D48]">
      {/* Enlace de salto: navegación por teclado sin recorrer todo el menú. */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#111113] focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido principal
      </a>
      
      {/* 1. Global Categorized Navigation Sidebar (Left) */}
      <NavigationSidebar
        activePage={activePage}
        onSelectPage={(pageId) => {
          setActivePage(pageId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        currentContaminant={currentContaminant}
        onSelectContaminant={(id) => {
          setContaminantId(id);
          setSelectedOrganId(null);
        }}
        humanTissueConcentrationPpm={humanTissueConcentrationPpm}
        onOpenSourceCode={() => setIsSourceCodeModalOpen(true)}
      />

      {/* 2. Main Content Area (With Left Margin on Desktop) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <AppNavbar
          activePage={activePage}
          onSelectPage={(pageId) => {
            setActivePage(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          currentContaminant={currentContaminant}
          onSelectContaminant={(id) => {
            setContaminantId(id);
            setSelectedOrganId(null);
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          onReset={handleReset}
          onOpenRemediation={() => setIsRemediationOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenSourceCode={() => setIsSourceCodeModalOpen(true)}
        />

        {/* Dynamic Multi-Page Router Outlet */}
        <main id="contenido-principal" className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-16">
          <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
          
          {/* Page: Dashboard */}
          {activePage === 'dashboard' && (
            <DashboardPage
              currentContaminant={currentContaminant}
              onSelectContaminant={setContaminantId}
              onNavigate={setActivePage}
              waterConcentrationPpm={waterConcentrationPpm}
              smallFishPpm={smallFishPpm}
              largeFishPpm={largeFishPpm}
              humanAccumulatedDoseMg={humanAccumulatedDoseMg}
              humanTissueConcentrationPpm={humanTissueConcentrationPpm}
              fishConsumedCount={fishConsumedCount}
              dischargeRateKgDay={dischargeRateKgDay}
              filtrationEfficiency={filtrationEfficiency}
              humanWeightKg={humanWeightKg}
            />
          )}

          {/* Page: Simulator Fluvial & Cadena Trófica */}
          {activePage === 'diorama' && (
            <SimulationPage
              contaminant={currentContaminant}
              phase={phase}
              onPhaseChange={setPhase}
              guidedMode={guidedMode}
              onToggleGuidedMode={() => setGuidedMode(prev => !prev)}
              dischargeRateKgDay={dischargeRateKgDay}
              onDischargeRateChange={setDischargeRateKgDay}
              filtrationEfficiency={filtrationEfficiency}
              onFiltrationEfficiencyChange={setFiltrationEfficiency}
              fishPortionsPerWeek={fishPortionsPerWeek}
              onFishPortionsChange={setFishPortionsPerWeek}
              humanWeightKg={humanWeightKg}
              onHumanWeightChange={setHumanWeightKg}
              exposureMonths={exposureMonths}
              onExposureMonthsChange={setExposureMonths}
              humanAccumulatedDoseMg={humanAccumulatedDoseMg}
              humanTissueConcentrationPpm={humanTissueConcentrationPpm}
              fishConsumedCount={fishConsumedCount}
              waterConcentrationPpm={waterConcentrationPpm}
              smallFishPpm={smallFishPpm}
              largeFishPpm={largeFishPpm}
              onFeedHuman={handleFeedHuman}
              onFishPpmUpdate={handleFishPpmUpdate}
              onSelectFishToInspect={setInspectedFish}
              onNavigateToAnatomy={() => setActivePage('anatomy')}
              onNavigateToMotionLab={() => setActivePage('motion_lab')}
            />
          )}

          {/* Page: Estudio de Motion Graphics 2D & Cinemática */}
          {activePage === 'motion_lab' && (
            <MotionGraphicsLabPage
              contaminant={currentContaminant}
              onSelectContaminant={setContaminantId}
              onNavigate={setActivePage}
            />
          )}

          {/* Page: Atlas Anatómico 3D */}
          {activePage === 'anatomy' && (
            <ToxicologyPage
              contaminant={currentContaminant}
              humanAccumulatedDoseMg={humanAccumulatedDoseMg}
              humanTissueConcentrationPpm={humanTissueConcentrationPpm}
              fishConsumedCount={fishConsumedCount}
              selectedOrganId={selectedOrganId}
              onSelectOrgan={setSelectedOrganId}
              onNavigate={setActivePage}
              onOpenRemediation={() => setIsRemediationOpen(true)}
            />
          )}

          {/* Page: Microscopio Celular */}
          {activePage === 'cellular' && (
            <CellularPage
              contaminant={currentContaminant}
              humanTissueConcentrationPpm={humanTissueConcentrationPpm}
              selectedOrganId={selectedOrganId}
              onSelectOrgan={setSelectedOrganId}
              onNavigate={setActivePage}
            />
          )}

          {/* Page: Laboratorio Matemático & Toxicocinética */}
          {activePage === 'kinetics' && (
            <MathematicalLabPage
              contaminant={currentContaminant}
              largeFishPpm={largeFishPpm}
              fishPortionsPerWeek={fishPortionsPerWeek}
              humanWeightKg={humanWeightKg}
              exposureMonths={exposureMonths}
              onNavigate={setActivePage}
            />
          )}

          {/* Page: Twinkl Go Hub Educativo */}
          {activePage === 'twinkl_hub' && (
            <TwinklGoHubPage
              contaminant={currentContaminant}
              onSelectContaminant={setContaminantId}
              onNavigate={setActivePage}
            />
          )}

          {/* Page: Planta de Tratamiento & Remediación */}
          {activePage === 'remediation_plant' && (
            <RemediationEngineeringPage
              contaminant={currentContaminant}
              dischargeRateKgDay={dischargeRateKgDay}
              onDischargeRateChange={setDischargeRateKgDay}
              filtrationEfficiency={filtrationEfficiency}
              onFiltrationEfficiencyChange={setFiltrationEfficiency}
              waterConcentrationPpm={waterConcentrationPpm}
            />
          )}

          {/* Page: Informes de Auditoría */}
          {activePage === 'audit_reports' && (
            <AuditReportsPage
              contaminant={currentContaminant}
              waterConcentrationPpm={waterConcentrationPpm}
              smallFishPpm={smallFishPpm}
              largeFishPpm={largeFishPpm}
              humanAccumulatedDoseMg={humanAccumulatedDoseMg}
              humanTissueConcentrationPpm={humanTissueConcentrationPpm}
              fishConsumedCount={fishConsumedCount}
              dischargeRateKgDay={dischargeRateKgDay}
              filtrationEfficiency={filtrationEfficiency}
              humanWeightKg={humanWeightKg}
              exposureMonths={exposureMonths}
            />
          )}

          {/* Page: Base de Conocimiento y Casos Históricos */}
          {activePage === 'knowledge_base' && (
            <KnowledgeBasePage />
          )}

          </Suspense>
          </ErrorBoundary>
        </main>

      </div>

      {/* Global Modals */}
      <RemediationModal
        contaminant={currentContaminant}
        isOpen={isRemediationOpen}
        onClose={() => setIsRemediationOpen(false)}
      />

      <ReportModal
        contaminant={currentContaminant}
        waterConcentrationPpm={waterConcentrationPpm}
        smallFishPpm={smallFishPpm}
        largeFishPpm={largeFishPpm}
        humanAccumulatedDoseMg={humanAccumulatedDoseMg}
        humanTissueConcentrationPpm={humanTissueConcentrationPpm}
        fishConsumedCount={fishConsumedCount}
        dischargeRateKgDay={dischargeRateKgDay}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <FishDetailsModal
        fish={inspectedFish}
        contaminant={currentContaminant}
        isOpen={!!inspectedFish}
        onClose={() => setInspectedFish(null)}
      />

      <Suspense fallback={null}>
        {isSourceCodeModalOpen && (
          <SourceCodeDownloadModal
            isOpen={isSourceCodeModalOpen}
            onClose={() => setIsSourceCodeModalOpen(false)}
          />
        )}
      </Suspense>

    </div>
  );
}
