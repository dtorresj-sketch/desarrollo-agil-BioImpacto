export type SystemCategory = 
  | 'monitoring' 
  | 'simulation' 
  | 'toxicology' 
  | 'modeling' 
  | 'education' 
  | 'engineering' 
  | 'documentation';

export type SystemPageId = 
  | 'dashboard'
  | 'diorama'
  | 'motion_lab'
  | 'anatomy'
  | 'cellular'
  | 'kinetics'
  | 'twinkl_hub'
  | 'remediation_plant'
  | 'audit_reports'
  | 'knowledge_base';

export interface PageDefinition {
  id: SystemPageId;
  title: string;
  shortTitle: string;
  category: SystemCategory;
  description: string;
  iconName: string;
  badge?: string;
}

export interface CategoryDefinition {
  id: SystemCategory;
  name: string;
  description: string;
  iconName: string;
  color: string;
  pages: SystemPageId[];
}

export const SYSTEM_CATEGORIES: Record<SystemCategory, CategoryDefinition> = {
  monitoring: {
    id: 'monitoring',
    name: '1. Monitoreo & Dashboard',
    description: 'Métricas en tiempo real, estado de la cuenca y cumplimiento normativo',
    iconName: 'LayoutDashboard',
    color: 'from-blue-600 to-cyan-500',
    pages: ['dashboard']
  },
  simulation: {
    id: 'simulation',
    name: '2. Simulación Fluvial & Motion 2D',
    description: 'Diorama interactivo fotorrealista y laboratorio de Motion Graphics 2D',
    iconName: 'Waves',
    color: 'from-cyan-600 to-teal-500',
    pages: ['diorama', 'motion_lab']
  },
  toxicology: {
    id: 'toxicology',
    name: '3. Toxicología & Anatomía',
    description: 'Atlas 3D de órganos diana y microscopía celular molecular',
    iconName: 'Activity',
    color: 'from-purple-600 to-indigo-500',
    pages: ['anatomy', 'cellular']
  },
  modeling: {
    id: 'modeling',
    name: '4. Biofísica & Modelado',
    description: 'Cinética monocompartimental, bioconcentración BCF y biomagnificación BMF',
    iconName: 'Calculator',
    color: 'from-amber-600 to-yellow-500',
    pages: ['kinetics']
  },
  education: {
    id: 'education',
    name: '5. Educación Twinkl Go!',
    description: 'Puzzles tróficos, trivia, emparejamiento de órganos y diplomas',
    iconName: 'Sparkles',
    color: 'from-rose-600 to-amber-500',
    pages: ['twinkl_hub']
  },
  engineering: {
    id: 'engineering',
    name: '6. Ingeniería & Remediación',
    description: 'Reactores de precipitación, filtros de zeolitas y humedales de pulido',
    iconName: 'ShieldCheck',
    color: 'from-emerald-600 to-teal-500',
    pages: ['remediation_plant']
  },
  documentation: {
    id: 'documentation',
    name: '7. Auditoría & Casos',
    description: 'Generación de informes DS 90 y expedientes históricos mundiales',
    iconName: 'FileText',
    color: 'from-slate-600 to-slate-400',
    pages: ['audit_reports', 'knowledge_base']
  }
};

export const SYSTEM_PAGES: Record<SystemPageId, PageDefinition> = {
  dashboard: {
    id: 'dashboard',
    title: 'Centro de Control & Dashboard Global',
    shortTitle: 'Dashboard',
    category: 'monitoring',
    description: 'Visión ejecutiva de la cuenca hídrica, alertas tempranas y cumplimiento de estándares OMS/DS90.',
    iconName: 'LayoutDashboard',
    badge: 'En Vivo'
  },
  diorama: {
    id: 'diorama',
    title: 'Diorama Fluvial & Cadena Trófica',
    shortTitle: 'Simulador Fluvial',
    category: 'simulation',
    description: 'Lienzo animado interactivo desde el efluente de fundición hasta la pesca y consumo humano.',
    iconName: 'Waves',
    badge: '3D Fotorrealista'
  },
  motion_lab: {
    id: 'motion_lab',
    title: 'Estudio de Motion Graphics 2D & Cinemática',
    shortTitle: 'Motion Graphics 2D',
    category: 'simulation',
    description: 'Animaciones 2D vectoriales, dinámica de partículas en movimiento, campos vectoriales y física trófica interactiva.',
    iconName: 'Film',
    badge: '2D Motion FX'
  },
  anatomy: {
    id: 'anatomy',
    title: 'Atlas Anatómico 3D & Órganos Diana',
    shortTitle: 'Atlas Anatómico',
    category: 'toxicology',
    description: 'Exploración de los 18 órganos diana, mapa de calor de bioacumulación y síntomas clínicos.',
    iconName: 'Activity'
  },
  cellular: {
    id: 'cellular',
    title: 'Microscopio Celular & Estrés Oxidativo',
    shortTitle: 'Microscopio Celular',
    category: 'toxicology',
    description: 'Mecanismos moleculares de daño: inhibición enzimática, mimetismo catiónico y quelación.',
    iconName: 'Microscope'
  },
  kinetics: {
    id: 'kinetics',
    title: 'Laboratorio Matemático & Toxicocinética',
    shortTitle: 'Modelado Cinético',
    category: 'modeling',
    description: 'Ecuaciones diferenciales, tiempo de vida media (t1/2), dosis-respuesta y factores BCF/BMF.',
    iconName: 'Calculator'
  },
  twinkl_hub: {
    id: 'twinkl_hub',
    title: 'Centro Educativo & Misiones Twinkl Go!',
    shortTitle: 'Misiones Twinkl Go!',
    category: 'education',
    description: 'Puzzles tróficos, trivia con vidas, simulador clínico y diploma digital imprimible.',
    iconName: 'Sparkles',
    badge: 'Gamificado'
  },
  remediation_plant: {
    id: 'remediation_plant',
    title: 'Planta de Tratamiento & Filtros Industriales',
    shortTitle: 'Planta de Tratamiento',
    category: 'engineering',
    description: 'Diseño modular de reactores químicos Ca(OH)2, columnas de zeolita y humedales biológicos.',
    iconName: 'ShieldCheck'
  },
  audit_reports: {
    id: 'audit_reports',
    title: 'Generador de Auditoría & Informes Técnicos',
    shortTitle: 'Informes & Auditoría',
    category: 'documentation',
    description: 'Generación de informes toxicológicos y ambientales exportables con cumplimiento legal.',
    iconName: 'FileText'
  },
  knowledge_base: {
    id: 'knowledge_base',
    title: 'Base de Conocimiento & Casos Históricos',
    shortTitle: 'Casos Históricos',
    category: 'documentation',
    description: 'Expedientes documentales: Quintero-Puchuncaví, Chañaral, Bahía de Minamata, Río Jinzu.',
    iconName: 'BookOpen'
  }
};
