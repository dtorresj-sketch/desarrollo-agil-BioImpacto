import { ContaminantId, ContaminantProfile } from '../types';

/**
 * Tipado estricto: `Record<ContaminantId, ...>` impide indexar el catálogo con
 * una cadena arbitraria y devolver `undefined` silenciosamente.
 */
export const CONTAMINANT_PROFILES: Record<ContaminantId, ContaminantProfile> = {
  mercury: {
    id: 'mercury',
    name: 'Metilmercurio (Orgánico)',
    chemicalSymbol: 'Hg',
    chemicalFormula: 'CH₃Hg⁺',
    color: '#38bdf8', // Cyan-blue / metallic silver glow
    glowColor: 'rgba(56, 189, 248, 0.4)',
    particleColor: '#0284c7',
    category: 'Metal pesado neurotóxico bioacumulable',
    description: 'El mercurio inorgánico vertido al mar es metilado por bacterias anaerobias a metilmercurio, una forma altamente liposoluble que atraviesa membranas biológicas con facilidad pasmosa.',
    sourceIndustry: 'Plantas petroquímicas, minería de oro artesanal, síntesis de acetaldehído y cloroálcali.',
    waterSolubility: 'Liposoluble tras biometilación bacteriana',
    
    // Constants
    bcfPhytoplankton: 1500,
    bcfSmallFish: 8000,
    bmfPredator: 5.5, // 5.5x multiplication per trophic step
    halfLifeHumansDays: 70,
    halfLifeFishDays: 250,
    referenceDoseRDA: 0.0001, // mg/kg/day (OMS / EPA)
    criticalDosePpm: 0.05,    // mg/kg en sangre / cerebro crítico
    volumeDistributionL: 1.7, // L/kg
    ptwiMgPerKgWeek: 0.0016, // JECFA: 1,6 µg/kg pc/semana (metilmercurio)

    regulatoryLimits: {
      ds90WaterPpm: 0.001,
      ds90Reference: 'DS 90/2000 MINSEGPRES, Tabla 1 — descarga a cuerpos fluviales (verificar edición vigente)',
      foodFishPpm: 0.5,
      foodReference: 'Codex/Reglamento Sanitario de los Alimentos — mercurio total en pescado (1,0 mg/kg en especies depredadoras)',
    },
    dataSources: [
      'ATSDR Toxicological Profile for Mercury (semivida corporal ≈ 70 d)',
      'US EPA IRIS — RfD metilmercurio 1×10⁻⁴ mg/kg/día',
      'JECFA — PTWI metilmercurio 1,6 µg/kg pc/semana',
    ],
    
    historicalCase: {
      title: 'Enfermedad de Minamata',
      location: 'Bahía de Minamata, Prefectura de Kumamoto, Japón',
      year: '1956 - 1968',
      summary: 'La corporación Chisso vertió metilmercurio en la bahía. El químico se bioacumuló en mariscos y peces consumidos por los pescadores locales, causando parálisis, pérdida de visión, ataxia severa y daño congénito.'
    },
    
    acuteSymptoms: [
      'Gusto metálico en la boca y náuseas intensas',
      'Dolor abdominal y quemazón gastrointestinal',
      'Debilidad muscular súbita y temblores periféricos'
    ],
    chronicSymptoms: [
      'Ataxia cerebelosa (pérdida de coordinación y marcha inestable)',
      'Constricción concéntrica del campo visual ("visión en túnel")',
      'Parestesias peribucales y entumecimiento en dedos de pies y manos',
      'Disartria (dificultad progresiva en la articulación del lenguaje)',
      'Deterioro cognitivo severo y microcefalia en fetos expuestos'
    ],
    targetOrgans: [
      {
        organId: 'brain',
        organName: 'Cerebro y Sistema Nervioso Central',
        severity: 'critical',
        impactDescription: 'Atraviesa la barrera hematoencefálica y la placenta. Provoca lisis neuronal en la corteza visual y células de Purkinje del cerebelo.',
        cellularMechanism: 'Se une a grupos tiol (-SH) de cisteínas proteicas e inhibe la síntesis de tubulina, fosforilación oxidativa y produce estrés oxidativo neuronal masivo.',
        affinityFactor: 0.95
      },
      {
        organId: 'nervous_system',
        organName: 'Nervios Periféricos',
        severity: 'high',
        impactDescription: 'Neuropatía axonal con pérdida de mielina sensorial.',
        cellularMechanism: 'Bloqueo de canales de calcio presinápticos y reducción de neurotransmisores.',
        affinityFactor: 0.85
      },
      {
        organId: 'kidneys',
        organName: 'Riñones',
        severity: 'moderate',
        impactDescription: 'Nefropatía tubular secundaria y proteinuria leve a moderada.',
        cellularMechanism: 'Acumulación en células del túbulo proximal.',
        affinityFactor: 0.60
      },
      {
        organId: 'blood',
        organName: 'Sangre y Barrera Placentaria',
        severity: 'high',
        impactDescription: 'Se une al 90% a la hemoglobina en eritrocitos y se transfiere activamente al feto vía transportador LAT1 de aminoácidos.',
        cellularMechanism: 'Mimetismo molecular: el complejo CH3Hg-L-cisteína imita a la metionina.',
        affinityFactor: 0.80
      }
    ],
    chelatingAgent: {
      name: 'DMSA (Ácido Dimercaptosuccínico) / DMPS',
      mechanism: 'Forma quelatos hidrosolubles estables con el catión de mercurio que son excretados por vía renal.',
      effectiveness: 'Alta si se administra precozmente tras el pico de intoxicación aguda.'
    },
    environmentalSolution: 'Tratamiento de efluentes mediante biorreactores con bacterias sulforreductoras y resinas quelantes de intercambio iónico de tiol.'
  },
  
  lead: {
    id: 'lead',
    name: 'Plomo Inorgánico',
    chemicalSymbol: 'Pb',
    chemicalFormula: 'Pb²⁺',
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    particleColor: '#64748b',
    category: 'Metal pesado tóxico multiorgánico',
    description: 'El plomo es un catión bivalente no biodegradable que mimetiza al calcio celular (Ca²⁺), acumulándose durante décadas en el tejido óseo y afectando la biosíntesis del hemo.',
    sourceIndustry: 'Fundiciones metalúrgicas, fabricación y reciclaje de baterías, pigmentos y pinturas antiguas, escorrentía industrial.',
    waterSolubility: 'Moderada en medios acuáticos ligeramente ácidos',
    
    // Constants
    bcfPhytoplankton: 800,
    bcfSmallFish: 2500,
    bmfPredator: 3.2,
    halfLifeHumansDays: 7300, // ~20 años en hueso (en sangre ~30 días)
    halfLifeFishDays: 180,
    referenceDoseRDA: 0.0035, // mg/kg/day
    criticalDosePpm: 0.20,    // mg/L en sangre (20 µg/dL en niños)
    volumeDistributionL: 2.1,
    ptwiMgPerKgWeek: undefined, // JECFA retiró el PTWI del plomo (2010): no hay umbral seguro

    regulatoryLimits: {
      ds90WaterPpm: 0.05,
      ds90Reference: 'DS 90/2000 MINSEGPRES, Tabla 1 — descarga a cuerpos fluviales (verificar edición vigente)',
      foodFishPpm: 0.3,
      foodReference: 'Codex STAN 193 — plomo en músculo de pescado',
    },
    dataSources: [
      'ATSDR Toxicological Profile for Lead (semivida ósea ≈ 20-30 años; sangre ≈ 30 d)',
      'JECFA 2010 — retiro del PTWI por ausencia de umbral',
      'OMS — plomo en agua de bebida 0,01 mg/L (valor guía distinto al de descarga)',
    ],
    
    historicalCase: {
      title: 'Crisis del Agua de Flint & Saturnismo Histórico',
      location: 'Flint, Michigan, EE.UU. y cuencas mineras globales',
      year: '2014 - Presente',
      summary: 'El cambio de fuente hídrica sin aditivos anticorrosivos lixivió toneladas de plomo de tuberías viejas, provocando retraso cognitivo en miles de niños y emergencias de salud pública.'
    },
    
    acuteSymptoms: [
      'Cólico saturnino (dolor abdominal espasmódico intenso)',
      'Encefalopatía aguda con convulsiones y coma',
      'Vómitos persistentes y sabor metálico astringente'
    ],
    chronicSymptoms: [
      'Anemia microcítica hipocrómica con punteado basófilo',
      'Línea de Burton (ribete azulado-grisáceo en la encía marginal)',
      'Déficit de atención, caída de Coeficiente Intelectual en niños',
      'Pie y mano caídos (parálisis radial periférica motora)',
      'Hipertensión arterial refractaria y nefropatía intersticial crónica'
    ],
    targetOrgans: [
      {
        organId: 'bones',
        organName: 'Esqueleto y Médula Ósea',
        severity: 'critical',
        impactDescription: 'El 90% de la carga corporal de plomo se almacena en la matriz ósea en lugar del calcio, liberándose durante el embarazo, lactancia o envejecimiento.',
        cellularMechanism: 'Sustituye al Ca²⁺ en los cristales de hidroxiapatita.',
        affinityFactor: 0.98
      },
      {
        organId: 'blood',
        organName: 'Sistema Hematopoyético',
        severity: 'high',
        impactDescription: 'Inhibe la producción de hemoglobina provocando anemia.',
        cellularMechanism: 'Inhibe las enzimas ácido delta-aminolevulínico deshidratasa (ALAD) y ferroquelatasa.',
        affinityFactor: 0.90
      },
      {
        organId: 'brain',
        organName: 'Cerebro y Neurodesarrollo',
        severity: 'high',
        impactDescription: 'Altera la sinaptogénesis y la neurotransmisión colinérgica y dopaminérgica.',
        cellularMechanism: 'Compite con el calcio en la proteína quinasa C y canales de calcio voltaje-dependientes.',
        affinityFactor: 0.88
      },
      {
        organId: 'kidneys',
        organName: 'Riñones',
        severity: 'moderate',
        impactDescription: 'Glomeruloesclerosis y fibrosis intersticial progresiva.',
        cellularMechanism: 'Cuerpos de inclusión nucleares en túbulos renales.',
        affinityFactor: 0.70
      }
    ],
    chelatingAgent: {
      name: 'EDTA Cálcico Disódico (CaNa₂EDTA) y DMSA',
      mechanism: 'Intercambio catiónico selectivo de plomo por calcio con eliminación urinaria activa.',
      effectiveness: 'Muy eficaz para reducir la plombemia en sangre activa.'
    },
    environmentalSolution: 'Precipitación química con sulfuros/hidróxidos y membranas de ósmosis inversa de doble paso en vertederos.'
  },
  
  cadmium: {
    id: 'cadmium',
    name: 'Cadmio (Cd)',
    chemicalSymbol: 'Cd',
    chemicalFormula: 'Cd²⁺',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    particleColor: '#d97706',
    category: 'Metal carcinogénico y nefrotóxico persistente',
    description: 'El cadmio se fija a la metalotioneína en el organismo y se concentra en la corteza renal con una semivida biológica humana de hasta 30 años, induciendo osteomalacia masiva.',
    sourceIndustry: 'Galvanoplastia, fabricación de baterías de níquel-cadmio, fundición de zinc, fertilizantes fosfatados contaminados.',
    waterSolubility: 'Alta en presencia de cloruros marinos (CdCl⁺, CdCl₂)',
    
    // Constants
    bcfPhytoplankton: 1200,
    bcfSmallFish: 3100,
    bmfPredator: 2.8,
    halfLifeHumansDays: 9125, // ~25 años en riñón
    halfLifeFishDays: 200,
    referenceDoseRDA: 0.001,  // mg/kg/day
    criticalDosePpm: 0.015,
    volumeDistributionL: 1.5,
    ptwiMgPerKgWeek: 0.0058, // Derivado del PTMI JECFA de 25 µg/kg pc/mes

    regulatoryLimits: {
      ds90WaterPpm: 0.01,
      ds90Reference: 'DS 90/2000 MINSEGPRES, Tabla 1 — descarga a cuerpos fluviales (verificar edición vigente)',
      foodFishPpm: 0.05,
      foodReference: 'Codex STAN 193 — cadmio en músculo de pescado',
    },
    dataSources: [
      'ATSDR Toxicological Profile for Cadmium (semivida renal 10-30 años)',
      'JECFA — PTMI 25 µg/kg pc/mes',
      'US EPA IRIS — RfD cadmio (agua) 5×10⁻⁴ mg/kg/día',
    ],
    
    historicalCase: {
      title: 'Epidemia de Itai-Itai ("¡Ay, ay!")',
      location: 'Cuenca del río Jinzū, Prefectura de Toyama, Japón',
      year: '1912 - 1960s',
      summary: 'La minera Mitsui vertió lodos ricos en cadmio al río. El agua se usó para regar arrozales y los campesinos sufrieron osteoporosis severa y fracturas múltiples al menor esfuerzo físico.'
    },
    
    acuteSymptoms: [
      'Gastroenteritis severa hemorrágica si es por ingestión',
      'Neumonitis química y edema pulmonar en inhalación',
      'Vértigo, salivación excesiva y dolor muscular'
    ],
    chronicSymptoms: [
      'Síndrome de Fanconi renal (pérdida de glucosa, aminoácidos y fosfato por orina)',
      'Osteomalacia y osteoporosis con pseudo-fracturas de Looser',
      'Dolores esqueléticos generalizados incapacitantes ("Itai-Itai")',
      'Proteinuria tubular con excreción de beta-2-microglobulina',
      'Incremento en riesgo de carcinoma renal y prostático'
    ],
    targetOrgans: [
      {
        organId: 'kidneys',
        organName: 'Corteza Renal (Túbulo Proximal)',
        severity: 'critical',
        impactDescription: 'Destrucción progresiva del epitelio tubular renal con pérdida de capacidad de reabsorción de calcio y fosfatos.',
        cellularMechanism: 'El complejo Cd-metalotioneína se filtra en glomérulos y sobrecarga lisosomas tubulares liberando Cd²⁺ citotóxico libre.',
        affinityFactor: 0.99
      },
      {
        organId: 'bones',
        organName: 'Tejido Óseo y Metabolismo del Calcio',
        severity: 'critical',
        impactDescription: 'Desmineralización ósea severa secundaria a la hipercalciuria e inhibición de activación de vitamina D.',
        cellularMechanism: 'Inhibe la 1-alfa-hidroxilasa renal impidiendo formar calcitriol activo.',
        affinityFactor: 0.92
      },
      {
        organId: 'liver',
        organName: 'Hígado',
        severity: 'moderate',
        impactDescription: 'Inducción de metalotioneínas hepáticas y esteatosis metabólica.',
        cellularMechanism: 'Secuestro intracelular inicial con daño mitocondrial.',
        affinityFactor: 0.75
      }
    ],
    chelatingAgent: {
      name: 'Quelantes específicos (Precaución: EDTA puede agravar la toxicidad renal)',
      mechanism: 'Monitoreo de calcio/fósforo, suplementación intensiva de Calcitriol (vitamina D activa) y diálisis si hay fallo terminal.',
      effectiveness: 'Moderada; la prevención de exposición es la única medida resolutiva.'
    },
    environmentalSolution: 'Lavado de suelos contaminados con electrocinética y fitorremediación con plantas hiperacumuladoras (ej. *Thlaspi caerulescens*).'
  },
  
  arsenic: {
    id: 'arsenic',
    name: 'Arsénico Inorgánico',
    chemicalSymbol: 'As',
    chemicalFormula: 'AsO₄³⁻ / AsO₂⁻',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    particleColor: '#059669',
    category: 'Metaloide citotóxico e inhibidor enzimático',
    description: 'El arsenito (As³⁺) reacciona con sulfhidrilos proteicos, mientras que el arseniato (As⁵⁺) compite con el fosfato inorgánico en la síntesis de ATP mitocondrial.',
    sourceIndustry: 'Pesticidas agrícolas históricos, lixiviados de minería de cobre y oro, fundiciones de pirita, aguas subterráneas geotérmicas.',
    waterSolubility: 'Alta y muy móvil en acuíferos',
    
    // Constants
    bcfPhytoplankton: 600,
    bcfSmallFish: 1800,
    bmfPredator: 2.2,
    halfLifeHumansDays: 4, // Excreción urinaria rápida (arsenobetaína orgánica marina es menos tóxica, pero el inorgánico causa daño tisular)
    halfLifeFishDays: 30,
    referenceDoseRDA: 0.0003,
    criticalDosePpm: 0.02,
    volumeDistributionL: 0.4,
    ptwiMgPerKgWeek: undefined, // JECFA retiró el PTWI del arsénico inorgánico (2010)

    regulatoryLimits: {
      ds90WaterPpm: 0.5,
      ds90Reference: 'DS 90/2000 MINSEGPRES, Tabla 1 — descarga a cuerpos fluviales (verificar edición vigente)',
      foodFishPpm: 0.1,
      foodReference: 'Arsénico inorgánico en productos del mar — referencia orientativa, verificar norma aplicable',
    },
    dataSources: [
      'ATSDR Toxicological Profile for Arsenic (semivida urinaria ≈ 4 d)',
      'US EPA IRIS — RfD arsénico inorgánico 3×10⁻⁴ mg/kg/día',
      'OMS — arsénico en agua de bebida 0,01 mg/L',
    ],
    
    historicalCase: {
      title: 'Hidroarsenicismo Crónico Regional Endémico (HACRE)',
      location: 'Cuenca de Bangladesh, Bengala Occidental y Chaco-Pampeana (Argentina)',
      year: '1970 - Presente',
      summary: 'El consumo continuado de aguas subterráneas y mariscos de estuarios contaminados provocó lesiones cutáneas masivas, gangrena ("Blackfoot disease") y cáncer de vejiga y pulmón.'
    },
    
    acuteSymptoms: [
      'Gastroenteritis en "agua de arroz" con colapso vascular',
      'Olor característico a ajo en el aliento y sudor',
      'Arritmias ventriculares (prolongación de intervalo QT)'
    ],
    chronicSymptoms: [
      'Hiperqueratosis palmoplantar ("callosidades verrugosas" en manos y pies)',
      'Leucomelanodermia cutánea ("aspecto en gotas de lluvia")',
      'Líneas de Mees transversales blancas en las uñas',
      'Enfermedad del pie negro (isquemia periférica y gangrena arterial)',
      'Carcinoma epidermoide de piel, cáncer urotelial y pulmonar'
    ],
    targetOrgans: [
      {
        organId: 'skin',
        organName: 'Piel y Faneras',
        severity: 'critical',
        impactDescription: 'Afinidad directa por la queratina rica en cisteína con producción de mutaciones en p53.',
        cellularMechanism: 'Estrés oxidativo, hipermetilación del ADN e hiperexpresión de factores de crecimiento endotelial.',
        affinityFactor: 0.96
      },
      {
        organId: 'heart',
        organName: 'Sistema Cardiovascular y Endotelio',
        severity: 'high',
        impactDescription: 'Aterosclerosis acelerada, microangiopatía periférica y necrosis isquémica tisular.',
        cellularMechanism: 'Inhibición de óxido nítrico sintasa endotelial y peroxidación lipídica.',
        affinityFactor: 0.85
      },
      {
        organId: 'liver',
        organName: 'Hígado',
        severity: 'high',
        impactDescription: 'Cirrosis no cirrótica portal y angiosarcoma hepático.',
        cellularMechanism: 'Metilación hepática de arsenito a ácido monometilarsónico (MMA) y dimetilarsínico (DMA).',
        affinityFactor: 0.82
      }
    ],
    chelatingAgent: {
      name: 'Dimercaprol (BAL) o DMSA',
      mechanism: 'Suministra grupos sulfhidrilo exógenos para quelar el catión As³⁺ antes de que inactive las enzimas mitocondriales.',
      effectiveness: 'Alta en fases agudas tempranas.'
    },
    environmentalSolution: 'Coagulación y floculación con sales de hierro (FeCl₃) y filtración por lechos de alúmina activada o arena con óxidos de manganeso.'
  }
};
