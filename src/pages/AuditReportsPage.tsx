import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Activity, 
  Building2, 
  FileCheck,
  Sparkles,
  BookOpen,
  Code2,
  FolderArchive,
  FileCode
} from 'lucide-react';
import { ContaminantProfile } from '../types';
import { soundFX } from '../utils/audio';
import { 
  downloadTechnicalDocumentation, 
  downloadTechnicalDocumentationHtml,
  downloadSimulationDataJson, 
  triggerFileDownload 
} from '../utils/downloadHelpers';
// Import dinámico: el módulo lleva el código fuente incrustado.
import { evaluateWaterCompliance, evaluateFishCompliance } from '../utils/mathModels';

interface AuditReportsPageProps {
  contaminant: ContaminantProfile;
  waterConcentrationPpm: number;
  smallFishPpm: number;
  largeFishPpm: number;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  dischargeRateKgDay: number;
  filtrationEfficiency: number;
  humanWeightKg: number;
  exposureMonths: number;
}

export const AuditReportsPage: React.FC<AuditReportsPageProps> = ({
  contaminant,
  waterConcentrationPpm,
  smallFishPpm,
  largeFishPpm,
  humanAccumulatedDoseMg,
  humanTissueConcentrationPpm,
  fishConsumedCount,
  dischargeRateKgDay,
  filtrationEfficiency,
  humanWeightKg,
  exposureMonths
}) => {
  const [auditorName, setAuditorName] = useState('Dr. Roberto Silva - Auditor Ambiental Certificado');
  const [institutionName, setInstitutionName] = useState('Superintendencia del Medio Ambiente & Seremi de Salud');
  const [notes, setNotes] = useState('Se constata proceso de bioacumulación trófica activa en la cuenca receptora. Se recomiendan medidas urgentes de abatimiento en la fuente emisora.');

  const isCritical = humanTissueConcentrationPpm >= contaminant.criticalDosePpm;
  const isWarning = humanTissueConcentrationPpm >= contaminant.criticalDosePpm * 0.5;

  const actualBMF = waterConcentrationPpm > 0 
    ? Math.round(largeFishPpm / waterConcentrationPpm) 
    : contaminant.bmfPredator;

  // Límites normativos: ahora viven en el perfil del contaminante junto con su
  // referencia. El ternario anterior aplicaba 0,05 ppm a cadmio y arsénico, lo
  // que daba un dictamen "conforme" falso para el cadmio (límite real 0,01).
  const simulatedCaseId = React.useMemo(
    () => `SIM-${new Date().getFullYear()}-${contaminant.id.slice(0, 3).toUpperCase()}-${String(Math.abs(Math.round(dischargeRateKgDay * 100 + filtrationEfficiency))).padStart(4, '0')}`,
    [contaminant.id, dischargeRateKgDay, filtrationEfficiency],
  );

  const waterCompliance = evaluateWaterCompliance(contaminant, waterConcentrationPpm);
  const fishCompliance = evaluateFishCompliance(contaminant, largeFishPpm);
  const normLimit = waterCompliance.limitPpm;
  const compliesDS90 = waterCompliance.status === 'cumple';

  const handlePrint = () => {
    soundFX.playCorrect();
    window.print();
  };

  const handleDownloadReportMd = () => {
    soundFX.playCorrect();
    const content = `# INFORME DE SIMULACIÓN ECOTOXICOLÓGICA (EJERCICIO ACADÉMICO)
> ⚠️ DOCUMENTO NO OFICIAL. Generado por el simulador educativo BioTrófica a
> partir de parámetros introducidos por el usuario. No constituye un dictamen
> pericial ni una medición de laboratorio, y no debe presentarse como tal ante
> ninguna autoridad.

Expediente simulado: ${simulatedCaseId} · Referencia normativa: ${waterCompliance.reference}
Fecha: ${new Date().toLocaleDateString('es-CL')}
Auditor: ${auditorName}
Institución: ${institutionName}

## 1. Parámetros del Vertido y Ecosistema
- Contaminante evaluado: ${contaminant.name} (${contaminant.chemicalFormula})
- Caudal de descarga bruto: ${dischargeRateKgDay} kg/día
- Eficiencia del filtro: ${filtrationEfficiency}%
- Concentración en Agua: ${waterConcentrationPpm.toFixed(4)} ppm (Límite DS90: ${normLimit} ppm) -> ${compliesDS90 ? 'CUMPLE' : 'SUPERA NORMA'}
- Concentración en Pez Pequeño: ${smallFishPpm.toFixed(3)} ppm
- Concentración en Trucha Depredadora: ${largeFishPpm.toFixed(3)} ppm
- Factor de Biomagnificación Real: ${actualBMF}x

## 2. Exposición y Carga Tisular Humana
- Peso Corporal: ${humanWeightKg} kg
- Porciones de Pescado Consumidas: ${fishConsumedCount}
- Dosis Acumulada: ${humanAccumulatedDoseMg.toFixed(2)} mg
- Concentración Tisular Humana: ${humanTissueConcentrationPpm.toFixed(4)} ppm
- Límite Crítico: ${contaminant.criticalDosePpm} ppm (${isCritical ? 'ESTADO CRÍTICO' : isWarning ? 'RIESGO MODERADO' : 'SEGURO'})

## 3. Dictamen y Conclusiones del Perito
${notes}

## 4. Medidas Correctivas Inmediatas
- Agente quelante clínico recomendado: ${contaminant.chelatingAgent.name} (${contaminant.chelatingAgent.mechanism})
- Solución ambiental en cuenca: ${contaminant.environmentalSolution}
`;
    triggerFileDownload(`Informe_Auditoria_${contaminant.id}_${Date.now()}.md`, content);
  };

  const handleDownloadDatasetJson = () => {
    soundFX.playCorrect();
    downloadSimulationDataJson({
      timestamp: new Date().toISOString(),
      contaminant: contaminant.id,
      contaminantName: contaminant.name,
      waterConcentrationPpm,
      smallFishPpm,
      largeFishPpm,
      humanAccumulatedDoseMg,
      humanTissueConcentrationPpm,
      fishConsumedCount,
      dischargeRateKgDay,
      filtrationEfficiency,
      humanWeightKg,
      exposureMonths,
      actualBMF,
      compliesDS90,
      ds90LimitPpm: waterCompliance.limitPpm,
      ds90Reference: waterCompliance.reference,
      disclaimer: 'Datos generados por el simulador educativo BioTrófica. No constituyen mediciones reales.',
      auditor: auditorName,
      institution: institutionName,
      notes
    });
  };

  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadSourceZip = async () => {
    soundFX.playCorrect();
    setIsDownloadingZip(true);
    try {
      await import('../utils/exportProjectZip').then(m => m.downloadProjectSourceZip());
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadSourceTxt = () => {
    soundFX.playCorrect();
    void import('../utils/exportProjectZip').then(m => m.downloadConsolidatedCodeTxt());
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Category Header with Download Hub */}
      <div className="bg-white border border-black/10 p-6 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-black/10 pb-6 mb-6">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#111113]/60 font-bold mb-1">
              [Auditoría & Descargas]
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111113] tracking-tight font-sans">
              Centro de Exportación & Dictamen Legal
            </h2>
            <p className="text-xs sm:text-sm text-[#111113]/70 mt-1 max-w-2xl">
              Descarga directa de todo el código fuente en ZIP, documentación técnica en HTML/MD, informes periciales y datasets en JSON.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-download-code-zip"
              onClick={handleDownloadSourceZip}
              disabled={isDownloadingZip}
              className="px-4 py-2.5 bg-[#111113] hover:bg-neutral-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 font-mono disabled:opacity-50 cursor-pointer"
              title="Descargar todos los archivos de código fuente del proyecto comprimidos en ZIP"
            >
              <FolderArchive className="w-4 h-4 text-[#E11D48]" />
              <span>{isDownloadingZip ? 'Comprimiendo...' : 'Código Fuente (.ZIP)'}</span>
            </button>

            <button
              id="btn-download-doc-html"
              onClick={() => {
                soundFX.playCorrect();
                downloadTechnicalDocumentationHtml();
              }}
              className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 font-mono cursor-pointer"
              title="Descargar documento HTML listo para abrir en Chrome/Edge/Safari sin símbolos ni garabatos"
            >
              <Sparkles className="w-4 h-4" />
              <span>Doc Visual (.HTML)</span>
            </button>

            <button
              id="btn-download-doc-md"
              onClick={() => {
                soundFX.playCorrect();
                downloadTechnicalDocumentation();
              }}
              className="px-4 py-2.5 bg-white border border-black/20 hover:border-black text-[#111113] font-bold text-xs transition-all shadow-sm flex items-center gap-2 font-mono cursor-pointer"
              title="Descargar archivo Markdown con la documentación completa"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Doc (.MD)</span>
            </button>

            <button
              id="btn-download-report-md"
              onClick={handleDownloadReportMd}
              className="px-4 py-2.5 bg-white border border-black/20 hover:border-black text-[#111113] font-bold text-xs transition-all shadow-sm flex items-center gap-2 font-mono cursor-pointer"
              title="Descargar informe pericial actual en Markdown"
            >
              <Download className="w-4 h-4" />
              <span>Informe (.MD)</span>
            </button>

            <button
              id="btn-download-json"
              onClick={handleDownloadDatasetJson}
              className="px-4 py-2.5 bg-white border border-black/20 hover:border-black text-[#111113] font-bold text-xs transition-all shadow-sm flex items-center gap-2 font-mono cursor-pointer"
              title="Descargar variables numéricas en formato JSON"
            >
              <Code2 className="w-4 h-4 text-neutral-500" />
              <span>Dataset (.JSON)</span>
            </button>

            <button
              id="btn-print-pdf"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white border border-black/20 hover:border-black text-[#111113] font-bold text-xs transition-all shadow-sm flex items-center gap-2 font-mono cursor-pointer"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Source Code Download Box */}
        <div className="p-4 bg-[#F8F7F4] border border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-start md:items-center gap-3 text-[#111113]">
            <div className="p-2 bg-white border border-black/10 text-[#E11D48] shrink-0">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111113] font-sans">
                ¿Necesitas los archivos de código fuente para tu computadora?
              </div>
              <div className="text-neutral-600 text-xs mt-0.5">
                Incluye componentes React, motor Canvas 2D, modelos matemáticos, constantes y estilos listos para <code className="bg-white px-1 border border-black/10">npm install &amp;&amp; npm run dev</code>.
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleDownloadSourceZip}
              disabled={isDownloadingZip}
              className="flex-1 md:flex-initial px-4 py-2 bg-[#111113] hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>{isDownloadingZip ? 'Empaquetando...' : 'Descargar Código (.ZIP)'}</span>
            </button>
            <button
              onClick={handleDownloadSourceTxt}
              className="flex-1 md:flex-initial px-4 py-2 bg-white border border-black/20 hover:border-black text-[#111113] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Descargar todos los códigos en un solo archivo de texto plano"
            >
              <FileCode className="w-3.5 h-3.5 text-neutral-600" />
              <span>Código en 1 Archivo (.TXT)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Audit Document Sheet (Print Optimized) */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Document Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 print:border-black pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 print:border-black print:text-black">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 print:text-black uppercase">
                República de Chile · Ministerio del Medio Ambiente
              </div>
              <h3 className="text-lg font-black text-white print:text-black">
                DICTAMEN PERICIAL DE ECOTOXICOLOGÍA & BIOACUMULACIÓN
              </h3>
              <div className="text-xs text-slate-400 print:text-gray-600 font-mono">
                Expediente simulado N° {simulatedCaseId} · {waterCompliance.reference}
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-black">
            <div>Fecha de Emisión: <strong>{new Date().toLocaleDateString('es-CL')}</strong></div>
            <div>Estado: <strong className={compliesDS90 ? 'text-emerald-400' : 'text-rose-400'}>{compliesDS90 ? 'CUMPLE NORMATIVA' : 'INFRACCIÓN AMBIENTAL'}</strong></div>
          </div>
        </div>

        {/* Auditor & Facility Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 print:bg-gray-100 border border-slate-800 print:border-gray-300 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Auditor Responsable:</span>
            <input 
              type="text" 
              value={auditorName} 
              onChange={e => setAuditorName(e.target.value)}
              className="w-full bg-transparent border-b border-slate-700 font-semibold text-white print:text-black focus:outline-none focus:border-cyan-400 mt-0.5"
            />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Organismo Fiscalizador:</span>
            <input 
              type="text" 
              value={institutionName} 
              onChange={e => setInstitutionName(e.target.value)}
              className="w-full bg-transparent border-b border-slate-700 font-semibold text-white print:text-black focus:outline-none focus:border-cyan-400 mt-0.5"
            />
          </div>
        </div>

        {/* Environmental Audit Matrix */}
        <div>
          <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 print:text-black" />
            <span>1. Matriz de Monitoreo de Eslabones Tróficos</span>
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-mono font-bold uppercase">
                <tr>
                  <th className="p-3">Compartimento / Eslabón</th>
                  <th className="p-3">Concentración Medida</th>
                  <th className="p-3">Factor BCF / BMF</th>
                  <th className="p-3">Límite Normativo</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300 font-medium">
                <tr>
                  <td className="p-3">Agua Fluvial (Efluente)</td>
                  <td className="p-3 font-mono font-bold">{(waterConcentrationPpm ?? 0).toFixed(4)} ppm</td>
                  <td className="p-3 text-slate-400">1x (Línea Base)</td>
                  <td className="p-3 font-mono">{normLimit} ppm (DS90)</td>
                  <td className="p-3 font-bold">
                    <span className={(waterConcentrationPpm ?? 0) <= normLimit ? 'text-emerald-400' : 'text-rose-400'}>
                      {(waterConcentrationPpm ?? 0) <= normLimit ? '✓ Conforme' : '✗ Excede'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Alevines / Peces Forrajeros</td>
                  <td className="p-3 font-mono font-bold">{(smallFishPpm ?? 0).toFixed(3)} ppm</td>
                  <td className="p-3 font-mono text-cyan-300">{contaminant.bcfSmallFish}x BCF</td>
                  <td className="p-3 font-mono">{fishCompliance.limitPpm} ppm</td>
                  <td className="p-3 font-bold">
                    <span className={(smallFishPpm ?? 0) <= fishCompliance.limitPpm ? 'text-emerald-400' : 'text-amber-400'}>
                      {(smallFishPpm ?? 0) <= fishCompliance.limitPpm ? 'Bajo Riesgo' : 'Bioacumulación'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Trucha Fario (Predador)</td>
                  <td className="p-3 font-mono font-bold text-amber-300">{(largeFishPpm ?? 0).toFixed(3)} ppm</td>
                  <td className="p-3 font-mono text-amber-300">{actualBMF}x BMF</td>
                  <td className="p-3 font-mono">{fishCompliance.limitPpm} ppm</td>
                  <td className="p-3 font-bold">
                    <span className={fishCompliance.status === 'cumple' ? 'text-emerald-400' : 'text-rose-400'}>
                      {fishCompliance.status === 'cumple' ? 'Apto Consumo' : 'Tóxico para Pesca'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Ser Humano (Consumidor Cúspide)</td>
                  <td className="p-3 font-mono font-bold text-purple-300">{(humanTissueConcentrationPpm ?? 0).toFixed(3)} ppm</td>
                  <td className="p-3 text-slate-400">{(humanAccumulatedDoseMg ?? 0).toFixed(2)} mg acumulados</td>
                  <td className="p-3 font-mono">{contaminant.criticalDosePpm} ppm (Dosis Crítica)</td>
                  <td className="p-3 font-bold">
                    <span className={!isCritical ? 'text-emerald-400' : 'text-rose-400'}>
                      {!isCritical ? 'Sub-crítico' : 'Intoxicación Clínica'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Toxicology Assessment */}
        <div>
          <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400 print:text-black" />
            <span>2. Evaluación de Riesgo en Salud Pública & Órganos Diana</span>
          </h4>
          <p className="text-xs text-slate-300 print:text-black leading-relaxed">
            El contaminante evaluado (<strong className="text-white print:text-black">{contaminant.name}</strong>) presenta una vida media biológica de eliminación en el organismo de <strong className="font-mono text-cyan-300 print:text-black">{contaminant.halfLifeHumansDays} días</strong>. Con un consumo de {fishConsumedCount} porciones de pescado en un periodo de {exposureMonths} meses en un individuo de {humanWeightKg} kg, la carga tisular representa el <strong>{Math.min(100, Math.round((humanTissueConcentrationPpm / contaminant.criticalDosePpm) * 100))}%</strong> del umbral toxicológico crítico.
          </p>
        </div>

        {/* Peritaje & Observaciones */}
        <div>
          <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-1.5">
            3. Dictamen Pericial & Recomendaciones de Ingeniería
          </h4>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 print:bg-white border border-slate-800 print:border-gray-400 text-xs text-slate-200 print:text-black focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Signatures Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-center text-xs font-mono">
          <div>
            <div className="h-10 flex items-end justify-center">
              <span className="text-cyan-400 print:text-black font-serif italic text-sm">Dr. Roberto Silva S.</span>
            </div>
            <div className="border-t border-slate-700 print:border-black pt-1">
              Firma Auditor Ambiental Líder
            </div>
          </div>
          <div>
            <div className="h-10 flex items-end justify-center">
              <span className="text-emerald-400 print:text-black font-serif italic text-sm">Dra. Claudia Morales M.</span>
            </div>
            <div className="border-t border-slate-700 print:border-black pt-1">
              Jefe Toxicología Clínica & Ambiental
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
