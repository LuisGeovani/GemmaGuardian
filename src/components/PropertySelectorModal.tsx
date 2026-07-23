import React, { useState } from 'react';
import { Property } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockData';
import { X, Layers, Check, Plus } from 'lucide-react';

interface PropertySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProperty: Property;
  onSelectProperty: (property: Property) => void;
}

export const PropertySelectorModal: React.FC<PropertySelectorModalProps> = ({
  isOpen,
  onClose,
  currentProperty,
  onSelectProperty,
}) => {
  const [customName, setCustomName] = useState('');
  const [customTotalArea, setCustomTotalArea] = useState('150');
  const [customForestCover, setCustomForestCover] = useState('100');
  const [customRecoveryGap, setCustomRecoveryGap] = useState('50');
  const [customHasEmbargo, setCustomHasEmbargo] = useState(true);
  const [customMunicipality, setCustomMunicipality] = useState('Xapuri');
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!isOpen) return null;

  const handleCreateCustomProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(customTotalArea) || 100;
    const forest = parseFloat(customForestCover) || 70;
    const requiredRl = 0.8 * total;
    const gap = Number(Math.max(0, requiredRl - forest).toFixed(2));
    const deforestedHa = Number(Math.max(0, total - forest).toFixed(2));

    const lat = -10.6512;
    const lng = -68.5028;

    const newProp: Property = {
      id: `prop-custom-${Date.now()}`,
      name: customName || 'Novo Seringal / Lote no Acre',
      location: 'RESEX Chico Mendes',
      municipality: customMunicipality || 'Xapuri',
      state: 'AC',
      coordinates: {
        lat: lat,
        lng: lng,
        crs: 'EPSG:4674 (SIRGAS 2000)',
        utmZone: 'UTM 19S',
      },
      totalAreaHa: total,
      forestCoverHa: forest,
      recoveryGapHa: gap,
      legalReserveRequiredPct: 80,
      embargoStatus: {
        hasEmbargo: customHasEmbargo,
        embargoId: customHasEmbargo ? '#309' : 'N/A',
        status: customHasEmbargo ? 'ATIVO' : 'REGULARIZADO',
        cpfCnpjMasked: '999.***.***-00',
        organ: 'ICMBio / IBAMA',
      },
      shapefileCode: 'MEU_IMOVEL_CUSTOM.SHP',
      polygonPoints: [],
      polygonCoords: [
        [lat - 0.008, lng - 0.008],
        [lat - 0.008, lng + 0.008],
        [lat + 0.008, lng + 0.008],
        [lat + 0.008, lng - 0.008],
      ],
      deforestationCoords:
        deforestedHa > 0
          ? [
              [lat - 0.003, lng - 0.003],
              [lat - 0.003, lng + 0.003],
              [lat + 0.003, lng + 0.003],
            ]
          : [],
      deforestationZones:
        deforestedHa > 0
          ? [
              {
                id: 'custom-def',
                areaHa: deforestedHa,
                year: 2024,
                type: `Área Desmatada / Solo Exposto (${deforestedHa} ha)`,
              },
            ]
          : [],
    };

    onSelectProperty(newProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 px-4 flex justify-between items-center border-b-2 border-emerald-500 shrink-0">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold">Seleção de Polígono / Terreno (GIS)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-slate-800 overflow-y-auto">
          {/* Preset Properties List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Imóveis Pré-Carregados no Bordo
            </h3>

            <div className="space-y-2.5">
              {INITIAL_PROPERTIES.map((prop) => {
                const isSelected = prop.id === currentProperty.id;

                return (
                  <div
                    key={prop.id}
                    onClick={() => {
                      onSelectProperty(prop);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{prop.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {prop.shapefileCode}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {prop.municipality}-{prop.state} • Total: {prop.totalAreaHa} ha • Floresta:{' '}
                        {prop.forestCoverHa} ha • PRAD Gap: {prop.recoveryGapHa} ha
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          prop.embargoStatus.hasEmbargo
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prop.embargoStatus.embargoId}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-emerald-600 rounded-full text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggle Custom Property Form */}
          <div className="pt-2 border-t border-slate-100">
            {!showCustomForm ? (
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl font-bold transition text-xs border border-slate-300"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Inserir Parâmetros de Terreno Customizado (Shapefile / CAR)</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCustomProperty} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 uppercase text-[11px]">
                    Cadastrar Novo Imóvel Customizado
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-[10px]"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nome do Imóvel / Seringal</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ex: Fazenda Boa Esperança"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Município (Acre)</label>
                    <input
                      type="text"
                      value={customMunicipality}
                      onChange={(e) => setCustomMunicipality(e.target.value)}
                      placeholder="Ex: Xapuri"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Área Total (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customTotalArea}
                      onChange={(e) => setCustomTotalArea(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Cobertura Florestal (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customForestCover}
                      onChange={(e) => setCustomForestCover(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Déficit PRAD (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customRecoveryGap}
                      onChange={(e) => setCustomRecoveryGap(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      required
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={customHasEmbargo}
                        onChange={(e) => setCustomHasEmbargo(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-red-700">Possui Embargo Ativo (ICMBio)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition mt-2 shadow-sm"
                >
                  Carregar Terreno no Bordo
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
