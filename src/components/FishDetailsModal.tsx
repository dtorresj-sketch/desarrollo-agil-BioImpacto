import React from 'react';
import { X, Fish, AlertTriangle, ShieldCheck, Activity, Dna } from 'lucide-react';
import { FishEntity, ContaminantProfile } from '../types';

interface FishDetailsModalProps {
  fish: FishEntity | null;
  contaminant: ContaminantProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const FishDetailsModal: React.FC<FishDetailsModalProps> = ({
  fish,
  contaminant,
  isOpen,
  onClose
}) => {
  if (!isOpen || !fish) return null;

  const toxicityRatio = fish.contaminationPpm / fish.maxHealthyPpm;
  const isDangerous = toxicityRatio > 1.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {fish.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Nivel Trófico: {fish.type === 'small' ? 'Consumidor 1° / 2°' : 'Consumidor 3° (Depredador)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-xs">
          
          {/* Status Gauge */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Concentración Acumulada:</span>
              <span className={`text-lg font-mono font-bold ${isDangerous ? 'text-rose-400' : 'text-cyan-400'}`}>
                {Number(fish?.contaminationPpm || 0).toFixed(4)} ppm
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
              isDangerous 
                ? 'bg-rose-950 border-rose-500/50 text-rose-300' 
                : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
            }`}>
              {isDangerous ? 'SOBRE LÍMITE SANITARIO' : 'NIVEL ACEPTABLE'}
            </span>
          </div>

          {/* Organ distribution in fish */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200 block">
              Distribución Tisular en el Pescado:
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Tejido Muscular (Filete):</span>
                <span className="font-mono text-cyan-300 font-bold">{(Number(fish?.contaminationPpm || 0) * 0.75).toFixed(4)} mg/kg</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Hígado y Vísceras:</span>
                <span className="font-mono text-amber-400 font-bold">{(Number(fish?.contaminationPpm || 0) * 1.8).toFixed(4)} mg/kg</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Branquias:</span>
                <span className="font-mono text-purple-400 font-bold">{(Number(fish?.contaminationPpm || 0) * 1.2).toFixed(4)} mg/kg</span>
              </div>
            </div>
          </div>

          {/* Biological half-life in fish */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-slate-300 text-[11px]">
              Semivida biológica en fauna marina: <strong>~{contaminant.halfLifeFishDays} días</strong>. La eliminación es extremadamente lenta comparada con la tasa de ingestión.
            </p>
          </div>

        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
