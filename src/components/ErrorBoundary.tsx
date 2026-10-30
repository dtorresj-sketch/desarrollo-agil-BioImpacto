import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Límite de error global. Sin él, cualquier excepción dentro del canvas o del
 * atlas anatómico desmonta el árbol completo y el usuario queda ante una
 * pantalla en blanco, sin explicación ni forma de recuperarse.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[BioTrófica] Error no controlado:', error, info.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="m-6 rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-900"
      >
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-lg">Este módulo no pudo cargarse</h2>
        </div>
        <p className="mt-2 max-w-xl text-sm">
          Ocurrió un error al renderizar esta sección. El resto del simulador sigue disponible desde
          el menú lateral.
        </p>
        <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-white/70 p-3 font-mono text-xs">
          {error.message}
        </pre>
        <button
          onClick={this.handleReset}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  }
}
