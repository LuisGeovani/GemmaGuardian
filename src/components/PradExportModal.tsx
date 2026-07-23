import React, { useState } from 'react';
import { Property, PradProposal, NativeSpecies } from '../types';
import { X, Download, Printer, CheckCircle, Trees, DollarSign, Calendar, Sparkles, ShieldCheck, Loader2, FileCheck2, AlertTriangle, Info } from 'lucide-react';
import { AMAZON_NATIVE_SPECIES } from '../data/mockData';
import { generatePradPdf } from '../utils/pdfGenerator';

interface PradExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  proposal: PradProposal;
}

export const PradExportModal: React.FC<PradExportModalProps> = ({
  isOpen,
  onClose,
  property,
  proposal,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const totalSeedlings = Math.round(property.recoveryGapHa * 400); // 400 mudas por hectare
  const totalCostEstimate = property.recoveryGapHa * 4000; // R$ 4.000 / ha
  const carbonTonsPerYear = Math.round(property.recoveryGapHa * 12); // ~12 t/ha/ano

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      setDownloadSuccess(false);

      // Generate and download PDF
      await generatePradPdf(property, proposal);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o arquivo PDF. Tente novamente.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto printable-modal-wrapper">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 printable-area">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-5 md:p-6 flex justify-between items-center border-b-4 border-emerald-600 shrink-0 gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src="/gemma_guardian_full_logo.svg"
              alt="GemmaGuardian"
              className="h-11 md:h-12 w-auto object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-base md:text-lg font-bold truncate">Recomendação Preliminar de PRAD</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                  Sugestão / Orientação
                </span>
              </div>
              <p className="text-xs text-emerald-200 truncate">
                GemmaGuardian (Agentes Gemma 2) • Imóvel: {property.name} ({property.shapefileCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-800 text-emerald-200 hover:text-white hover:bg-emerald-700 transition no-print shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Important Recommendation Disclaimer Box */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start space-x-3 text-amber-950 printable-card">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-xs uppercase tracking-wide text-amber-900">
                Aviso Importante: Este documento é uma Estimativa e Recomendação Preliminar
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Os dados de reflorestamento, cronograma e orçamentos aqui apresentados foram gerados por agentes de IA Gemma 2 (Green AI / Edge) para fins exclusivamente <strong>orientativos e de planejamento inicial</strong>. Este material <strong>não possui valor legal de laudo oficial</strong> e não substitui a contratação de um Engenheiro Florestal/Agrônomo habilitado para emissão de Anotação de Responsabilidade Técnica (ART) junto ao CREA e órgãos ambientais (IBAMA/IMAC).
              </p>
            </div>
          </div>

          {/* Executive Overview Banner */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 printable-card">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Área p/ Recomposição</span>
              <p className="text-xl font-bold text-slate-800 font-mono">{property.recoveryGapHa.toFixed(2)} ha</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total de Mudas Requeridas</span>
              <p className="text-xl font-bold text-emerald-600 font-mono">{totalSeedlings.toLocaleString('pt-BR')} mudas</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Custo Estimado Implantação</span>
              <p className="text-xl font-bold text-slate-800 font-mono">
                R$ {totalCostEstimate.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Captura de Carbono Projected</span>
              <p className="text-xl font-bold text-emerald-700 font-mono">{carbonTonsPerYear} t.CO₂/ano</p>
            </div>
          </div>

          {/* Section 1: Property Identification */}
          <div className="border-b border-slate-200 pb-4 space-y-2">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Identificação do Imóvel & Embargo</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg text-slate-700 font-mono text-[11px] printable-card">
              <div className="col-span-1 sm:col-span-2 md:col-span-3"><span className="text-slate-400">Nome do Imóvel:</span> <strong className="text-slate-900 font-semibold">{property.name}</strong></div>
              <div><span className="text-slate-400">Shapefile/CAR:</span> {property.shapefileCode}</div>
              <div><span className="text-slate-400">Município:</span> {property.municipality} - {property.state}</div>
              <div><span className="text-slate-400">Sistema Ref:</span> {property.coordinates.crs}</div>
              <div><span className="text-slate-400">Embargo Ativo:</span> {property.embargoStatus.hasEmbargo ? property.embargoStatus.embargoId : 'Nenhum'}</div>
              <div><span className="text-slate-400">Órgão Regulador:</span> {property.embargoStatus.organ}</div>
              <div><span className="text-slate-400">CPF/CNPJ Titular:</span> {property.embargoStatus.cpfCnpjMasked}</div>
              <div><span className="text-slate-400">Coordenadas Datum:</span> {property.coordinates.lat}, {property.coordinates.lng}</div>
            </div>
          </div>

          {/* Section 2: Technical Planting Plan */}
          <div className="border-b border-slate-200 pb-4 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-emerald-600" />
              <span>2. Mix de Espécies Nativas da Bacia do Acre</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Combinação de espécies florestais pioneiras, secundárias e clímax para formação de ilhas de nucleação (Método Anderson 5m x 5m) garantindo sombreamento e atração de polinizadores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {AMAZON_NATIVE_SPECIES.map((species) => {
                const count = Math.round((property.recoveryGapHa * 400) / AMAZON_NATIVE_SPECIES.length);
                return (
                  <div key={species.id} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 printable-card">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-emerald-950 text-xs">{species.popularName}</span>
                      <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {count} mudas
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic font-mono">{species.scientificName}</p>
                    <div className="flex gap-1 pt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                        {species.ecologicalGroup}
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                        Crescimento {species.growthRate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Professional Execution Checklist */}
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
              3. Cronograma Físico-Financeiro (36 Meses)
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center printable-card">
                <div>
                  <span className="font-bold text-emerald-950 block">Fase 01 (Mês 01 - 03): Isolamento e Preparo do Solo</span>
                  <span className="text-[11px] text-emerald-800">Cercamento do perímetro de {property.recoveryGapHa}ha e adubação orgânica em covas.</span>
                </div>
                <span className="font-mono font-bold text-emerald-900">R$ {(totalCostEstimate * 0.25).toLocaleString('pt-BR')}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center printable-card">
                <div>
                  <span className="font-bold text-emerald-950 block">Fase 02 (Mês 04 - 06): Plantio das Ilhas de Nucleação</span>
                  <span className="text-[11px] text-emerald-800">Alocação das {totalSeedlings.toLocaleString('pt-BR')} mudas com tutoramento e hidrogel.</span>
                </div>
                <span className="font-mono font-bold text-emerald-900">R$ {(totalCostEstimate * 0.5).toLocaleString('pt-BR')}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center printable-card">
                <div>
                  <span className="font-bold text-emerald-950 block">Fase 03 (Mês 07 - 36): Manutenção e Coroamento</span>
                  <span className="text-[11px] text-emerald-800">Roçada seletiva, combate a formigas cortadeiras e replantio de falhas.</span>
                </div>
                <span className="font-mono font-bold text-emerald-900">R$ {(totalCostEstimate * 0.25).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Legal Notice Footer Box (Replaces signature fields) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-slate-600 printable-card">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Observação Sobre Execução e Licenciamento</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Esta proposta foi estruturada como sugestão prévia para auxílio ao produtor rural na organização do imóvel e dimensionamento de insumos. Por se tratar de uma recomendação orientativa de inteligência artificial, não há campos para assinaturas formais. Para validação perante os órgãos de fiscalização ambiental, consulte um profissional registrado no CREA/CRBio.
            </p>
          </div>
        </div>

        {/* Success Alert Banner if PDF generated */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between no-print animate-in fade-in duration-300">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4" />
              <span>Relatório em PDF baixado com sucesso! O arquivo foi salvo na pasta de downloads.</span>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap justify-between items-center shrink-0 gap-3 no-print">
          <div className="text-[10px] text-slate-500 font-mono">
            Documento gerado pela orquestração de Agentes Gemma 2 (Amazon Eco-Hack UFAC) • Versão 1.0.4
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-lg text-xs transition border border-slate-300 shadow-xs cursor-pointer"
              title="Abrir diálogo de impressão e salvar como papel/PDF do navegador"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir Relatório</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                isDownloadingPdf
                  ? 'bg-emerald-700 text-emerald-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Relatório (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

