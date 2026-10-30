# BioTrófica

Simulador educativo interactivo de **bioacumulación y biomagnificación trófica** de metales pesados (Hg, Pb, Cd, As) en un ecosistema fluvial, y de su impacto toxicocinético en el ser humano.

> ⚠️ **Herramienta educativa.** Los informes que genera son ejercicios de simulación a partir de parámetros introducidos por el usuario. No son mediciones de laboratorio ni dictámenes periciales y no deben presentarse como tales ante ninguna autoridad.

---

## Puesta en marcha

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:3000
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Verifica tipos y compila a `dist/` |
| `npm run typecheck` | `tsc --noEmit` en modo estricto |
| `npm run lint` | ESLint sobre `src/` |
| `npm run format` | Prettier |
| `npm test` | Tests del modelo científico (Vitest) |

Requisitos: Node.js ≥ 20.

---

## Arquitectura

```
src/
├── App.tsx                 Estado global y enrutado por página (lazy)
├── components/             Componentes reutilizables y canvas de simulación
├── pages/                  Una página por módulo del sistema
├── data/
│   ├── contaminants.ts     Perfiles toxicológicos + constantes + límites normativos
│   └── organs.ts           Atlas de órganos diana
├── types.ts                Contratos de dominio
└── utils/
    ├── mathModels.ts       ★ Única fuente de verdad del modelo científico
    ├── audio.ts            Síntesis de efectos con Web Audio API
    ├── downloadHelpers.ts  Exportación de informes
    └── exportProjectZip.ts Exportación del código fuente (JSZip)
```

**Regla de oro:** toda ecuación vive en `src/utils/mathModels.ts`, es una función pura y está cubierta por tests. Los componentes no calculan ciencia, sólo la presentan.

---

## Modelo científico

### 1. Balance de masa en la columna de agua

$$C_{agua} = \frac{E \cdot (1-\eta)}{Q} + C_{fondo}$$

con `E` en kg/día, `Q` en m³/día y el resultado en mg/L. Es un modelo **estacionario**: aumentar la eficiencia de filtración baja la concentración, que es la relación que el simulador enseña.

### 2. Bioconcentración y biomagnificación

$$C_{fito} = C_{agua}\cdot BCF_{fito} \qquad C_{pez} = C_{agua}\cdot BCF_{pez} \qquad C_{depredador} = C_{pez}\cdot BMF$$

> El BCF se define **siempre respecto del agua**, nunca respecto de la presa. Encadenar `BCF_fito · BCF_pez` multiplica factores del orden de 10³ y produce concentraciones de miles de mg/kg, físicamente imposibles. La transferencia entre niveles tróficos se modela con BMF.

### 3. Cinética de primer orden (biota y humano)

$$k_e = \frac{\ln 2}{t_{1/2}} \qquad \frac{dC}{dt} = R - k_e C \qquad C(t+\Delta t) = C_{ss} + (C(t)-C_{ss})e^{-k_e\Delta t}$$

Se integra con la **solución analítica**, estable para cualquier `Δt`. Tanto los peces como el compartimento humano se depuran: si el agua se limpia, la carga baja.

### 4. Riesgo

- Cociente de peligro: `HQ = (ingesta diaria / peso) / RfD`; `HQ > 1` indica riesgo.
- Comparación con la PTWI de JECFA cuando existe.
- Curva de Hill dosis-respuesta: `R(%) = 100 / (1 + (ED50/D)^n)`.

### Escala temporal

Un segundo de animación equivale a **3 días simulados** (`SIM_DAYS_PER_SECOND`). Sin esa escala, semividas de días a décadas serían invisibles. El bucle usa *delta-time* real, de modo que la simulación avanza igual en pantallas de 60 Hz y de 120 Hz.

---

## Datos y trazabilidad

Cada contaminante en `src/data/contaminants.ts` declara:

- Constantes toxicocinéticas (BCF, BMF, t½, V_d, RfD, dosis crítica).
- `regulatoryLimits`: límite DS 90/2000 en agua y límite alimentario en músculo de pescado, **cada uno con su referencia**.
- `dataSources`: procedencia de las constantes (ATSDR, EPA IRIS, JECFA).

`k_e` se **deriva** de `t½`; no se almacena por separado para evitar dos fuentes de verdad que puedan divergir.

Los valores normativos deben verificarse contra la edición vigente del DS 90/2000 MINSEGPRES y del Reglamento Sanitario de los Alimentos antes de usarlos con fines académicos formales.

---

## Limitaciones conocidas

- El compartimento humano es de **un solo compartimento**. Para el plomo (semivida ósea de décadas) esto sobreestima la concentración en sangre; un modelo de 2–3 compartimentos sería más fiel.
- No se modelan especiación química, temperatura, pH, sedimentación ni dieta mixta.
- La animación es cualitativa: las partículas son un recurso pedagógico, no un método de volúmenes finitos.
- Los estados de cumplimiento son orientativos y dependen de que los límites cargados estén actualizados.

---

## Licencia

Pendiente de definir por el equipo.
