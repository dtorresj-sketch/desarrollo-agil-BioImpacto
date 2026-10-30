import { ContaminantProfile } from '../types';

/**
 * ============================================================================
 * MODELO AMBIENTAL Y TOXICOCINÉTICO DE BioTrófica
 * ============================================================================
 *
 * Todas las funciones de este módulo son puras y deterministas: son la única
 * fuente de verdad del modelo científico y están cubiertas por tests
 * (src/utils/__tests__/mathModels.test.ts).
 *
 * Convenio de unidades
 *   - Concentración en agua ....... mg/L  (≡ ppm en agua dulce)
 *   - Concentración en biota ...... mg/kg (≡ ppm en peso húmedo)
 *   - Emisión ..................... kg/día
 *   - Caudal ...................... m³/día
 *   - Constantes de eliminación ... día⁻¹
 *   - Volumen de distribución ..... L/kg de peso corporal
 */

// ---------------------------------------------------------------------------
// 1. BALANCE DE MASA EN LA COLUMNA DE AGUA
// ---------------------------------------------------------------------------

/** Caudal por defecto del río receptor (m³/día) ≈ 3,5 m³/s. */
export const DEFAULT_RIVER_FLOW_M3_DAY = 300_000;

/** Concentración de fondo natural del cuerpo receptor (mg/L). */
export const DEFAULT_BACKGROUND_PPM = 0.0002;

export interface WaterBalanceInput {
  /** Emisión bruta de la planta industrial (kg/día). */
  dischargeKgDay: number;
  /** Eficiencia del tren de filtración, 0–100 (%). */
  filtrationEfficiencyPct: number;
  /** Caudal del río receptor (m³/día). */
  riverFlowM3Day?: number;
  /** Concentración de fondo (mg/L). */
  backgroundPpm?: number;
}

/**
 * Balance de masa en régimen estacionario para un vertido puntual:
 *
 *   C_agua = E_bruta · (1 − η) / Q  +  C_fondo
 *
 * Con E en kg/día y Q en m³/día, el cociente kg/m³ se convierte a mg/L
 * multiplicando por 10⁶ mg/kg ÷ 10³ L/m³ = 10³.
 *
 * A diferencia del modelo anterior (que acumulaba el vertido sin dilución y
 * crecía sin cota), esta formulación es estacionaria: subir la filtración
 * baja la concentración, que es la relación pedagógica que el simulador quiere
 * enseñar.
 */
export function calculateWaterConcentration({
  dischargeKgDay,
  filtrationEfficiencyPct,
  riverFlowM3Day = DEFAULT_RIVER_FLOW_M3_DAY,
  backgroundPpm = DEFAULT_BACKGROUND_PPM,
}: WaterBalanceInput): number {
  const flow = Math.max(1, riverFlowM3Day);
  const efficiency = clamp(filtrationEfficiencyPct / 100, 0, 0.999);
  const netLoadKgDay = Math.max(0, dischargeKgDay) * (1 - efficiency);
  return (netLoadKgDay / flow) * 1000 + Math.max(0, backgroundPpm);
}

// ---------------------------------------------------------------------------
// 2. BIOCONCENTRACIÓN Y BIOMAGNIFICACIÓN TRÓFICA
// ---------------------------------------------------------------------------

/**
 * Bioconcentración: BCF = C_organismo / C_agua.
 *
 * IMPORTANTE — corrección de modelo: el BCF se define SIEMPRE respecto del
 * agua, nunca respecto de la presa. Encadenar BCF_fito · BCF_pez (como hacía
 * la versión anterior y la documentación técnica) multiplica factores del
 * orden de 10³ y produce concentraciones de miles de ppm, físicamente
 * imposibles. La transferencia entre niveles tróficos se modela con BMF.
 */
export function calculateBCF(waterPpm: number, bcf: number): number {
  return Math.max(0, waterPpm) * Math.max(0, bcf);
}

/** Biomagnificación entre niveles tróficos: C_depredador = C_presa · BMF. */
export function calculateBMF(preyPpm: number, bmf: number): number {
  return Math.max(0, preyPpm) * Math.max(0, bmf);
}

export interface TrophicChainResult {
  waterPpm: number;
  phytoplanktonPpm: number;
  smallFishPpm: number;
  largeFishPpm: number;
  /** Factor de magnificación total desde el agua hasta el depredador tope. */
  totalMagnification: number;
}

