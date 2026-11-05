import React, { useState } from 'react';
import { Incident, Language, RecommendedCollectionMethod, CollectionAccessibility } from '../types';
import { IncidentThumbnail } from './IncidentThumbnail';
import {
  X,
  MapPin,
  Clock,
  ThumbsUp,
  HardHat,
  Truck,
  Phone,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Waves,
  HeartPulse,
  Recycle,
  ShieldAlert,
  HelpCircle,
  Building,
  Navigation,
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onVerifyAccessibility?: (
    incidentId: string,
    method: RecommendedCollectionMethod,
    accessibility: CollectionAccessibility
  ) => void;
  lang: Language;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpvote,
  onVerifyAccessibility,
  lang,
}) => {
  if (!incident) return null;

  const [hasVoted, setHasVoted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'recovery' | 'access'>('overview');
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);

  const handleVote = () => {
    if (!hasVoted) {
      onUpvote(incident.id);
      setHasVoted(true);
    }
  };

  const handleVehicleOverride = (
    method: RecommendedCollectionMethod,
    accessibility: CollectionAccessibility
  ) => {
    if (onVerifyAccessibility) {
      onVerifyAccessibility(incident.id, method, accessibility);
      setOverrideNotice(`Vehicle verified/updated to: ${method.replace(/_/g, ' ').toUpperCase()}`);
      setTimeout(() => setOverrideNotice(null), 3000);
    }
  };

  const getSeverityBadge = (sev: number) => {
    if (sev === 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[4px]">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
          SEV-5 CRITICAL HAZARD
        </span>
      );
    }
    if (sev >= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[4px]">
          SEV-{sev} MODERATE RISK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[4px]">
        SEV-{sev} ROUTINE CLEANUP
      </span>
    );
  };

  const getStormDrainBadge = () => {
    if (incident.stormDrainBlockage === 'severe') {
      return (
        <div className="flex items-center gap-2 p-2.5 bg-[#FEF2F2] border border-[#F87171] rounded-[4px] text-xs">
          <Waves className="w-4 h-4 text-[#EF4444] shrink-0" />
          <div>
            <div className="font-bold font-mono text-[#991B1B] uppercase flex items-center gap-1.5">
              <span>STORM DRAIN CHOKE: SEVERE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping"></span>
            </div>
            <div className="text-slate-800 text-[11px] mt-0.5">
              {lang === 'te' ? incident.drainBlockageDetailsTe : incident.drainBlockageDetailsEn}
            </div>
          </div>
        </div>
      );
    }
    if (incident.stormDrainBlockage === 'partial') {
      return (
        <div className="flex items-center gap-2 p-2.5 bg-[#FFFBEB] border border-[#FCD34D] rounded-[4px] text-xs">
          <Waves className="w-4 h-4 text-[#D97706] shrink-0" />
          <div>
            <div className="font-bold font-mono text-[#92400E] uppercase">
              STORM DRAIN CHOKE: PARTIAL
            </div>
            <div className="text-slate-800 text-[11px] mt-0.5">
              {lang === 'te' ? incident.drainBlockageDetailsTe : incident.drainBlockageDetailsEn}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 p-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[4px] text-xs">
        <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" />
        <div>
          <div className="font-bold font-mono text-[#065F46] uppercase">
            STORM DRAIN STATUS: CLEAR / NO BLOCKAGE
          </div>
          <div className="text-slate-800 text-[11px] mt-0.5">
            {lang === 'te' ? incident.drainBlockageDetailsTe : incident.drainBlockageDetailsEn}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-[#CBD5E1] rounded-[8px] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12)] my-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-[3px]">
              {incident.ticketNumber}
            </div>
            <span className="px-1.5 py-0.5 bg-[#F59E0B] text-slate-950 text-[10px] font-mono font-bold rounded-[2px]">
              DEMO DATA
            </span>
            {getSeverityBadge(incident.severity)}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[3px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center px-6 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 font-bold transition-colors ${
              activeTab === 'overview'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Triage
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`py-2.5 px-3 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'health'
                ? 'border-[#EF4444] text-[#991B1B]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Health Exposure ({incident.exposurePriority || 'MED'})</span>
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2.5 px-3 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'recovery'
                ? 'border-[#059669] text-[#065F46]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Recycle className="w-3.5 h-3.5 text-[#059669]" />
            <span>Waste Recovery ({incident.recoveryOpportunity || 'LOW'})</span>
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`py-2.5 px-3 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'access'
                ? 'border-[#2563EB] text-[#1E40AF]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Vehicle Access ({incident.collectionAccessibility || 'MED'})</span>
          </button>
        </div>

        {overrideNotice && (
          <div className="bg-[#ECFDF5] border-b border-[#A7F3D0] text-[#065F46] px-6 py-2 text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#059669]" />
            <span>{overrideNotice}</span>
          </div>
        )}

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title & Location Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#059669] uppercase tracking-wide">
                {incident.categoryNameEn}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-mono text-slate-500">GVMC Zone-2</span>
            </div>

            <h2 className="text-xl font-bold text-[#0F172A] leading-tight mb-1">
              {lang === 'te' ? incident.titleTe : incident.titleEn}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-3">
              {lang === 'te' ? incident.titleEn : incident.titleTe}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                <strong className="text-slate-900">
                  Ward {incident.wardNumber} ({lang === 'te' ? incident.wardNameTe : incident.wardName})
                </strong>
                <span>· {incident.locationDetails}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Reported: {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
              <span>·</span>
              <span>GPS: {incident.coordinates.lat.toFixed(4)}°N, {incident.coordinates.lng.toFixed(4)}°E (Vizag)</span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Storm Drain Blockage Highlight Box */}
              {getStormDrainBadge()}

              {/* Visual Evidence & AI Assessment Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <IncidentThumbnail
                    category={incident.category}
                    severity={incident.severity}
                    customImage={incident.imageThumbnail?.startsWith('data:') ? incident.imageThumbnail : undefined}
                    thumbnailType={incident.imageThumbnail}
                    className="w-full h-48 border border-[#CBD5E1]"
                    isDemoData={true}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">
                      {incident.verifiedByCitizens} neighborhood verifications
                    </span>
                    <button
                      type="button"
                      onClick={handleVote}
                      disabled={hasVoted}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] font-semibold text-xs transition-colors ${
                        hasVoted
                          ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                          : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3 text-[#059669]" />
                      <span>{hasVoted ? 'Verified by You' : '+1 Verify Report'}</span>
                    </button>
                  </div>
                </div>

                {/* AI Diagnostics Dossier */}
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                      <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                        AI SANITATION AUDIT LOG
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {incident.aiTriageLog?.model || 'Gemini 3.8 Flash Vision'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px] font-medium">Hazard Rationale:</span>
                        <p className="text-slate-800 font-medium mt-0.5">
                          {incident.aiTriageLog?.hazardAnalysis || incident.descriptionEn}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-medium">GVMC Sanitation Wing:</span>
                        <p className="text-[#0F172A] font-semibold">
                          {lang === 'te' ? incident.departmentTe : incident.department}
                        </p>
                      </div>

                      {incident.aiTriageLog?.recommendedGear && (
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Mandated Squad PPE & Gear:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {incident.aiTriageLog.recommendedGear.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 text-[10px] font-mono rounded-[2px]"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">SLA TARGET: {incident.slaHours} HOURS</span>
                    <span className="font-bold text-[#059669]">CONFIDENCE: 98%</span>
                  </div>
                </div>
              </div>

              {/* Quick AI Features Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setActiveTab('health')}
                  className="p-3 bg-[#FEF2F2] border border-[#F87171] rounded-[4px] cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#991B1B]">
                    <span className="flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-[#EF4444]" />
                      HEALTH EXPOSURE
                    </span>
                    <span>{incident.exposurePriority || 'MED'}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">
                    {incident.exposureReason || 'Proximity-based exposure score'}
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('recovery')}
                  className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[4px] cursor-pointer hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#065F46]">
                    <span className="flex items-center gap-1">
                      <Recycle className="w-3.5 h-3.5 text-[#059669]" />
                      WASTE RECOVERY
                    </span>
                    <span>{incident.recoveryOpportunity || 'MED'}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">
                    {incident.recommendedRecoveryAction || 'Circular segregation pathway'}
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('access')}
                  className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#1E40AF]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
                      COLLECTION ACCESS
                    </span>
                    <span>{(incident.recommendedCollectionMethod || 'small_collection_vehicle').replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">
                    {incident.accessibilityReason || 'Visual road obstacles assessment'}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {lang === 'en' ? 'Field Incident Narrative' : 'క్షేత్రస్థాయి సమస్య వివరణ'}
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {lang === 'te' ? incident.descriptionTe : incident.descriptionEn}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PUBLIC HEALTH EXPOSURE MAPPER */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="bg-[#FEF2F2] border border-[#F87171] rounded-[6px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#EF4444]" />
                    <span className="font-mono font-bold text-sm text-[#991B1B]">
                      PUBLIC HEALTH EXPOSURE ASSESSMENT
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 font-mono font-bold text-xs bg-[#7F1D1D] text-white rounded-[3px]">
                    PRIORITY: {incident.exposurePriority || 'MEDIUM'}
                  </span>
                </div>

                <div className="text-xs text-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-900 block font-mono">EXPOSURE RATIONALE:</span>
                  <p className="leading-relaxed bg-white p-2.5 rounded-[4px] border border-red-200">
                    {incident.exposureReason ||
                      'Computed based on waste toxicity category, storm runoff obstruction, and GPS distance to vulnerable neighborhood hubs.'}
                  </p>
                </div>

                {/* Nearby Sensitive Facilities in MVP Colony */}
                <div className="space-y-2 pt-2 border-t border-red-200">
                  <span className="text-xs font-mono font-bold text-[#991B1B] block">
                    NEARBY SENSITIVE RECEPTORS (MVP COLONY GIS):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(incident.nearbySensitivePlaces || []).map((place, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-red-200 p-2.5 rounded-[4px] text-xs flex items-center justify-between font-mono"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">{place.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase">{place.type}</span>
                          </div>
                        </div>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-[2px] text-[10px] shrink-0 ${
                            place.distanceMeters <= 50
                              ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#F87171]'
                              : place.distanceMeters <= 150
                              ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {place.distanceMeters}m away
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Ethical & Public Health Disclaimer */}
                <div className="bg-white border border-[#CBD5E1] p-3 rounded-[4px] text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">AI Public Health Assessment Disclaimer:</strong>
                    <span>
                      Exposure-priority scores are calculated solely from visible environmental accumulation, storm drain blockage risk, and GPS proximity to sensitive institutions. <em>CivicSnap AI never claims that disease, contamination, or actual clinical health damage has been detected or diagnosed.</em>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WASTE RECOVERY OPPORTUNITY FINDER */}
          {activeTab === 'recovery' && (
            <div className="space-y-4">
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-[6px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Recycle className="w-5 h-5 text-[#059669]" />
                    <span className="font-mono font-bold text-sm text-[#065F46]">
                      WASTE RECOVERY & CIRCULAR SEGREGATION
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 font-mono font-bold text-xs bg-[#064E3B] text-white rounded-[3px]">
                    OPPORTUNITY: {incident.recoveryOpportunity || 'MEDIUM'}
                  </span>
                </div>

                {/* Recommended Recovery Pathway */}
                <div className="bg-white p-3 rounded-[4px] border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold font-mono text-[#065F46] block uppercase">
                    RECOMMENDED HANDLING & CIRCULAR ACTION:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {incident.recommendedRecoveryAction ||
                      'Segregate clean plastics and metals before dispatch to GVMC Material Recovery Facility (MRF).'}
                  </p>
                </div>

                {/* Detected Materials Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#065F46] block">
                    VISUALLY DETECTED SOLID WASTE FRACTIONS:
                  </span>
                  <div className="bg-white border border-emerald-200 rounded-[4px] overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFC] border-b border-emerald-200 text-slate-600 font-mono text-[10px]">
                        <tr>
                          <th className="py-2 px-3">MATERIAL FRACTION</th>
                          <th className="py-2 px-3">RECYCLABILITY</th>
                          <th className="py-2 px-3">CONFIDENCE</th>
                          <th className="py-2 px-3">RECOMMENDED HANDLING</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100 font-mono">
                        {(incident.detectedMaterials || []).map((mat, idx) => {
                          const matName = mat.material || mat.name || 'Detected Material';
                          const conf = typeof mat.confidence === 'number' ? Math.round(mat.confidence * 100) : 90;
                          const cat = (mat.category || '').toLowerCase();
                          const isHighValue = cat === 'plastic' || cat === 'cardboard' || cat === 'metal';
                          const isOrganic = cat === 'organic';

                          return (
                            <tr key={idx} className="hover:bg-emerald-50/50">
                              <td className="py-2 px-3 font-bold text-slate-800">{matName}</td>
                              <td className="py-2 px-3">
                                {isHighValue ? (
                                  <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[2px] text-[10px]">
                                    HIGH VALUE
                                  </span>
                                ) : isOrganic ? (
                                  <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] rounded-[2px] text-[10px]">
                                    COMPOSTABLE
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-[2px] text-[10px]">
                                    NON-RECYCLABLE
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-[#059669] font-bold">
                                {conf}%
                              </td>
                              <td className="py-2 px-3 font-sans text-slate-700 text-[11px]">
                                {mat.recommendedHandling}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mandatory Waste Segregation Disclaimer */}
                <div className="bg-white border border-[#CBD5E1] p-3 rounded-[4px] text-[11px] text-slate-600 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Material Verification Notice:</strong>
                    <span>
                      Detected materials are identified through computer vision inference only and are explicitly distinguished from confirmed recyclable inventory. Actual material purity, moisture contamination, and facility acceptance must be confirmed upon intake at an authorized Material Recovery Facility (MRF).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLLECTION ACCESSIBILITY SCORE */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#2563EB]" />
                    <span className="font-mono font-bold text-sm text-[#1E40AF]">
                      COLLECTION ACCESSIBILITY & FLEET ROUTING
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 font-mono font-bold text-xs bg-[#1E3A8A] text-white rounded-[3px]">
                    ACCESSIBILITY: {incident.collectionAccessibility || 'MEDIUM'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-[4px] border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-[#1E40AF] block uppercase">
                      RECOMMENDED VEHICLE CLASS:
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-300 text-blue-900 font-mono font-bold rounded-[3px]">
                      {(incident.recommendedCollectionMethod || 'small_collection_vehicle').replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {incident.accessibilityReason ||
                      'Analyzed road width, overhead cables, storm culvert obstruction, and parked vehicle congestion.'}
                  </p>
                </div>

                {/* Visual Obstacles List */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-[#1E40AF] block">
                    VISIBLE PASSAGE & ROAD OBSTACLES:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(incident.visibleRoadObstacles || ['Narrow passage']).map((obs, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-blue-200 text-slate-800 text-xs font-mono rounded-[3px] flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                        <span>{obs}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Human Verification / Vehicle Override Buttons */}
                <div className="bg-white p-3 rounded-[4px] border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                    <span>SUPERVISOR VEHICLE VERIFICATION / OVERRIDE:</span>
                    <span className="text-[10px] text-slate-500 font-normal">Human in the loop</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVehicleOverride('large_compactor_truck', 'HIGH')}
                      className={`p-2 rounded-[4px] border text-xs font-mono font-bold transition-all ${
                        incident.recommendedCollectionMethod === 'large_compactor_truck'
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-[#F8FAFC] text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Large Compactor Truck
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVehicleOverride('small_collection_vehicle', 'MEDIUM')}
                      className={`p-2 rounded-[4px] border text-xs font-mono font-bold transition-all ${
                        incident.recommendedCollectionMethod === 'small_collection_vehicle'
                          ? 'bg-[#F59E0B] text-slate-950 border-[#F59E0B]'
                          : 'bg-[#F8FAFC] text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Mini-Tipper / Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVehicleOverride('manual_collection', 'LOW')}
                      className={`p-2 rounded-[4px] border text-xs font-mono font-bold transition-all ${
                        incident.recommendedCollectionMethod === 'manual_collection'
                          ? 'bg-[#EF4444] text-white border-[#EF4444]'
                          : 'bg-[#F8FAFC] text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Manual Squad Only
                    </button>
                  </div>
                </div>

                {/* Mandatory Sensor Disclaimer */}
                <div className="bg-white border border-[#CBD5E1] p-3 rounded-[4px] text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Fleet Accessibility Disclaimer:</strong>
                    <span>
                      Image analysis alone cannot confirm actual physical road width, weight limits, or dynamic vehicle clearance. Field supervisors and drivers must perform on-ground verification before deploying heavy equipment.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Squad or Resolution Status */}
          {incident.status === 'resolved' ? (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-[6px] p-4 text-xs text-[#065F46] space-y-2">
              <div className="flex items-center gap-2 font-bold font-mono">
                <CheckCircle className="w-4 h-4 text-[#059669]" />
                INCIDENT RESOLVED & VERIFIED IN FIELD
              </div>
              <p className="text-slate-800">
                {incident.resolutionNotes || 'Cleaned and cleared according to GVMC sanitation standards.'}
              </p>
              <div className="font-mono text-[11px] text-slate-600">
                Closed at: {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Recent'}
              </div>
            </div>
          ) : incident.assignedCrew ? (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#1E40AF] font-mono">
                  <HardHat className="w-4 h-4 text-[#2563EB]" />
                  ACTIVE GVMC SQUAD DISPATCHED
                </div>
                <div className="text-slate-900 font-semibold">{incident.assignedCrew.name}</div>
                <div className="text-slate-600 font-mono text-[11px]">
                  Vehicle: {incident.assignedCrew.vehicle}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${incident.assignedCrew.contact}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-[4px] font-semibold text-xs transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#059669]" />
                  <span>Call Squad ({incident.assignedCrew.contact})</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-[6px] p-4 text-xs text-slate-600 flex items-center justify-between">
              <span>Awaiting squad assignment from MVP Colony Ward Dispatch console.</span>
              <span className="font-mono text-slate-500">GVMC ZONE-2 QUEUE</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            CivicSnap ID: {incident.ticketNumber} · Visakhapatnam GVMC Certified Demo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-[4px] hover:bg-slate-50 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

