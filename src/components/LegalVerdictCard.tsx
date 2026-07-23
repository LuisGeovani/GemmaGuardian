import React, { useState } from 'react';
import { Property } from '../types';
import { Scale, BookOpen, AlertOctagon, Sparkles, Send, Loader2 } from 'lucide-react';

interface LegalVerdictCardProps {
  property: Property;
  onAskLegalAi: (question: string) => Promise<string>;
}

export const LegalVerdictCard: React.FC<LegalVerdictCardProps> = ({
  property,
  onAskLegalAi,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isConsultingAi, setIsConsultingAi] = useState(false);

  const handleConsultAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isConsultingAi) return;

    setIsConsultingAi(true);
    setAiAnswer(null);
    try {
      const answer = await onAskLegalAi(customQuestion);
      setAiAnswer(answer);
    } catch (err) {
      setAiAnswer('Não foi possível obter a resposta jurídica no momento. Tente novamente.');
    } finally {
      setIsConsultingAi(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col p-5 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-orange-100 rounded-md text-orange-600">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Veredito Jurídico
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            property.embargoStatus.hasEmbargo
              ? 'bg-red-100 text-red-800 border-red-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}
        >
          {property.embargoStatus.hasEmbargo ? 'IRREGULARIDADE DETECTADA' : 'CONFORME'}
        </span>
      </div>

      {/* Main Legal Verdict Body - Scrollable Container */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex-1 overflow-y-auto min-h-0 space-y-3">
        <p className="text-xs text-slate-700 leading-relaxed">
          <span
            className={`font-bold ${
              property.embargoStatus.hasEmbargo ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            STATUS: {property.embargoStatus.hasEmbargo ? 'IRREGULAR' : 'REGULAR'}.
          </span>{' '}
          <br />
          {property.embargoStatus.hasEmbargo
            ? `Detectada supressão de vegetação nativa e déficit na Reserva Legal de ${property.recoveryGapHa.toFixed(
                2
              )} ha, excedendo o limite legal para a Amazônia Legal (exigido 80%).`
            : `Propriedade em conformidade territorial com 80% de Reserva Legal preservada.`}
        </p>

        <div className="bg-white p-2.5 rounded border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fundamentação Legal:</span>
          </div>
          <p className="text-[11px] text-slate-600 font-mono pl-5">
            Art. 12, inciso I, alínea 'a' da Lei 12.651/2012 (Código Florestal Brasileiro).
          </p>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed pt-1 break-words">
          <span className="font-semibold italic underline decoration-emerald-200">
            Observação do Agente Jurídico Gemma:
          </span>{' '}
          O embargo <span className="font-mono font-bold break-all">{property.embargoStatus.embargoId}</span> foi localizado na base de dados do{' '}
          {property.embargoStatus.organ} referente ao cadastro CPF/CNPJ {property.embargoStatus.cpfCnpjMasked}.
          {property.embargoStatus.hasEmbargo
            ? ' Requer regularização imediata via elaboração e protocolo de PRAD para desembargo.'
            : ' Sem pendências administrativas ativas.'}
        </div>

        {/* AI Answer Box if generated */}
        {aiAnswer && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-950 mt-2 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resposta da Inteligência Jurídica Gemma:</span>
            </div>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
          </div>
        )}
      </div>

      {/* Quick Legal AI Prompt Bar */}
      <form onSubmit={handleConsultAi} className="mt-3 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Pergunte ao Agente Jurídico Gemma 2 (ex: Como levantar o embargo #101?)..."
            className="w-full bg-slate-100 border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={isConsultingAi || !customQuestion.trim()}
            className="absolute right-1.5 p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition disabled:opacity-40"
            title="Consultar Legislação Ambiental"
          >
            {isConsultingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