/**
 * Cadena trófica completa en estado estacionario.
 *
 *   C_fito   = C_agua · BCF_fito                  (bioconcentración)
 *   C_pez_p  = C_agua · BCF_pez                   (bioconcentración, NO BCF_fito · BCF_pez)
 *   C_pez_g  = C_pez_p · BMF                      (biomagnificación trófica)
 */
export function calculateTrophicChain(
  contaminant: ContaminantProfile,
  waterPpm: number,
): TrophicChainResult {
  const water = Math.max(0, waterPpm);
  const phytoplanktonPpm = calculateBCF(water, contaminant.bcfPhytoplankton);
  const smallFishPpm = calculateBCF(water, contaminant.bcfSmallFish);
  const largeFishPpm = calculateBMF(smallFishPpm, contaminant.bmfPredator);

  return {
    waterPpm: water,
    phytoplanktonPpm,
    smallFishPpm,
    largeFishPpm,
    totalMagnification: water > 0 ? largeFishPpm / water : 0,
  };
}

// ---------------------------------------------------------------------------
// 3. CINÉTICA DE PRIMER ORDEN (compartimento único)
// ---------------------------------------------------------------------------

/** Constante de eliminación a partir de la semivida biológica: k_e = ln2 / t½. */
export function eliminationConstantFromHalfLife(halfLifeDays: number): number {
  if (halfLifeDays <= 0) return 0;
  return Math.LN2 / halfLifeDays;
}

/**
 * Avance temporal exacto de un compartimento con entrada constante:
 *
 *   dC/dt = R − k_e·C   ⟹   C(t+Δt) = C_ss + (C(t) − C_ss)·e^(−k_e·Δt)
 *
 * donde C_ss = R / k_e. Es estable para cualquier Δt, a diferencia de un
 * Euler explícito, y por eso se usa también en el bucle de animación.
 */
export function stepFirstOrderKinetics(
  currentPpm: number,
  inputRatePpmPerDay: number,
  eliminationConstant: number,
  deltaDays: number,
): number {
  if (eliminationConstant <= 0) {
    return Math.max(0, currentPpm + inputRatePpmPerDay * deltaDays);
  }
  const steadyState = inputRatePpmPerDay / eliminationConstant;
  const decay = Math.exp(-eliminationConstant * deltaDays);
  return Math.max(0, steadyState + (currentPpm - steadyState) * decay);
}

/** Decaimiento puro tras cesar la exposición: C(t) = C₀·e^(−k_e·t). */
export function decayConcentration(
  initialPpm: number,
  eliminationConstant: number,
  days: number,
): number {
  return Math.max(0, initialPpm) * Math.exp(-Math.max(0, eliminationConstant) * Math.max(0, days));
}

// ---------------------------------------------------------------------------
// 4. MODELO TOXICOCINÉTICO HUMANO
// ---------------------------------------------------------------------------

export interface ToxicokineticResult {
  dailyIntakeMg: number;
  steadyStateConcentrationPpm: number;
  currentConcentrationPpm: number;
  totalBodyBurdenMg: number;
  halfLifeDays: number;
  timeToSteadyStateDays: number;
  /** Fracción del estado estacionario alcanzada al final del periodo (0–1). */
  fractionOfSteadyState: number;
  /** HQ = (ingesta diaria / peso) / RfD. HQ > 1 ⇒ riesgo. */
  hazardQuotientHQ: number;
  /** Ingesta semanal como % de la ingesta semanal tolerable provisional. */
  percentOfPtwi: number | null;
  timeSeriesData: { day: number; concentration: number; safeThreshold: number }[];
}

