import React from 'react';
import { 
  X, 
  FileText, 
  Printer, 
} from 'lucide-react';
import { ContaminantProfile } from '../types';

interface ReportModalProps {
  contaminant: ContaminantProfile;
  waterConcentrationPpm: number;
  smallFishPpm: number;
  largeFishPpm: number;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  dischargeRateKgDay: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  contaminant,
  waterConcentrationPpm,
  smallFishPpm,
  largeFishPpm,
  humanAccumulatedDoseMg,
  humanTissueConcentrationPpm,
  fishConsumedCount,
  dischargeRateKgDay,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const isCritical = humanTissueConcentrationPpm > contaminant.criticalDosePpm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Informe Toxicológico & Evaluación de Impacto Ambiental
              </h3>
              <p className="text-xs text-slate-400">
                Auditoría de Bioacumulación Trófica y Riesgo Sanitario
              </p>
            </div>
          </div>
          <button
            id="btn-close-report"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable/Scannable Report Body */}
        <div className="space-y-4 text-xs">
          
          {/* Executive Summary */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-400 text-sm">
                1. Resumen Ejecutivo de la Evaluación
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                isCritical 
                  ? 'bg-rose-950 border-rose-500/50 text-rose-400' 
                  : 'bg-emerald-950 border-emerald-500/50 text-emerald-400'
              }`}>
                {isCritical ? 'ESTADO: RIESGO TOXICOLÓGICO CRÍTICO' : 'ESTADO: DENTRO DE LÍMITES TOLERABLES'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Se ha modelado el vertido de <strong>{contaminant.name} ({contaminant.chemicalFormula})</strong> con un caudal de descarga de <strong>{dischargeRateKgDay || 0} kg/día</strong>. El contaminante exhibe un factor de bioacumulación primaria de <strong>×{contaminant.bcfSmallFish}</strong> y biomagnificación trófica de <strong>×{contaminant.bmfPredator}</strong> en peces carnívoros, trasladando una carga acumulada de <strong>{(humanAccumulatedDoseMg || 0).toFixed(3)} mg</strong> al consumidor humano tras <strong>{fishConsumedCount || 0}</strong> ingestas registradas.
            </p>
          </div>

          {/* Trophic Chain Metrics Table */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-white block mb-3">
              2. Concentraciones por Eslabón de la Cadena Trófica
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Agua Fluvial</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {(waterConcentrationPpm || 0).toFixed(4)} ppm
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Alevines / Bentos</span>
                <span className="text-blue-400 font-bold text-sm">
                  {(smallFishPpm || 0).toFixed(4)} ppm
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Trucha Fario</span>
                <span className="text-amber-400 font-bold text-sm">
                  {(largeFishPpm || 0).toFixed(4)} ppm
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tejido Humano</span>
                <span className={`font-bold text-sm ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(humanTissueConcentrationPpm || 0).toFixed(4)} ppm
                </span>
              </div>
            </div>
          </div>

          {/* Organ Target Pathology Breakdown */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-white block mb-2">
              3. Diagnóstico de Órganos Diana Afectados
            </span>
            <div className="space-y-2">
              {contaminant.targetOrgans.map(org => (
                <div key={org.organId} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-slate-200 block">{org.organName}</strong>
                    <span className="text-slate-400 text-[11px]">{org.impactDescription}</span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                    org.severity === 'critical' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {org.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
