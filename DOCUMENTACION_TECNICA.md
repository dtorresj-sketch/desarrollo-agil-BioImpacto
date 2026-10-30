# BioTrófica: Simulador Hidrológico & Modelo Toxicocinético Multicompartimental

## 1. Resumen Ejecutivo
**BioTrófica** es una plataforma científica y pedagógica interactiva diseñada para modelar y visualizar la bioacumulación y biomagnificación de contaminantes metálicos y metaloides pesados (**Mercurio $\text{CH}_3\text{Hg}^+$, Plomo $\text{Pb}^{2+}$, Cadmio $\text{Cd}^{2+}$, Arsénico $\text{As}^{3+}$**) a lo largo de redes tróficas dulceacuícolas y su impacto en la salud pública humana.

---

## 2. Fundamentos Matemáticos y Ecuaciones Toxicocinéticas

### 2.1. Balance de Masa en el Ecosistema Fluvial
La concentración en la columna de agua $C_{\text{agua}}$ en función del vertido industrial:
$$C_{\text{agua}} (\text{ppm}) = \frac{E_{\text{bruta}} \cdot (1 - \eta_{\text{filtro}})}{Q_{\text{río}}} + C_{\text{fondo}}$$
- $E_{\text{bruta}}$: Caudal másico de emisión industrial ($\text{kg/día}$).
- $\eta_{\text{filtro}}$: Eficiencia de retención del tren de filtración de la planta ($0 \le \eta \le 0.95$).
- $Q_{\text{río}}$: Caudal volumétrico del receptor fluvial.

### 2.2. Bioconcentración y Biomagnificación Trófica

> **Corrección de modelo (v2).** La versión anterior de este documento encadenaba
> $C_{\text{pez}} = C_{\text{fito}} \cdot BCF_{\text{pez}}$. Eso es incorrecto: el
> BCF se define **siempre respecto de la concentración en agua**, no respecto de la
> presa. Encadenarlos multiplicaba factores del orden de $10^3$ y producía
> concentraciones de decenas de miles de mg/kg, físicamente imposibles.

- **Fitoplancton (Productores Primarios)**:
  $$C_{\text{fito}} = C_{\text{agua}} \cdot BCF_{\text{fito}}$$
- **Peces Pequeños (Consumidores Primarios)** — bioconcentración desde el agua:
  $$C_{\text{pez\_pequeño}} = C_{\text{agua}} \cdot BCF_{\text{pez}}$$
- **Trucha Fario / Depredador Tope** — biomagnificación trófica:
  $$C_{\text{depredador}} = C_{\text{pez\_pequeño}} \cdot BMF_{\text{depredador}}$$

Ambos niveles se integran además con cinética de primer orden, de modo que la
carga en biota **decae** cuando la columna de agua se limpia:
$$C(t+\Delta t) = C_{eq} + \left(C(t) - C_{eq}\right)e^{-k_e \Delta t}$$

### 2.3. Modelo Compartimental Humano de Primer Orden
- **Dosis Ingerida por Porción de Pescado** ($M_{\text{porción}} = 0.20\,\text{kg}$):
  $$D (\text{mg}) = C_{\text{depredador}} (\text{mg/kg}) \cdot M_{\text{porción}}$$
- **Volumen de Distribución Aparente** ($V_d^{\text{total}}$):
  $$V_d^{\text{total}} = V_d \cdot W_{\text{corporal}} \quad (\text{Litros})$$
- **Incremento de Carga Tisular**:
  $$\Delta C_{\text{humano}} (\text{ppm}) = \frac{D}{V_d^{\text{total}}}$$
- **Cinética de Eliminación**:
  $$k_e = \frac{\ln(2)}{t_{1/2}} \quad\text{(derivado, nunca almacenado por separado)}$$
  $$C(t) = C_0 \cdot e^{-k_e \cdot t}$$

---

## 3. Matriz de Constantes por Contaminante

| Contaminante | Fórmula | BCF fito | BCF pez | BMF | t½ humano | V_d (L/kg) | RfD (mg/kg/d) | Dosis crítica | Límite DS 90 (agua) | Caso histórico |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Metilmercurio | CH₃Hg⁺ | 1500 | 8000 | 5,5× | 70 d | 1,7 | 1×10⁻⁴ | 0,05 ppm | 0,001 mg/L | Minamata (1956) |
| Plomo | Pb²⁺ | 800 | 2500 | 3,2× | 7300 d (~20 a) | 2,1 | 3,5×10⁻³ | 0,20 ppm | 0,05 mg/L | Flint (2014) |
| Cadmio | Cd²⁺ | 1200 | 3100 | 2,8× | 9125 d (~25 a) | 1,5 | 1×10⁻³ | 0,015 ppm | 0,01 mg/L | Itai-Itai (1912) |
| Arsénico | As(III) | 600 | 1800 | 2,2× | 4 d | 0,4 | 3×10⁻⁴ | 0,02 ppm | 0,5 mg/L | Antofagasta HACRE (1958) |

