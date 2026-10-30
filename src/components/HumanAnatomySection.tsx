import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertOctagon, 
  Brain, 
  Heart, 
  Layers, 
  Pill,
  Flame,
  Microscope,
  Scan,
  CheckCircle2,
  Crosshair,
  Wind,
  Droplets,
  Bone,
  GitCommit,
  Gauge,
  Stethoscope,
  TrendingDown,
  Play,
  Pause,
  BookOpen
} from 'lucide-react';
import { ContaminantProfile, TargetOrganImpact } from '../types';
import { CellularMicroscope } from './CellularMicroscope';
import { AnatomicalTorsoVisualizer } from './AnatomicalTorsoVisualizer';
import { getOrganMaster, getOrganImpactForContaminant } from '../data/organs';

interface HumanAnatomySectionProps {
  contaminant: ContaminantProfile;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  selectedOrganId: string | null;
  onSelectOrgan: (organId: string | null) => void;
  onOpenRemediation: () => void;
}

type PhysiologicalSystem = 'all' | 'nervous' | 'circulatory' | 'respiratory' | 'digestive' | 'renal' | 'skeletal' | 'endocrine' | 'immune' | 'reproductive' | 'skin' | 'pathway';

export const HumanAnatomySection: React.FC<HumanAnatomySectionProps> = ({
  contaminant,
  humanAccumulatedDoseMg,
  humanTissueConcentrationPpm,
  selectedOrganId,
  onSelectOrgan,
  onOpenRemediation
}) => {
  const [viewMode, setViewMode] = useState<'macro_scanner' | 'cellular_microscope' | 'split'>('split');
  const [activeSystem, setActiveSystem] = useState<PhysiologicalSystem>('all');
  const [pathwayStep, setPathwayStep] = useState<number>(1);
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);
  const [morphoAnimationActive, setMorphoAnimationActive] = useState<boolean>(true);
  const [morphoLayerDetail, setMorphoLayerDetail] = useState<'all' | 'stroma_parenchyma' | 'tunics_mucosa' | 'vascular_hemodynamics'>('all');

  const toxicityRatio = humanTissueConcentrationPpm / Math.max(0.001, contaminant.criticalDosePpm);
  const isToxic = toxicityRatio >= 1.0;
  const isModerate = toxicityRatio >= 0.4 && toxicityRatio < 1.0;

  // Selected organ impact data (fallback to primary target organ or master database)
  const currentOrganId = selectedOrganId || contaminant.targetOrgans[0]?.organId || 'brain';
  const currentOrganData = useMemo(() => {
    const existing = contaminant.targetOrgans.find(o => o.organId === currentOrganId);
    if (existing) return existing;
    return getOrganImpactForContaminant(currentOrganId, contaminant.id);
  }, [contaminant, currentOrganId]);

  // Physiological Biomarkers Calculation based on Morfología Humana II & Clinical Toxicology
  const biomarkers = useMemo(() => {
    const dose = humanAccumulatedDoseMg;
    const tox = Math.min(3.0, toxicityRatio);

    // Blood levels in ug/dL
    const bloodLevelUgDl = (Number(humanTissueConcentrationPpm || 0) * 100 * (contaminant.id === 'lead' ? 45 : 20)).toFixed(1);
    
    // Renal eGFR (mL/min/1.73m^2)
    const baselineGFR = 110;
    const gfrReduction = contaminant.id === 'cadmium' ? tox * 35 : contaminant.id === 'lead' ? tox * 22 : tox * 15;
    const eGFR = Math.max(18, Math.round(baselineGFR - gfrReduction));

    // Blood Pressure mmHg (Lead-induced arterial stiffness)
    const systolicBP = Math.min(185, Math.round(120 + (contaminant.id === 'lead' ? tox * 25 : tox * 12)));
    const diastolicBP = Math.min(115, Math.round(80 + (contaminant.id === 'lead' ? tox * 15 : tox * 8)));

    // Enzyme Inhibition % (ALAD for Lead, Pyruvate Dehydrogenase for As, Tubulin/ATPase for Hg)
    const enzymeInhibitionPct = Math.min(95, Math.round(tox * (contaminant.id === 'lead' ? 38 : 28)));

    // ROS Oxidative Stress %
    const oxidativeStressPct = Math.min(99, Math.round(15 + tox * 32));

    // Bone hydroxyapatite displacement in Lead/Cadmium (Ca10(PO4)6(OH)2)
    const boneDepositionMg = (Number(dose || 0) * (contaminant.id === 'lead' ? 0.90 : contaminant.id === 'cadmium' ? 0.45 : 0.10)).toFixed(2);

    return {
      bloodLevelUgDl,
      eGFR,
      systolicBP,
      diastolicBP,
      enzymeInhibitionPct,
      oxidativeStressPct,
      boneDepositionMg
    };
  }, [humanAccumulatedDoseMg, toxicityRatio, humanTissueConcentrationPpm, contaminant.id]);

  // Morphological Classification Data according to Morfología Humana II
  const morphologicalDetails = useMemo(() => {
    const master = getOrganMaster(currentOrganId);
    return master.morphology;
  }, [currentOrganId]);

  // Color calculation based on organ role and active system
  const getOrganVisualStatus = (organId: string, systemCategory: PhysiologicalSystem) => {
    const isTarget = contaminant.targetOrgans.some(o => o.organId === organId);
    const isSelected = currentOrganId === organId;
    const isSystemActive = activeSystem === 'all' || activeSystem === systemCategory || activeSystem === 'pathway';

    let strokeColor = '#475569';
    let fillColor = '#1e293b';
    let opacity = isSystemActive ? 1.0 : 0.25;

    if (isSelected) {
      strokeColor = '#38bdf8';
      fillColor = '#0284c7';
      opacity = 1.0;
    } else if (isTarget) {
      if (isToxic) {
        strokeColor = '#ef4444';
        fillColor = '#7f1d1d';
      } else if (isModerate) {
        strokeColor = '#f59e0b';
        fillColor = '#78350f';
      } else {
        strokeColor = '#10b981';
        fillColor = '#064e3b';
      }
    }

    return { strokeColor, fillColor, opacity, isTarget, isSelected };
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
      
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Stethoscope className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Escáner Anatómico & Fisiológico Humano
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  MORFOLOGÍA HUMANA II (ROSELL PUIG)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluación morfofuncional, hemodinámica y toxicocinética por <strong>{contaminant.name} ({contaminant.chemicalFormula})</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Toxicity Alert Badge & View Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Morpho Dynamic Animation Toggle */}
          <button
            id="btn-toggle-morpho-anim"
            onClick={() => setMorphoAnimationActive(!morphoAnimationActive)}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              morphoAnimationActive
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {morphoAnimationActive ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
            <span>{morphoAnimationActive ? 'Morfodinámica: Activa' : 'Morfodinámica: Pausa'}</span>
          </button>

          {/* View Mode Buttons */}
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              id="btn-viewmode-split"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Doble Vista</span>
            </button>
            <button
              id="btn-viewmode-macro"
              onClick={() => setViewMode('macro_scanner')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'macro_scanner' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Cuerpo Completo</span>
            </button>
            <button
              id="btn-viewmode-micro"
              onClick={() => setViewMode('cellular_microscope')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'cellular_microscope' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Histología 1000x</span>
            </button>
          </div>

          {/* Clinical Badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-bold ${
            isToxic 
              ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse shadow-lg shadow-rose-950/40' 
              : isModerate 
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>
              {isToxic ? 'INTOXICACIÓN CLÍNICA SEVERA' : isModerate ? 'NIVEL DE RIESGO TOXICOLÓGICO' : 'HOMEOSTASIS FISIOLÓGICA'}
            </span>
          </div>
        </div>
      </div>

      {/* Physiological Systems Interactive Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 uppercase mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-400" /> Capas Morfofuncionales:
        </span>
        {[
          { id: 'all', label: 'Todos los Sistemas', icon: Activity },
          { id: 'nervous', label: 'SNC & Periférico', icon: Brain },
          { id: 'circulatory', label: 'Cardiovascular & Hemodinámico', icon: Heart },
          { id: 'renal', label: 'Renal & Nefronas', icon: Droplets },
          { id: 'digestive', label: 'Digestivo & Hepático', icon: Flame },
          { id: 'respiratory', label: 'Respiratorio & Alvéolos', icon: Wind },
          { id: 'skeletal', label: 'Óseo & Hidroxiapatita', icon: Bone },
          { id: 'pathway', label: 'Ruta Toxicocinética', icon: GitCommit }
        ].map((sys) => {
          const Icon = sys.icon;
          const isActive = activeSystem === sys.id;
          return (
            <button
              key={sys.id}
              id={`btn-system-${sys.id}`}
              onClick={() => setActiveSystem(sys.id as PhysiologicalSystem)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all border ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-950 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{sys.label}</span>
            </button>
          );
        })}
      </div>

      {/* Real-Time Physiological Telemetry / Vital Signs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 bg-slate-950/90 rounded-xl border border-slate-800/90 shadow-inner">
        {/* Metric 1: Blood Concentration */}
        <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>NIVEL EN SANGRE</span>
            <Droplets className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-base font-mono font-bold ${Number(biomarkers.bloodLevelUgDl) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {biomarkers.bloodLevelUgDl}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">µg/dL</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            Límite OMS: &lt; {contaminant.id === 'mercury' ? '4.0' : '3.5'} µg/dL
          </span>
        </div>

        {/* Metric 2: Renal eGFR */}
        <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>TASA FILTRADO (eGFR)</span>
            <Gauge className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-base font-mono font-bold ${biomarkers.eGFR < 60 ? 'text-rose-400' : biomarkers.eGFR < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {biomarkers.eGFR}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">mL/min</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {biomarkers.eGFR < 60 ? 'Fallo Tubular / Fanconi' : 'Filtración Renal Óptima'}
          </span>
        </div>

        {/* Metric 3: Blood Pressure */}
        <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>PRESIÓN ARTERIAL</span>
            <Heart className="w-3 h-3 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-base font-mono font-bold ${biomarkers.systolicBP >= 140 ? 'text-rose-400' : 'text-cyan-300'}`}>
              {biomarkers.systolicBP}/{biomarkers.diastolicBP}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {biomarkers.systolicBP >= 140 ? 'Hipertensión Secundaria' : 'Normotensión'}
          </span>
        </div>

        {/* Metric 4: Enzyme Inhibition */}
        <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>INHIBICIÓN ENZIMAS</span>
            <TrendingDown className="w-3 h-3 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-base font-mono font-bold ${biomarkers.enzymeInhibitionPct > 40 ? 'text-rose-400' : 'text-amber-400'}`}>
              {biomarkers.enzymeInhibitionPct}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Inhib.</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {contaminant.id === 'lead' ? 'ALAD / Síntesis Hemo' : contaminant.id === 'mercury' ? 'Tubulina / NMDA' : 'Mitocondrial'}
          </span>
        </div>

        {/* Metric 5: Oxidative Stress ROS */}
        <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>ESTRÉS OXIDATIVO (ROS)</span>
            <Flame className="w-3 h-3 text-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-base font-mono font-bold ${biomarkers.oxidativeStressPct > 60 ? 'text-rose-400' : 'text-orange-400'}`}>
              {biomarkers.oxidativeStressPct}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ROS</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            Peroxidación Lipídica
          </span>
        </div>

        {/* Metric 6: Bone / Tissue Reservoir */}
        <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>DEPÓSITO EN HUESO</span>
            <Bone className="w-3 h-3 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base font-mono font-bold text-amber-300">
              {biomarkers.boneDepositionMg}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">mg Pb/Cd</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            Semivida: {contaminant.id === 'lead' ? '~20-30 años' : '~25 años'}
          </span>
        </div>
      </div>

      {/* Main Scanner & Pathology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Anatomical & Physiological Vector Body Scanner */}
        {(viewMode === 'split' || viewMode === 'macro_scanner') && (
          <div className={`${viewMode === 'macro_scanner' ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col p-4 bg-slate-950 rounded-xl border border-slate-800 relative shadow-inner overflow-hidden`}>
            
            {/* Top Scanner Status Telemetry */}
            <div className="w-full flex items-center justify-between mb-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Crosshair className="w-3.5 h-3.5" />
                <span>ESCÁNER MORFOLÓGICO HUMANO</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                CAPA: {activeSystem.toUpperCase()}
              </span>
            </div>

            {/* High-Fidelity 3D Morphological Anatomy Visualizer (Matching Academic Torso Reference) */}
            <div className="relative w-full my-1">
              <AnatomicalTorsoVisualizer
                contaminant={contaminant}
                activeSystem={activeSystem}
                selectedOrganId={currentOrganId}
                humanTissueConcentrationPpm={humanTissueConcentrationPpm}
                onSelectOrgan={(orgId) => onSelectOrgan(orgId)}
                hoveredStructure={hoveredStructure}
                setHoveredStructure={setHoveredStructure}
                morphoAnimationActive={morphoAnimationActive}
              />
            </div>

            {/* Hovered / Current Target Diagnostic Callout */}
            <div className="bg-slate-900/95 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono mt-2">
              <span className="text-slate-400">ESTRUCTURA INSPECCIONADA:</span>
              <span className="text-cyan-300 font-bold">
                {hoveredStructure || currentOrganData.organName}
              </span>
            </div>

            {/* Quick Interactive Organ Pill Selector */}
            <div className="w-full mt-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold uppercase">
                Selección de Tejido & Órgano Diana:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {contaminant.targetOrgans.map((org) => {
                  const isSelected = currentOrganId === org.organId;
                  return (
                    <button
                      key={org.organId}
                      id={`btn-organ-pill-${org.organId}`}
                      onClick={() => onSelectOrgan(org.organId)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{org.organName.split(' ')[0]}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Right / Center Column: High Definition Cellular Microscope & Clinical Pathology */}
        {viewMode !== 'macro_scanner' && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col space-y-4`}>
          
          {/* Dedicated Ultra-Sharp Cellular Microscope Window */}
          {(viewMode === 'split' || viewMode === 'cellular_microscope') && (
            <CellularMicroscope
              organId={currentOrganId}
              contaminant={contaminant}
              tissuePpm={humanTissueConcentrationPpm}
              criticalDosePpm={contaminant.criticalDosePpm}
            />
          )}

          {/* Morphological Architecture Card (Estroma vs Parénquima & Túnicas) */}
          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Arquitectura Morfofuncional: {morphologicalDetails.type}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                ESPLACNOLOGÍA & HISTOGÉNESIS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
                  1. Estroma de Sostén (Armazón Conectivo):
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  {morphologicalDetails.stroma}
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase">
                  2. Parénquima Funcional (Epitelial/Nervioso):
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  {morphologicalDetails.parenchyma}
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 sm:col-span-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">
                  3. Unidad Morfofuncional & Alteración Patomorfológica:
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  <strong>Unidad:</strong> {morphologicalDetails.functionalUnit}.<br />
                  <span className="text-rose-300 font-medium"><strong>Lesión Tisular:</strong> {morphologicalDetails.morphoLesion}.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Organ Clinical Pathology & Mechanism Card */}
          <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {currentOrganData.organName}
                </h3>
              </div>
              <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                currentOrganData.severity === 'critical'
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              }`}>
                Severidad Tisular: {currentOrganData.severity}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {currentOrganData.impactDescription}
            </p>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/90 shadow-inner">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Mecanismo Molecular Sub-Celular:
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {currentOrganData.cellularMechanism}
              </p>
            </div>
          </div>

          {/* Toxicokinetic Physiological Cascade Timeline */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-cyan-400" />
                Cascada Fisiológica de Absorción, Distribución y Daño
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Paso {pathwayStep} de 4
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { step: 1, title: '1. Ingesta & GI', desc: 'Solubilización ácida y paso por mucosa intestinal.' },
                { step: 2, title: '2. Paso Portal', desc: 'Transporte por vena porta y fijación a albúmina.' },
                { step: 3, title: '3. Barreras SNC', desc: 'Paso de barrera hematoencefálica y placenta.' },
                { step: 4, title: '4. Depósito Diana', desc: 'Inhibición enzimática y daño oxidativo crónico.' }
              ].map((st) => (
                <button
                  key={st.step}
                  id={`btn-pathway-step-${st.step}`}
                  onClick={() => setPathwayStep(st.step)}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    pathwayStep === st.step
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{st.title}</span>
                  <span className="text-[10px] text-slate-400 leading-tight block mt-0.5 line-clamp-2">{st.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              {pathwayStep === 1 && (
                <span><strong>Fase 1 (Absorción Gastrointestinal):</strong> Tras consumir pescado contaminado, los complejos lipofílicos de {contaminant.name} se absorben con una eficiencia superior al 95% en las vellosidades del intestino delgado utilizando transportadores de metales divalentes (DMT1) y transportadores neutros de aminoácidos a través de la túnica mucosa y submucosa.</span>
              )}
              {pathwayStep === 2 && (
                <span><strong>Fase 2 (Distribución Hemodinámica & Sistema Porta):</strong> La circulación portal conduce el metal pesado al hígado donde se induce la síntesis de metalotioneínas. Más del 90% del metal se fija a los eritrocitos (hemoglobina) y proteínas séricas, distribuyéndose por todo el árbol vascular sistémico hacia la vena cava inferior y el atrio derecho.</span>
              )}
              {pathwayStep === 3 && (
                <span><strong>Fase 3 (Permeación de Barreras Biológicas):</strong> Debido a su liposolubilidad o mimetismo con nutrientes esenciales (el metilmercurio imita a la L-metionina vía transportador LAT1; el plomo imita al Ca²⁺), el contaminante atraviesa la barrera hematoencefálica glial y la membrana placentaria fetal.</span>
              )}
              {pathwayStep === 4 && (
                <span><strong>Fase 4 (Lisis Celular & Citotoxicidad Tisular):</strong> Unión irreversible a grupos sulfhidrilo (-SH), colapso de la cadena respiratoria mitocondrial, despolarización de membrana en neuronas, atrofia en el ribete en cepillo de túbulos renales y depósito prolongado en la matriz de hidroxiapatita ósea.</span>
              )}
            </div>
          </div>

          {/* Acute vs Chronic Symptoms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-amber-400 block mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Manifestaciones Clínicas Agudas
              </span>
              <ul className="space-y-1.5">
                {contaminant.acuteSymptoms.map((sym, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-rose-400 block mb-2 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Secuelas Crónicas & Fisiopatología
              </span>
              <ul className="space-y-1.5">
                {contaminant.chronicSymptoms.slice(0, 3).map((sym, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medical Chelation Therapy Protocol Action Banner */}
          <div className="p-3 bg-gradient-to-r from-emerald-950/70 via-slate-950 to-slate-950 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  Tratamiento de Quelación Farmacológica
                </span>
                <p className="text-xs font-bold text-white">
                  {contaminant.chelatingAgent.name} ({contaminant.chelatingAgent.effectiveness})
                </p>
              </div>
            </div>
            <button
              id="btn-view-remediation-modal"
              onClick={onOpenRemediation}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/50 shrink-0 flex items-center gap-1"
            >
              <span>Ver Protocolo Clínico</span>
            </button>
          </div>

        </div>
        )}

      </div>
    </div>
  );
};
