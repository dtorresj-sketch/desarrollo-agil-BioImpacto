export type ContaminantId = 'mercury' | 'lead' | 'cadmium' | 'arsenic';

export type OrganIdentifier = 
  | 'brain' 
  | 'heart' 
  | 'lungs' 
  | 'liver' 
  | 'gallbladder'
  | 'kidneys' 
  | 'bladder'
  | 'stomach' 
  | 'pancreas' 
  | 'spleen' 
  | 'small_intestine'
  | 'large_intestine'
  | 'reproductive'
  | 'bones' 
  | 'blood' 
  | 'thyroid' 
  | 'skin' 
  | 'nervous_system';

export interface TargetOrganImpact {
  organId: OrganIdentifier;
  organName: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  impactDescription: string;
  cellularMechanism: string;
  affinityFactor: number; // 0 to 1 relative affinity
  category?: 'nervous' | 'circulatory' | 'respiratory' | 'digestive' | 'renal' | 'skeletal' | 'endocrine' | 'skin' | 'immune' | 'reproductive';
}

/**
 * Límites normativos aplicables. Se guardan por contaminante y con la
 * referencia explícita de la norma, en lugar de estar codificados en la vista.
 */
export interface RegulatoryLimits {
  /** Límite de descarga a cuerpos fluviales, DS 90/2000 MINSEGPRES, Tabla 1 (mg/L). */
  ds90WaterPpm: number;
  ds90Reference: string;
  /** Límite en músculo de pescado para consumo humano (mg/kg peso húmedo). */
  foodFishPpm: number;
  foodReference: string;
}

export interface ContaminantProfile {
  id: ContaminantId;
  name: string;
  chemicalSymbol: string;
  chemicalFormula: string;
  color: string;
  glowColor: string;
  particleColor: string;
  category: string;
  description: string;
  sourceIndustry: string;
  waterSolubility: string;
  
  // Mathematical and Toxicokinetic Constants
  bcfPhytoplankton: number; // Bioaccumulation factor in primary producers
  bcfSmallFish: number;     // Bioaccumulation factor in primary consumers
  bmfPredator: number;       // Biomagnification factor in apex fish (e.g. Tuna)
  halfLifeHumansDays: number; // Biological half-life in human body (days)
  halfLifeFishDays: number;   // Half-life in marine fauna (days)
  referenceDoseRDA: number;  // mg/kg/day safe reference dose (RfD)
  criticalDosePpm: number;   // Dangerous human blood/tissue concentration (ppm or mg/L)
  volumeDistributionL: number; // V_d in L/kg
  /** Ingesta semanal tolerable provisional JECFA/OMS (mg/kg peso corporal/semana). */
  ptwiMgPerKgWeek?: number;

  /** Límites normativos con su fuente. */
  regulatoryLimits: RegulatoryLimits;

  /** Procedencia de las constantes toxicocinéticas usadas arriba. */
  dataSources: string[];

  // Real Historical Benchmark Case
  historicalCase: {
    title: string;
    location: string;
    year: string;
    summary: string;
  };
  
  // Clinical Information
  acuteSymptoms: string[];
  chronicSymptoms: string[];
  targetOrgans: TargetOrganImpact[];
  chelatingAgent: {
    name: string;
    mechanism: string;
    effectiveness: string;
  };
  environmentalSolution: string;
}

export type TrophicLevel = 'water' | 'phytoplankton' | 'small_fish' | 'large_fish' | 'human';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  alpha: number;
  absorbed: boolean;
}

export interface FishEntity {
  id: string;
  type: 'small' | 'large';
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  contaminationPpm: number;
  maxHealthyPpm: number;
  digestionTimer: number;
  color: string;
  tailAngle: number;
  tailSpeed: number;
  direction: 1 | -1;
  isDragging?: boolean;
}

export type SimPhase = 1 | 2 | 3 | 4 | 5;

export interface SimulationState {
  isPlaying: boolean;
  phase: SimPhase;
  dischargeRateKgDay: number; // 1 to 100 kg/day industrial emission
  filtrationEfficiency: number; // 0% to 100% industrial filter
  contaminantId: ContaminantId;
  
  // Dynamic Environment & Ecosystem Concentrations (ppm / mg/kg)
  waterConcentrationPpm: number;
  phytoplanktonPpm: number;
  smallFishPpm: number;
  largeFishPpm: number;
  
  // Human Intake & Body Burden
  humanWeightKg: number;
  fishPortionsPerMonth: number;
  exposureMonths: number;
  humanAccumulatedDoseMg: number;
  humanTissueConcentrationPpm: number;
  fishConsumedCount: number;
  
  // Flags
  soundEnabled: boolean;
  mathModeActive: boolean;
  selectedOrgan: string | null;
  activeModal: 'remediation' | 'report' | 'fish_inspect' | null;
}
