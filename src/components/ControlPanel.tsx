import React from 'react';
import { 
  Factory, 
  Filter, 
  Utensils, 
  User, 
  Calendar, 
  BookOpen,
} from 'lucide-react';
import { ContaminantProfile } from '../types';

interface ControlPanelProps {
  contaminant: ContaminantProfile;
  dischargeRateKgDay: number;
  onDischargeRateChange: (val: number) => void;
  filtrationEfficiency: number;
  onFiltrationEfficiencyChange: (val: number) => void;
  fishPortionsPerWeek: number;
  onFishPortionsChange: (val: number) => void;
  humanWeightKg: number;
  onHumanWeightChange: (val: number) => void;
  exposureMonths: number;
  onExposureMonthsChange: (val: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  contaminant,
  dischargeRateKgDay,
  onDischargeRateChange,
  filtrationEfficiency,
  onFiltrationEfficiencyChange,
  fishPortionsPerWeek,
  onFishPortionsChange,
  humanWeightKg,
  onHumanWeightChange,
  exposureMonths,
  onExposureMonthsChange
}) => {
  return (
    <div className="bg-white border border-black/10 p-6 shadow-sm">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-0.5">
            [Parámetros de Control]
          </div>
          <h3 className="text-base font-bold text-[#111113] font-sans">
            Controles de Efluente & Dieta Poblacional
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#111113]/60 bg-[#F8F7F4] px-2.5 py-1 border border-black/10">
          Variables Dinámicas
        </span>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Factory Discharge Rate */}
        <div className="space-y-2 p-4 bg-[#F8F7F4] border border-black/8">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111113] font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Factory className="w-3.5 h-3.5 text-[#E11D48]" />
              Descarga Industrial
            </span>
            <span className="font-mono font-bold text-[#111113]">
              {dischargeRateKgDay} kg/día
            </span>
          </div>
          <input
            id="input-discharge-rate"
            type="range"
            min="1"
            max="80"
            value={dischargeRateKgDay}
            onChange={(e) => onDischargeRateChange(Number(e.target.value))}
            className="w-full accent-[#E11D48] cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
          />
          <span className="text-[10px] text-[#111113]/60 block font-mono">
            Masa bruta emitida sin tratar
          </span>
        </div>

        {/* 2. Factory Effluent Filtration */}
        <div className="space-y-2 p-4 bg-[#F8F7F4] border border-black/8">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111113] font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Filter className="w-3.5 h-3.5 text-[#111113]" />
              Filtro de Planta
            </span>
            <span className="font-mono font-bold text-[#111113]">
              {filtrationEfficiency}%
            </span>
          </div>
          <input
            id="input-filtration-efficiency"
            type="range"
            min="0"
            max="95"
            value={filtrationEfficiency}
            onChange={(e) => onFiltrationEfficiencyChange(Number(e.target.value))}
            className="w-full accent-[#111113] cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
          />
          <span className="text-[10px] text-[#111113]/60 block font-mono">
            Retención de metales en planta
          </span>
        </div>

        {/* 3. Fish Portions Consumed */}
        <div className="space-y-2 p-4 bg-[#F8F7F4] border border-black/8">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111113] font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Utensils className="w-3.5 h-3.5 text-[#111113]" />
              Consumo de Pescado
            </span>
            <span className="font-mono font-bold text-[#111113]">
              {fishPortionsPerWeek} porc/sem
            </span>
          </div>
          <input
            id="input-fish-portions"
            type="range"
            min="1"
            max="14"
            value={fishPortionsPerWeek}
            onChange={(e) => onFishPortionsChange(Number(e.target.value))}
            className="w-full accent-[#111113] cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
          />
          <span className="text-[10px] text-[#111113]/60 block font-mono">
            Frecuencia dietética semanal
          </span>
        </div>

        {/* 4. Human Body Weight */}
        <div className="space-y-2 p-4 bg-[#F8F7F4] border border-black/8">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111113] font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <User className="w-3.5 h-3.5 text-[#111113]" />
              Peso Corporal
            </span>
            <span className="font-mono font-bold text-[#111113]">
              {humanWeightKg} kg
            </span>
          </div>
          <input
            id="input-human-weight"
            type="range"
            min="40"
            max="120"
            value={humanWeightKg}
            onChange={(e) => onHumanWeightChange(Number(e.target.value))}
            className="w-full accent-[#111113] cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
          />
          <span className="text-[10px] text-[#111113]/60 block font-mono">
            Afecta volumen de distribución (Vd)
          </span>
        </div>

        {/* 5. Exposure Duration */}
        <div className="space-y-2 p-4 bg-[#F8F7F4] border border-black/8">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111113] font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Calendar className="w-3.5 h-3.5 text-[#111113]" />
              Duración de Exposición
            </span>
            <span className="font-mono font-bold text-[#111113]">
              {exposureMonths} meses
            </span>
          </div>
          <input
            id="input-exposure-months"
            type="range"
            min="1"
            max="24"
            value={exposureMonths}
            onChange={(e) => onExposureMonthsChange(Number(e.target.value))}
            className="w-full accent-[#111113] cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
          />
          <span className="text-[10px] text-[#111113]/60 block font-mono">
            Horizonte temporal acumulativo
          </span>
        </div>

        {/* 6. Historical Case Benchmark Mini-Card */}
        <div className="p-4 bg-white border border-black/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[#E11D48] text-xs font-bold mb-1 font-mono uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Caso: {contaminant.historicalCase.title}</span>
            </div>
            <p className="text-[11px] text-[#111113]/70 line-clamp-2 leading-relaxed">
              {contaminant.historicalCase.summary}
            </p>
          </div>
          <span className="text-[10px] text-[#111113]/50 font-mono mt-2">
            📍 {contaminant.historicalCase.location} ({contaminant.historicalCase.year})
          </span>
        </div>

      </div>

    </div>
  );
};
