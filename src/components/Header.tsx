import React from 'react';
import { ShieldCheck, RefreshCw, FileText, Layers, Search, ShieldAlert } from 'lucide-react';
import { Property } from '../types';

interface HeaderProps {
  currentProperty: Property;
  onOpenPropertySelector: () => void;
  onOpenEmbargoSearch: () => void;
  onRunAgentPipeline: () => void;
  onExportPrad: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProperty,
  onOpenPropertySelector,
  onOpenEmbargoSearch,
  onRunAgentPipeline,
  onExportPrad,
  isAnalyzing,
}) => {
  return (
    <header className="bg-emerald-900 text-white px-4 md:px-6 py-3 flex flex-wrap justify-between items-center border-b-4 border-emerald-600 shrink-0 shadow-md gap-3">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex items-center space-x-2.5 shrink-0">
          <img
            src="/gemma_guardian_full_logo.svg"
            alt="GemmaGuardian"
            className="h-11 md:h-13 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight font-sans truncate text-white">GemmaGuardian</h1>
            <span className="text-[10px] font-mono font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700 shrink-0">
              v1.0.4
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-emerald-200 uppercase tracking-wider font-semibold flex items-center gap-1 mt-0.5 truncate">
            <span className="truncate">{currentProperty.location}</span>
            <span>•</span>
            <span className="text-emerald-300 font-bold truncate">{currentProperty.name}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3 flex-wrap gap-y-2">
        {/* Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={onOpenEmbargoSearch}
            className="flex items-center space-x-1.5 bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-500 shadow-sm"
            title="Consultar CPF ou baixar CSV de embargos IBAMA"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>Consultar CPF / Embargos</span>
          </button>

          <button
            onClick={onOpenPropertySelector}
            className="flex items-center space-x-1.5 bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-emerald-700 shadow-sm"
            title="Mudar polígono ou carregar novo shapefile"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Seleção de Terreno</span>
          </button>

          <button
            onClick={onRunAgentPipeline}
            disabled={isAnalyzing}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border shadow-sm ${
              isAnalyzing
                ? 'bg-emerald-700 text-emerald-300 border-emerald-600 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border-emerald-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analisando...' : 'Simular Agentes'}</span>
          </button>

          <button
            onClick={onExportPrad}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar PRAD</span>
          </button>
        </div>

        {/* System Badges */}
        <div className="hidden xl:flex items-center space-x-3 border-l border-emerald-800 pl-3">
          <div className="flex items-center space-x-2 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-[11px] font-mono text-emerald-200">Agentes Gemma 2 (2B / 9B / 27B) • ATIVOS</span>
          </div>
        </div>
      </div>
    </header>
  );
};
