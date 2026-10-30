/**
 * Utilidades para descarga y exportación directa de archivos en el navegador
 */

// Descarga de texto o markdown genérico
export function triggerFileDownload(filename: string, content: string, mimeType: string = 'text/markdown;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Descargar documentación técnica completa en Markdown
export function downloadTechnicalDocumentation() {
  const markdownContent = `# BioTrófica: Simulador Hidrológico & Modelo Toxicocinético Multicompartimental
Fecha de Exportación: ${new Date().toLocaleDateString('es-CL')}

## 1. Resumen Ejecutivo
BioTrófica es una plataforma interactiva de modelado hidrológico y toxicocinético que simula el transporte advectivo de metales pesados (Mercurio CH3Hg+, Plomo Pb2+, Cadmio Cd2+, Arsénico As3+), su absorción celular por fitoplancton, bioconcentración en consumidores primarios, biomagnificación trófica exponencial en peces depredadores y bioacumulación en seres humanos con daño tisular en 18 órganos diana.

---

## 2. Ecuaciones del Modelo Matemático

### A. Concentración Fluvial (Balance de Masa)
C_agua (ppm) = [ E_bruta * (1 - Filtro/100) / Q_rio ] + C_fondo

### B. Factores Tróficos
- Fitoplancton: C_fito = C_agua * BCF_fito
- Pez Pequeño: C_pez_pequeño = C_fito * BCF_pez
- Depredador (Trucha): C_trucha = C_pez_pequeño * BMF_depredador

### C. Toxicocinética Humana (Modelo Compartimental)
- Dosis Ingerida (mg) = C_trucha (mg/kg) * 0.20 kg
- Volumen de Distribución: Vd_total = Vd (L/kg) * Peso_Humano (kg)
- Incremento Tisular: Delta_C (ppm) = Dosis / Vd_total
- Constante de Eliminación: ke = ln(2) / t_half_life
- Concentración Temporal: C(t) = C0 * exp(-ke * t)

---

## 3. Matriz de Constantes Toxicológicas
- Metilmercurio (CH3Hg+): BCF Fito = 1500, BCF Pez = 8000, BMF = 4.5x, t1/2 = 70 días, Vd = 1.7 L/kg, Dosis Crítica = 0.05 ppm. (Caso: Minamata 1956)
- Plomo (Pb2+): BCF Fito = 800, BCF Pez = 3500, BMF = 2.8x, t1/2 = 10950 días (~30 años en hueso), Vd = 0.9 L/kg, Dosis Crítica = 0.10 ppm. (Caso: Flint 2014)
- Cadmio (Cd2+): BCF Fito = 2200, BCF Pez = 6000, BMF = 3.2x, t1/2 = 9125 días (~25 años en riñón), Vd = 1.2 L/kg, Dosis Crítica = 0.02 ppm. (Caso: Itai-Itai 1912)
- Arsénico (As3+): BCF Fito = 900, BCF Pez = 1800, BMF = 1.8x, t1/2 = 4 días, Vd = 0.6 L/kg, Dosis Crítica = 0.01 ppm. (Caso: Antofagasta HACRE 1958)

---

## 4. Órganos Diana Modelados (18 Sistemas)
1. Encéfalo / SNC (Necrosis neuronal y ataxia)
2. Riñones (Necrosis tubular proximal y proteinuria)
3. Huesos (Sustitución de Ca2+ en hidroxiapatita)
4. Sistema Hematopoyético (Inhibición de ALAD y anemia)
5. Piel y Tegumentos (Hiperqueratosis y leucodermia)
6. Hígado (Fibrosis portal y colestasis)
7. Corazón (Aterosclerosis y arritmias)
8. Pulmones (Neumonitis y enfisema)
9. Estómago (Cólico saturnino)
10. Tiroides (Disrupción hormonal)
11. Páncreas (Estrés de células beta)
12. Bazo / Inmunológico (Depleción linfocitaria)
13. Intestino Delgado (Malabsorción)
14. Intestino Grueso (Colitis tóxica)
15. Vejiga (Carcinogénesis urotelial)
16. Gónadas / Reproductivo (Teratogénesis y esterilidad)
17. Sistema Nervioso Periférico (Neuropatía radial)
18. Médula Ósea (Mielosupresión)

---

## 5. Módulos del Sistema
- Dashboard Central
- Diorama Fluvial 2D Canvas
- Estudio Motion Graphics 2D
- Atlas Anatómico & Órganos Diana
- Microscopio Celular
- Laboratorio Matemático
- Twinkl Go! Misiones Educativas
- Planta de Remediación
- Generador de Auditorías Ambientales
- Base de Conocimiento Histórica
`;

  triggerFileDownload('BioTrofica_Documentacion_Tecnica.md', markdownContent, 'text/markdown;charset=utf-8;');
}

// Descargar documentación técnica completa en HTML listo para abrir en cualquier navegador
export function downloadTechnicalDocumentationHtml() {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BioTrófica - Documentación Técnica & Manual de Toxicocinética</title>
  <style>
    :root {
      --bg: #F8F7F4;
      --card-bg: #FFFFFF;
      --text: #111113;
      --text-muted: #555558;
      --accent: #E11D48;
      --border: #E2E0D8;
      --code-bg: #F1EFEA;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.65;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--card-bg);
      padding: 48px;
      border-radius: 8px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--text);
      border-bottom: 2px solid var(--text);
      padding-bottom: 12px;
      margin-top: 0;
      letter-spacing: -0.02em;
    }
    h2 {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text);
      margin-top: 36px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: 24px;
    }
    p, li {
      font-size: 15px;
      color: var(--text);
    }
    .badge {
      display: inline-block;
      font-family: monospace;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 0.1em;
      background: var(--text);
      color: #fff;
      padding: 3px 8px;
      border-radius: 3px;
      margin-bottom: 8px;
    }
    .formula-box {
      background: var(--code-bg);
      border-left: 4px solid var(--accent);
      padding: 14px 20px;
      margin: 16px 0;
      font-family: "Courier New", Courier, monospace;
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 13.5px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background: var(--code-bg);
      font-weight: 700;
      color: var(--text);
    }
    tr:nth-child(even) {
      background: #FAFAF8;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    .card {
      background: #FAFAF8;
      border: 1px solid var(--border);
      padding: 16px;
      border-radius: 4px;
    }
    .card strong {
      display: block;
      color: var(--text);
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      font-family: monospace;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">[Documento Técnico Oficial]</div>
    <h1>BioTrófica: Simulador Hidrológico & Toxicocinético</h1>
    <p><strong>Plataforma de Modelado Ecosistémico de Metales Pesados y Bioacumulación Trófica Multicompartimental.</strong></p>
    <p><em>Fecha de emisión: ${new Date().toLocaleDateString('es-CL')} · República de Chile · DS 90/2000 / OMS</em></p>

    <h2>1. Resumen Ejecutivo</h2>
    <p>BioTrófica modela de manera integrada el transporte advectivo de metales pesados en ecosistemas de agua dulce, su absorción celular por productores primarios, la biomagnificación trófica exponencial a lo largo de la cadena alimentaria (fitoplancton &rarr; macroinvertebrados &rarr; truchas depredadoras) y la bioacumulación en seres humanos por ingesta dietética con afectación celular en 18 órganos diana.</p>

    <h2>2. Ecuaciones del Modelo Matemático</h2>
    
    <h3>A. Concentración Fluvial (Balance de Masa)</h3>
    <div class="formula-box">
      C_agua (ppm) = [ Efluente_Industrial * (1 - Eficiencia_Filtro) / Caudal_Río ] + Fondo_Natural
    </div>

    <h3>B. Factores de Transferencia Trófica (BCF y BMF)</h3>
    <div class="formula-box">
      C_fitoplancton = C_agua × BCF_fitoplancton<br>
      C_pez_pequeño = C_fitoplancton × BCF_consumidor<br>
      C_trucha_depredadora = C_pez_pequeño × BMF_depredador
    </div>

    <h3>C. Toxicocinética Humana de Primer Orden</h3>
    <div class="formula-box">
      Dosis Ingerida (mg) = C_trucha (mg/kg) × 0.20 kg (porción)<br>
      Volumen de Distribución: Vd_total = Vd (L/kg) × Peso_Corporal (kg)<br>
      Incremento Tisular: &Delta;C_humano (ppm) = Dosis / Vd_total<br>
      Constante de Eliminación: ke = ln(2) / t_1/2<br>
      Carga Tisular Temporal: C(t) = C0 × e^(-ke × t)
    </div>

    <h2>3. Matriz de Constantes Toxicológicas</h2>
    <table>
      <thead>
        <tr>
          <th>Contaminante</th>
          <th>Fórmula</th>
          <th>BCF Fito</th>
          <th>BMF Pez</th>
          <th>t½ Humanos</th>
          <th>Vd (L/kg)</th>
          <th>Dosis Crítica</th>
          <th>Caso Histórico</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Metilmercurio</strong></td>
          <td>CH₃Hg⁺</td>
          <td>1,500</td>
          <td>4.5x</td>
          <td>70 días</td>
          <td>1.7</td>
          <td>0.05 ppm</td>
          <td>Bahía de Minamata (1956)</td>
        </tr>
        <tr>
          <td><strong>Plomo</strong></td>
          <td>Pb²⁺</td>
          <td>800</td>
          <td>2.8x</td>
          <td>10,950 d (~30 años)</td>
          <td>0.9</td>
          <td>0.10 ppm</td>
          <td>Crisis de Flint (2014)</td>
        </tr>
        <tr>
          <td><strong>Cadmio</strong></td>
          <td>Cd²⁺</td>
          <td>2,200</td>
          <td>3.2x</td>
          <td>9,125 d (~25 años)</td>
          <td>1.2</td>
          <td>0.02 ppm</td>
          <td>Río Jinzū / Itai-Itai (1912)</td>
        </tr>
        <tr>
          <td><strong>Arsénico</strong></td>
          <td>As(III)</td>
          <td>900</td>
          <td>1.8x</td>
          <td>4 días</td>
          <td>0.6</td>
          <td>0.01 ppm</td>
          <td>Antofagasta HACRE (1958)</td>
        </tr>
      </tbody>
    </table>

    <h2>4. Órganos Diana y Mecanismos de Toxicidad (18 Sistemas)</h2>
    <div class="grid">
      <div class="card">
        <strong>1. Encéfalo & SNC</strong>
        <p style="font-size: 13px; margin:0;">Necrosis neuronal en células de Purkinje, ataxia motora y pérdida concéntrica del campo visual.</p>
      </div>
      <div class="card">
        <strong>2. Riñones (Túbulo Proximal)</strong>
        <p style="font-size: 13px; margin:0;">Necrosis tubular aguda, proteinuria tubular de bajo peso molecular e insuficiencia renal.</p>
      </div>
      <div class="card">
        <strong>3. Sistema Óseo</strong>
        <p style="font-size: 13px; margin:0;">Sustitución de Ca²⁺ en hidroxiapatita ósea, osteomalacia severa y pseudofracturas (Itai-Itai).</p>
      </div>
      <div class="card">
        <strong>4. Sistema Hematopoyético</strong>
        <p style="font-size: 13px; margin:0;">Inhibición de enzimas ALAD y ferroquelatasa, anemia microcítica y punteado basófilo.</p>
      </div>
      <div class="card">
        <strong>5. Piel & Tegumentos</strong>
        <p style="font-size: 13px; margin:0;">Hiperqueratosis palmoplantar en espiga, manchas en gotas de lluvia y líneas ungueales de Mees.</p>
      </div>
      <div class="card">
        <strong>6. Hígado</strong>
        <p style="font-size: 13px; margin:0;">Fibrosis portal no cirrótica, esteatosis tóxica y angiosarcoma hepático por arsénico.</p>
      </div>
    </div>

    <h2>5. Módulos y Arquitectura del Sistema</h2>
    <ul>
      <li><strong>Dashboard Central:</strong> Monitor en tiempo real con KPIs hidrológicos, faunísticos y tisulares.</li>
      <li><strong>Simulador Fluvial 2D Canvas:</strong> Motor gráfico interactivo a 60 FPS con física de partículas, advección y depredación trófica.</li>
      <li><strong>Laboratorio Motion Graphics 2D:</strong> Vórtices interactivos, campos de velocidad y vectores de flujo.</li>
      <li><strong>Atlas Anatómico:</strong> Visualizador tridimensional de 18 órganos diana y mapa de calor de bioacumulación.</li>
      <li><strong>Microscopio Celular:</strong> Transporte de membrana, canales de Ca²⁺ y estrés oxidativo mitocondrial (ROS).</li>
      <li><strong>Laboratorio Matemático:</strong> Curvas de decaimiento temporal y modelado compartimental de eliminación.</li>
      <li><strong>Twinkl Go! Hub:</strong> Misiones educativas, puzzle de cadena trófica, trivia con vidas y diploma descargable.</li>
      <li><strong>Planta de Remediación:</strong> Simulación de trenes de tratamiento físico-químico, precipitación alcalina y zeolitas.</li>
      <li><strong>Auditoría & Dictamen Legal:</strong> Informes periciales según Decreto Supremo N° 90 y normativas OMS.</li>
    </ul>

    <div class="footer">
      BioTrófica Platform · Modelo Toxicológico Fluvial Integrado · Documento Oficial
    </div>
  </div>
</body>
</html>`;

  triggerFileDownload('BioTrofica_Documentacion_Oficial.html', htmlContent, 'text/html;charset=utf-8;');
}

// Descargar dataset de simulación en formato JSON
export function downloadSimulationDataJson(data: Record<string, unknown>) {
  const jsonString = JSON.stringify(data, null, 2);
  triggerFileDownload(`BioTrofica_Simulacion_${Date.now()}.json`, jsonString, 'application/json;charset=utf-8;');
}

