import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Pill, 
  Trees, 
  CheckCircle, 
  Building2
} from 'lucide-react';
import { ContaminantProfile } from '../types';

interface RemediationModalProps {
  contaminant: ContaminantProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  contaminant,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Protocolos de Mitigación & Quelación Clínica
              </h3>
              <p className="text-xs text-slate-400">
                Soluciones médicas y de ingeniería ambiental para {contaminant.name}
              </p>
            </div>
          </div>
          <button
            id="btn-close-remediation"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          
          {/* Medical Chelation Therapy */}
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <Pill className="w-4 h-4" />
              <span>1. Terapia Farmacológica de Quelación Humana</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 mb-2">
              <span className="text-xs text-slate-300 font-bold block mb-1">
                Fármaco de Elección: {contaminant.chelatingAgent.name}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {contaminant.chelatingAgent.mechanism}
              </p>
            </div>
            <div className="text-xs text-slate-400">
              <strong className="text-emerald-300">Eficacia Clínica:</strong> {contaminant.chelatingAgent.effectiveness}
            </div>
          </div>

          {/* Environmental Remediation */}
          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
              <Trees className="w-4 h-4" />
              <span>2. Biorremediación & Tratamiento de Efluentes Marinos</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {contaminant.environmentalSolution}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Resinas de intercambio iónico selectivas</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Humedales artificiales y fitorremediación</span>
              </div>
            </div>
          </div>

          {/* Regulatory Measures */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Building2 className="w-4 h-4" />
              <span>3. Marco Regulatorio & Políticas Públicas</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Límites máximos permisibles de vertido industrial (EPA / Convenio de Minamata).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Monitoreo biológico regular en especies de peces carnívoros comerciales.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Recomendaciones dietéticas preventivas para mujeres embarazadas e infantes.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
