import React from 'react';
import { Check, Loader2, Terminal, Cpu } from 'lucide-react';
import { AgentStep, LogEntry } from '../types';

interface AgentSidebarProps {
  agentSteps: AgentStep[];
  logs: LogEntry[];
  isAnalyzing: boolean;
  activeStepId: number;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  agentSteps,
  logs,
  isAnalyzing,
  activeStepId,
}) => {
  return (
    <aside className="w-full lg:w-72 flex flex-col space-y-4 shrink-0">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Orquestração de Agentes Gemma</span>
            </h2>
            {isAnalyzing && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                <span>RODANDO</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            {agentSteps.map((step) => {
              const isInProgress = isAnalyzing && step.id === activeStepId;
              const isCompleted = step.status === 'completed' && !isInProgress;

              return (
                <div
                  key={step.id}
                  className={`relative pl-7 transition-all duration-300 ${
                    isCompleted
                      ? 'border-l-2 border-emerald-500'
                      : isInProgress
                      ? 'border-l-2 border-emerald-400'
                      : 'border-l-2 border-slate-200'
                  }`}
                >
                  {/* Step Status Badge Icon */}
                  <div
                    className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isInProgress
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : isInProgress ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  <div>
                    <p className={`text-sm font-bold ${isCompleted || isInProgress ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.name}
                    </p>
                    <p
                      className={`text-xs ${
                        isCompleted
                          ? 'text-slate-500'
                          : isInProgress
                          ? 'text-emerald-600 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.subtext}
                    </p>

                    {step.confidencePct && (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${step.confidencePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {step.confidencePct}% Confiança
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traceability Log Terminal */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Log de Rastreabilidade</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-400">AUDIT LOG</span>
          </div>

          <div className="bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto max-h-40 shadow-inner border border-slate-800 space-y-1.5 leading-relaxed break-words">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-1.5 items-start">
                <span className="text-slate-500 shrink-0">[{log.stepCode}]</span>
                <span
                  className={`break-all ${
                    log.type === 'error'
                      ? 'text-red-400 font-semibold'
                      : log.type === 'warning'
                      ? 'text-amber-300'
                      : log.type === 'success'
                      ? 'text-emerald-300'
                      : 'text-emerald-400'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))}

            <div className="pt-1 flex items-center space-x-1 text-white font-bold text-[11px] animate-pulse">
              <span>&gt;</span>
              <span>
                {isAnalyzing ? 'AGENTES GEMMA PROCESSANDO...' : 'SISTEMA GEMMA EM PRONTIDÃO'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
