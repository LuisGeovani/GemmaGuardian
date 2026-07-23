import React from 'react';
import { PradProposal, NativeSpecies } from '../types';
import { Sprout, Users, CheckCircle, ChevronRight, Calculator, FileCheck } from 'lucide-react';

interface PradRecommendationCardProps {
  proposal: PradProposal;
  isAnalyzing?: boolean;
  onOpenDetails: () => void;
  onSelectSpecies?: (species: NativeSpecies) => void;
}

export const PradRecommendationCard: React.FC<PradRecommendationCardProps> = ({
  proposal,
  isAnalyzing = false,
  onOpenDetails,
}) => {
  return (
    <div className={`rounded-xl border p-5 shrink-0 shadow-xs transition-all duration-300 ${
      isAnalyzing ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/50' : 'bg-emerald-50 border-emerald-200'
    }`}>
      {/* Active Generating Alert Banner */}
      {isAnalyzing && (
        <div className="mb-3 px-3 py-1.5 bg-amber-500/10 border border-amber-400/60 rounded-lg flex items-center justify-between text-amber-900 text-xs font-semibold animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span>🔄 GERANDO NOVO PRAD: Agentes Gemma reprocessando diagnóstico e parâmetros ecológicos para este imóvel...</span>
          </div>
          <span className="text-[10px] font-mono bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 uppercase font-bold">
            Agentes em Ação
          </span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
              Recomendação Preliminar de PRAD (Plano de Recuperação)
            </h3>
          </div>
          <p className="text-[10px] text-amber-800 font-medium mt-0.5 flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-amber-600 animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
            {isAnalyzing
              ? '🔄 Agentes Gemma calculando e personalizando novo PRAD em tempo real...'
              : 'Estimativa orientativa via Agentes Gemma 2 (IA Verde / Edge) • Não substitui ART nem laudo de engenharia florestal'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`text-white text-[10px] px-3 py-1 rounded font-bold uppercase shadow-xs transition ${
            isAnalyzing ? 'bg-amber-600 animate-pulse' : 'bg-emerald-600'
          }`}>
            {isAnalyzing ? '🔄 Gerando Novo PRAD...' : proposal.status}
          </div>
          <button
            onClick={onOpenDetails}
            className="flex items-center space-x-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold px-2.5 py-1 rounded transition"
          >
            <span>Ver Detalhes do Plano</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Profissionais Necessários */}
        <div className="space-y-2 bg-emerald-100/50 p-3 rounded-lg border border-emerald-200/60 relative">
          <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Profissionais Necessários</span>
          </p>

          {isAnalyzing ? (
            <div className="p-2 bg-amber-100/80 border border-amber-300 rounded text-[11px] text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Gerando especificação profissional...
              </span>
              <p className="text-[10px] text-amber-800">
                Agente Jurídico e Síntese definindo ARTs e laudos necessários para este novo polígono.
              </p>
            </div>
          ) : (
            <ul className="text-xs text-emerald-900 space-y-1.5">
              {proposal.professionals.map((prof, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">{prof.role}</span>
                    <span className="text-[10px] block text-emerald-700">{prof.requirement}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Column 2: Espécies Sugeridas */}
        <div className="space-y-2 bg-emerald-100/50 p-3 rounded-lg border border-emerald-200/60">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>Espécies Sugeridas (Acre)</span>
            </p>
            <span className="text-[9px] font-mono font-bold text-emerald-700">
              {proposal.speciesSuggested.length} Nativas
            </span>
          </div>

          {isAnalyzing ? (
            <div className="p-2 bg-amber-100/80 border border-amber-300 rounded text-[11px] text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Agente Ecólogo Gemma selecionando espécies...
              </span>
              <p className="text-[10px] text-amber-800">
                Mapeando biomassa nativa e mudas amazônicas para recomposição deste terreno.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {proposal.speciesSuggested.map((sp) => (
                  <span
                    key={sp.id}
                    className="px-2 py-1 bg-white rounded border border-emerald-200 text-[10px] text-emerald-900 font-medium shadow-2xs hover:border-emerald-400 transition cursor-default"
                    title={`${sp.scientificName} (${sp.ecologicalGroup})`}
                  >
                    {sp.popularName}
                  </span>
                ))}
              </div>

              <p className="text-[10px] text-emerald-800/80 pt-1 italic">
                Densidade média: 400 mudas/ha • Consórcio pioneiras x clímax
              </p>
            </>
          )}
        </div>

        {/* Column 3: Ações Prioritárias */}
        <div className="space-y-2 bg-emerald-100/50 p-3 rounded-lg border border-emerald-200/60">
          <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ações Prioritárias</span>
          </p>

          {isAnalyzing ? (
            <div className="p-2 bg-amber-100/80 border border-amber-300 rounded text-[11px] text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Sintetizando novas ações prioritárias...
              </span>
              <p className="text-[10px] text-amber-800">
                Estruturando plano de recuperação ambiental personalizado para o passivo do imóvel.
              </p>
            </div>
          ) : (
            <div className="text-[10px] text-emerald-900 leading-snug space-y-1 font-sans">
              {proposal.priorityActions.map((action, idx) => (
                <div key={action.id} className="flex gap-1.5 items-start">
                  <span className="font-bold text-emerald-800 shrink-0">{idx + 1}.</span>
                  <p>
                    <span className="font-bold text-emerald-950">{action.title}:</span>{' '}
                    <span className="text-emerald-800">{action.description}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
