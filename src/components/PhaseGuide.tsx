import React from 'react';
import { 
  Factory, 
  Droplet, 
  Fish, 
  User, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
} from 'lucide-react';
import { SimPhase, ContaminantProfile } from '../types';
import { soundFX } from '../utils/audio';

interface PhaseGuideProps {
  currentPhase: SimPhase;
  onSelectPhase?: (phase: SimPhase) => void;
  onSetPhase?: (phase: SimPhase) => void;
  onTriggerDischarge?: () => void;
  onFeedHuman?: () => void;
  contaminant: ContaminantProfile;
  fishContaminationPpm?: number;
  smallFishPpm?: number;
  largeFishPpm?: number;
  waterConcentrationPpm?: number;
  humanTissuePpm?: number;
  humanAccumulatedDoseMg?: number;
  totalParticlesInWater?: number;
  onOpenRemediation?: () => void;
}

export const PhaseGuide: React.FC<PhaseGuideProps> = ({
  currentPhase,
  onSelectPhase,
  onSetPhase,
  onTriggerDischarge,
  onFeedHuman,
  contaminant,
  fishContaminationPpm,
  smallFishPpm = 0,
  largeFishPpm = 0,
  waterConcentrationPpm = 0,
  humanTissuePpm = 0,
  humanAccumulatedDoseMg = 0,
  totalParticlesInWater = 0,
  onOpenRemediation
}) => {
  const handleSetPhase = (phase: SimPhase) => {
    if (onSetPhase) onSetPhase(phase);
    if (onSelectPhase) onSelectPhase(phase);
  };

  const effectiveFishPpm = fishContaminationPpm ?? largeFishPpm ?? smallFishPpm ?? 0.05;

  const phases = [
    {
      id: 1,
      title: 'Fase 1: Fuente Industrial',
      icon: Factory,
      subtitle: 'Configuración de efluente',
      description: 'La industria petroquímica/minera acumula residuos tóxicos con alta concentración de ' + (contaminant?.name || 'metales pesados') + '.',
      actionLabel: '1. Iniciar Proceso de Planta',
      actionHandler: () => {
        soundFX.playPhaseStep();
        handleSetPhase(2);
        if (onTriggerDischarge) onTriggerDischarge();
      }
    },
    {
      id: 2,
      title: 'Fase 2: Vertido & Emisión',
      icon: Droplet,
      subtitle: 'Dispersión en el océano',
      description: 'El efluente se descarga por la tubería submarina. Las partículas de ' + (contaminant?.chemicalSymbol || 'ion') + ' flotan y se difunden en la columna de agua.',
      actionLabel: '2. Emitir Oleada de Químico',
      actionHandler: () => {
        soundFX.playDischarge();
        if (onTriggerDischarge) onTriggerDischarge();
        handleSetPhase(3);
      }
    },
    {
      id: 3,
      title: 'Fase 3: Bioacumulación en Peces',
      icon: Fish,
      subtitle: 'Ingestión por fauna marina',
      description: 'Los peces nadan y absorben el metal pesado por branquias y alimentación. El pez cambia de color y acumula ' + Number(effectiveFishPpm || 0).toFixed(3) + ' ppm de toxina.',
      actionLabel: '3. Pescar y Preparar para Consumo',
      actionHandler: () => {
        soundFX.playPhaseStep();
        handleSetPhase(4);
      }
    },
    {
      id: 4,
      title: 'Fase 4: Consumo Humano',
      icon: User,
      subtitle: 'Traspaso a la dieta',
      description: 'El pescado contaminado entra en la cadena alimentaria humana. Arrastra el pez hacia la persona o presiona consumir.',
      actionLabel: '4. Servir Pescado al Humano',
      actionHandler: () => {
        if (onFeedHuman) onFeedHuman();
        handleSetPhase(5);
      }
    },
    {
      id: 5,
      title: 'Fase 5: Efectos en la Salud',
      icon: Activity,
      subtitle: 'Toxicocinética y patología',
      description: 'El ' + (contaminant?.chemicalFormula || 'metal') + ' se distribuye por sangre hacia ' + (contaminant?.targetOrgans?.map(o => o.organName).join(', ') || 'órganos vitales') + '.',
      actionLabel: '5. Ver Diagnóstico y Quelación',
      actionHandler: () => {
        soundFX.playToxAlert();
        if (onOpenRemediation) onOpenRemediation();
      }
    }
  ];

  const activePhaseData = phases.find(p => p.id === currentPhase) || phases[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl mb-4 backdrop-blur-md">
      {/* Progress Steps Header */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {phases.map((phase) => {
          const Icon = phase.icon;
          const isCurrent = currentPhase === phase.id;
          const isPast = currentPhase > phase.id;

          return (
            <button
              key={phase.id}
              id={`phase-step-${phase.id}`}
              onClick={() => {
                soundFX.playPhaseStep();
                handleSetPhase(phase.id as SimPhase);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-800 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : isPast
                  ? 'bg-slate-950/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  : 'bg-slate-950/30 border-slate-850 text-slate-600 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className={`p-1.5 rounded-lg ${
                  isCurrent 
                    ? 'bg-cyan-500/20 text-cyan-300' 
                    : isPast 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-800/40 text-slate-500'
                }`}>
                  {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{phase.id}
                </span>
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight line-clamp-1 ${
                  isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {phase.title.split(':')[1] || phase.title}
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                  {phase.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Dynamic Action Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
            <activePhaseData.icon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Paso {activePhaseData.id} de 5
              </span>
              <h3 className="text-sm font-bold text-white">
                {activePhaseData.title}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {activePhaseData.description}
            </p>
          </div>
        </div>

        {/* Action Trigger Button for Phase */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            id={`btn-phase-action-${currentPhase}`}
            onClick={activePhaseData.actionHandler}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <span>{activePhaseData.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
