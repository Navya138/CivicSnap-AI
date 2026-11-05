import React, { useState } from 'react';
import { Incident, WardData, Language } from '../types';
import { INITIAL_WARDS } from '../data/sampleData';
import {
  MapPin,
  Flame,
  Truck,
  CheckCircle,
  AlertTriangle,
  Download,
  Layers,
  Waves,
  ChevronRight,
} from 'lucide-react';

interface WardHeatmapScreenProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  lang: Language;
}

export const WardHeatmapScreen: React.FC<WardHeatmapScreenProps> = ({
  incidents,
  onSelectIncident,
  lang,
}) => {
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(18); // Default to Ward 18 MVP Colony
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(true);
  const [showSev5Pins, setShowSev5Pins] = useState(true);
  const [showCrewsLayer, setShowCrewsLayer] = useState(true);
  const [showDrainsLayer, setShowDrainsLayer] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // AI Feature Filters for Ward Supervisor
  const [filterExposure, setFilterExposure] = useState<string>('all');
  const [filterRecovery, setFilterRecovery] = useState<string>('all');
  const [filterAccessibility, setFilterAccessibility] = useState<string>('all');

  // Overall Zone Statistics for the 3 AI Features
  const zoneAiStats = {
    highExposure: incidents.filter((i) => i.exposurePriority === 'HIGH').length,
    highRecovery: incidents.filter((i) => i.recoveryOpportunity === 'HIGH').length,
    largeTruck: incidents.filter((i) => i.recommendedCollectionMethod === 'large_compactor_truck').length,
    smallVehicle: incidents.filter((i) => i.recommendedCollectionMethod === 'small_collection_vehicle').length,
    manualSquad: incidents.filter((i) => i.recommendedCollectionMethod === 'manual_collection').length,
  };

  // Merge static ward defs with live incident state
  const liveWards: WardData[] = INITIAL_WARDS.map((w) => {
    const wardIncidents = incidents.filter((i) => i.wardNumber === w.number);
    const total = wardIncidents.length;
    const resolved = wardIncidents.filter((i) => i.status === 'resolved').length;
    const active = total - resolved;
    const severity5Count = wardIncidents.filter((i) => i.severity === 5 && i.status !== 'resolved').length;
    const drainBlockageCount = wardIncidents.filter(
      (i) => i.stormDrainBlockage === 'severe' && i.status !== 'resolved'
    ).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    const crewsDeployed = wardIncidents.filter((i) => i.assignedCrew).length;

    let densityLevel: WardData['densityLevel'] = 'low';
    if (severity5Count > 0 || drainBlockageCount >= 2 || active >= 3) densityLevel = 'critical';
    else if (active === 2 || drainBlockageCount >= 1) densityLevel = 'high';
    else if (active === 1) densityLevel = 'moderate';

    return {
      ...w,
      total,
      active,
      resolved,
      severity5Count,
      resolutionRate,
      crewsDeployed,
      densityLevel,
      drainBlockageCount,
      recentIncidents: wardIncidents,
    };
  });

  const activeWard = liveWards.find((w) => w.number === selectedWardNumber) || liveWards[0];
  const activeWardIncidents = incidents.filter((i) => i.wardNumber === activeWard.number);

  // Filtered ward incidents based on AI attributes
  const filteredWardIncidents = activeWardIncidents.filter((inc) => {
    if (filterExposure !== 'all' && inc.exposurePriority !== filterExposure) return false;
    if (filterRecovery !== 'all') {
      if (filterRecovery === 'NONE' && (inc.recoveryOpportunity === 'NONE' || inc.recoveryOpportunity === 'LOW')) {
        // match
      } else if (inc.recoveryOpportunity !== filterRecovery) {
        return false;
      }
    }
    if (filterAccessibility !== 'all' && inc.recommendedCollectionMethod !== filterAccessibility) return false;
    return true;
  });

  const handleExportCsv = () => {
    const rows = [
      ['TicketID', 'Category', 'Severity', 'DrainBlockage', 'WardNumber', 'WardName', 'Status', 'SLA_Hours', 'Lat', 'Lng', 'IsDemoData'],
      ...incidents.map((i) => [
        i.ticketNumber,
        i.categoryNameEn,
        i.severity,
        i.stormDrainBlockage,
        i.wardNumber,
        i.wardName,
        i.status,
        i.slaHours,
        i.coordinates.lat,
        i.coordinates.lng,
        'DEMO_DATA',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GVMC_Vizag_MVP_Colony_Garbage_Audit_DEMO_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionNotice('Visakhapatnam GVMC garbage GIS audit downloaded (CSV DEMO).');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAutoRoute = () => {
    setActionNotice('Dispatched closest desilting and garbage compactors to MVP Colony sectors.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F172A] text-white rounded-[8px] p-5 sm:p-6 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              GVMC SPATIAL SANITATION GIS
            </span>
            <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {lang === 'en'
              ? 'Visakhapatnam Ward Heatmap: Garbage & Drain Density'
              : 'విశాఖపట్నం వార్డుల హీట్‌మ్యాప్: చెత్త మరియు డ్రెయిన్ అడ్డంకులు'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {lang === 'en'
              ? 'Spatial GIS monitoring of solid waste accumulation, severe storm drain choke points, and GVMC sanitation fleet coverage across MVP Colony & coastal wards.'
              : 'ఎం.వి.పి కాలనీ మరియు తీరప్రాంత వార్డులలో చెత్త సాంద్రత, వర్షపు కాలువ అడ్డంకులు మరియు పారిశుధ్య వాహనాల పర్యవేక్షణ.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-[4px] border border-slate-700 flex items-center gap-2 transition-colors font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Vizag GIS (DEMO)</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] px-4 py-2 text-xs rounded-[4px] font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#059669]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: Interactive Map + Ward Dossier Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Interactive SVG Map (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#CBD5E1] rounded-[8px] p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] text-xs">
            <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
              <Layers className="w-4 h-4 text-[#059669]" />
              <span>VISAKHAPATNAM ZONE-2 WARD TOPOLOGY</span>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showHeatmapLayer}
                  onChange={(e) => setShowHeatmapLayer(e.target.checked)}
                  className="rounded-[2px] text-[#059669] focus:ring-[#059669]"
                />
                <span>Garbage Density</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showDrainsLayer}
                  onChange={(e) => setShowDrainsLayer(e.target.checked)}
                  className="rounded-[2px] text-[#D97706] focus:ring-[#D97706]"
                />
                <span className="text-[#92400E]">Storm Drain Chokes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showSev5Pins}
                  onChange={(e) => setShowSev5Pins(e.target.checked)}
                  className="rounded-[2px] text-[#EF4444] focus:ring-[#EF4444]"
                />
                <span className="text-[#991B1B]">SEV-5 Hazards</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showCrewsLayer}
                  onChange={(e) => setShowCrewsLayer(e.target.checked)}
                  className="rounded-[2px] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-[#1E40AF]">GVMC Squads</span>
              </label>
            </div>
          </div>

          {/* Interactive SVG Municipal Map: Visakhapatnam Coastal Strip */}
          <div className="relative bg-[#0F172A] rounded-[6px] overflow-hidden border border-slate-800 p-2 select-none aspect-[16/10]">
            <svg
              viewBox="0 0 760 480"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                </pattern>
                <radialGradient id="hazardGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="760" height="480" fill="url(#grid)" />

              {/* Bay of Bengal Coastline Ribbon */}
              <path
                d="M 680 0 Q 640 180 610 320 T 480 480 L 760 480 L 760 0 Z"
                fill="#0369A1"
                fillOpacity="0.3"
              />
              <path
                d="M 680 0 Q 640 180 610 320 T 480 480"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="4"
                strokeOpacity="0.8"
              />
              <text x="635" y="80" fill="#38BDF8" fontSize="10" fontFamily="JetBrains Mono" transform="rotate(75 635 80)" fillOpacity="0.8">
                BAY OF BENGAL COASTLINE (BEACH ROAD)
              </text>

              {/* Lawson's Bay Creek Outfall */}
              <path
                d="M 380 220 Q 460 270 610 320"
                fill="none"
                stroke="#0284C7"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeOpacity="0.7"
              />
              <text x="460" y="275" fill="#7DD3FC" fontSize="9" fontFamily="JetBrains Mono" fillOpacity="0.8">
                LAWSON'S BAY STORM OUTFLOW
              </text>

              {/* Municipal Ward Polygons */}
              {liveWards.map((w) => {
                const isSelected = w.number === selectedWardNumber;
                let fillColor = '#1E293B';
                let strokeColor = '#334155';

                if (showHeatmapLayer) {
                  if (w.densityLevel === 'critical') {
                    fillColor = isSelected ? '#7F1D1D' : '#450A0A';
                    strokeColor = '#EF4444';
                  } else if (w.densityLevel === 'high') {
                    fillColor = isSelected ? '#78350F' : '#451A03';
                    strokeColor = '#F59E0B';
                  } else if (w.densityLevel === 'moderate') {
                    fillColor = isSelected ? '#1E3A8A' : '#172554';
                    strokeColor = '#3B82F6';
                  } else {
                    fillColor = isSelected ? '#064E3B' : '#022C22';
                    strokeColor = '#059669';
                  }
                } else if (isSelected) {
                  fillColor = '#334155';
                  strokeColor = '#059669';
                }

                return (
                  <g
                    key={w.number}
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => setSelectedWardNumber(w.number)}
                  >
                    <circle
                      cx={w.polygonOffset.x}
                      cy={w.polygonOffset.y}
                      r={isSelected ? 64 : 54}
                      fill={fillColor}
                      stroke={isSelected ? '#FFFFFF' : strokeColor}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray={isSelected ? 'none' : '4 2'}
                      fillOpacity="0.85"
                    />

                    {/* Ward Label */}
                    <text
                      x={w.polygonOffset.x}
                      y={w.polygonOffset.y - 12}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="Public Sans"
                    >
                      Ward {w.number}
                    </text>
                    <text
                      x={w.polygonOffset.x}
                      y={w.polygonOffset.y + 4}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                    >
                      {w.name.split(' ')[0]}
                    </text>
                    <text
                      x={w.polygonOffset.x}
                      y={w.polygonOffset.y + 18}
                      textAnchor="middle"
                      fill={w.active > 0 ? '#FBBF24' : '#68DBA9'}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="JetBrains Mono"
                    >
                      {w.active} Active {w.drainBlockageCount > 0 ? `(${w.drainBlockageCount} Choked)` : ''}
                    </text>

                    {/* Storm Drain Choke Icon Indicator */}
                    {showDrainsLayer && w.drainBlockageCount > 0 && (
                      <g transform={`translate(${w.polygonOffset.x - 32}, ${w.polygonOffset.y - 32})`}>
                        <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#D97706" />
                        <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
                          {w.drainBlockageCount}D
                        </text>
                      </g>
                    )}

                    {/* Severity 5 Hazard Pulsing Pin */}
                    {showSev5Pins && w.severity5Count > 0 && (
                      <g transform={`translate(${w.polygonOffset.x + 30}, ${w.polygonOffset.y - 30})`}>
                        <circle cx="0" cy="0" r="16" fill="url(#hazardGlow)" />
                        <circle cx="0" cy="0" r="7" fill="#EF4444" />
                        <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
                      </g>
                    )}

                    {/* Squad Location Marker */}
                    {showCrewsLayer && w.crewsDeployed > 0 && (
                      <g transform={`translate(${w.polygonOffset.x - 28}, ${w.polygonOffset.y + 24})`}>
                        <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#2563EB" />
                        <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
                          {w.crewsDeployed}S
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-[#0F172A]/90 backdrop-blur-xs p-2.5 rounded-[4px] border border-slate-700 text-[10px] font-mono text-slate-300 space-y-1">
              <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                <span>DENSITY INDEX</span>
                <span className="px-1 py-0.2 bg-[#F59E0B] text-slate-950 font-bold rounded-[2px] text-[8px]">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-[2px]"></span>
                <span>Critical / Sev 5 Hazard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#D97706] rounded-[2px]"></span>
                <span>Severe Storm Drain Choke</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#059669] rounded-[2px]"></span>
                <span>Clear / Desilted</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>CLICK ANY WARD TO INSPECT TELEMETRY DOSSIER</span>
            <span className="font-bold text-slate-800">VIEWING: WARD {activeWard.number}</span>
          </div>
        </div>

        {/* Right Side: Selected Ward Telemetry Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#CBD5E1] rounded-[8px] p-5 shadow-sm space-y-5">
          {/* Ward Header */}
          <div className="pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#0F172A] text-white text-xs font-mono font-bold rounded-[2px]">
                  WARD #{activeWard.number} DOSSIER
                </span>
                <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
                  DEMO DATA
                </span>
              </div>
              <span
                className={`px-2 py-0.5 text-xs font-mono font-bold rounded-[2px] ${
                  activeWard.densityLevel === 'critical'
                    ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#F87171]'
                    : activeWard.densityLevel === 'high'
                    ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]'
                    : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                }`}
              >
                {activeWard.densityLevel.toUpperCase()}
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#0F172A] mt-2">
              {lang === 'te' ? activeWard.nameTe : activeWard.name}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Zone: {activeWard.zone} · MVP Colony Coordinates: {activeWard.center.lat}°N, {activeWard.center.lng}°E
            </p>
          </div>

          {/* Ward Metrics Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F8FAFC] border border-slate-200 p-3 rounded-[4px]">
              <span className="text-slate-500 block text-[11px] font-mono">ACTIVE GARBAGE TICKETS</span>
              <strong className="text-xl font-bold text-[#0F172A] font-mono mt-1 block">
                {activeWard.active}
              </strong>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 p-3 rounded-[4px]">
              <span className="text-slate-500 block text-[11px] font-mono">STORM DRAINS CHOKED</span>
              <strong
                className={`text-xl font-bold font-mono mt-1 block ${
                  activeWard.drainBlockageCount > 0 ? 'text-[#D97706]' : 'text-[#059669]'
                }`}
              >
                {activeWard.drainBlockageCount} Culverts
              </strong>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 p-3 rounded-[4px]">
              <span className="text-slate-500 block text-[11px] font-mono">GVMC SQUADS ASSIGNED</span>
              <strong className="text-xl font-bold text-[#1E40AF] font-mono mt-1 block">
                {activeWard.crewsDeployed} Squads
              </strong>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 p-3 rounded-[4px]">
              <span className="text-slate-500 block text-[11px] font-mono">CRITICAL SEV-5</span>
              <strong
                className={`text-xl font-bold font-mono mt-1 block ${
                  activeWard.severity5Count > 0 ? 'text-[#EF4444]' : 'text-slate-400'
                }`}
              >
                {activeWard.severity5Count} Emergencies
              </strong>
            </div>
          </div>

          {/* AI Zone Intelligence Metrics Strip */}
          <div className="bg-[#0F172A] text-white p-3 rounded-[6px] space-y-2 border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-300 block uppercase tracking-wider">
              ZONE-2 AI TRIAGE INTELLIGENCE (10 TICKETS)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-slate-900/80 p-2 rounded-[3px] border border-red-900/50">
                <span className="text-[10px] text-red-400 block">HIGH EXPOSURE</span>
                <strong className="text-sm font-bold text-white">{zoneAiStats.highExposure}</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-[3px] border border-emerald-900/50">
                <span className="text-[10px] text-emerald-400 block">HIGH RECOVERY</span>
                <strong className="text-sm font-bold text-white">{zoneAiStats.highRecovery}</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-[3px] border border-blue-900/50">
                <span className="text-[10px] text-blue-400 block">MANUAL SQUAD</span>
                <strong className="text-sm font-bold text-white">{zoneAiStats.manualSquad}</strong>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Fleet Clearance: {zoneAiStats.largeTruck} Large Truck · {zoneAiStats.smallVehicle} Mini-Tipper</span>
            </div>
          </div>

          {/* Ward AI Filter Controls */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-[6px] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800">
              <span>WARD AI FILTERS:</span>
              {(filterExposure !== 'all' || filterRecovery !== 'all' || filterAccessibility !== 'all') && (
                <button
                  onClick={() => {
                    setFilterExposure('all');
                    setFilterRecovery('all');
                    setFilterAccessibility('all');
                  }}
                  className="text-[10px] text-[#059669] hover:underline font-normal"
                >
                  Reset AI Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Exposure Filter */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">EXPOSURE</label>
                <select
                  value={filterExposure}
                  onChange={(e) => setFilterExposure(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-[3px] text-slate-800 font-mono text-[11px]"
                >
                  <option value="all">All Exposure</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              {/* Recovery Filter */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">RECOVERY</label>
                <select
                  value={filterRecovery}
                  onChange={(e) => setFilterRecovery(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-[3px] text-slate-800 font-mono text-[11px]"
                >
                  <option value="all">All Recovery</option>
                  <option value="HIGH">High Value</option>
                  <option value="MEDIUM">Medium Value</option>
                  <option value="NONE">Low / None</option>
                </select>
              </div>

              {/* Accessibility Filter */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">VEHICLE ACCESS</label>
                <select
                  value={filterAccessibility}
                  onChange={(e) => setFilterAccessibility(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-[3px] text-slate-800 font-mono text-[11px]"
                >
                  <option value="all">All Vehicles</option>
                  <option value="large_compactor_truck">Large Truck</option>
                  <option value="small_collection_vehicle">Mini-Tipper</option>
                  <option value="manual_collection">Manual Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Supervisor Actions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 font-mono">SUPERVISOR DISPATCH CONTROLS:</span>
            <div className="flex gap-2">
              <button
                onClick={handleAutoRoute}
                className="flex-1 py-2 px-3 text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white rounded-[4px] transition-colors font-mono flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Auto-Deploy Squads</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="py-2 px-3 text-xs font-semibold bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 rounded-[4px] transition-colors font-mono flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ward CSV</span>
              </button>
            </div>
          </div>

          {/* Incidents in this Ward */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 font-mono">
              <span>WARD TICKETS QUEUE ({filteredWardIncidents.length})</span>
            </div>

            {filteredWardIncidents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-[#F8FAFC] rounded-[4px]">
                No pending garbage tickets match the active AI filters in this ward.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredWardIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="p-2.5 rounded-[4px] border border-[#E2E8F0] hover:border-[#059669] bg-white cursor-pointer transition-colors text-xs flex items-center justify-between"
                  >
                    <div className="space-y-1 truncate pr-2 w-full">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] flex-wrap">
                        <span className="font-bold text-slate-800">{inc.ticketNumber}</span>
                        <span
                          className={`px-1 rounded-[2px] font-bold ${
                            inc.severity === 5
                              ? 'bg-[#FEF2F2] text-[#991B1B]'
                              : 'bg-[#FFFBEB] text-[#92400E]'
                          }`}
                        >
                          SEV-{inc.severity}
                        </span>
                        <span className="text-[#D97706] font-semibold">
                          Drain: {inc.stormDrainBlockage}
                        </span>
                        {inc.exposurePriority === 'HIGH' && (
                          <span className="px-1 bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[2px] font-bold">
                            EXP: HIGH
                          </span>
                        )}
                        {inc.recoveryOpportunity === 'HIGH' && (
                          <span className="px-1 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[2px] font-bold">
                            REC: HIGH
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 truncate">
                        {lang === 'te' ? inc.titleTe : inc.titleEn}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {inc.locationDetails} · {inc.recommendedCollectionMethod?.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
