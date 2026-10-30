import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FolderArchive, 
  Copy, 
  Check, 
  Terminal, 
  FileText,
  ChevronRight,
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { 
  downloadProjectSourceZip, 
  downloadConsolidatedCodeTxt, 
  getSourceFilesMap 
} from '../utils/exportProjectZip';

interface SourceCodeDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeDownloadModal: React.FC<SourceCodeDownloadModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const filesMap = getSourceFilesMap();
  const filePaths = Object.keys(filesMap).sort();
  const currentContent = filesMap[selectedFile] || '';

  const handleCopy = (path: string, content: string) => {
    soundFX.playCorrect();
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownloadZip = async () => {
    soundFX.playCorrect();
    setIsZipping(true);
    try {
      await downloadProjectSourceZip();
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadTxt = () => {
    soundFX.playCorrect();
    downloadConsolidatedCodeTxt();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white border border-black/15 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-[#111113]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-[#F8F7F4]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E11D48] text-white">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#111113]/60 font-bold">
                [Centro de Descarga de Código Fuente]
              </div>
              <h3 className="text-lg font-black tracking-tight font-sans text-[#111113]">
                Descargar Código de BioTrófica
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Banner */}
        <div className="p-5 bg-[#111113] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#E11D48] font-bold uppercase tracking-wider mb-0.5">
              Descarga Inmediata y Completa
            </div>
            <p className="text-sm font-sans font-medium text-neutral-200">
              Descarga todo el proyecto empaquetado en formato ZIP o como un archivo de texto consolidado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-modal-download-zip"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Generando ZIP...' : 'Descargar Todo (.ZIP)'}</span>
            </button>

            <button
              id="btn-modal-download-txt"
              onClick={handleDownloadTxt}
              className="px-4 py-2.5 bg-white text-[#111113] hover:bg-neutral-100 font-mono font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#E11D48]" />
              <span>Todos los Códigos (.TXT)</span>
            </button>
          </div>
        </div>

        {/* Local Run Guide Pill */}
        <div className="px-6 py-2.5 bg-[#F8F7F4] border-b border-black/10 flex flex-wrap items-center gap-4 text-xs font-mono text-[#111113]/80">
          <span className="font-bold text-[#111113] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#E11D48]" />
            Ejecutar en tu PC tras descomprimir:
          </span>
          <code className="bg-white px-2 py-0.5 border border-black/10 font-bold text-[#111113]">
            npm install
          </code>
          <span>luego</span>
          <code className="bg-white px-2 py-0.5 border border-black/10 font-bold text-[#111113]">
            npm run dev
          </code>
          <span className="text-neutral-500">(abre en http://localhost:3000)</span>
        </div>

        {/* File Explorer & Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[350px]">
          
          {/* File List (Left) */}
          <div className="w-full md:w-72 border-r border-black/10 overflow-y-auto bg-[#FAFAF8] p-3 space-y-1">
            <div className="font-mono text-[10px] uppercase font-bold text-neutral-500 px-2 py-1 tracking-wider">
              Archivos del Proyecto ({filePaths.length})
            </div>
            {filePaths.map((filePath) => {
              const isSelected = selectedFile === filePath;
              const fileName = filePath.split('/').pop();
              const dir = filePath.substring(0, filePath.lastIndexOf('/'));

              return (
                <button
                  key={filePath}
                  onClick={() => {
                    soundFX.playPhaseStep();
                    setSelectedFile(filePath);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-mono transition-all flex items-center justify-between rounded-none ${
                    isSelected
                      ? 'bg-[#111113] text-white font-bold'
                      : 'text-[#111113]/80 hover:bg-neutral-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="text-[10px] opacity-50 block truncate">{dir || '.'}</span>
                    <span className="truncate">{fileName}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#E11D48]' : 'opacity-30'}`} />
                </button>
              );
            })}
          </div>

          {/* Code Viewer (Right) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Viewer Toolbar */}
            <div className="px-4 py-2 border-b border-black/10 bg-[#F8F7F4] flex items-center justify-between">
              <div className="font-mono text-xs font-bold text-[#111113] truncate">
                {selectedFile}
              </div>
              <button
                onClick={() => handleCopy(selectedFile, currentContent)}
                className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black/15 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPath === selectedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <pre className="flex-1 overflow-auto p-4 text-[11.5px] font-mono leading-relaxed bg-[#111113] text-neutral-200 select-all">
              <code>{currentContent}</code>
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 bg-[#F8F7F4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="font-mono text-[#111113]/60">
            Exportación completa con React 19, Vite, Tailwind CSS y Canvas 2D.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 font-bold text-xs text-[#111113] transition-colors"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
