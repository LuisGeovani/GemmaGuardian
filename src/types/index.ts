export interface Property {
  id: string;
  name: string;
  location: string;
  municipality: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
    crs: string;
    utmZone: string;
  };
  totalAreaHa: number;
  forestCoverHa: number;
  recoveryGapHa: number;
  legalReserveRequiredPct: number; // e.g. 80% for Amazonia Legal
  embargoStatus: {
    hasEmbargo: boolean;
    embargoId: string;
    status: 'ATIVO' | 'REGULARIZADO' | 'ISENTO' | 'EM_ANALISE';
    cpfCnpjMasked: string;
    organ: string;
  };
  shapefileCode: string;
  polygonPoints?: Array<{ x: number; y: number }>;
  polygonCoords: [number, number][]; // Lat, Lng pairs for Leaflet
  deforestationCoords?: [number, number][]; // Lat, Lng pairs for embargo/gap zone
  deforestationZones: Array<{ id: string; areaHa: number; year: number; type: string }>;
}

export interface EmbargoRecord {
  id: string;
  cpfCnpj: string;
  cpfCnpjClean: string; // digits only
  nomeInfrator: string;
  termoEmbargo: string;
  numProcesso: string;
  organ: string;
  municipio: string;
  uf: string;
  areaEmbargadaHa: number;
  status: 'ATIVO' | 'REGULARIZADO' | 'EM_ANALISE';
  dataEmbargo: string;
  infracao: string;
  nomeUc?: string;
  theGeom?: string;
  wktCoords?: [number, number][];
  lat?: number;
  lng?: number;
}

export interface AgentStep {
  id: number;
  name: string;
  role: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  subtext: string;
  confidencePct?: number;
  details?: string;
}

export interface LogEntry {
  timestamp: string;
  stepCode: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface NativeSpecies {
  id: string;
  popularName: string;
  scientificName: string;
  ecologicalGroup: 'Pioneira' | 'Secundária Inicial' | 'Secundária Tardia' | 'Clímax';
  growthRate: 'Rápido' | 'Médio' | 'Lento';
  densityPerHa: number;
  uses: string[];
  description: string;
}

export interface PradProposal {
  propertyId: string;
  status: string;
  version?: string;
  generatedAt?: string;
  title?: string;
  summary?: string;
  targetRecoveryAreaHa?: number;
  professionals: Array<{ role: string; requirement: string }>;
  speciesSuggested: NativeSpecies[];
  priorityActions: Array<{ id: number; title: string; description: string }>;
  estimatedCostBrl: number;
  estimatedTimeMonths: number;
  carbonOffsetTonsPerYear: number;
}
