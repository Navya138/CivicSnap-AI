import React, { useState, useMemo } from 'react';
import { Incident, IncidentSeverity, IncidentStatus, Language, StormDrainBlockageStatus, ExposurePriority, RecoveryOpportunity, CollectionAccessibility } from '../types';
import { IncidentThumbnail } from '../components/IncidentThumbnail';
import { UI_STRINGS } from '../data/sampleData';
import {
  Search,
  Filter,
  Camera,
  ThumbsUp,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  Flame,
  ChevronRight,
  Waves,
  Sparkles,
  ShieldAlert,
  Recycle,
  HeartPulse,
} from 'lucide-react';

interface LiveStreamScreenProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onUpvoteIncident: (id: string) => void;
  onOpenReportModal: () => void;
  lang: Language;
}

export const LiveStreamScreen: React.FC<LiveStreamScreenProps> = ({
  incidents,
  onSelectIncident,
  onUpvoteIncident,
  onOpenReportModal,
  lang,
}) => {
  const strings = UI_STRINGS[lang];

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedDrainStatus, setSelectedDrainStatus] = useState<string>('all');
  const [selectedExposure, setSelectedExposure] = useState<string>('all');
  const [selectedRecovery, setSelectedRecovery] = useState<string>('all');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('all');

  // KPI Calculations
  const stats = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter((i) => i.status !== 'resolved').length;
    const resolved = incidents.filter((i) => i.status === 'resolved').length;
    const criticalSev5 = incidents.filter((i) => i.severity === 5 && i.status !== 'resolved').length;
    const severeDrains = incidents.filter((i) => i.stormDrainBlockage === 'severe' && i.status !== 'resolved').length;
    const highExposure = incidents.filter((i) => i.exposurePriority === 'HIGH' && i.status !== 'resolved').length;
    const highRecovery = incidents.filter((i) => i.recoveryOpportunity === 'HIGH' && i.status !== 'resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { total, active, resolved, criticalSev5, severeDrains, highExposure, highRecovery, resolutionRate };
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitleEn = item.titleEn.toLowerCase().includes(q);
        const matchTitleTe = item.titleTe.toLowerCase().includes(q);
        const matchTicket = item.ticketNumber.toLowerCase().includes(q);
        const matchWard = item.wardName.toLowerCase().includes(q);
        const matchLocation = item.locationDetails.toLowerCase().includes(q);
        const matchCategory = item.categoryNameEn.toLowerCase().includes(q);
        const matchExposure = (item.exposurePriority || '').toLowerCase().includes(q);
        const matchRecovery = (item.recoveryOpportunity || '').toLowerCase().includes(q);
        if (!matchTitleEn && !matchTitleTe && !matchTicket && !matchWard && !matchLocation && !matchCategory && !matchExposure && !matchRecovery) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedSeverity !== 'all' && item.severity.toString() !== selectedSeverity) {
        return false;
      }
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      if (selectedWard !== 'all' && item.wardNumber.toString() !== selectedWard) {
        return false;
      }
      if (selectedDrainStatus !== 'all' && item.stormDrainBlockage !== selectedDrainStatus) {
        return false;
      }
      if (selectedExposure !== 'all' && item.exposurePriority !== selectedExposure) {
        return false;
      }
      if (selectedRecovery !== 'all') {
        if (selectedRecovery === 'NONE' && (item.recoveryOpportunity === 'NONE' || item.recoveryOpportunity === 'LOW')) {
          // match low or none
        } else if (item.recoveryOpportunity !== selectedRecovery) {
          return false;
        }
      }
      if (selectedAccessibility !== 'all' && item.recommendedCollectionMethod !== selectedAccessibility) {
        return false;
      }

      return true;
    });
  }, [
    incidents,
    searchTerm,
    selectedCategory,
    selectedSeverity,
    selectedStatus,
    selectedWard,
    selectedDrainStatus,
    selectedExposure,
    selectedRecovery,
    selectedAccessibility,
  ]);

  // Exposure Priority badge
  const renderExposureBadge = (priority: ExposurePriority) => {
    if (priority === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[2px]" title="High Public Health Exposure Priority (Proximity assessment only)">
          <HeartPulse className="w-3 h-3 text-[#EF4444]" />
          EXPOSURE: HIGH
        </span>
      );
    }
    if (priority === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[2px]" title="Medium Public Health Exposure Priority">
          <HeartPulse className="w-3 h-3 text-[#D97706]" />
          EXPOSURE: MED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[2px]" title="Low Public Health Exposure Priority">
        <HeartPulse className="w-3 h-3 text-[#059669]" />
        EXPOSURE: LOW
      </span>
    );
  };

  // Recovery Opportunity badge
  const renderRecoveryBadge = (opportunity: RecoveryOpportunity) => {
    if (opportunity === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[2px]" title="High Waste Recovery Opportunity">
          <Recycle className="w-3 h-3 text-[#059669]" />
          RECOVERY: HIGH
        </span>
      );
    }
    if (opportunity === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] rounded-[2px]" title="Medium Waste Recovery Opportunity">
          <Recycle className="w-3 h-3 text-[#2563EB]" />
          RECOVERY: MED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F8FAFC] text-slate-600 border border-slate-300 rounded-[2px]" title="Low or Non-Recoverable Waste">
        <Recycle className="w-3 h-3 text-slate-400" />
        RECOVERY: LOW/NONE
      </span>
    );
  };

  // Collection Accessibility badge
  const renderAccessBadge = (method: string, accessibility?: string) => {
    if (method === 'large_compactor_truck') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F8FAFC] text-slate-800 border border-[#CBD5E1] rounded-[2px]" title="Large Compactor Truck Accessible (High Access)">
          <Truck className="w-3 h-3 text-slate-700" />
          ACCESS: LARGE TRUCK
        </span>
      );
    }
    if (method === 'small_collection_vehicle') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[2px]" title="Small Collection Vehicle (Mini-Tipper / Auto) (Medium Access)">
          <Truck className="w-3 h-3 text-[#D97706]" />
          ACCESS: MINI-TIPPER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[2px]" title="Manual Collection Mandated (Low Access / Narrow Passage)">
        <Truck className="w-3 h-3 text-[#EF4444]" />
        ACCESS: MANUAL ONLY
      </span>
    );
  };

  // Severity badge
  const renderSeverityBadge = (severity: IncidentSeverity) => {
    if (severity === 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[4px]">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
          SEV-5 CRITICAL
        </span>
      );
    }
    if (severity >= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[4px]">
          SEV-{severity} MODERATE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[4px]">
        SEV-{severity} NORMAL
      </span>
    );
  };

  // Storm drain blockage badge
  const renderDrainBadge = (drainStatus: StormDrainBlockageStatus) => {
    if (drainStatus === 'severe') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[2px]">
          <Waves className="w-3 h-3 text-[#EF4444]" />
          DRAIN CHOKED: SEVERE
        </span>
      );
    }
    if (drainStatus === 'partial') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[2px]">
          <Waves className="w-3 h-3 text-[#D97706]" />
          DRAIN: PARTIAL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[2px]">
        <CheckCircle className="w-3 h-3 text-[#059669]" />
        DRAIN: CLEAR
      </span>
    );
  };

  // Status indicator badge
  const renderStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[4px]">
            <CheckCircle className="w-3 h-3 text-[#059669]" />
            RESOLVED
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] rounded-[4px]">
            <Clock className="w-3 h-3 text-[#2563EB]" />
            IN PROGRESS
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] rounded-[4px]">
            <Truck className="w-3 h-3 text-[#F59E0B]" />
            SQUAD DISPATCHED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold bg-white text-slate-700 border border-[#CBD5E1] rounded-[4px]">
            OPEN TRIAGE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* DEMO DATA Notice Bar */}
      <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-[6px] px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#92400E]">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-[#F59E0B] text-slate-950 font-mono font-bold text-[10px] rounded-[2px]">
            DEMO DATA
          </span>
          <span className="font-semibold">
            {lang === 'en'
              ? 'Showing 10 Sample Garbage Tickets (TKT-101 to TKT-110) for MVP Colony, Visakhapatnam, Andhra Pradesh (GVMC Zone-2).'
              : 'ఎం.వి.పి. కాలనీ, విశాఖపట్నం (జివిఎంసి జోన్-2) కు సంబంధించిన 10 నమూనా చెత్త సమస్యల డేటా (TKT-101 నుండి TKT-110).'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-600">
          All data clearly labeled as DEMO DATA
        </span>
      </div>

      {/* Hero Action Strip */}
      <div className="bg-[#0F172A] text-white rounded-[8px] p-5 sm:p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#059669] text-white text-[10px] font-mono font-bold rounded-[2px] tracking-wider uppercase">
                GVMC SWACHH VISAKHA AI
              </span>
              <span className="text-slate-400 text-xs font-mono">
                MVP COLONY / ZONE-2 OPERATIONS
              </span>
              <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
                DEMO DATA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {lang === 'en'
                ? 'MVP Colony Garbage Triage & Storm Drain Monitor'
                : 'ఎం.వి.పి కాలనీ చెత్త సమస్యలు మరియు వర్షపు కాలువల పర్యవేక్షణ'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'Computer vision analyzes street garbage piles, classifies plastic vs organic rot, monitors storm drain blockage risk, and triggers GVMC sanitation squads.'
                : 'జెమిని ఏఐ ద్వారా చెత్త పరిమాణం, ప్లాస్టిక్ రకాలు, కాలువ అడ్డంకులు విశ్లేషించబడి తక్షణమే జివిఎంసి పారిశుధ్య సిబ్బందికి పంపబడతాయి.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenReportModal}
              className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] border border-[#047857] rounded-[6px] shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>{strings.btnReport}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{strings.activeHazards}</span>
            <Flame className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#991B1B] mt-1.5 flex items-baseline gap-2">
            <span>{stats.criticalSev5}</span>
            <span className="text-xs font-sans font-semibold text-slate-500">SEV-5 Tickets</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            TKT-101 (Drain) & TKT-102 (Bio)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Storm Drains Severely Choked</span>
            <Waves className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#0F172A] mt-1.5 flex items-baseline gap-2">
            <span>{stats.severeDrains}</span>
            <span className="text-xs font-sans font-semibold text-slate-500">High Risk</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Monsoon culverts obstructed
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Garbage Backlog</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#0F172A] mt-1.5">
            {stats.active} of {stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Across MVP Colony Sectors
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{strings.resolvedToday}</span>
            <CheckCircle className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#059669] mt-1.5 flex items-baseline gap-2">
            <span>{stats.resolved}</span>
            <span className="text-xs font-sans font-semibold text-slate-500">(TKT-110 Desilted)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Citizen verified cleanups
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={strings.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Clear Filters */}
          {(selectedCategory !== 'all' ||
            selectedSeverity !== 'all' ||
            selectedStatus !== 'all' ||
            selectedWard !== 'all' ||
            selectedDrainStatus !== 'all' ||
            selectedExposure !== 'all' ||
            selectedRecovery !== 'all' ||
            selectedAccessibility !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSelectedStatus('all');
                setSelectedWard('all');
                setSelectedDrainStatus('all');
                setSelectedExposure('all');
                setSelectedRecovery('all');
                setSelectedAccessibility('all');
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-[#0F172A] font-semibold border border-dashed border-slate-300 rounded-[4px] hover:bg-slate-50 transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid - Row 1: Core Triage */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-[#E2E8F0] text-xs">
          {/* Garbage Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
          >
            <option value="all">{strings.allCategories}</option>
            <option value="drain_blockage">Storm Drain Plastic Choke</option>
            <option value="bio_hazardous">Bio-Medical & Hazardous</option>
            <option value="commercial_market">Market & Organic Rot</option>
            <option value="dumper_overflow">Dumper Bin Overflow</option>
            <option value="c_and_d_rubble">Construction Rubble</option>
            <option value="coastal_beach">Coastal Beachfront Litter</option>
            <option value="residential_solid">Residential Solid Waste</option>
            <option value="bulk_green">Bulk Greenery / Branches</option>
          </select>

          {/* Storm Drain Blockage Dropdown */}
          <select
            value={selectedDrainStatus}
            onChange={(e) => setSelectedDrainStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
          >
            <option value="all">All Storm Drain States</option>
            <option value="severe">Severe Blockage (90% Choke)</option>
            <option value="partial">Partial Choke</option>
            <option value="none">Clear / No Drain</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
          >
            <option value="all">{strings.allSeverities}</option>
            <option value="5">Severity 5 (Critical Risk)</option>
            <option value="4">Severity 4 (Arterial Urgent)</option>
            <option value="3">Severity 3 (Moderate)</option>
            <option value="2">Severity 2 (Normal)</option>
            <option value="1">Severity 1 (Routine / Cleaned)</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
          >
            <option value="all">{strings.allStatuses}</option>
            <option value="open">Open Triage</option>
            <option value="dispatched">Squad Dispatched</option>
            <option value="in_progress">Cleansing in Progress</option>
            <option value="resolved">Resolved & Desilted</option>
          </select>

          {/* Ward Dropdown */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
          >
            <option value="all">All Vizag Wards</option>
            <option value="18">Ward 18 - MVP Colony</option>
            <option value="19">Ward 19 - Lawson's Bay</option>
            <option value="20">Ward 20 - Ushodaya Junction</option>
            <option value="17">Ward 17 - Sivajipalem</option>
            <option value="21">Ward 21 - Isukathota</option>
          </select>
        </div>

        {/* Filter Dropdowns Grid - Row 2: AI Upgrades (Exposure, Recovery, Vehicle Access) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-dashed border-[#E2E8F0] text-xs">
          {/* Feature 1: Exposure Priority */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase shrink-0">Exposure:</span>
            <select
              value={selectedExposure}
              onChange={(e) => setSelectedExposure(e.target.value)}
              className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
            >
              <option value="all">All Health Exposure Levels</option>
              <option value="HIGH">High Exposure (Near School/Hospital/Market)</option>
              <option value="MEDIUM">Medium Exposure (Residential Buffer)</option>
              <option value="LOW">Low Exposure (Isolated / Open Space)</option>
            </select>
          </div>

          {/* Feature 2: Recovery Opportunity */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase shrink-0">Recovery:</span>
            <select
              value={selectedRecovery}
              onChange={(e) => setSelectedRecovery(e.target.value)}
              className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
            >
              <option value="all">All Recovery Opportunities</option>
              <option value="HIGH">High Recovery (Segregated Recyclables)</option>
              <option value="MEDIUM">Medium Recovery (Mixed Recoverable)</option>
              <option value="NONE">Low / None (Contaminated / Rubble)</option>
            </select>
          </div>

          {/* Feature 3: Collection Accessibility */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase shrink-0">Access:</span>
            <select
              value={selectedAccessibility}
              onChange={(e) => setSelectedAccessibility(e.target.value)}
              className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] text-slate-800 font-medium focus:border-[#059669]"
            >
              <option value="all">All Collection Vehicles</option>
              <option value="large_compactor_truck">Large Compactor Truck (Wide Road)</option>
              <option value="small_collection_vehicle">Mini-Tipper / Auto (Narrow Lane)</option>
              <option value="manual_collection">Manual Squad Only (Culvert / Blocked)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Cards Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>
            SHOWING {filteredIncidents.length} OF {incidents.length} SAMPLE GARBAGE TICKETS (TKT-101 TO TKT-110)
          </span>
          <span className="hidden sm:inline">MVP COLONY, VISAKHAPATNAM (ANDHRA PRADESH)</span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-10 text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-[#059669] mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No garbage tickets match your selected filters
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting your category, drain status, or AI feature filters to view the other sample tickets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncidents.map((incident) => {
              const stripeColor =
                incident.status === 'resolved'
                  ? 'border-l-[#059669]'
                  : incident.severity === 5
                  ? 'border-l-[#EF4444]'
                  : incident.severity >= 3
                  ? 'border-l-[#F59E0B]'
                  : 'border-l-[#059669]';

              return (
                <div
                  key={incident.id}
                  className={`bg-white border border-[#E2E8F0] ${stripeColor} border-l-4 rounded-[6px] p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.06)] hover:border-[#CBD5E1] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] transition-all flex flex-col justify-between`}
                >
                  <div>
                    {/* Card Header: Metadata Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-[#F1F5F9] px-2 py-0.5 rounded-[2px]">
                          {incident.ticketNumber}
                        </span>
                        <span className="px-1 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
                          DEMO DATA
                        </span>
                        {renderStatusBadge(incident.status)}
                      </div>
                      {renderSeverityBadge(incident.severity)}
                    </div>

                    {/* Storm Drain Blockage Status Chip */}
                    <div className="mb-2">
                      {renderDrainBadge(incident.stormDrainBlockage)}
                    </div>

                    {/* Bilingual Title Header */}
                    <h3 className="text-base font-bold text-[#0F172A] leading-snug line-clamp-2">
                      {lang === 'te' ? incident.titleTe : incident.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 mb-2 line-clamp-1">
                      {lang === 'te' ? incident.titleEn : incident.titleTe}
                    </p>

                    {/* AI Tri-Feature Badges Row: Exposure, Recovery, Accessibility */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-1 border-t border-slate-100">
                      {incident.exposurePriority && renderExposureBadge(incident.exposurePriority)}
                      {incident.recoveryOpportunity && renderRecoveryBadge(incident.recoveryOpportunity)}
                      {incident.recommendedCollectionMethod &&
                        renderAccessBadge(incident.recommendedCollectionMethod, incident.collectionAccessibility)}
                    </div>

                    {/* Thumbnail & Diagnostic Snippet */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="col-span-1">
                        <IncidentThumbnail
                          category={incident.category}
                          severity={incident.severity}
                          customImage={
                            incident.imageThumbnail?.startsWith('data:')
                              ? incident.imageThumbnail
                              : undefined
                          }
                          thumbnailType={incident.imageThumbnail}
                          aspectRatio="video"
                          className="w-full h-20"
                          isDemoData={true}
                        />
                      </div>
                      <div className="col-span-2 text-xs flex flex-col justify-between">
                        <p className="text-slate-700 line-clamp-2 text-[11px] leading-relaxed">
                          {lang === 'te' ? incident.descriptionTe : incident.descriptionEn}
                        </p>
                        <div className="space-y-0.5 text-[11px] text-slate-600 font-mono">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-[#059669] shrink-0" />
                            <span className="truncate">
                              Ward {incident.wardNumber}: {incident.locationDetails}
                            </span>
                          </div>
                          {incident.nearbySensitivePlaces && incident.nearbySensitivePlaces.length > 0 && (
                            <div className="text-[10px] text-slate-500 truncate">
                              Near: {incident.nearbySensitivePlaces[0].name} ({incident.nearbySensitivePlaces[0].distanceMeters}m)
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>SLA: {incident.slaHours}h target</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Citizen verification + Action Button */}
                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-3 text-xs">
                    <button
                      onClick={() => onUpvoteIncident(incident.id)}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-[#059669] transition-colors font-medium"
                      title="Confirm this incident"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">
                        {incident.verifiedByCitizens} {strings.verifiedBy}
                      </span>
                    </button>

                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-[#CBD5E1] rounded-[4px] transition-colors flex items-center gap-1"
                    >
                      <span>{strings.viewDetails}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