> Esta tabla se genera a partir de `src/data/contaminants.ts`, que es la fuente de
> verdad. La versión anterior del documento listaba valores distintos de los del
> código (BMF, BCF y V_d desalineados en los cuatro contaminantes). Cada perfil
> declara además su campo `dataSources` con la procedencia (ATSDR, EPA IRIS, JECFA)
> y `regulatoryLimits` con la referencia normativa. **Verificar contra la edición
> vigente del DS 90/2000 antes de un uso académico formal.**

---

## 4. Órganos Diana Modelados (18 Sistemas)
1. **Encéfalo / SNC**: Ataxia, pérdida concéntrica de campo visual, microcefalia.
2. **Riñones**: Necrosis tubular aguda, proteinuria de bajo peso molecular.
3. **Sistema Óseo**: Sustitución de $\text{Ca}^{2+}$ en hidroxiapatita, osteomalacia.
4. **Sistema Hematopoyético**: Inhibición de ALAD y ferroquelatasa (anemia microcítica).
5. **Piel y Tegumentos**: Hiperqueratosis palmoplantar, leucodermia, líneas de Mees.
6. **Hígado / Vías Biliares**: Colestasis, angiosarcoma hepático, desacoplamiento mitocondrial.
7. **Corazón / Sistema Circulatorio**: Aterosclerosis acelerada, arritmias ventriculares.
8. **Pulmones / Vías Aéreas**: Neumonitis química, enfisema, edema pulmonar agudo.
9. **Estómago / Digestivo**: Cólico saturnino, gastroenteritis hemorrágica.
10. **Tiroides / Endocrino**: Disrupción tiroidea, alteración del eje hipotálamo-hipofisario.
11. **Páncreas**: Disfunción de células beta e hiperglicemia tóxica.
12. **Bazo / Inmunológico**: Depleción de linfocitos e inmunosupresión.
13. **Intestino Delgado**: Malabsorción enterocítica y daño en vellosidades.
14. **Intestino Grueso**: Colitis tóxica y alteración de microbiota.
15. **Vejiga**: Carcinoma urotelial inducido por metabolitos de arsénico.
16. **Gónadas / Reproductivo**: Teratogénesis, oligospermia, disrupción embrionaria.
17. **Sistema Nervioso Periférico**: Neuropatía motora periférica ("caída de muñeca").
18. **Médula Ósea**: Aplasia medular y mielosupresión por metales pesados.

---

## 5. Módulos y Arquitectura del Sistema
- `DashboardPage.tsx`: Monitor central con KPIs en tiempo real de agua, fauna y humanos.
- `SimulationPage.tsx`: Simulador hidrológico 2D con canvas a 60 FPS, partículas y física advectiva.
- `MotionGraphicsLabPage.tsx`: Laboratorio Motion 2D con física de fluidos y vórtices interactivos.
- `ToxicologyPage.tsx`: Atlas anatómico interactivo con mapa de calor de afinidad tisular.
- `CellularPage.tsx`: Microscopio celular con canales iónicos y estrés oxidativo.
- `MathematicalLabPage.tsx`: Calculadora toxicocinética con decaimiento temporal y gráficos interactivos.
- `TwinklGoHubPage.tsx`: Gamificación educativa con puzzle de cadena trófica, trivia con vidas y diploma.
- `RemediationEngineeringPage.tsx`: Simulación de trenes de tratamiento físico-químico y biológico.
- `AuditReportsPage.tsx`: Generador de informes periciales con normativas DS90 / OMS y exportación.
- `KnowledgeBasePage.tsx`: Base de conocimiento con biblioteca de casos históricos reales.

---

## 6. Limitaciones del modelo

1. **Un solo compartimento humano.** Para el plomo (semivida ósea de décadas) se
   sobreestima la concentración en sangre; un modelo de 2–3 compartimentos sería
   más fiel.
2. **Sin especiación química ni variables fisicoquímicas** (pH, temperatura,
   materia orgánica disuelta, sedimentación).
3. **Dieta monotemática**: sólo se modela la ingesta vía pescado.
4. **La animación de partículas es cualitativa**, no un método de volúmenes finitos.
5. Los estados de cumplimiento normativo dependen de que los límites cargados en
   `regulatoryLimits` estén actualizados.

---

## 7. Instrucciones de Ejecución y Despliegue
- **Instalar dependencias**: `npm install`
- **Iniciar en desarrollo**: `npm run dev` (Port 3000)
- **Compilar para producción**: `npm run build` (incluye verificación de tipos)
- **Ejecutar tests del modelo**: `npm test`
- **Linter**: `npm run lint`
