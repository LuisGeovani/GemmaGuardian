import React, { useEffect, useRef, useState } from 'react';
import { Property } from '../types';
import L from 'leaflet';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PenTool,
  Check,
  Trash2,
  ShieldAlert,
  Trees,
  AlertTriangle,
  X,
  Scan,
  Cpu,
  Loader2,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import { analyzeSatellitePolygonCV, CvAnalysisResult } from '../utils/computerVision';

interface GisMapViewerProps {
  property: Property;
  onCustomPolygonCreated?: (newProp: Property) => void;
}

// Approximate polygon area calculation in hectares using geodesic formula
function calculateAreaHectares(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const radius = 6378137; // Earth radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const p1 = coords[i];
    const p2 = coords[j];

    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const lng1 = (p1[1] * Math.PI) / 180;
    const lng2 = (p2[1] * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = (area * radius * radius) / 2;
  const areaM2 = Math.abs(area);
  return Number((areaM2 / 10000).toFixed(2));
}

export const GisMapViewer: React.FC<GisMapViewerProps> = ({ property, onCustomPolygonCreated }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const defLayerRef = useRef<L.Polygon | null>(null);
  const drawnMarkersRef = useRef<L.Marker[]>([]);
  const drawnPolylineRef = useRef<L.Polyline | null>(null);

  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');
  const [showLegalReserve, setShowLegalReserve] = useState(true);
  const [showDeforestation, setShowDeforestation] = useState(true);

  // Custom Polygon Draw Mode
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [drawnAreaHa, setDrawnAreaHa] = useState<number>(0);

  // Computer Vision & Polygon Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCvAnalyzing, setIsCvAnalyzing] = useState(false);
  const [cvResult, setCvResult] = useState<CvAnalysisResult | null>(null);

  const [greenPct, setGreenPct] = useState<number>(75);
  const [legalRegime, setLegalRegime] = useState<'amazonia_floresta' | 'amazonia_cerrado' | 'amazonia_campos' | 'custom'>('amazonia_floresta');
  const [customReservePct, setCustomReservePct] = useState<number>(80);
  const [customName, setCustomName] = useState<string>('Área Mapeada por Visão Computacional');
  const [customShpCode, setCustomShpCode] = useState<string>('GLEBA_SATELITE_01.SHP');

  // Active analysis coordinates (either drawn shape or current property)
  const [activeAnalysisCoords, setActiveAnalysisCoords] = useState<[number, number][]>([]);
  const [activeAnalysisAreaHa, setActiveAnalysisAreaHa] = useState<number>(10);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [property.coordinates.lat, property.coordinates.lng],
        zoom: 14,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 19,
        }
      );

      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Layer Mode (Satellite vs Street)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapMode === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri World Imagery',
          maxZoom: 19,
        }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    } else {
      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }
      );
      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;
    }
  }, [mapMode]);

  // Update Property Polygons on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing property layers
    if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
    if (defLayerRef.current) map.removeLayer(defLayerRef.current);

    if (property.polygonCoords && property.polygonCoords.length > 0) {
      const is100PercentPreserved = property.forestCoverHa >= property.totalAreaHa;
      const is100PercentDegraded = property.forestCoverHa === 0;
      const isMixedGleba = !is100PercentPreserved && !is100PercentDegraded;

      const forestPct = ((property.forestCoverHa / property.totalAreaHa) * 100).toFixed(1);
      const deforestedHa = (property.totalAreaHa - property.forestCoverHa).toFixed(2);
      const deforestedPct = (100 - (property.forestCoverHa / property.totalAreaHa) * 100).toFixed(1);

      // Main Property Polygon
      if (showLegalReserve) {
        const poly = L.polygon(property.polygonCoords, {
          color: is100PercentDegraded ? '#ef4444' : '#10b981',
          weight: 3,
          fillColor: is100PercentDegraded ? '#dc2626' : '#059669',
          fillOpacity: is100PercentDegraded ? 0.5 : isMixedGleba ? 0.25 : 0.4,
          dashArray: is100PercentDegraded ? '4, 4' : undefined,
        }).addTo(map);

        if (is100PercentPreserved) {
          poly.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
              <strong style="color: #065f46; font-size: 14px;">🌲 ${property.name}</strong><br/>
              <span style="display: inline-block; background: #d1fae5; color: #065f46; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px; border: 1px solid #a7f3d0;">🌲 100% FLORESTA NATIVA PRESERVADA</span><br/><br/>
              <b>Código Shapefile:</b> ${property.shapefileCode}<br/>
              <b>Área Total da Gleba:</b> ${property.totalAreaHa.toFixed(2)} ha<br/>
              <b>Cobertura Verde (Árvores):</b> ${property.forestCoverHa.toFixed(2)} ha (100%)<br/>
              <b>Área Desmatada:</b> 0 ha (0%)<br/>
              <b>Status PRAD:</b> Regularizado / Sem Déficit
            </div>
          `);
        } else if (is100PercentDegraded) {
          poly.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
              <strong style="color: #991b1b; font-size: 14px;">🚨 ${property.name}</strong><br/>
              <span style="display: inline-block; background: #fee2e2; color: #991b1b; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px; border: 1px solid #fca5a5;">🚨 100% ÁREA DESMATADA / SOLO EXPOSTO</span><br/><br/>
              <b>Código Shapefile:</b> ${property.shapefileCode}<br/>
              <b>Área Total Degradada:</b> ${property.totalAreaHa.toFixed(2)} ha<br/>
              <b>Cobertura Florestal:</b> 0 ha (0%)<br/>
              <b>Déficit PRAD (Recomposição):</b> ${property.recoveryGapHa.toFixed(2)} ha
            </div>
          `);
        } else {
          poly.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
              <strong style="color: #065f46; font-size: 14px;">🌳 ${property.name}</strong><br/>
              <span style="display: inline-block; background: #fef3c7; color: #92400e; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px; border: 1px solid #fde68a;">GLEBA MISTA (FLORESTA + DESMATAMENTO)</span><br/><br/>
              <b>Área Total da Gleba:</b> ${property.totalAreaHa.toFixed(2)} ha<br/>
              <b>🌲 Cobertura Florestal (Árvores):</b> ${property.forestCoverHa.toFixed(2)} ha (${forestPct}%)<br/>
              <b>🚨 Área Desmatada (Solo Exposto):</b> ${deforestedHa} ha (${deforestedPct}%)<br/>
              <b>Déficit Passível de PRAD:</b> ${property.recoveryGapHa.toFixed(2)} ha
            </div>
          `);
        }

        polygonLayerRef.current = poly;
      }

      // Deforestation / Embargo Zone Polygon (only if separate inner polygon exists & not 100% forest)
      if (
        showDeforestation &&
        property.deforestationCoords &&
        property.deforestationCoords.length > 0 &&
        !is100PercentPreserved &&
        !is100PercentDegraded
      ) {
        const defPoly = L.polygon(property.deforestationCoords, {
          color: '#ef4444',
          weight: 2,
          fillColor: '#dc2626',
          fillOpacity: 0.6,
          dashArray: '5, 5',
        }).addTo(map);

        defPoly.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px; color: #991b1b;">
            <strong style="font-size: 13px;">🚨 ÁREA ESPECÍFICA DESMATADA / DEGRADADA (VISÃO COMPUTACIONAL)</strong><br/>
            <b>Extensão Mapeada:</b> ${deforestedHa} ha<br/>
            <b>Proporção da Gleba:</b> ${deforestedPct}%<br/>
            <b>Déficit a Recompor (PRAD):</b> ${property.recoveryGapHa.toFixed(2)} ha
          </div>
        `);

        defLayerRef.current = defPoly;
      }

      // Center map bounds to property
      map.fitBounds(property.polygonCoords, { padding: [40, 40] });
    }
  }, [property, showLegalReserve, showDeforestation]);

  // Handle Map Click when Drawing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => {
        const updated = [...prev, newPoint];
        setDrawnAreaHa(calculateAreaHectares(updated));
        return updated;
      });

      // Add temporary marker
      const marker = L.circleMarker(newPoint, {
        radius: 6,
        color: '#fbbf24',
        fillColor: '#d97706',
        fillOpacity: 0.9,
      }).addTo(map);

      drawnMarkersRef.current.push(marker);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing]);

  // Update Polyline for Drawn Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (drawnPolylineRef.current) {
      map.removeLayer(drawnPolylineRef.current);
    }

    if (drawnPoints.length > 1) {
      const poly = L.polygon(drawnPoints, {
        color: '#f59e0b',
        weight: 3,
        fillColor: '#fef3c7',
        fillOpacity: 0.4,
        dashArray: '6, 6',
      }).addTo(map);

      drawnPolylineRef.current = poly;
    }
  }, [drawnPoints]);

  const handleStartDraw = () => {
    setIsDrawing(true);
    setDrawnPoints([]);
    setDrawnAreaHa(0);
    clearDrawnMarkers();
  };

  const clearDrawnMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    drawnMarkersRef.current.forEach((m) => map.removeLayer(m));
    drawnMarkersRef.current = [];

    if (drawnPolylineRef.current) {
      map.removeLayer(drawnPolylineRef.current);
      drawnPolylineRef.current = null;
    }
  };

  const handleCancelDraw = () => {
    setIsDrawing(false);
    setDrawnPoints([]);
    setDrawnAreaHa(0);
    clearDrawnMarkers();
  };

  // Run Computer Vision Analysis on Drawn Shape or Existing Property
  const handleRunComputerVision = async (coords: [number, number][], areaHa: number, isExistingProp = false) => {
    if (!coords || coords.length < 3) {
      alert('Selecione pelo menos 3 pontos no mapa para formar um polígono válido.');
      return;
    }

    setActiveAnalysisCoords(coords);
    setActiveAnalysisAreaHa(areaHa);
    setIsCvAnalyzing(true);
    setIsConfigModalOpen(true);
    setCvResult(null);

    if (isExistingProp) {
      setCustomName(property.name);
      setCustomShpCode(property.shapefileCode);
    } else {
      setCustomName(`Gleba Mapeada em Campo (${areaHa.toFixed(1)} ha)`);
      setCustomShpCode(`GLEBA_CAMPO_${Math.floor(Math.random() * 900 + 100)}.SHP`);
    }

    try {
      // Analyze satellite image pixels inside the polygon
      const result = await analyzeSatellitePolygonCV(coords, areaHa);
      setCvResult(result);
      setGreenPct(result.forestPct);
    } catch (err: any) {
      console.error('Erro na análise de visão computacional:', err);
    } finally {
      setIsCvAnalyzing(false);
    }
  };

  const handleConfirmPolygon = () => {
    const totalHa = activeAnalysisAreaHa || 10;

    const effectiveLegalReservePct =
      legalRegime === 'amazonia_floresta'
        ? 80
        : legalRegime === 'amazonia_cerrado'
        ? 35
        : legalRegime === 'amazonia_campos'
        ? 20
        : Math.min(100, Math.max(0, customReservePct));

    const centerLat = activeAnalysisCoords.reduce((acc, p) => acc + p[0], 0) / activeAnalysisCoords.length;
    const centerLng = activeAnalysisCoords.reduce((acc, p) => acc + p[1], 0) / activeAnalysisCoords.length;

    let forestHa = 0;
    let gapHa = 0;
    let defCoords: [number, number][] = [];

    if (cvResult) {
      forestHa = cvResult.forestHa;
      const deforestedHa = cvResult.degradedHa;
      const requiredLegalReserveHa = Number(((totalHa * effectiveLegalReservePct) / 100).toFixed(2));
      gapHa = Number(Math.max(0, requiredLegalReserveHa - forestHa).toFixed(2));
      defCoords = cvResult.deforestedSubPolygonCoords;
    } else {
      forestHa = Number(((totalHa * greenPct) / 100).toFixed(2));
      const requiredLegalReserveHa = Number(((totalHa * effectiveLegalReservePct) / 100).toFixed(2));
      gapHa = Number(Math.max(0, requiredLegalReserveHa - forestHa).toFixed(2));

      if (greenPct < 100) {
        const deforestedHa = Number((totalHa - forestHa).toFixed(2));
        const scaleRatio = Math.min(0.85, Math.sqrt(deforestedHa / totalHa));
        defCoords = activeAnalysisCoords.map(([lat, lng]) => [
          centerLat + (lat - centerLat) * scaleRatio,
          centerLng + (lng - centerLng) * scaleRatio,
        ]);
      }
    }

    const hasEmbargo = gapHa > 0;
    const deforestedHa = Number((totalHa - forestHa).toFixed(2));

    const newProp: Property = {
      id: `prop-drawn-${Date.now()}`,
      name: customName || `Gleba Analisada por Satélite`,
      location: 'RESEX Chico Mendes / Bacia do Acre',
      municipality: 'Xapuri',
      state: 'AC',
      coordinates: {
        lat: Number(centerLat.toFixed(4)),
        lng: Number(centerLng.toFixed(4)),
        crs: 'EPSG:4674 (SIRGAS 2000)',
        utmZone: 'UTM 19S',
      },
      totalAreaHa: totalHa,
      forestCoverHa: forestHa,
      recoveryGapHa: gapHa,
      legalReserveRequiredPct: effectiveLegalReservePct,
      embargoStatus: {
        hasEmbargo: hasEmbargo,
        embargoId: hasEmbargo ? '#VISAO-COMPUTACIONAL' : 'N/A',
        status: hasEmbargo ? 'ATIVO' : 'REGULARIZADO',
        cpfCnpjMasked: '999.***.***-88',
        organ: 'ICMBio / IBAMA',
      },
      shapefileCode: customShpCode || 'GLEBA_SATELITE.SHP',
      polygonPoints: [],
      polygonCoords: activeAnalysisCoords,
      deforestationCoords: defCoords,
      deforestationZones:
        greenPct < 100
          ? [
              {
                id: `def-${Date.now()}`,
                areaHa: deforestedHa,
                year: 2024,
                type: greenPct === 0
                  ? `Área 100% Desmatada / Solo Exposto (${totalHa.toFixed(2)} ha)`
                  : `Mancha Desmatada Detectada por Visão Computacional (${deforestedHa.toFixed(2)} ha / ${(100 - greenPct).toFixed(0)}% da Gleba)`,
              },
            ]
          : [],
    };

    if (onCustomPolygonCreated) {
      onCustomPolygonCreated(newProp);
    }

    setIsConfigModalOpen(false);
    setIsDrawing(false);
    clearDrawnMarkers();
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (mapInstanceRef.current && property.polygonCoords) {
      mapInstanceRef.current.fitBounds(property.polygonCoords, { padding: [40, 40] });
    }
  };

  const effectiveLegalReservePct =
    legalRegime === 'amazonia_floresta'
      ? 80
      : legalRegime === 'amazonia_cerrado'
      ? 35
      : legalRegime === 'amazonia_campos'
      ? 20
      : Math.min(100, Math.max(0, customReservePct));

  const calculatedForestHa = Number(((activeAnalysisAreaHa * greenPct) / 100).toFixed(2));
  const calculatedDeforestedHa = Number((activeAnalysisAreaHa - calculatedForestHa).toFixed(2));

  return (
    <div className="bg-slate-900 rounded-xl relative overflow-hidden flex flex-col border border-slate-300 shadow-sm h-full min-h-[360px]">
      {/* Top Controls Bar */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2 flex flex-wrap justify-between items-center z-20 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white font-bold">{property.shapefileCode}</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-300">{property.coordinates.utmZone}</span>
        </div>

        {/* Map Mode Buttons & Visão Computacional / Draw Toggle */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
              mapMode === 'satellite'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Satélite
          </button>
          <button
            onClick={() => setMapMode('street')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
              mapMode === 'street'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Vetor OSM
          </button>

          {/* Quick AI Computer Vision Scan Button for current property */}
          <button
            onClick={() => handleRunComputerVision(property.polygonCoords, property.totalAreaHa, true)}
            className="px-2.5 py-1 rounded text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1 cursor-pointer shadow-sm"
            title="Analisar Imagem de Satélite Atual com Visão Computacional"
          >
            <Scan className="w-3.5 h-3.5 text-indigo-200" />
            <span>Visão Computacional</span>
          </button>

          {!isDrawing ? (
            <button
              onClick={handleStartDraw}
              className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center space-x-1 cursor-pointer"
            >
              <PenTool className="w-3 h-3" />
              <span>Desenhar Polígono</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleRunComputerVision(drawnPoints, drawnAreaHa, false)}
                disabled={drawnPoints.length < 3}
                className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition flex items-center space-x-1 cursor-pointer"
              >
                <Scan className="w-3 h-3" />
                <span>Analisar Polígono ({drawnAreaHa} ha)</span>
              </button>
              <button
                onClick={handleCancelDraw}
                className="p-1 rounded bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition cursor-pointer"
                title="Cancelar desenho"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Draw Instruction Banner if drawing */}
      {isDrawing && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-bold flex justify-between items-center z-20 shadow-md animate-pulse">
          <span className="flex items-center space-x-1.5">
            <PenTool className="w-3.5 h-3.5" />
            <span>Clique no mapa para delimitar a área. A Visão Computacional analisará as árvores e o desmatamento automaticamente! ({drawnPoints.length} pontos)</span>
          </span>
          <span className="font-mono bg-slate-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">
            Área: {drawnAreaHa} ha
          </span>
        </div>
      )}

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[300px] z-0" />

      {/* Floating Zoom & Controls */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-1 bg-slate-950/90 p-1.5 rounded-lg border border-slate-700 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
          title="Aumentar Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
          title="Reduzir Zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
          title="Centralizar no Terreno"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Checkboxes (Top Right Overlay) */}
      <div className="absolute top-12 right-3 z-20 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-[10px] space-y-1.5 text-slate-300 shadow-xl">
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLegalReserve}
            onChange={(e) => setShowLegalReserve(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 bg-slate-800 border-slate-700"
          />
          <span className="text-emerald-400 font-bold">Reserva Legal / Limites</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDeforestation}
            onChange={(e) => setShowDeforestation(e.target.checked)}
            className="rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700"
          />
          <span className="text-red-400 font-bold">Área Degradada / Embargo</span>
        </label>
      </div>

      {/* Computer Vision & Satellite Image Spectral Analysis Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center border-b-2 border-indigo-500 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base">Visão Computacional de Satélite</h3>
                    <span className="bg-indigo-900/80 text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-700">
                      Sensoriamento Remoto
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Análise espectral de pixels em imagem de satélite (Sentinel-2 / Esri World Imagery)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
              {isCvAnalyzing ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                    <Cpu className="w-7 h-7 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Escaneando Imagem de Satélite no Polígono...</h4>
                    <p className="text-slate-500 text-xs max-w-sm">
                      Processando matriz de pixels, índice de vegetação (Excess Green Index) e segmentando copas de árvores vs solo exposto.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Heatmap Canvas & Core Metrics */}
                  <div className="md:col-span-5 space-y-4">
                    {/* Live Satellite Heatmap Mask Preview */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      <div className="w-full flex items-center justify-between text-[10px] text-slate-300 font-mono mb-2">
                        <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Máscara de Visão Computacional
                        </span>
                        {cvResult && (
                          <span className="text-emerald-400 font-bold">
                            {cvResult.confidenceScore}% precisão
                          </span>
                        )}
                      </div>

                      {cvResult?.heatmapDataUrl ? (
                        <div className="relative w-full rounded-lg overflow-hidden border border-slate-800 group">
                          <img
                            src={cvResult.heatmapDataUrl}
                            alt="Heatmap de Visão Computacional"
                            className="w-full h-[160px] object-cover"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md p-1.5 rounded text-[9.5px] font-mono text-slate-300 flex justify-between border border-slate-800">
                            <span className="text-emerald-400 font-bold">🟢 Árvores Detectadas</span>
                            <span className="text-red-400 font-bold">🔴 Solo Exposto</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-[150px] bg-slate-900 rounded-lg flex items-center justify-center text-slate-500">
                          Imagem processada
                        </div>
                      )}

                      {/* Summary Metrics Cards */}
                      <div className="w-full grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                        <div className="bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-lg text-emerald-200">
                          <span className="text-[9.5px] text-emerald-400 block font-semibold font-sans">🌲 Com Árvores (Floresta)</span>
                          <strong className="text-sm font-extrabold text-emerald-300">{greenPct}%</strong>
                          <span className="text-[10px] block text-emerald-400">{calculatedForestHa} ha</span>
                        </div>
                        <div className="bg-red-950/60 border border-red-800/80 p-2.5 rounded-lg text-red-200">
                          <span className="text-[9.5px] text-red-400 block font-semibold font-sans">🚨 Sem Árvores (Desmatado)</span>
                          <strong className="text-sm font-extrabold text-red-300">{100 - greenPct}%</strong>
                          <span className="text-[10px] block text-red-400">{calculatedDeforestedHa} ha</span>
                        </div>
                      </div>
                    </div>

                    {/* Polygon Identifiers */}
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Nome do Polígono Mapeado
                        </label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Código Shapefile / CAR
                        </label>
                        <input
                          type="text"
                          value={customShpCode}
                          onChange={(e) => setCustomShpCode(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Computer Vision Diagnostic Report */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Automated Computer Vision Summary Box */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                          <h4 className="font-bold text-slate-900 text-xs">Diagnóstico da Visão Computacional</h4>
                        </div>
                        {cvResult && (
                          <span className="bg-slate-200 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                            Setor: {cvResult.deforestedQuadrant}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {cvResult?.summaryReport || 'Análise de sensoriamento remoto finalizada.'}
                      </p>

                      {cvResult && (
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 text-slate-600 font-mono">
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <span className="text-[9.5px] text-slate-400 block font-sans uppercase">Classificação de Dossel</span>
                            <span className="font-bold text-slate-800">{cvResult.canopyType}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <span className="text-[9.5px] text-slate-400 block font-sans uppercase">Padrão de Alteração</span>
                            <span className="font-bold text-slate-800">{cvResult.deforestationType}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quadrants Sector Breakdown */}
                    {cvResult?.quadrantsSummary && (
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 block text-[11px] flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>Mapeamento Setorial por Quadrantes</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {cvResult.quadrantsSummary.map((q, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border text-[10.5px] flex justify-between items-center ${
                                q.isGreen
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  : 'bg-red-50 border-red-200 text-red-900'
                              }`}
                            >
                              <span className="font-bold">{q.quadrant}</span>
                              <span className="text-[9.5px] font-mono font-medium">{q.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual Fine-Tuning Range Slider */}
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                          <Info className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ajuste Fino de Calibração (% Árvores):</span>
                        </label>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded text-xs border border-emerald-200">
                          {greenPct}% Floresta
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={greenPct}
                        onChange={(e) => setGreenPct(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {/* Legal Reserve Selector */}
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                          <ShieldAlert className="w-4 h-4 text-emerald-700" />
                          <span>Regra de Reserva Legal Aplicável</span>
                        </label>
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          Exigência: {effectiveLegalReservePct}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLegalRegime('amazonia_floresta')}
                          className={`p-2 rounded-lg border text-left text-[11px] transition cursor-pointer ${
                            legalRegime === 'amazonia_floresta'
                              ? 'border-emerald-600 bg-emerald-100/80 text-emerald-950 font-bold'
                              : 'border-slate-200 text-slate-600 bg-white'
                          }`}
                        >
                          <div className="font-bold text-slate-900">Amazônia (Floresta)</div>
                          <div className="text-[9.5px] text-slate-500">80% Reserva Legal</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLegalRegime('amazonia_cerrado')}
                          className={`p-2 rounded-lg border text-left text-[11px] transition cursor-pointer ${
                            legalRegime === 'amazonia_cerrado'
                              ? 'border-emerald-600 bg-emerald-100/80 text-emerald-950 font-bold'
                              : 'border-slate-200 text-slate-600 bg-white'
                          }`}
                        >
                          <div className="font-bold text-slate-900">Amazônia (Cerrado)</div>
                          <div className="text-[9.5px] text-slate-500">35% Reserva Legal</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPolygon}
                disabled={isCvAnalyzing}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar e Salvar Polígono Mapeado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
