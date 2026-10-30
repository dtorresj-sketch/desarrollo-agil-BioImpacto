import { describe, expect, it } from 'vitest';
import { CONTAMINANT_PROFILES } from '../../data/contaminants';
import {
  calculateBCF,
  calculateBMF,
  calculateDoseResponse,
  calculateTrophicChain,
  calculateWaterConcentration,
  decayConcentration,
  eliminationConstantFromHalfLife,
  evaluateFishCompliance,
  evaluateWaterCompliance,
  simulateToxicokinetics,
  stepFirstOrderKinetics,
  DEFAULT_RIVER_FLOW_M3_DAY,
} from '../mathModels';

const mercury = CONTAMINANT_PROFILES.mercury;
const cadmium = CONTAMINANT_PROFILES.cadmium;

describe('balance de masa en agua', () => {
  it('aplica C = E(1-η)/Q + C_fondo con conversión kg/m³ → mg/L', () => {
    const result = calculateWaterConcentration({
      dischargeKgDay: 30,
      filtrationEfficiencyPct: 0,
      riverFlowM3Day: DEFAULT_RIVER_FLOW_M3_DAY,
      backgroundPpm: 0,
    });
    // 30 kg/día ÷ 300.000 m³/día = 1e-4 kg/m³ = 0,1 mg/L
    expect(result).toBeCloseTo(0.1, 6);
  });

  it('subir la filtración reduce la concentración de forma monótona', () => {
    const values = [0, 25, 50, 75, 95].map((eff) =>
      calculateWaterConcentration({ dischargeKgDay: 30, filtrationEfficiencyPct: eff }),
    );
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1]);
    }
  });

  it('nunca baja de la concentración de fondo', () => {
    const result = calculateWaterConcentration({
      dischargeKgDay: 0,
      filtrationEfficiencyPct: 100,
      backgroundPpm: 0.0002,
    });
    expect(result).toBeCloseTo(0.0002, 8);
  });
});

describe('cadena trófica', () => {
  it('el BCF se refiere al agua, no a la presa', () => {
    const chain = calculateTrophicChain(mercury, 0.001);
    expect(chain.smallFishPpm).toBeCloseTo(calculateBCF(0.001, mercury.bcfSmallFish), 10);
    // Regresión: el modelo antiguo encadenaba BCF_fito·BCF_pez.
    const modeloAntiguo = 0.001 * mercury.bcfPhytoplankton * mercury.bcfSmallFish;
    expect(chain.smallFishPpm).toBeLessThan(modeloAntiguo / 1000);
  });

  it('produce concentraciones físicamente plausibles (< 1000 mg/kg)', () => {
    for (const profile of Object.values(CONTAMINANT_PROFILES)) {
      const chain = calculateTrophicChain(profile, 0.01);
      expect(chain.largeFishPpm).toBeLessThan(1000);
      expect(chain.largeFishPpm).toBeGreaterThan(chain.smallFishPpm);
    }
  });

  it('el depredador aplica exactamente el BMF sobre su presa', () => {
    const chain = calculateTrophicChain(cadmium, 0.005);
    expect(chain.largeFishPpm).toBeCloseTo(calculateBMF(chain.smallFishPpm, cadmium.bmfPredator), 10);
  });
});

describe('cinética de primer orden', () => {
  it('k_e coincide con ln2/t½ para todos los contaminantes', () => {
    for (const profile of Object.values(CONTAMINANT_PROFILES)) {
      const ke = eliminationConstantFromHalfLife(profile.halfLifeHumansDays);
      expect(decayConcentration(1, ke, profile.halfLifeHumansDays)).toBeCloseTo(0.5, 6);
    }
  });

  it('converge al estado estacionario R/k_e y es estable con Δt grande', () => {
    const ke = 0.1;
    const rate = 0.5;
    let c = 0;
    for (let i = 0; i < 500; i++) c = stepFirstOrderKinetics(c, rate, ke, 1);
    expect(c).toBeCloseTo(rate / ke, 6);

    // Un único paso enorme debe dar el mismo estacionario, no divergir.
    expect(stepFirstOrderKinetics(0, rate, ke, 10_000)).toBeCloseTo(rate / ke, 6);
  });

  it('sin aporte, decae y nunca se vuelve negativo', () => {
    let c = 10;
    for (let i = 0; i < 100; i++) c = stepFirstOrderKinetics(c, 0, 0.3, 1);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThan(1e-6);
  });
});

describe('modelo toxicocinético humano', () => {
  it('la ingesta diaria escala con porciones y concentración', () => {
    const a = simulateToxicokinetics(mercury, 0.5, 2);
    const b = simulateToxicokinetics(mercury, 0.5, 4);
    expect(b.dailyIntakeMg).toBeCloseTo(a.dailyIntakeMg * 2, 10);
  });

  it('un pescado limpio no genera carga corporal', () => {
    const result = simulateToxicokinetics(mercury, 0, 4);
    expect(result.currentConcentrationPpm).toBe(0);
    expect(result.hazardQuotientHQ).toBe(0);
  });

  it('la serie temporal es monótona creciente y conserva resolución', () => {
    const { timeSeriesData } = simulateToxicokinetics(mercury, 0.3, 3, 200, 70, 6);
    for (let i = 1; i < timeSeriesData.length; i++) {
      expect(timeSeriesData[i].concentration).toBeGreaterThanOrEqual(
        timeSeriesData[i - 1].concentration,
      );
    }
    // Regresión: el redondeo a 4 decimales aplanaba la curva a cero.
    expect(timeSeriesData[timeSeriesData.length - 1].concentration).toBeGreaterThan(0);
  });

  it('HQ > 1 cuando la ingesta supera la dosis de referencia', () => {
    const result = simulateToxicokinetics(mercury, 1.0, 7, 200, 70, 6);
    expect(result.hazardQuotientHQ).toBeGreaterThan(1);
  });

  it('el plomo prácticamente no alcanza el estacionario en 6 meses', () => {
    const result = simulateToxicokinetics(CONTAMINANT_PROFILES.lead, 0.4, 4, 200, 70, 6);
    expect(result.fractionOfSteadyState).toBeLessThan(0.05);
  });
});

describe('dosis-respuesta', () => {
  it('es monótona y acotada a [0, 100]', () => {
    const doses = [0, 0.01, 0.05, 0.1, 1, 10];
    const values = doses.map((d) => calculateDoseResponse(d, 0.05, 2.5));
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1] - 1e-9);
  });

  it('en ED50 la respuesta es 50 %', () => {
    expect(calculateDoseResponse(0.05, 0.05, 2.5)).toBeCloseTo(50, 6);
  });
});

describe('evaluación normativa', () => {
  it('usa el límite propio de cada contaminante', () => {
    // Regresión: el ternario antiguo daba 0,05 ppm al cadmio y lo declaraba conforme.
    const cd = evaluateWaterCompliance(cadmium, 0.02);
    expect(cd.limitPpm).toBe(0.01);
    expect(cd.status).toBe('excede');

    const hg = evaluateWaterCompliance(mercury, 0.0005);
    expect(hg.status).toBe('cumple');
  });

  it('todos los perfiles declaran límites y fuentes', () => {
    for (const profile of Object.values(CONTAMINANT_PROFILES)) {
      expect(profile.regulatoryLimits.ds90WaterPpm).toBeGreaterThan(0);
      expect(profile.regulatoryLimits.ds90Reference.length).toBeGreaterThan(10);
      expect(profile.dataSources.length).toBeGreaterThan(0);
      expect(evaluateFishCompliance(profile, 0).status).toBe('cumple');
    }
  });
});
