import React, { useState } from 'react';
import { 
  Calculator, 
} from 'lucide-react';
import { ContaminantProfile } from '../types';
import { simulateToxicokinetics, calculateDoseResponse } from '../utils/mathModels';

interface MathematicalLabProps {
  contaminant: ContaminantProfile;
  fishConcentrationPpm: number;
  fishPortionsPerWeek: number;
  humanWeightKg: number;
  exposureMonths: number;
}

export const MathematicalLab: React.FC<MathematicalLabProps> = ({
  contaminant,
  fishConcentrationPpm,
  fishPortionsPerWeek,
  humanWeightKg,
  exposureMonths
}) => {
  const [activeTab, setActiveTab] = useState<'kinetics' | 'bcf' | 'doseresponse'>('kinetics');

  const kineticModel = simulateToxicokinetics(
    contaminant,
    fishConcentrationPpm > 0 ? fishConcentrationPpm : 0.2,
    fishPortionsPerWeek,
    200,
    humanWeightKg,
    exposureMonths
  );

  const doseResponseVal = calculateDoseResponse(kineticModel.currentConcentrationPpm, contaminant.criticalDosePpm);

  // SVG dimensions for graphs
  const graphWidth = 440;
  const graphHeight = 180;
  const padding = 35;

  // Max value for Y scaling
  const maxConc = Math.max(
    contaminant.criticalDosePpm * 1.6,
    ...kineticModel.timeSeriesData.map(d => d.concentration)
  );

  // Coordinate mapping helper
  const mapX = (day: number) => {
    const maxDay = exposureMonths * 30;
    return padding + (day / maxDay) * (graphWidth - padding * 2);
  };

  const mapY = (conc: number) => {
    return graphHeight - padding - (conc / (maxConc || 1)) * (graphHeight - padding * 2);
  };

  // Generate SVG path for kinetic curve
  const points = kineticModel.timeSeriesData
    .map(d => `${mapX(d.day)},${mapY(d.concentration)}`)
    .join(' L ');
  const curvePath = points ? `M ${points}` : '';

  const thresholdY = mapY(contaminant.criticalDosePpm);

  return (
    <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md mb-6">
      
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Laboratorio Matemático & Toxicocinética (Modo Manim)
            </h2>
            <p className="text-xs text-slate-400">
              Ecuaciones diferenciales y modelos cinéticos de 1 compartimento
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            id="tab-math-kinetics"
            onClick={() => setActiveTab('kinetics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kinetics'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Curva Cinética C(t)
          </button>
          <button
            id="tab-math-bcf"
            onClick={() => setActiveTab('bcf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bcf'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Factores BCF & BMF
          </button>
          <button
            id="tab-math-doseresponse"
            onClick={() => setActiveTab('doseresponse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'doseresponse'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dosis-Respuesta (Hill)
          </button>
        </div>
      </div>

      {/* Content Area according to active tab */}
      {activeTab === 'kinetics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Dynamic LaTeX Styled Formula Card (5 cols) */}
          <div className="lg:col-span-5 space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">
                Ecuación Diferencial Ordinaria (ODE):
              </span>
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-purple-500/20 text-purple-200 text-center font-bold text-sm">
                dC/dt = (R_ingesta / V_d) - k_e · C(t)
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">
                Solución Analítica Temporal:
              </span>
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-200 text-center font-bold">
                C(t) = C_ss · (1 - e^(-k_e · t))
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Semivida (t½):</span>
                <span className="text-amber-300 font-bold font-mono">
                  {(kineticModel?.halfLifeDays ?? 0).toFixed(1)} días
                </span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Cociente Peligro (HQ):</span>
                <span className={`font-bold font-mono ${
                  (kineticModel?.hazardQuotientHQ || 0) > 1 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {(kineticModel?.hazardQuotientHQ ?? 0).toFixed(2)} {(kineticModel?.hazardQuotientHQ || 0) > 1 ? '(Riesgo Alto)' : '(Seguro)'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: SVG Interactive Kinetic Plot (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">
                Acumulación de {contaminant.chemicalFormula} en Sangre vs Tiempo
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                Concentración actual: {(kineticModel?.currentConcentrationPpm ?? 0).toFixed(4)} ppm
              </span>
            </div>

            <div className="w-full flex justify-center">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full max-w-lg h-44">
                {/* Grid lines */}
                <line x1={padding} y1={graphHeight - padding} x2={graphWidth - padding} y2={graphHeight - padding} stroke="#334155" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={graphHeight - padding} stroke="#334155" strokeWidth="1" />

                {/* Safe Threshold Horizontal Line */}
                <line 
                  x1={padding} 
                  y1={thresholdY} 
                  x2={graphWidth - padding} 
                  y2={thresholdY} 
                  stroke="#ef4444" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3" 
                />
                <text x={graphWidth - padding - 80} y={thresholdY - 5} fill="#ef4444" fontSize="9" fontWeight="bold">
                  Límite Crítico OMS
                </text>

                {/* Kinetic Area Fill & Curve */}
                {curvePath && (
                  <>
                    <path
                      d={`${curvePath} L ${mapX(exposureMonths * 30)},${graphHeight - padding} L ${mapX(0)},${graphHeight - padding} Z`}
                      fill="url(#purpleGrad)"
                      opacity="0.3"
                    />
                    <path
                      d={curvePath}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Gradients */}
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>

                {/* Axis Labels */}
                <text x={graphWidth / 2} y={graphHeight - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  Días de Consumo Continuo (0 a {exposureMonths * 30} d)
                </text>
                <text x="10" y={graphHeight / 2} fill="#94a3b8" fontSize="9" transform={`rotate(-90 10,${graphHeight / 2})`} textAnchor="middle">
                  C(t) [mg/kg]
                </text>
              </svg>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'bcf' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold block mb-1">
              1. BCF Fitoplancton
            </span>
            <div className="text-xl font-bold font-mono text-white mb-1">
              × {contaminant.bcfPhytoplankton}
            </div>
            <p className="text-xs text-slate-400">
              Factor de bioacumulación primaria desde el agua marina disuelta hacia microorganismos fotosintéticos.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-blue-400 uppercase font-bold block mb-1">
              2. BCF Pez Herbívoro
            </span>
            <div className="text-xl font-bold font-mono text-white mb-1">
              × {contaminant.bcfSmallFish}
            </div>
            <p className="text-xs text-slate-400">
              Absorción branquial pasiva y filtración de zooplancton contaminado en peces pequeños.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-rose-400 uppercase font-bold block mb-1">
              3. BMF Depredador Superior
            </span>
            <div className="text-xl font-bold font-mono text-white mb-1">
              × {contaminant.bmfPredator} por nivel trófico
            </div>
            <p className="text-xs text-slate-400">
              Multiplicación por biomagnificación en la cúspide trófica (Atún / Corvina / Tiburón).
            </p>
          </div>
        </div>
      )}

      {activeTab === 'doseresponse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 block">
              Principio de Paracelso: "Sola dosis facit venenum"
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              La curva sigmoidea de Hill modela la probabilidad o severidad del daño celular en función de la concentración libre en receptores tisulares.
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-slate-200">
              Respuesta(%) = 100 / (1 + (ED50 / Dosis)^2.5)
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-xs font-mono text-slate-400 block mb-2">
              Índice de Daño Celular Estimado
            </span>
            <div className="text-3xl font-black font-mono text-rose-400 mb-1">
              {(doseResponseVal ?? 0).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(2, doseResponseVal))}%` }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
