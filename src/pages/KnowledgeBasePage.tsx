import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Info,
  Activity
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface HistoricalCase {
  id: string;
  title: string;
  location: string;
  country: string;
  year: string;
  contaminant: string;
  summary: string;
  sourceType: string;
  pathway: string;
  impactScale: string;
  remediation: string;
  lessonsLearned: string[];
  tag: 'chile' | 'world';
}

const HISTORICAL_CASES: HistoricalCase[] = [
  {
    id: 'quintero',
    title: 'Complejo Industrial Ventanas - Bahía de Quintero',
    location: 'Puchuncaví / Quintero, Región de Valparaíso',
    country: 'Chile',
    year: '1964 - Presente',
    contaminant: 'Cobre (Cu), Arsénico (As), Dióxido de Azufre (SO₂), Plomo (Pb)',
    summary: 'Zona de sacrificio ambiental con fundición de concentrados de cobre, termoeléctricas a carbón y terminales químicos con descarga histórica de escorias y polvos metalúrgicos en el lecho marino y la atmósfera.',
    sourceType: 'Fundición pirometalúrgica de concentrados de cobre y plantas termoeléctricas',
    pathway: 'Emisión atmosférica de partículas MP2.5 ricas en As/Pb + vertido costero de RILes y riles térmicos',
    impactScale: 'Bioacumulación en bivalvos (choritos, machas) y recurrentes episodios de intoxicación en escuelas rurales',
    remediation: 'Cierre definitivo de la Fundición Ventanas (CODELCO, mayo 2023) e implementación de Planes de Descontaminación Atmosférica (PDA).',
    lessonsLearned: [
      'Los efectos sinérgicos de múltiples contaminantes superan los límites de normas individuales.',
      'La biomonitorización continua de bivalvos bentónicos es indispensable en zonas costeras industriales.',
      'La transición justa hacia fundiciones ecológicas de estándar mundial es impostergable.'
    ],
    tag: 'chile'
  },
  {
    id: 'chanaral',
    title: 'Relaves Mineros en Bahía de Chañaral',
    location: 'Chañaral, Región de Atacama',
    country: 'Chile',
    year: '1938 - 1990',
    contaminant: 'Cobre (Cu), Cadmio (Cd), Molibdeno (Mo), Hierro (Fe)',
    summary: 'Descarga directa de más de 300 millones de toneladas de relaves mineros de la mina El Salvador a través del Río Salado directamente a la bahía de Chañaral, rellenando la playa y destruyendo el ecosistema marino costero.',
    sourceType: 'Relaves de beneficio de flotación de minerales sulfurados de cobre',
    pathway: 'Transporte fluvial por el cauce del Río Salado y sedimentación masiva en plataforma litoral',
    impactScale: 'Colmatación total de la bahía marina, mortandad de praderas de macroalgas y esterilización de fauna bentónica',
    remediation: 'Sentencia judicial histórica de la Corte Suprema (1988) que ordenó el cese de descargas al mar y construcción del tranque Pampa Austral.',
    lessonsLearned: [
      'Las descargas directas de relaves en cursos de agua producen pasivos ambientales de escala centenaria.',
      'Los metales depositados en sedimentos se lixivian progresivamente por acción del agua de mar.'
    ],
    tag: 'chile'
  },
  {
    id: 'minamata',
    title: 'Enfermedad de Minamata - Bahía de Shiranui',
    location: 'Minamata, Prefectura de Kumamoto',
    country: 'Japón',
    year: '1932 - 1968',
    contaminant: 'Metilmercurio (CH₃Hg⁺)',
    summary: 'La corporación química Chisso Corporation vertió metilmercurio residual del catalizador de sulfato de mercurio en la síntesis de acetaldehído a la bahía costera, bioacumulándose en peces y mariscos que consumía la población pesquera.',
    sourceType: 'Industria petroquímica de síntesis de acetaldehído y cloruro de vinilo',
    pathway: 'Metilación bacteriana en sedimentos anóxicos ⟶ fitoplancton ⟶ peces depredadores ⟶ humanos',
    impactScale: 'Más de 2.200 víctimas con síndrome neurológico severo congénito, ataxia, ceguera y parálisis',
    remediation: 'Dragado y confinamiento de 1.5 millones de m³ de lodos mercuriales y creación del Convenio de Minamata sobre el Mercurio (ONU 2013).',
    lessonsLearned: [
      'El metilmercurio atraviesa la barrera hematoencefálica y la placenta con extrema facilidad.',
      'El factor de biomagnificación (BMF) puede superar 100.000x entre el agua y el pez depredador.'
    ],
    tag: 'world'
  },
  {
    id: 'itai_itai',
    title: 'Enfermedad de Itai-Itai (Río Jinzu)',
    location: 'Prefectura de Toyama',
    country: 'Japón',
    year: '1912 - 1960',
    contaminant: 'Cadmio (Cd²⁺)',
    summary: 'La empresa minera Mitsui Mining & Smelting Co. vertió relaves de zinc y plomo en la cuenca del Río Jinzu, cuya agua se utilizaba para regar arrozales. La población ingirió arroz contaminado con cadmio durante décadas.',
    sourceType: 'Minería polimetálica y beneficio de concentrados de zinc y plomo (esfalerita)',
    pathway: 'Agua fluvial de regadío ⟶ Suelos agrícolas de arrozal ⟶ Bioacumulación en granos de arroz ⟶ Consumo',
    impactScale: 'Osteomalacia severa dolorosa ("¡ay, ay!"), fracturas óseas espontáneas por hipocalcemia y fallo renal tubular',
    remediation: 'Sustitución y reposición de 1.500 hectáreas de suelo contaminado con suelo virgen y plantas de tratamiento de efluentes mineros.',
    lessonsLearned: [
      'El cadmio tiene una vida media biológica de hasta 30 años en el parénquima renal.',
      'Sustituye al Ca²⁺ en la hidroxiapatita de los huesos provocando desmineralización ósea severa.'
    ],
    tag: 'world'
  },
  {
    id: 'flint',
    title: 'Crisis del Agua Potable en Flint',
    location: 'Flint, Michigan',
    country: 'Estados Unidos',
    year: '2014 - 2019',
    contaminant: 'Plomo (Pb²⁺)',
    summary: 'Cambio de la fuente de suministro de agua potable al Río Flint sin adición de inhibidores de corrosión (ortofosfatos), provocando la disolución de la capa protectora interna de las tuberías antiguas de plomo.',
    sourceType: 'Corrosión galvánica de infraestructura de redes de distribución de agua potable',
    pathway: 'Agua ácida y clorada ⟶ Despasivación de tuberías domiciliarias de plomo ⟶ Grifo de consumo humano',
    impactScale: 'Elevación de niveles de plomo en sangre (BLL) en miles de niños, déficit cognitivo y brotes de legionelosis',
    remediation: 'Reemplazo de más de 10.000 conexiones de servicio de plomo por cobre y adición rigurosa de ortofosfato.',
    lessonsLearned: [
      'El tratamiento de control de corrosión en redes públicas de agua potable es una barrera sanitaria crítica.',
      'No existe nivel seguro de plomo en sangre en niños pequeños en desarrollo neurológico.'
    ],
    tag: 'world'
  }
];

