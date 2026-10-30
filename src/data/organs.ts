import { OrganIdentifier, TargetOrganImpact, ContaminantId } from '../types';

export interface OrganMasterDefinition {
  id: OrganIdentifier;
  name: string;
  shortName: string;
  systemCategory: 'nervous' | 'circulatory' | 'respiratory' | 'digestive' | 'renal' | 'skeletal' | 'endocrine' | 'skin' | 'immune' | 'reproductive';
  systemLabel: string;
  anatomicalLocation: string;
  iconName: string;
  
  // Rosell Puig - Morfología Humana II Classification
  morphology: {
    type: string;
    stroma: string;
    parenchyma: string;
    functionalUnit: string;
    morphoLesion: string;
  };
  
  // Contaminant-specific toxicological mechanisms
  toxicology: Record<ContaminantId, {
    severity: 'low' | 'moderate' | 'high' | 'critical';
    isPrimaryTarget: boolean;
    affinityFactor: number;
    impactDescription: string;
    cellularMechanism: string;
  }>;
}

export const ALL_IMPORTANT_ORGANS: OrganMasterDefinition[] = [
  {
    id: 'brain',
    name: 'Cerebro & Sistema Nervioso Central',
    shortName: 'Cerebro (SNC)',
    systemCategory: 'nervous',
    systemLabel: 'Sistema Nervioso',
    anatomicalLocation: 'Cavidad craneal, encéfalo suprasegmentario',
    iconName: 'Brain',
    morphology: {
      type: 'Órgano Suprasegmentario (Cerebro & SNC)',
      stroma: 'Meninges (Duramadre, Aracnoides, Piamadre) y Espacio Subaracnoideo con LCR',
      parenchyma: 'Corteza Cerebral (6 Láminas de citoarquitectura: Molecular a Multiforme) y Sustancia Blanca',
      functionalUnit: 'Neurona (Soma, Cuerpos de Nissl, Axón con Mielina) & Astrocitos BHE',
      morphoLesion: 'Cromatolisis, despolarización de membrana y apoptosis en neuronas piramidales de Betz'
    },
    toxicology: {
      mercury: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.95,
        impactDescription: 'Atraviesa la barrera hematoencefálica y la placenta. Provoca lisis neuronal en la corteza visual y células de Purkinje del cerebelo.',
        cellularMechanism: 'Se une a grupos tiol (-SH) de cisteínas proteicas e inhibe la síntesis de tubulina, fosforilación oxidativa y produce estrés oxidativo neuronal masivo.'
      },
      lead: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.88,
        impactDescription: 'Altera la sinaptogénesis, permeabiliza la barrera hematoencefálica y disminuye el CI en niños (encefalopatía saturnina).',
        cellularMechanism: 'Compite con el calcio en la proteína quinasa C (PKC) y canales de calcio dependientes de voltaje presinápticos.'
      },
      cadmium: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.45,
        impactDescription: 'Cefaleas, alteraciones del ciclo sueño-vigilia y neuropatía subclínica por disfunción endotelial cerebral.',
        cellularMechanism: 'Disrupción de uniones ocluyentes en capilares cerebrales y peroxidación de lípidos de membrana.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.70,
        impactDescription: 'Encefalopatía arsenical difusa, neuropatía simétrica ascendente y deterioro cognitivo por estrés nitrosativo.',
        cellularMechanism: 'Inhibe el complejo piruvato deshidrogenasa cerebral reduciendo la síntesis de acetilcolina y ATP.'
      }
    }
  },
  {
    id: 'nervous_system',
    name: 'Nervios Periféricos & Placa Neuromuscular',
    shortName: 'Nervios Periféricos',
    systemCategory: 'nervous',
    systemLabel: 'Sistema Nervioso',
    anatomicalLocation: 'Plexos braquial/lumbosacro y troncos nerviosos periféricos',
    iconName: 'Activity',
    morphology: {
      type: 'Tejido Nervioso Segmentario Conductor',
      stroma: 'Epineuro (T.C. denso irregular), Perineuro (barrera) y Endoneuro',
      parenchyma: 'Fibras nerviosas mielínicas (Aα, Aβ, Aδ) y amielínicas (tipo C)',
      functionalUnit: 'Fibra nerviosa periférica (Axón + Vaina de mielina de células de Schwann)',
      morphoLesion: 'Degeneración walleriana, atrofia axonal distal ("en guante y calcetín") y bloqueo saltatorio'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.85,
        impactDescription: 'Parestesias peribucales y distales en manos/pies, ataxia sensorial y pérdida del sentido de posición propioceptivo.',
        cellularMechanism: 'Inhibición del transporte axoplásmico retrógrado y bloqueo de canales iónicos de sodio.'
      },
      lead: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.92,
        impactDescription: 'Parálisis radial motora periférica con "mano caída" (wrist drop) y marcha en estepaje por "pie caído".',
        cellularMechanism: 'Desmielinización segmentaria y degeneración axonal motora por depleción de hemo y ATP en células de Schwann.'
      },
      cadmium: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.40,
        impactDescription: 'Neuropatía periférica sensitiva leve con enlentecimiento de la velocidad de conducción nerviosa.',
        cellularMechanism: 'Estrés oxidativo en el ganglio de la raíz dorsal y alteración del influjo de Ca²⁺.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.80,
        impactDescription: 'Polineuropatía sensitivo-motora distal simétrica con dolor quemante, hiperalgesia y arreflexia aquílea.',
        cellularMechanism: 'Interacción con el ácido lipoico en mitocondrias axonales induciendo apoptosis retrógrada.'
      }
    }
  },
  {
    id: 'heart',
    name: 'Corazón & Sistema Cardiovascular',
    shortName: 'Corazón & Miocardio',
    systemCategory: 'circulatory',
    systemLabel: 'Cardiovascular',
    anatomicalLocation: 'Mediastino medio torácico, entre ambos pulmones',
    iconName: 'Heart',
    morphology: {
      type: 'Órgano Muscular Hueco Central Tetracameral',
      stroma: 'Epicardio (Pericardio Seroso), Esqueleto Fibroso Cardíaco y Endomisio vascular',
      parenchyma: 'Miocardio contráctil con Discos Intercalares y Sistema Cardionector (Nódulos SA y AV)',
      functionalUnit: 'Cardiomiocito ventricular con sarcómeros (Bandas A/I, Discos Z) y díadas túbulo T',
      morphoLesion: 'Necrosis miocitaria parcheada, hipertrofia concéntrica y disfunción diastólica por sobrecarga'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.75,
        impactDescription: 'Variabilidad del ritmo cardíaco reducida, hipertensión arterial y aceleración de aterosclerosis coronaria.',
        cellularMechanism: 'Inactivación de la paraoxonasa sérica y aumento masivo de peróxidos lipídicos endoteliales.'
      },
      lead: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.85,
        impactDescription: 'Hipertensión arterial refractaria, hipertrofia ventricular izquierda y aumento de morbimortalidad por infarto.',
        cellularMechanism: 'Aumento del tono vascular por inhibición de la bomba Na⁺/K⁺-ATPasa y reducción del óxido nítrico endotelial (eNOS).'
      },
      cadmium: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.65,
        impactDescription: 'Rigidez aórtica, ateromatosis acelerada y miocardiopatía tóxica con disfunción sistólica.',
        cellularMechanism: 'Sustitución de zinc en metaloenzimas endoteliales y sobreexpresión de moléculas de adhesión VCAM-1.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.90,
        impactDescription: 'Arritmias graves (prolongación de intervalo QT, torsades de pointes), miocardiopatía y enfermedad del pie negro.',
        cellularMechanism: 'Bloqueo de canales de potasio hERG cardíacos y necrosis isquémica endotelial por radicales libres.'
      }
    }
  },
  {
    id: 'blood',
    name: 'Sangre, Vasos & Médula Ósea',
    shortName: 'Sangre & Hemo',
    systemCategory: 'circulatory',
    systemLabel: 'Hematopoyético',
    anatomicalLocation: 'Torrente vascular sistémico y médula ósea trabecular',
    iconName: 'Droplets',
    morphology: {
      type: 'Tejido Conectivo Especializado Líquido & Órgano Hematopoyético',
      stroma: 'Matriz extracelular plasmática y estroma reticular medular con sinusoides',
      parenchyma: 'Elementos formes sanguíneos (Eritrocitos, Leucocitos, Trombocitos) e islotes hematopoyéticos',
      functionalUnit: 'Eritrocito maduro bicóncavo (7.5 µm) con 280 millones de moléculas de Hemoglobina',
      morphoLesion: 'Inhibición de ferroquelatasa/ALAD con punteado basófilo ribosomal y hemólisis intravascular'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.80,
        impactDescription: 'Fijación en un 90% a la hemoglobina eritrocitaria y transporte activo transplacentario vía transportador LAT1.',
        cellularMechanism: 'Formación del complejo CH₃Hg-L-cisteína que imita al aminoácido esencial metionina en eritrocitos.'
      },
      lead: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.95,
        impactDescription: 'Anemia microcítica hipocrómica con punteado basófilo difuso en frotis y acumulación de protoporfirina IX.',
        cellularMechanism: 'Inhibición no competitiva potente de la enzima ácido delta-aminolevulínico deshidratasa (ALAD) y ferroquelatasa.'
      },
      cadmium: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.60,
        impactDescription: 'Anemia normocítica por deficiencia de eritropoyetina (secundaria a nefropatía) y fragilidad osmótica eritrocitaria.',
        cellularMechanism: 'Interferencia en la absorción intestinal de hierro ferroso (Fe²⁺) vía transportador DMT1.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.78,
        impactDescription: 'Leucopenia, trombocitopenia y anemia megaloblástica por diseritropoyesis y hemólisis periférica.',
        cellularMechanism: 'Inhibición de la metilación del ADN en células madre hematopoyéticas y colapso de la síntesis de folatos.'
      }
    }
  },
  {
    id: 'lungs',
    name: 'Pulmones & Árbol Traqueobronquial',
    shortName: 'Pulmones & Alvéolos',
    systemCategory: 'respiratory',
    systemLabel: 'Sistema Respiratorio',
    anatomicalLocation: 'Cavidades pleurales derecha e izquierda del tórax',
    iconName: 'Wind',
    morphology: {
      type: 'Órgano Visceral Parenquimatoso Tubular-Alveolar',
      stroma: 'Pleura visceral (Mesotelio), Tabiques Interalveolares y Fibras Elásticas',
      parenchyma: 'Árbol Bronquial Segmentario, Bronquiolos Respiratorios y Sacos Alveolares',
      functionalUnit: 'Alvéolo Pulmonar & Barrera Alveolo-Capilar (Neumocitos I/II, Membrana basal fused)',
      morphoLesion: 'Edema pulmonar intersticial, pérdida de surfactante por daño de neumocitos II y fibrosis difusa'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.50,
        impactDescription: 'Neumonitis química y bronquiolitis constrictiva en exposiciones por inhalación de vapores.',
        cellularMechanism: 'Peroxidación de lípidos en surfactante alveolar y daño a uniones endoteliales capilares.'
      },
      lead: {
        severity: 'low',
        isPrimaryTarget: false,
        affinityFactor: 0.30,
        impactDescription: 'Disminución subclínica de la capacidad de difusión de monóxido de carbono (DLCO) y aclaramiento ciliar.',
        cellularMechanism: 'Inhibición de ATPasas en células ciliadas del epitelio respiratorio pseudoestratificado.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.85,
        impactDescription: 'Enfisema centroacinar grave, enfermedad pulmonar obstructiva crónica (EPOC) y carcinoma broncogénico.',
        cellularMechanism: 'Inhibición de la alfa-1-antitripsina y liberación masiva de elastasa por macrófagos alveolares.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.88,
        impactDescription: 'Carcinoma pulmonar de células pequeñas y no pequeñas, bronquiectasias y fibrosis intersticial progresiva.',
        cellularMechanism: 'Generación de 8-hidroxidesoxiguanosina (8-OHdG), aberraciones cromosómicas e hipometilación oncogénica.'
      }
    }
  },
  {
    id: 'liver',
    name: 'Hígado & Vía Biliar',
    shortName: 'Hígado & Hepatocitos',
    systemCategory: 'digestive',
    systemLabel: 'Sistema Digestivo',
    anatomicalLocation: 'Hipocondrio derecho y epigastrio, bajo la cúpula diafragmática',
    iconName: 'Flame',
    morphology: {
      type: 'Glándula Maciza Mixta Anexa (Esplacnología Digestiva)',
      stroma: 'Cápsula de Glisson y Tabiques Interlobulillares con Espacios Porta de Kiernan',
      parenchyma: 'Lobulillos Hepáticos Clásicos Hexagonales y Cordones Anastomosados de Remak',
      functionalUnit: 'Hepatocito poliédrico, Sinusoides tipo III con células de Kupffer y Espacio de Disse',
      morphoLesion: 'Degeneración vacuolar hidrópica, balonización hepatocelular y colapso de la fosforilación oxidativa'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.65,
        impactDescription: 'Sobrecarga hepatocelular de glutatión y elevación moderada de transaminasas (ALT/AST).',
        cellularMechanism: 'Depleción del glutatión intracelular (GSH) y estrés del retículo endoplásmico rugoso.'
      },
      lead: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.60,
        impactDescription: 'Esteatosis microvesicular, alteración de la detoxificación microsomal hepática del citocromo P450.',
        cellularMechanism: 'Inhibición de enzimas hemo-dependientes del complejo CYP450 hepático.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.82,
        impactDescription: 'Hepatotoxicidad inicial con síntesis masiva de Cd-metalotioneína que luego es transportada hacia el riñón.',
        cellularMechanism: 'Sobrecarga mitocondrial hepatocitaria con desacoplamiento de la cadena transportadora de electrones.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.92,
        impactDescription: 'Cirrosis no cirrótica portal (hipertensión portal idiopática), colangitis destructiva y angiosarcoma hepático.',
        cellularMechanism: 'Biometilación hepática tóxica a ácido monometilarsónico (MMA) y producción masiva de peróxido de hidrógeno.'
      }
    }
  },
  {
    id: 'kidneys',
    name: 'Riñones & Sistema Excretor',
    shortName: 'Riñones & Nefronas',
    systemCategory: 'renal',
    systemLabel: 'Sistema Renal',
    anatomicalLocation: 'Espacio retroperitoneal paravertebral (T12 a L3)',
    iconName: 'Droplets',
    morphology: {
      type: 'Órgano Macizo Visceral Bilateral (Esplacnología Urinaria)',
      stroma: 'Cápsula Fibrosa Inelástica, Fascia Renal de Gerota y Tejido Intersticial Reticular',
      parenchyma: 'Corteza (Laberinto & Rayos Medulares de Ferrein) y Médula (Pirámides de Malpighi)',
      functionalUnit: 'Nefrona (Corpúsculo de Malpighi con Podocitos + Túbulo Contorneado Proximal)',
      morphoLesion: 'Necrosis tubular aguda, pérdida de microvellosidades del ribete en cepillo y proteinuria'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.80,
        impactDescription: 'Nefropatía tubular tóxica, oliguria, proteinuria e insuficiencia renal en intoxicaciones crónicas.',
        cellularMechanism: 'Unión a metalotioneínas en células del TCP con lisis de lisosomas y daño mitocondrial.'
      },
      lead: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.82,
        impactDescription: 'Nefropatía saturnina crónica con fibrosis intersticial progresiva, atrofia tubular y gota saturnina (hiperuricemia).',
        cellularMechanism: 'Formación de cuerpos de inclusión nucleares densos intranucleares de plomo-proteína en el túbulo proximal.'
      },
      cadmium: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.99,
        impactDescription: 'Síndrome de Fanconi renal completo (glucosuria, aminoaciduria, fosfaturia), hipercalciuria y fallo renal terminal irreversible.',
        cellularMechanism: 'Filtración glomerular del complejo Cd-MT; endocitosis en TCP con degradación lisosomal que libera Cd²⁺ libre citotóxico.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.78,
        impactDescription: 'Necrosis tubular aguda, glomerulonefritis proliferativa y alto riesgo de carcinoma de células transicionales vesical y renal.',
        cellularMechanism: 'Sustitución de fosfatos inorgánicos en transportadores luminales de sodio-fosfato (NaPi).'
      }
    }
  },
  {
    id: 'stomach',
    name: 'Estómago & Tracto Digestivo Superior',
    shortName: 'Estómago & Mucosa',
    systemCategory: 'digestive',
    systemLabel: 'Sistema Digestivo',
    anatomicalLocation: 'Hipocondrio izquierdo y epigastrio, entre esófago y duodeno',
    iconName: 'Flame',
    morphology: {
      type: 'Órgano Hueco Músculo-Membranoso Dilatado',
      stroma: 'Túnica Serosa (Peritoneo), Submucosa con Plexo de Meissner y Lámina Propia',
      parenchyma: 'Túnica Mucosa con Criptas Gástricas y Glándulas Oxínticas/Pépticas',
      functionalUnit: 'Glándula Fúndica (Células Parietales productoras de HCl/Factor Intrínseco y Principales)',
      morphoLesion: 'Gastritis erosiva hemorrágica, atrofia glandular de la mucosa y rotura de la barrera de moco'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.70,
        impactDescription: 'Gastritis erosiva, ardor epigástrico intenso, náuseas, vómitos y sabor metálico constante en boca.',
        cellularMechanism: 'Necrosis por coagulación en el epitelio gástrico y disrupción de la secreción de bicarbonato mucoso.'
      },
      lead: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.85,
        impactDescription: 'Cólico saturnino clásico: dolor abdominal paroxístico intenso, estreñimiento rebelde y espasmo intestinal.',
        cellularMechanism: 'Hipertonía espástica muscular lisa secundaria a toxicidad por plomo sobre el plexo mientérico de Auerbach.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.68,
        impactDescription: 'Gastroenteritis aguda severa tras ingestión accidental con vómitos biliosos, diarrea acuosa y dolor cólico.',
        cellularMechanism: 'Citotoxicidad directa sobre las uniones estrechas de los enterocitos gástricos y duodenales.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.90,
        impactDescription: 'Gastroenteritis coleriforme masiva ("evacuaciones en agua de arroz"), hemorragia gástrica y shock hipovolémico.',
        cellularMechanism: 'Inhibición de la respiración celular mitocondrial en enterocitos con descamación epitelial masiva.'
      }
    }
  },
  {
    id: 'pancreas',
    name: 'Páncreas (Endocrino & Exocrino)',
    shortName: 'Páncreas & Islotes',
    systemCategory: 'digestive',
    systemLabel: 'Sistema Digestivo & Endocrino',
    anatomicalLocation: 'Espacio retroperitoneal oblicuo, enmarcado por el asa duodenal',
    iconName: 'Activity',
    morphology: {
      type: 'Glándula Mixta Anfícrina Retroperitoneal',
      stroma: 'Cápsula de tejido conectivo delgado con tabiques interlobulillares',
      parenchyma: 'Porción Exocrina (Acinos serosos y conducto de Wirsung) + Endocrina (Islotes de Langerhans)',
      functionalUnit: 'Acinos pancreáticos con gránulos de cimógeno & Células Beta (65% del islote, Insulina)',
      morphoLesion: 'Apoptosis de células beta pancreáticas, estrés del retículo endoplásmico y pancreatitis tóxica'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.55,
        impactDescription: 'Disfunción en la secreción de insulina estimulada por glucosa y aumento de resistencia periférica.',
        cellularMechanism: 'Estrés oxidativo en células beta pancreáticas con inactivación de enzimas antioxidantes tioredoxina.'
      },
      lead: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.50,
        impactDescription: 'Alteración de la tolerancia a la glucosa y disfunción secretora de enzimas digestivas (amilasa/lipasa).',
        cellularMechanism: 'Interferencia con la señalización de calcio intracelular requerida para la exocitosis de gránulos de insulina.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.72,
        impactDescription: 'Diabetes mellitus secundaria a destrucción acumulativa de células beta en los islotes de Langerhans.',
        cellularMechanism: 'Acumulación selectiva en células de los islotes vía canales de zinc/calcio ZnT8 e inducción de apoptosis.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.86,
        impactDescription: 'Epidemiología demostrada de Diabetes Mellitus tipo 2 diabetogénica por aguas con arsénico e hipoinsulinemia.',
        cellularMechanism: 'Inhibición de la translocación de transportadores GLUT4 dependientes de insulina y daño genómico en células beta.'
      }
    }
  },
  {
    id: 'spleen',
    name: 'Bazo & Sistema Inmunológico',
    shortName: 'Bazo & Inmunidad',
    systemCategory: 'immune',
    systemLabel: 'Sistema Linfoide / Inmune',
    anatomicalLocation: 'Hipocondrio izquierdo, en el receso subfrénico esplénico',
    iconName: 'ShieldAlert',
    morphology: {
      type: 'Órgano Linfoide Secundario Hemolinfático',
      stroma: 'Cápsula fibroelástica con Músculo Liso y Trabéculas Esplénicas reticulares',
      parenchyma: 'Pulpa Blanca (Manguitos linfoides periarteriolares PALS) y Pulpa Roja (Cordones de Billroth)',
      functionalUnit: 'Sinusoide esplénico con células endoteliales en duelas de barril & Macrófagos fagocíticos',
      morphoLesion: 'Esplenomegalia congestiva, hemocateresis acelerada y depleción de linfocitos T/B'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.68,
        impactDescription: 'Autoinmunidad inducida por mercurio (síndrome lupus-like), glomerulonefritis membranosa y atrofia tímica.',
        cellularMechanism: 'Alteración de la selección tímica de linfocitos T y activación policlonal aberrante de linfocitos B.'
      },
      lead: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.72,
        impactDescription: 'Inmunosupresión humoral y celular con reducción de la quimiotaxis de neutrófilos e hipergammaglobulinemia.',
        cellularMechanism: 'Desbalance en la respuesta de citoquinas Th1/Th2 hacia un perfil proinflamatorio crónico Th2.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.70,
        impactDescription: 'Atrofia del tejido linfoide esplénico, disminución de la actividad de células Natural Killer (NK).',
        cellularMechanism: 'Inhibición de la proliferación linfocitaria inducida por mitógenos y apoptosis de esplenocitos.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.75,
        impactDescription: 'Inmunotoxicidad severa, reactivación de infecciones oportunistas y alteración de la inmunovigilancia tumoral.',
        cellularMechanism: 'Supresión de la diferenciación de células dendríticas y bloqueo de la presentación antigénica HLA-II.'
      }
    }
  },
  {
    id: 'bones',
    name: 'Esqueleto, Huesos & Hidroxiapatita',
    shortName: 'Esqueleto & Huesos',
    systemCategory: 'skeletal',
    systemLabel: 'Sistema Osteomioarticular',
    anatomicalLocation: 'Caja torácica, esqueleto axial y apendicular',
    iconName: 'Bone',
    morphology: {
      type: 'Tejido Conectivo Rígido Mineralizado (Sistema Osteomioarticular)',
      stroma: 'Periostio fibroso vascularizado externo y Endostio osteogénico interno',
      parenchyma: 'Osteonas / Sistema de Havers con Laminillas concéntricas y Conductos de Volkmann',
      functionalUnit: 'Osteocitos en lagunas & Matriz extracelular de Hidroxiapatita Ca₁₀(PO₄)₆(OH)₂',
      morphoLesion: 'Sustitución isoiónica de Ca²⁺ por Pb²⁺/Cd²⁺ en la red cristalina con pérdida de resistencia ósea'
    },
    toxicology: {
      mercury: {
        severity: 'low',
        isPrimaryTarget: false,
        affinityFactor: 0.25,
        impactDescription: 'Depósito óseo mínimo; el mercurio orgánico tiene baja afinidad por la matriz de hidroxiapatita mineral.',
        cellularMechanism: 'Fijación insignificante en cristales minerales óseos en comparación con los tejidos ricos en sulfhidrilo.'
      },
      lead: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.98,
        impactDescription: 'El 90-95% de la carga corporal total de plomo se almacena en la matriz ósea durante 20 a 30 años (reservorio tóxico permanente).',
        cellularMechanism: 'Sustituye directamente al ion Ca²⁺ en los cristales de hidroxiapatita Ca₁₀(PO₄)₆(OH)₂ alterando el remodelado osteoblástico.'
      },
      cadmium: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.92,
        impactDescription: 'Enfermedad de Itai-Itai: osteomalacia masiva, osteoporosis severa y fracturas patológicas al toser o caminar.',
        cellularMechanism: 'Inhibición de la enzima 1-alfa-hidroxilasa renal impidiendo la activación de la vitamina D (calcitriol) y descalcificación ósea.'
      },
      arsenic: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.40,
        impactDescription: 'Inhibición de la diferenciación osteogénica y depósito residual en periostio y uñas (Líneas de Mees).',
        cellularMechanism: 'Competición del arseniato (AsO₄³⁻) con el fosfato inorgánico (PO₄³⁻) en la cristalización ósea.'
      }
    }
  },
  {
    id: 'thyroid',
    name: 'Glándula Tiroides & Laringe',
    shortName: 'Tiroides & Laringe',
    systemCategory: 'endocrine',
    systemLabel: 'Sistema Endocrino & Cervical',
    anatomicalLocation: 'Región anterior del cuello, abrazando la tráquea bajo el cartílago tiroides',
    iconName: 'Sparkles',
    morphology: {
      type: 'Glándula Endocrina Folicular Bipartita',
      stroma: 'Cápsula de tejido conectivo con tabiques vascularizados y red capilar fenestrada',
      parenchyma: 'Folículos Tiroideos esféricos con epitelio cúbico simple y células parafoliculares C',
      functionalUnit: 'Folículo Tiroideo con Coloide central rico en Tiroglobulina y síntesis de T3/T4',
      morphoLesion: 'Disrupción del eje tiroideo, hipotiroidismo subclínico y tiroiditis autoinmune crónica'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.60,
        impactDescription: 'Hipotiroidismo secundario, bocio difuso y disminución de los niveles circulantes de hormona T3 activa.',
        cellularMechanism: 'Inhibición selectiva de la enzima desyodasa tipo I que contiene selenocisteína requerida para convertir T4 en T3.'
      },
      lead: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.55,
        impactDescription: 'Depresión de la función tiroidea con disminución en la captación de yodo y niveles bajos de tiroxina libre (FT4).',
        cellularMechanism: 'Inhibición de la peroxidasa tiroidea (TPO) por interacción con sus centros enzimáticos de hemo.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.70,
        impactDescription: 'Hipertrofia folicular tiroidea, proliferación adenomatosa y riesgo incrementado de nódulos tiroideos.',
        cellularMechanism: 'Acumulación en células foliculares induciendo estrés genotóxico y desregulación de receptores de TSH.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.65,
        impactDescription: 'Bocio endémico exacerbado, hipotiroidismo primario y carcinoma papilar de tiroides.',
        cellularMechanism: 'Inhibición de la bomba transportadora simportadora de sodio-yoduro (NIS) en la membrana basolateral folicular.'
      }
    }
  },
  {
    id: 'skin',
    name: 'Piel, Faneras & Sistema Tegumentario',
    shortName: 'Piel & Faneras',
    systemCategory: 'skin',
    systemLabel: 'Sistema Tegumentario',
    anatomicalLocation: 'Superficie corporal externa (Epidermis, Dermis e Hipodermis)',
    iconName: 'Eye',
    morphology: {
      type: 'Órgano Tegumentario Estratificado',
      stroma: 'Dermis Papilar y Reticular con fibras de colágeno I/III y elastina',
      parenchyma: 'Epidermis: Epitelio plano estratificado queratinizado (Estratos Basal, Espinoso, Granuloso, Córneo)',
      functionalUnit: 'Queratinocito epidérmico, Melanocito basal y Complejo Pilosebáceo',
      morphoLesion: 'Hiperqueratosis palmoplantar, leucomelanodermia "en gotas de lluvia" y carcinoma epidermoide'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.60,
        impactDescription: 'Acrodinia (enfermedad rosada): eritema palmoplantar doloroso, descamación profusa y diaforesis.',
        cellularMechanism: 'Vasoconstricción cutánea periférica por acumulación de catecolaminas e hipersensibilidad tisular.'
      },
      lead: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.50,
        impactDescription: 'Palidez terrosa facial característica (saturnismo) y la Línea de Burton azulada en la encía marginal.',
        cellularMechanism: 'Precipitación de sulfuro de plomo (PbS) insoluble por reacción con bacterias orales sulfatarreductoras.'
      },
      cadmium: {
        severity: 'low',
        isPrimaryTarget: false,
        affinityFactor: 0.35,
        impactDescription: 'Dermatitis eccematosa de contacto en trabajadores expuestos y pérdida de elasticidad dérmica.',
        cellularMechanism: 'Inhibición de la lisil oxidasa dérmica interfiriendo con el entrecruzamiento de colágeno y elastina.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.96,
        impactDescription: 'Hiperqueratosis palmoplantar severa verrugosa, leucomelanodermia difusa ("gotas de lluvia") y carcinoma espinocelular de piel.',
        cellularMechanism: 'Alta afinidad por la queratina rica en cisteína (-SH); hipermetilación de genes supresores tumorales p53 y p16.'
      }
    }
  },
  {
    id: 'gallbladder',
    name: 'Vesícula Biliar & Conductos Biliares',
    shortName: 'Vesícula Biliar',
    systemCategory: 'digestive',
    systemLabel: 'Sistema Digestivo & Biliar',
    anatomicalLocation: 'Fosa cística en la cara visceral del hígado (lóbulo derecho)',
    iconName: 'Droplet',
    morphology: {
      type: 'Órgano Hueco Piriforme Reservorio Biliar',
      stroma: 'Túnica Serosa peritoneal y Capa Subserosa rica en vasos linfáticos',
      parenchyma: 'Túnica Mucosa con pliegues rugosos y epitelio cilíndrico simple con microvellosidades',
      functionalUnit: 'Colangiocito & Epitelio de absorción de agua con concentración de sales biliares',
      morphoLesion: 'Colecistitis química, estasis biliar, litiasis por precipitación de complejos metálicos y colangitis'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.62,
        impactDescription: 'Excreción biliar de complejos mercurio-glutatión con irritación de la mucosa vesicular.',
        cellularMechanism: 'Transporte activo canalicular vía transportadores Mrp2 alterando la composición micelar de la bilis.'
      },
      lead: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.52,
        impactDescription: 'Alteración de la motilidad vesicular e hipotonía del esfínter de Oddi.',
        cellularMechanism: 'Inhibición de la síntesis de colecistoquinina (CCK) y espasmo microvascular.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.74,
        impactDescription: 'Acumulación en el epitelio biliar, colelitiasis inducida y metaplasia de la mucosa vesicular.',
        cellularMechanism: 'Sustitución de zinc en metaloenzimas del epitelio biliar y peroxidación lipídica de la bilis concentrada.'
      },
      arsenic: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.80,
        impactDescription: 'Colangitis esclerosante tóxica y riesgo incrementado de carcinoma del tracto biliar extrahepático.',
        cellularMechanism: 'Excreción masiva de metabolitos metilados trivalentes citotóxicos a la bilis.'
      }
    }
  },
  {
    id: 'small_intestine',
    name: 'Intestino Delgado (Duodeno, Yeyuno & Íleon)',
    shortName: 'Intestino Delgado',
    systemCategory: 'digestive',
    systemLabel: 'Sistema Digestivo (Absorción)',
    anatomicalLocation: 'Cavidad abdominal central e hipogastrio, enmarcado por el colon',
    iconName: 'Activity',
    morphology: {
      type: 'Tubo Digestivo Tubular con Vellosidades y Criptas de Lieberkühn',
      stroma: 'Túnica Serosa, Submucosa con Plexo de Meissner y Placas de Peyer en íleon',
      parenchyma: 'Epitelio Cilíndrico Simple con Ribete en Cepillo (Enterocitos y Células Caliciformes)',
      functionalUnit: 'Vellosidad Intestinal (Microvellosidades apicales, Capilares fenestrados y Vaso quilífero central)',
      morphoLesion: 'Atrofia de vellosidades, hiperplasia de criptas, malabsorción de cationes divalentes y diarrea osmótica'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.85,
        impactDescription: 'Absorción masiva del 95% de metilmercurio en el yeyuno; enteritis necrotizante por sales inorgánicas.',
        cellularMechanism: 'Uso del transportador de aminoácidos neutros LAT1 mimetizando el complejo cisteína-metilmercurio.'
      },
      lead: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.90,
        impactDescription: 'Absorción digestiva activa incrementada hasta un 50% en niños; atrofia de enterocitos y cólico intestinal.',
        cellularMechanism: 'Absorción competitiva a través del transportador de metales divalentes 1 (DMT1) y canales TRPV6.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.88,
        impactDescription: 'Diarrea secretora severa, descamación epitelial y bloqueo de la absorción de hierro y calcio.',
        cellularMechanism: 'Competencia con transportadores DMT1 y degradación de claudinas en las uniones estrechas (zonula occludens).'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.94,
        impactDescription: 'Gastroenteritis arsenical fulminante con necrosis de la mucosa intestinal ("evacuaciones en agua de arroz").',
        cellularMechanism: 'Aumento severo de la permeabilidad vascular submucosa por óxido nítrico e inhibición del ciclo de Krebs.'
      }
    }
  },
  {
    id: 'large_intestine',
    name: 'Intestino Grueso & Colon (Marco Colónico)',
    shortName: 'Colon & Recto',
    systemCategory: 'digestive',
    systemLabel: 'Sistema Digestivo (Excreción)',
    anatomicalLocation: 'Periferia de la cavidad abdominal (Ciego, Colon ascendente, transverso, descendente, sigmoide)',
    iconName: 'Activity',
    morphology: {
      type: 'Tubo Digestivo Hueco con Haustras, Tenias y Apéndices Epiploicos',
      stroma: 'Serosa peritoneal con mesocolon, Capa Muscular Externa (Tenias del colon) y Submucosa',
      parenchyma: 'Mucosa sin vellosidades con Criptas de Lieberkühn profundas y abundantes Células Caliciformes',
      functionalUnit: 'Colonocito absortivo de agua/electrolitos & Glándulas mucíparas tubulares simples',
      morphoLesion: 'Colitis ulcerosa tóxica, necrosis isquémica mucosa, espasmo muscular colónico y disbiosis de la microbiota'
    },
    toxicology: {
      mercury: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.78,
        impactDescription: 'Colitis hemorrágica, tenesmo rectal doloroso y ulceraciones de la mucosa colónica.',
        cellularMechanism: 'Excreción retrógrada hacia la luz colónica con daño directo a los colonocitos y apoptosis mediada por caspasas.'
      },
      lead: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.92,
        impactDescription: 'Cólico saturnino con estreñimiento pertinaz e íleo paralítico por intoxicación crónica.',
        cellularMechanism: 'Parálisis espástica de la musculatura lisa circular colónica por interferencia con la acetilcolina en plexo mientérico.'
      },
      cadmium: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.65,
        impactDescription: 'Alteración del microbioma intestinal, permeabilidad colónica aumentada y proctitis inflamatoria.',
        cellularMechanism: 'Inhibición de enzimas mucoprotectoras de los colonocitos e inducción de citoquinas TNF-alfa.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.88,
        impactDescription: 'Colitis isquémica difusa, melenas y riesgo elevado de neoplasias colorrectales en exposición crónica.',
        cellularMechanism: 'Endarteritis obliterante de los vasos mesentéricos rectos y rotura de la barrera epitelial colónica.'
      }
    }
  },
  {
    id: 'bladder',
    name: 'Vejiga Urinaria & Uréteres',
    shortName: 'Vejiga Urinaria',
    systemCategory: 'renal',
    systemLabel: 'Sistema Renal & Urinario',
    anatomicalLocation: 'Pelvis menor anterior, por detrás de la sínfisis del pubis',
    iconName: 'Droplets',
    morphology: {
      type: 'Órgano Hueco Músculo-Membranoso Reservorio Urinario',
      stroma: 'Adventicia / Serosa peritoneal superior y Lámina Propia de tejido conectivo laxo',
      parenchyma: 'Urotelio / Epitelio de Transición (Células en Paraguas con placas uroteliales rígidas) y Músculo Detrusor',
      functionalUnit: 'Célula en Paraguas del Urotelio con Uroplaquinas impermeables a toxinas urinarias',
      morphoLesion: 'Cistitis hemorrágica química, displasia urotelial, hiperplasia papilar y carcinoma de células transicionales'
    },
    toxicology: {
      mercury: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.60,
        impactDescription: 'Disuria, cistitis irritativa por excreción de sales inorgánicas e hipertonía del trígono vesical.',
        cellularMechanism: 'Descamación del urotelio superficial por reacción con metabolitos sulfuro de mercurio.'
      },
      lead: {
        severity: 'moderate',
        isPrimaryTarget: false,
        affinityFactor: 0.50,
        impactDescription: 'Disfunción contráctil del músculo detrusor y polaquiuria secundaria a neuropatía autonómica.',
        cellularMechanism: 'Bloqueo ganglionar parasimpático del plexo pélvico que inerva el músculo detrusor.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: false,
        affinityFactor: 0.76,
        impactDescription: 'Litiasis renal secundaria a hipercalciuria obstructiva vesical y engrosamiento de la pared vesical.',
        cellularMechanism: 'Precipitación de fosfato de calcio y microcristales abrasivos en la orina sobresaturada.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.98,
        impactDescription: 'Cáncer urotelial de vejiga (carcinoma transicional), hematuria indolora y displasia papilar difusa.',
        cellularMechanism: 'Acumulación y toxicidad extrema de DMA(III) y MMA(III) en la orina concentrada produciendo rupturas bicatenarias de ADN.'
      }
    }
  },
  {
    id: 'reproductive',
    name: 'Sistema Reproductor (Útero, Ovarios / Gónadas)',
    shortName: 'Sistema Reproductor',
    systemCategory: 'reproductive',
    systemLabel: 'Sistema Reproductor & Gónadas',
    anatomicalLocation: 'Cavidad pélvica peritoneal y espacio retroperitoneal genital',
    iconName: 'Heart',
    morphology: {
      type: 'Órganos Reproductivos y Glandulares Gono-Endocrinos',
      stroma: 'Estroma cortical ovárico, miometrio liso uterino y túnica albugínea',
      parenchyma: 'Folículos ováricos (células de la granulosa y teca) / Endometrio secretor y túbulos seminíferos',
      functionalUnit: 'Folículo Ovárico / Oocito & Células de Sertoli/Leydig gonadales',
      morphoLesion: 'Atrofia folicular, disrupción de la esteroidogénesis, aborto espontáneo, teratogénesis y fallo ovárico prematuro'
    },
    toxicology: {
      mercury: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.93,
        impactDescription: 'Teratogénesis severa (Enfermedad de Minamata congénita), microcefalia fetal y muerte intrauterina.',
        cellularMechanism: 'Paso placentario irrestricto del metilmercurio vía transportador LAT1 concentrándose 30% más en feto que en madre.'
      },
      lead: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.95,
        impactDescription: 'Abortos espontáneos recurrentes, parto pretérmino, bajo peso al nacer y teratogénesis neurológica congénita.',
        cellularMechanism: 'Transferencia transplacentaria masiva de plomo sustituyendo al calcio en la organogénesis esquelética y cerebral fetal.'
      },
      cadmium: {
        severity: 'high',
        isPrimaryTarget: true,
        affinityFactor: 0.86,
        impactDescription: 'Necrosis placentaria isquémica, disfunción ovárica con anovulación y disminución de la síntesis de progesterona.',
        cellularMechanism: 'Acumulación selectiva en sincitiotrofoblasto placentario inhibiendo la aromatasa y enzimas esteroidogénicas.'
      },
      arsenic: {
        severity: 'critical',
        isPrimaryTarget: true,
        affinityFactor: 0.90,
        impactDescription: 'Muerte fetal intrauterina, restricción del crecimiento intrauterino y malformaciones congénitas vasculares.',
        cellularMechanism: 'Disrupción endotelial de arterias espirales uteroplacentarias y estrés genotóxico ovocitario.'
      }
    }
  }
];

export function getOrganMaster(organId: string): OrganMasterDefinition {
  const found = ALL_IMPORTANT_ORGANS.find(o => o.id === organId);
  if (found) return found;
  return ALL_IMPORTANT_ORGANS[0];
}

export function getOrganImpactForContaminant(organId: string, contaminantId: ContaminantId): TargetOrganImpact {
  const organ = getOrganMaster(organId);
  const tox = organ.toxicology[contaminantId] || organ.toxicology.mercury;
  
  return {
    organId: organ.id,
    organName: organ.name,
    severity: tox.severity,
    impactDescription: tox.impactDescription,
    cellularMechanism: tox.cellularMechanism,
    affinityFactor: tox.affinityFactor,
    category: organ.systemCategory
  };
}
