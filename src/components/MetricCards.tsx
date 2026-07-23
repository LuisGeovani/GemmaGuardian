import React from 'react';
import { Property } from '../types';
import { Trees, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MetricCardsProps {
  property: Property;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ property }) => {
  const forestPct = Math.round((property.forestCoverHa / property.totalAreaHa) * 100);
  const gapPct = Math.round((property.recoveryGapHa / property.totalAreaHa) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Área Total */}
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-slate-300 flex justify-between items-start transition hover:shadow-md min-w-0">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">Área Total</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 truncate">
            {property.totalAreaHa.toFixed(2)} <span className="text-xs sm:text-sm font-semibold text-slate-500">ha</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
            {property.coordinates.crs}
          </p>
        </div>
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
          <Trees className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Cobertura Florestal */}
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 flex justify-between items-start transition hover:shadow-md min-w-0">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">Cobertura Florestal</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 truncate">
            {property.forestCoverHa.toFixed(2)} <span className="text-xs sm:text-sm font-semibold text-emerald-600/80">ha</span>
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono shrink-0">
              {forestPct}% do imóvel
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">Exigido: 80%</span>
          </div>
        </div>
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Gap de Recuperação */}
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-start transition hover:shadow-md min-w-0">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">Gap de Recuperação</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1 truncate">
            {property.recoveryGapHa.toFixed(2)} <span className="text-xs sm:text-sm font-semibold text-orange-600/80">ha</span>
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-mono shrink-0">
              {gapPct}% p/ PRAD
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">Déficit Florestal</span>
          </div>
        </div>
        <div className="p-2 bg-orange-50 rounded-lg text-orange-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Status de Embargo */}
      <div
        className={`p-4 rounded-xl shadow-sm border flex justify-between items-start transition min-w-0 ${
          property.embargoStatus.hasEmbargo
            ? 'bg-red-50/80 border-red-200'
            : 'bg-emerald-50/80 border-emerald-200'
        }`}
      >
        <div className="min-w-0 pr-2 flex-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wide truncate ${
              property.embargoStatus.hasEmbargo ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            Status de Embargo
          </p>
          
          <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span
              className={`text-sm sm:text-base font-bold font-mono leading-tight break-all ${
                property.embargoStatus.hasEmbargo ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {property.embargoStatus.embargoId}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded font-sans tracking-wider ${
                property.embargoStatus.hasEmbargo ? 'bg-red-200/80 text-red-900' : 'bg-emerald-200/80 text-emerald-900'
              }`}
            >
              {property.embargoStatus.status}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Órgão: <span className="font-semibold text-slate-700">{property.embargoStatus.organ}</span>
          </p>
        </div>

        <div
          className={`p-2 rounded-lg shrink-0 ${
            property.embargoStatus.hasEmbargo ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