export const KnowledgeBasePage: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('quintero');
  const [filterTag, setFilterTag] = useState<'all' | 'chile' | 'world'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCases = HISTORICAL_CASES.filter(c => {
    const matchesTag = filterTag === 'all' || c.tag === filterTag;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contaminant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const selectedCase = HISTORICAL_CASES.find(c => c.id === selectedCaseId) || HISTORICAL_CASES[0];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
              Categoría 7: Base de Conocimiento & Casos Históricos
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Expedientes Internacionales & Nacionales
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Biblioteca de Desastres Ecotoxicológicos & Lecciones de Ingeniería
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Análisis documental y científico de los grandes hitos de contaminación por metales pesados en Chile y el mundo, sus rutas de biomagnificación y soluciones de remediación.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { soundFX.playPhaseStep(); setFilterTag('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTag === 'all' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({HISTORICAL_CASES.length})
          </button>
          <button
            onClick={() => { soundFX.playPhaseStep(); setFilterTag('chile'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTag === 'chile' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Chile 🇨🇱
          </button>
          <button
            onClick={() => { soundFX.playPhaseStep(); setFilterTag('world'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTag === 'world' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Mundo 🌐
          </button>
        </div>
      </div>

      {/* 2. Main Dual Panel: Case Explorer + Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Case Selector List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text"
              placeholder="Buscar por metal, lugar o título..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredCases.map(c => {
              const isSelected = selectedCaseId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    soundFX.playPhaseStep();
                    setSelectedCaseId(c.id);
                  }}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                      {c.year}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.tag === 'chile' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {c.country}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{c.title}</h4>
                  <div className="text-xs text-cyan-300 font-mono mt-1 line-clamp-1">
                    {c.contaminant}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Case Dossier */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Expediente Histórico Oficial
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedCase.year}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {selectedCase.title}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{selectedCase.location} ({selectedCase.country})</span>
              </p>
            </div>
          </div>

          {/* Quick Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Agentes Contaminantes</span>
              <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">{selectedCase.contaminant}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Fuente Emisora</span>
              <div className="text-xs font-bold text-white mt-0.5">{selectedCase.sourceType}</div>
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="font-bold text-white uppercase text-[11px] mb-1 flex items-center gap-1.5 text-cyan-400">
                <Info className="w-4 h-4" />
                <span>Resumen del Incidente</span>
              </h4>
              <p>{selectedCase.summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="font-bold text-white uppercase text-[11px] mb-1 flex items-center gap-1.5 text-purple-400">
                <Activity className="w-4 h-4" />
                <span>Ruta de Exposición & Biomagnificación</span>
              </h4>
              <p>{selectedCase.pathway}</p>
              <div className="mt-2 text-rose-300 font-semibold">
                Impacto sanitario: {selectedCase.impactScale}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200">
              <h4 className="font-bold uppercase text-[11px] mb-1 flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Medidas de Remediación & Cierre Ambiental</span>
              </h4>
              <p>{selectedCase.remediation}</p>
            </div>
          </div>

          {/* Lessons Learned */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs mb-2">
              Lecciones de Ingeniería & Salud Pública
            </h4>
            <div className="space-y-1.5">
              {selectedCase.lessonsLearned.map((lesson, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{lesson}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
