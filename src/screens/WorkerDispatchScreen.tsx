import React, { useState } from 'react';
import { Incident, Language, RecommendedCollectionMethod, CollectionAccessibility } from '../types';
import { IncidentThumbnail } from '../components/IncidentThumbnail';
import {
  Truck,
  HardHat,
  Clock,
  MapPin,
  CheckCircle,
  Phone,
  Flame,
  ChevronRight,
  Waves,
  ShieldAlert,
  HeartPulse,
  Recycle,
  AlertTriangle,
} from 'lucide-react';

interface WorkerDispatchScreenProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, status: Incident['status'], crew?: any) => void;
  onOpenResolutionModal: (incident: Incident) => void;
  onSelectIncident: (incident: Incident) => void;
  onVerifyAccessibility?: (
    incidentId: string,
    method: RecommendedCollectionMethod,
    accessibility: CollectionAccessibility
  ) => void;
  lang: Language;
}

export const WorkerDispatchScreen: React.FC<WorkerDispatchScreenProps> = ({
  incidents,
  onUpdateStatus,
  onOpenResolutionModal,
  onSelectIncident,
  onVerifyAccessibility,
  lang,
}) => {
  const [selectedCrewFilter, setSelectedCrewFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'sev5' | 'choked' | 'active'>('active');

  // GVMC Visakhapatnam Sanitation Squads
  const squads = [
    {
      id: 'CREW-GVMC-D01',
      name: 'GVMC Super-Sucker Hydro-Desilting Squad #1',
      type: 'drain_blockage',
      vehicle: 'Desilting Tanker AP-31-TE-4102',
      contact: '+91 891 274 5501',
      base: 'MVP Colony Ward 18 Depot',
      status: 'On Mission',
    },
    {
      id: 'CREW-GVMC-H03',
      name: 'GVMC Bio-Hazard Neutralization Squad #3',
      type: 'bio_hazardous',
      vehicle: 'Sealed Bio-Carrier AP-31-TA-8921',
      contact: '+91 891 274 5502',
      base: 'GVMC Public Health Wing (Zone-2)',
      status: 'On Mission',
    },
    {
      id: 'CREW-GVMC-S07',
      name: 'MVP Market Flying Cleansing Crew #7',
      type: 'commercial_market',
      vehicle: 'Mini JCB Compactor AP-31-TC-1108',
      contact: '+91 891 274 5503',
      base: 'Ushodaya Rythu Bazaar Depot',
      status: 'On Site',
    },
    {
      id: 'CREW-GVMC-B02',
      name: 'GVMC Beachfront Swachh Squad #2',
      type: 'coastal_beach',
      vehicle: 'Coastal Sweeper AP-31-TE-0110',
      contact: '+91 891 274 5506',
      base: "Lawson's Bay Coastal Post",
      status: 'Patrolling',
    },
  ];

  // Filter tasks
  const dispatchTasks = incidents.filter((inc) => {
    if (urgencyFilter === 'sev5' && inc.severity !== 5) return false;
    if (urgencyFilter === 'choked' && inc.stormDrainBlockage !== 'severe') return false;
    if (urgencyFilter === 'active' && inc.status === 'resolved') return false;

    if (selectedCrewFilter !== 'all') {
      if (!inc.assignedCrew || inc.assignedCrew.id !== selectedCrewFilter) {
        return false;
      }
    }
    return true;
  });

  const handleProgressStatus = (incident: Incident) => {
    if (incident.status === 'open') {
      const defaultCrew = squads.find((s) => s.type === incident.category) || squads[0];
      onUpdateStatus(incident.id, 'dispatched', {
        id: defaultCrew.id,
        name: defaultCrew.name,
        vehicle: defaultCrew.vehicle,
        contact: defaultCrew.contact,
      });
    } else if (incident.status === 'dispatched') {
      onUpdateStatus(incident.id, 'in_progress');
    } else if (incident.status === 'in_progress') {
      onOpenResolutionModal(incident);
    }
  };

  const renderVehicleBadge = (method?: string) => {
    if (method === 'large_compactor_truck') {
      return (
        <span className="px-2 py-0.5 bg-[#0F172A] text-white font-mono font-bold text-[10px] rounded-[2px] flex items-center gap-1">
          <Truck className="w-3 h-3 text-slate-300" />
          LARGE COMPACTOR TRUCK
        </span>
      );
    }
    if (method === 'small_collection_vehicle') {
      return (
        <span className="px-2 py-0.5 bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] font-mono font-bold text-[10px] rounded-[2px] flex items-center gap-1">
          <Truck className="w-3 h-3 text-[#D97706]" />
          SMALL COLLECTION VEHICLE (MINI-TIPPER)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] font-mono font-bold text-[10px] rounded-[2px] flex items-center gap-1">
        <Truck className="w-3 h-3 text-[#EF4444]" />
        MANUAL SQUAD ONLY (NARROW/BLOCKED)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white rounded-[8px] p-5 sm:p-6 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              GVMC SWACHH VISAKHA DISPATCH
            </span>
            <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {lang === 'en'
              ? 'MVP Colony Sanitation Squad Dispatch List'
              : 'ఎం.వి.పి కాలనీ పారిశుధ్య సిబ్బంది కార్యాచరణ జాబితా'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {lang === 'en'
              ? 'Field execution queue with AI vehicle recommendations, recyclable recovery targets, and public health exposure priority.'
              : 'వాహన సిఫార్సులు, రీసైక్లింగ్ వ్యర్థాల రకాలు మరియు ప్రజారోగ్య ప్రాధాన్యతతో కూడిన క్షేత్రస్థాయి విధులు.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-[6px] border border-slate-700">
          <Truck className="w-5 h-5 text-[#059669]" />
          <div className="text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">VISAKHA SQUADS</span>
            <strong className="text-white">4 SQUADS ACTIVE</strong>
          </div>
        </div>
      </div>

      {/* Field Squad Units Strip */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2 font-mono">
          <span>GVMC ACTIVE SANITATION SQUADS (DEMO)</span>
          <span className="text-slate-500 font-normal">ZONE-2 MVP COLONY</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {squads.map((sq) => (
            <div
              key={sq.id}
              onClick={() =>
                setSelectedCrewFilter(selectedCrewFilter === sq.id ? 'all' : sq.id)
              }
              className={`p-3.5 rounded-[6px] border cursor-pointer transition-all ${
                selectedCrewFilter === sq.id
                  ? 'border-[#059669] bg-[#ECFDF5] shadow-xs ring-1 ring-[#059669]'
                  : 'border-[#CBD5E1] bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold bg-[#E2E8F0] px-1.5 py-0.2 rounded-[2px] text-slate-700">
                  {sq.id}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] ${
                    sq.status === 'On Site'
                      ? 'bg-[#EFF6FF] text-[#1E40AF]'
                      : sq.status === 'On Mission'
                      ? 'bg-[#FEF2F2] text-[#991B1B]'
                      : 'bg-[#ECFDF5] text-[#065F46]'
                  }`}
                >
                  {sq.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">{sq.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                {sq.vehicle} · {sq.base}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                <span>{sq.contact}</span>
                <span className="text-[#059669] font-semibold">Filter Squad</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Filter Controls */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700 font-mono text-[11px]">DISPATCH QUEUE:</span>
          <button
            onClick={() => setUrgencyFilter('active')}
            className={`px-2.5 py-1 rounded-[4px] font-semibold transition-colors ${
              urgencyFilter === 'active'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Active Orders ({incidents.filter((i) => i.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setUrgencyFilter('choked')}
            className={`px-2.5 py-1 rounded-[4px] font-semibold transition-colors flex items-center gap-1 ${
              urgencyFilter === 'choked'
                ? 'bg-[#B45309] text-white'
                : 'bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]'
            }`}
          >
            <Waves className="w-3 h-3 text-[#D97706]" />
            <span>Severe Drain Chokes</span>
          </button>
          <button
            onClick={() => setUrgencyFilter('sev5')}
            className={`px-2.5 py-1 rounded-[4px] font-semibold transition-colors flex items-center gap-1 ${
              urgencyFilter === 'sev5'
                ? 'bg-[#991B1B] text-white'
                : 'bg-[#FEF2F2] text-[#991B1B] border border-[#F87171]'
            }`}
          >
            <Flame className="w-3 h-3 text-[#EF4444]" />
            <span>Severity 5 Emergencies</span>
          </button>
          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-2.5 py-1 rounded-[4px] font-semibold transition-colors ${
              urgencyFilter === 'all'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Tickets (TKT-101 to TKT-110)
          </button>
        </div>

        {selectedCrewFilter !== 'all' && (
          <button
            onClick={() => setSelectedCrewFilter('all')}
            className="text-xs text-[#059669] hover:underline font-mono"
          >
            Clear Squad Filter ({selectedCrewFilter})
          </button>
        )}
      </div>

      {/* Dispatch Work Orders List */}
      <div className="space-y-4">
        {dispatchTasks.length === 0 ? (
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-8 text-center text-slate-600">
            <CheckCircle className="w-8 h-8 text-[#059669] mx-auto mb-2" />
            <p className="font-bold text-sm">No garbage tickets match the current filter.</p>
            <p className="text-xs text-slate-500 mt-1">All selected squad tasks in MVP Colony are completed.</p>
          </div>
        ) : (
          dispatchTasks.map((task) => {
            const isSev5 = task.severity === 5;
            const isResolved = task.status === 'resolved';

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-[6px] p-4 sm:p-5 transition-all shadow-[0_1px_3px_0_rgba(15,23,42,0.06)] ${
                  isSev5 && !isResolved
                    ? 'border-[#F87171] ring-1 ring-[#F87171] bg-[#FFFBFB]'
                    : 'border-[#CBD5E1]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0]">
                  {/* Task Header Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="font-bold bg-[#0F172A] text-white px-2 py-0.5 rounded-[2px]">
                        {task.ticketNumber}
                      </span>
                      <span className="px-1 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-bold rounded-[2px]">
                        DEMO DATA
                      </span>
                      {isSev5 ? (
                        <span className="px-2 py-0.5 font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[2px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                          SEV-5: CRITICAL 2H SLA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[2px]">
                          SEV-{task.severity} · {task.slaHours}H SLA TARGET
                        </span>
                      )}
                      <span className="text-slate-500">
                        Ward {task.wardNumber} ({task.wardName})
                      </span>
                    </div>

                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#059669]">
                        {task.categoryNameEn}
                      </span>
                      <span className="text-slate-400 text-xs">·</span>
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] ${
                          task.stormDrainBlockage === 'severe'
                            ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#F87171]'
                            : task.stormDrainBlockage === 'partial'
                            ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]'
                            : 'bg-[#ECFDF5] text-[#065F46]'
                        }`}
                      >
                        Storm Drain: {task.stormDrainBlockage.toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-xs">·</span>
                      {renderVehicleBadge(task.recommendedCollectionMethod)}
                    </div>

                    <h3 className="text-base font-bold text-[#0F172A] pt-0.5">
                      {lang === 'te' ? task.titleTe : task.titleEn}
                    </h3>
                  </div>

                  {/* Progressive Field Worker Status Action Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono text-xs hidden sm:block">
                      <span className="text-slate-500 block text-[10px]">CURRENT PHASE</span>
                      <strong className="text-slate-900 uppercase">
                        {task.status.replace('_', ' ')}
                      </strong>
                    </div>

                    {!isResolved && (
                      <button
                        onClick={() => handleProgressStatus(task)}
                        className={`px-4 py-2 text-xs font-bold rounded-[4px] transition-colors flex items-center gap-2 shadow-xs ${
                          task.status === 'open'
                            ? 'bg-[#0F172A] hover:bg-slate-800 text-white'
                            : task.status === 'dispatched'
                            ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                            : 'bg-[#059669] hover:bg-[#047857] text-white'
                        }`}
                      >
                        {task.status === 'open' && (
                          <>
                            <Truck className="w-3.5 h-3.5" />
                            <span>Accept & Deploy Squad</span>
                          </>
                        )}
                        {task.status === 'dispatched' && (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Mark Arrived On Site</span>
                          </>
                        )}
                        {task.status === 'in_progress' && (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Submit Proof & Complete</span>
                          </>
                        )}
                      </button>
                    )}

                    {isResolved && (
                      <span className="px-3 py-1.5 text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[4px] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
                        DESILTED & RESOLVED
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Dispatch Intelligence Strip: Priority Reason, Materials to Recover, Vehicle Override */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 border-b border-[#F1F5F9] text-xs">
                  {/* Priority Reason */}
                  <div className="p-2.5 bg-[#FEF2F2] border border-red-200 rounded-[4px] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#991B1B] uppercase flex items-center gap-1">
                      <HeartPulse className="w-3 h-3 text-[#EF4444]" />
                      PRIORITY REASON ({task.exposurePriority || 'MED'} EXPOSURE)
                    </span>
                    <p className="text-slate-800 text-[11px] leading-snug">
                      {task.exposureReason || 'Direct proximity to neighborhood traffic and drainage network.'}
                    </p>
                  </div>

                  {/* Materials to Recover */}
                  <div className="p-2.5 bg-[#ECFDF5] border border-emerald-200 rounded-[4px] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#065F46] uppercase flex items-center gap-1">
                      <Recycle className="w-3 h-3 text-[#059669]" />
                      MATERIALS TO RECOVER ({task.recoveryOpportunity || 'LOW'})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(task.detectedMaterials || []).slice(0, 3).map((m, idx) => {
                        const matTitle = m.material || m.name || 'Recyclable';
                        const pct = typeof m.confidence === 'number' ? Math.round(m.confidence * 100) : 90;
                        return (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-white border border-emerald-300 text-slate-800 text-[10px] font-mono rounded-[2px]"
                          >
                            {matTitle} ({pct}%)
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Human Vehicle Verification / Override */}
                  <div className="p-2.5 bg-[#EFF6FF] border border-blue-200 rounded-[4px] space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#1E40AF] uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-[#2563EB]" />
                        VEHICLE CLEARANCE VERIFICATION
                      </span>
                      <span className="text-[9px] text-slate-500 font-normal">Human override</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        value={task.recommendedCollectionMethod || 'small_collection_vehicle'}
                        onChange={(e) => {
                          const val = e.target.value as RecommendedCollectionMethod;
                          const access: CollectionAccessibility =
                            val === 'large_compactor_truck' ? 'HIGH' : val === 'small_collection_vehicle' ? 'MEDIUM' : 'LOW';
                          if (onVerifyAccessibility) {
                            onVerifyAccessibility(task.id, val, access);
                          }
                        }}
                        className="w-full px-2 py-1 bg-white border border-blue-300 rounded-[3px] text-slate-900 font-mono text-[11px] font-semibold"
                      >
                        <option value="large_compactor_truck">Large Compactor Truck</option>
                        <option value="small_collection_vehicle">Small Collection (Mini-Tipper)</option>
                        <option value="manual_collection">Manual Squad Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Task Body: Location, Required Gear & AI Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                  {/* Location & Navigation */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-mono text-[11px] block font-semibold">
                      MVP COLONY LOCATION & GPS:
                    </span>
                    <p className="text-slate-900 font-medium">{task.locationDetails}</p>
                    <p className="font-mono text-[11px] text-[#059669]">
                      GPS: {task.coordinates.lat.toFixed(4)}° N, {task.coordinates.lng.toFixed(4)}° E (Vizag)
                    </p>
                  </div>

                  {/* Mandated Safety Gear Checklist */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-mono text-[11px] block font-semibold">
                      MANDATED SQUAD PPE & EQUIPMENT:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(task.aiTriageLog?.recommendedGear || [
                        'Heavy Gloves',
                        'Sanitation Boots',
                        'Trash Rakes',
                      ]).map((gear, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-[#F1F5F9] text-slate-800 font-mono text-[10px] rounded-[2px] border border-slate-200"
                        >
                          {gear}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Crew Details */}
                  <div className="space-y-1 bg-[#F8FAFC] p-2 rounded-[4px] border border-slate-200">
                    <span className="text-slate-500 font-mono text-[11px] block font-semibold">
                      ASSIGNED GVMC SQUAD:
                    </span>
                    <div className="font-bold text-[#0F172A]">
                      {task.assignedCrew?.name || 'Unassigned Flying Squad'}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <span>{task.assignedCrew?.vehicle || 'GVMC Vehicle Standby'}</span>
                      {task.assignedCrew?.contact && (
                        <a
                          href={`tel:${task.assignedCrew.contact}`}
                          className="text-[#059669] hover:underline font-bold"
                        >
                          Call Squad
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inspect Link */}
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Drain Status: {task.drainBlockageDetailsEn}
                  </span>
                  <button
                    onClick={() => onSelectIncident(task)}
                    className="text-[#0F172A] hover:text-[#059669] font-semibold flex items-center gap-1 font-mono"
                  >
                    <span>Full Diagnostic Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