export function simulateToxicokinetics(
  contaminant: ContaminantProfile,
  fishConcentrationPpm: number,
  fishPortionsPerWeek: number,
  portionWeightGrams = 200,
  humanWeightKg = 70,
  durationMonths = 6,
): ToxicokineticResult {
  const weight = Math.max(1, humanWeightKg);
  const kgFishPerDay = (Math.max(0, fishPortionsPerWeek) * Math.max(0, portionWeightGrams)) / 7 / 1000;
  const dailyIntakeMg = Math.max(0, fishConcentrationPpm) * kgFishPerDay;

  // k_e se deriva de la semivida: una sola fuente de verdad.
  const ke = eliminationConstantFromHalfLife(contaminant.halfLifeHumansDays);
  const vd = contaminant.volumeDistributionL * weight; // L
  const halfLife = contaminant.halfLifeHumansDays;
  const timeToSteadyState = 4.32 * halfLife; // ≈95 % del estado estacionario

  // Tasa de aporte expresada en concentración: R = D / V_d  (mg/L/día)
  const inputRatePpmPerDay = vd > 0 ? dailyIntakeMg / vd : 0;
  const cSteadyState = ke > 0 ? inputRatePpmPerDay / ke : Infinity;

  const totalDays = Math.max(1, Math.round(durationMonths * 30.44));
  const step = Math.max(1, Math.floor(totalDays / 60));
  const timeSeriesData: ToxicokineticResult['timeSeriesData'] = [];

  let currentConc = 0;
  for (let day = 0; day <= totalDays; day += step) {
    currentConc =
      ke > 0
        ? cSteadyState * (1 - Math.exp(-ke * day))
        : inputRatePpmPerDay * day;
    timeSeriesData.push({
      day,
      // Se guarda el valor completo: redondear a 4 decimales borraba por
      // completo la curva del arsénico y del mercurio a dosis bajas.
      concentration: currentConc,
      safeThreshold: contaminant.criticalDosePpm,
    });
  }

  const dailyDosePerKg = dailyIntakeMg / weight;
  const hazardQuotientHQ =
    contaminant.referenceDoseRDA > 0 ? dailyDosePerKg / contaminant.referenceDoseRDA : 0;

  const percentOfPtwi =
    contaminant.ptwiMgPerKgWeek && contaminant.ptwiMgPerKgWeek > 0
      ? (dailyDosePerKg * 7) / contaminant.ptwiMgPerKgWeek * 100
      : null;

  return {
    dailyIntakeMg,
    steadyStateConcentrationPpm: cSteadyState,
    currentConcentrationPpm: currentConc,
    totalBodyBurdenMg: currentConc * vd,
    halfLifeDays: halfLife,
    timeToSteadyStateDays: timeToSteadyState,
    fractionOfSteadyState: Number.isFinite(cSteadyState) && cSteadyState > 0 ? currentConc / cSteadyState : 0,
    hazardQuotientHQ,
    percentOfPtwi,
    timeSeriesData,
  };
}

// ---------------------------------------------------------------------------
// 5. RELACIÓN DOSIS-RESPUESTA
// ---------------------------------------------------------------------------

/** Curva sigmoide de Hill: R(%) = 100 / (1 + (ED50/D)^n). */
export function calculateDoseResponse(dose: number, ed50 = 0.05, hillCoeff = 2.5): number {
  if (dose <= 0 || ed50 <= 0) return 0;
  return 100 / (1 + Math.pow(ed50 / dose, hillCoeff));
}

// ---------------------------------------------------------------------------
// 6. EVALUACIÓN NORMATIVA
// ---------------------------------------------------------------------------

export type ComplianceStatus = 'cumple' | 'excede';

export interface ComplianceResult {
  status: ComplianceStatus;
  limitPpm: number;
  measuredPpm: number;
  /** Veces que la medición supera el límite (1 = exactamente en el límite). */
  ratio: number;
  reference: string;
}

/** Compara la concentración en agua con el límite del contaminante (DS 90/2000). */
export function evaluateWaterCompliance(
  contaminant: ContaminantProfile,
  measuredPpm: number,
): ComplianceResult {
  const limit = contaminant.regulatoryLimits.ds90WaterPpm;
  return {
    status: measuredPpm <= limit ? 'cumple' : 'excede',
    limitPpm: limit,
    measuredPpm,
    ratio: limit > 0 ? measuredPpm / limit : 0,
    reference: contaminant.regulatoryLimits.ds90Reference,
  };
}

/** Compara la concentración en músculo de pez con el límite alimentario. */
export function evaluateFishCompliance(
  contaminant: ContaminantProfile,
  measuredPpm: number,
): ComplianceResult {
  const limit = contaminant.regulatoryLimits.foodFishPpm;
  return {
    status: measuredPpm <= limit ? 'cumple' : 'excede',
    limitPpm: limit,
    measuredPpm,
    ratio: limit > 0 ? measuredPpm / limit : 0,
    reference: contaminant.regulatoryLimits.foodReference,
  };
}

// ---------------------------------------------------------------------------

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
