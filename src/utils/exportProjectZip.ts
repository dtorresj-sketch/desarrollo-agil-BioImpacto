import JSZip from 'jszip';

/**
 * Exportación del código fuente del proyecto.
 *
 * Los archivos se resuelven en tiempo de compilación con `import.meta.glob`
 * (Vite), de modo que el bundle incluye una copia textual de cada fuente y la
 * exportación funciona sin backend ni acceso al sistema de archivos.
 */

const RAW_MODULES = import.meta.glob('/src/**/*.{ts,tsx,css}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const ROOT_MODULES = import.meta.glob(
  '/{package.json,tsconfig.json,vite.config.ts,index.html,README.md,DOCUMENTACION_TECNICA.md}',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

/** Mapa `ruta relativa -> contenido` de todo el código fuente del proyecto. */
export function getSourceFilesMap(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [absolutePath, content] of Object.entries({ ...ROOT_MODULES, ...RAW_MODULES })) {
    files[absolutePath.replace(/^\//, '')] = content;
  }
  return files;
}

/** Descarga genérica de un Blob como archivo. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Se libera en el siguiente tick para no cancelar la descarga en Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Empaqueta todo el código fuente en un .zip y lo descarga. */
export async function downloadProjectSourceZip(): Promise<void> {
  const zip = new JSZip();
  const files = getSourceFilesMap();

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  saveBlob(blob, `BioTrofica_Codigo_Fuente_${timestamp()}.zip`);
}

/** Concatena todo el código fuente en un único .txt legible y lo descarga. */
export function downloadConsolidatedCodeTxt(): void {
  const files = getSourceFilesMap();
  const paths = Object.keys(files).sort();

  const header = [
    'BioTrófica — Código fuente consolidado',
    `Generado: ${new Date().toISOString()}`,
    `Archivos: ${paths.length}`,
    '='.repeat(78),
    '',
  ].join('\n');

  const body = paths
    .map((path) => ['='.repeat(78), `FILE: ${path}`, '='.repeat(78), '', files[path], ''].join('\n'))
    .join('\n');

  saveBlob(
    new Blob([header + body], { type: 'text/plain;charset=utf-8' }),
    `BioTrofica_Codigo_Consolidado_${timestamp()}.txt`,
  );
}
