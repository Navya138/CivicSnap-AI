import React, { useState, useMemo } from 'react';
import {
  Incident,
  GarbageCategory,
  Language,
  StormDrainBlockageStatus,
  ExposurePriority,
  RecoveryOpportunity,
  CollectionAccessibility,
  RecommendedCollectionMethod,
  DetectedMaterial,
  NearbySensitivePlace,
} from '../types';
import { SAMPLE_PRESETS } from '../data/sampleData';
import { IncidentThumbnail } from './IncidentThumbnail';
import { findNearestIncident, NearestIncidentResult } from '../utils/geo';
import {
  getNearbySensitivePlaces,
  calculateExposureScore,
  calculateCollectionAccessibility,
} from '../utils/geoSensitivity';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Radar,
  Info,
  HeartPulse,
  Recycle,
  Truck,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIncident: Partial<Incident>) => Promise<any> | void;
  lang: Language;
  existingIncidents: Incident[];
  onInspectExistingTicket?: (incident: Incident) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lang,
  existingIncidents,
  onInspectExistingTicket,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<GarbageCategory>('drain_blockage');
  const [description, setDescription] = useState(
    'Compacted plastic bottles, thermocol packaging, and silt severely choking stormwater culvert intake.'
  );
  const [stormDrainBlockage, setStormDrainBlockage] = useState<StormDrainBlockageStatus>('severe');
  const [location, setLocation] = useState('Sector 1, MVP Double Road Near AS Raja Ground Culvert');
  const [wardNumber, setWardNumber] = useState<number>(18);
  const [wardName, setWardName] = useState('MVP Colony (Sector 1-4)');
  const [wardNameTe, setWardNameTe] = useState('ఎం.వి.పి. కాలనీ (సెక్టార్ 1-4)');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 17.7392,
    lng: 83.3315,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-drain');

  // Duplicate interception state (shown when submission is intercepted because <= 20m)
  const [duplicateIntercept, setDuplicateIntercept] = useState<{
    existingIncident: Incident;
    distanceMeters: number;
  } | null>(null);

  // AI Triage state
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    category: GarbageCategory;
    categoryNameEn: string;
    categoryNameTe: string;
    severity: 1 | 2 | 3 | 4 | 5;
    confidence: number;
    stormDrainBlockage: StormDrainBlockageStatus;
    drainBlockageDetailsEn: string;
    drainBlockageDetailsTe: string;
    titleEn: string;
    titleTe: string;
    summaryEn: string;
    summaryTe: string;
    department: string;
    departmentTe: string;
    slaHours: number;
    recommendedGear: string[];
    hazardAnalysis: string;
    source?: string;
    detectedMaterials?: DetectedMaterial[];
    recoveryOpportunity?: RecoveryOpportunity;
    recommendedRecoveryAction?: string;
    nearbySensitivePlaces?: NearbySensitivePlace[];
    exposurePriority?: ExposurePriority;
    exposureReason?: string;
    visibleRoadObstacles?: string[];
    collectionAccessibility?: CollectionAccessibility;
    recommendedCollectionMethod?: RecommendedCollectionMethod;
    accessibilityReason?: string;
  } | null>(null);

  // Real-time Haversine Proximity Check
  const nearestResult: NearestIncidentResult | null = useMemo(() => {
    return findNearestIncident(coordinates.lat, coordinates.lng, existingIncidents);
  }, [coordinates.lat, coordinates.lng, existingIncidents]);

  // Apply a sample preset
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setCategory(preset.category);
    setDescription(preset.description);
    setLocation(preset.location);
    setWardNumber(preset.ward);
    setWardName(preset.wardName);
    setWardNameTe(preset.wardNameTe);
    setStormDrainBlockage(preset.stormDrainBlockage);
    setImagePreview(null);
    setTriageResult(null);
    setDuplicateIntercept(null);

    // Set coordinates based on preset location in MVP Colony
    if (preset.id === 'preset-drain') {
      setCoordinates({ lat: 17.7392, lng: 83.3315 });
    } else if (preset.id === 'preset-bio') {
      setCoordinates({ lat: 17.741, lng: 83.3342 });
    } else if (preset.id === 'preset-market') {
      setCoordinates({ lat: 17.7435, lng: 83.3368 });
    } else if (preset.id === 'preset-dumper') {
      setCoordinates({ lat: 17.7422, lng: 83.329 });
    }
  };

  // Quick helper to test duplicate (< 20m of TKT-101)
  const handleSetTestDuplicateCoords = () => {
    // TKT-101 is at (17.7392, 83.3315). Offset by ~0.00008 deg (~11.4m)
    setCoordinates({ lat: 17.73928, lng: 83.33156 });
    setLocation('Sector 1, MVP Double Road (11m from TKT-101 culvert)');
    setSelectedPresetId('');
    setDuplicateIntercept(null);
  };

  // Quick helper to test independent new ticket (> 20m)
  const handleSetTestIndependentCoords = () => {
    // 17.74050, 83.33250 is ~179m from TKT-101
    setCoordinates({ lat: 17.7405, lng: 83.3325 });
    setLocation('Sector 2, MVP Park Road Crossway');
    setSelectedPresetId('');
    setDuplicateIntercept(null);
  };

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setSelectedPresetId('');
        setTriageResult(null);
        setDuplicateIntercept(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Triage via Server API
  const handleRunAiTriage = async () => {
    setIsTriaging(true);
    try {
      const payload: any = {
        description: description || 'Garbage issue in MVP Colony, Visakhapatnam',
        category,
        location,
        wardNumber,
        lat: coordinates.lat,
        lng: coordinates.lng,
      };

      if (imagePreview) {
        payload.imageBase64 = imagePreview;
        payload.mimeType = 'image/jpeg';
      }

      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.triage) {
        setTriageResult(data.triage);
        setCategory(data.triage.category);
        if (data.triage.stormDrainBlockage) {
          setStormDrainBlockage(data.triage.stormDrainBlockage);
        }
      }
    } catch (err) {
      console.error('Error invoking AI triage:', err);
      const nearby = getNearbySensitivePlaces(coordinates.lat, coordinates.lng);
      const exp = calculateExposureScore(4, nearby, 'severe', category);
      const acc = calculateCollectionAccessibility([location, 'Drain culvert'], category, 4);

      setTriageResult({
        category,
        categoryNameEn: 'Storm Drain Plastic Choke',
        categoryNameTe: 'వర్షపు కాలువ ప్లాస్టిక్ అడ్డంకి',
        severity: 4,
        confidence: 0.95,
        stormDrainBlockage: 'severe',
        drainBlockageDetailsEn: 'Severe Choke (constricting monsoon outfall)',
        drainBlockageDetailsTe: 'తీవ్ర అడ్డంకి (వర్షపు నీరు సాఫీగా పోవడం లేదు)',
        titleEn: 'Storm Drain Waste Accumulation in MVP Colony',
        titleTe: 'ఎం.వి.పి కాలనీలో వర్షపు కాలువలో వ్యర్థాలు పేరుకుపోవడం',
        summaryEn: 'Urgent desilting and trash-trap extraction scheduled for GVMC Zone-2 crew.',
        summaryTe: 'జివిఎంసి జోన్-2 క్షేత్ర బృందానికి పంపబడింది.',
        department: 'GVMC Stormwater Drains & Desilting Wing (Zone-2)',
        departmentTe: 'జివిఎంసి వర్షపు నీటి కాలువల నిర్వహణ విభాగం',
        slaHours: 4,
        recommendedGear: ['High-Power Desilting Jet', 'Heavy Trash Rakes', 'Boots'],
        hazardAnalysis: 'Direct drainage channel restriction.',
        detectedMaterials: [
          { material: 'PET Plastic Bottles', category: 'plastic', visualStatus: 'visually_detected', recoverable: true, confidence: 0.96, recommendedHandling: 'Segregate at intake' },
          { material: 'Thermocol Packaging', category: 'plastic', visualStatus: 'visually_detected', recoverable: false, confidence: 0.88, recommendedHandling: 'Manual skimming' },
        ],
        recoveryOpportunity: 'MEDIUM',
        recommendedRecoveryAction: 'Screen and extract intact plastics for bailer recycling before desilting.',
        nearbySensitivePlaces: nearby,
        exposurePriority: exp.priority,
        exposureReason: exp.reason,
        visibleRoadObstacles: acc.obstacles,
        collectionAccessibility: acc.accessibility,
        recommendedCollectionMethod: acc.method,
        accessibilityReason: acc.reason,
      });
    } finally {
      setIsTriaging(false);
    }
  };

  // Submit incident with 20m Haversine duplicate check
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 20-Metre Duplicate Interception Check
    if (nearestResult && nearestResult.isWithin20m) {
      // Flag as duplicate: do NOT create a second independent ticket!
      setDuplicateIntercept({
        existingIncident: nearestResult.incident,
        distanceMeters: nearestResult.distanceMeters,
      });

      // Increment verification / upvote on the existing ticket to record citizen report
      onSubmit({
        coordinates,
        locationDetails: location,
      });
      return;
    }

    // Outside 20 metres: proceed with creating new ticket normally
    const finalSeverity = triageResult
      ? triageResult.severity
      : selectedPresetId === 'preset-drain' || selectedPresetId === 'preset-bio'
      ? 5
      : 4;
    const finalTitleEn = triageResult
      ? triageResult.titleEn
      : 'Reported Garbage Hazard in MVP Colony';
    const finalTitleTe = triageResult ? triageResult.titleTe : 'ఎం.వి.పి కాలనీలో పౌర చెత్త సమస్య';
    const finalDept = triageResult
      ? triageResult.department
      : 'GVMC Solid Waste Management (Zone-2)';
    const finalDeptTe = triageResult ? triageResult.departmentTe : 'జివిఎంసి ఘన వ్యర్థాల నిర్వహణ విభాగం';
    const finalSla = triageResult ? triageResult.slaHours : finalSeverity === 5 ? 2 : 12;

    const nearby = triageResult?.nearbySensitivePlaces || getNearbySensitivePlaces(coordinates.lat, coordinates.lng);
    const exp = triageResult?.exposurePriority
      ? { priority: triageResult.exposurePriority, reason: triageResult.exposureReason || '' }
      : calculateExposureScore(finalSeverity, nearby, stormDrainBlockage, category);
    const acc = triageResult?.collectionAccessibility
      ? {
          accessibility: triageResult.collectionAccessibility,
          method: triageResult.recommendedCollectionMethod || 'small_collection_vehicle',
          reason: triageResult.accessibilityReason || '',
          obstacles: triageResult.visibleRoadObstacles || [],
        }
      : calculateCollectionAccessibility([location], category, finalSeverity);

    await onSubmit({
      category,
      categoryNameEn: triageResult?.categoryNameEn || 'Solid Waste Defect',
      categoryNameTe: triageResult?.categoryNameTe || 'ఘన వ్యర్థాల సమస్య',
      titleEn: finalTitleEn,
      titleTe: finalTitleTe,
      descriptionEn: description,
      descriptionTe: lang === 'te' ? description : 'పరిశీలన కొరకు వేచివున్న పౌర ఫిర్యాదు.',
      severity: finalSeverity,
      stormDrainBlockage,
      drainBlockageDetailsEn:
        stormDrainBlockage === 'severe'
          ? 'Severe Choke (immediate water stagnation & monsoon flood hazard)'
          : stormDrainBlockage === 'partial'
          ? 'Partial Choke (slight drainage obstruction)'
          : 'None / Clear (drain is clear)',
      drainBlockageDetailsTe:
        stormDrainBlockage === 'severe'
          ? 'తీవ్ర అడ్డంకి (నీరు నిలిచిపోయింది)'
          : stormDrainBlockage === 'partial'
          ? 'పాక్షిక అడ్డంకి'
          : 'అడ్డంకి లేదు',
      wardNumber,
      wardName,
      wardNameTe,
      locationDetails: location,
      coordinates,
      department: finalDept,
      departmentTe: finalDeptTe,
      slaHours: finalSla,
      imageThumbnail: imagePreview ? imagePreview : category,
      isDemoData: true,
      detectedMaterials: triageResult?.detectedMaterials || [
        { material: 'Mixed Plastics', category: 'plastic', visualStatus: 'visually_detected', recoverable: true, confidence: 0.9, recommendedHandling: 'Segregate at transfer station' },
      ],
      recoveryOpportunity: triageResult?.recoveryOpportunity || 'MEDIUM',
      recommendedRecoveryAction: triageResult?.recommendedRecoveryAction || 'Standard MRF intake segregation',
      nearbySensitivePlaces: nearby,
      exposurePriority: exp.priority,
      exposureReason: exp.reason,
      visibleRoadObstacles: acc.obstacles,
      collectionAccessibility: acc.accessibility,
      recommendedCollectionMethod: acc.method,
      accessibilityReason: acc.reason,
      aiTriageLog: triageResult
        ? {
            model: triageResult.source || 'Gemini 3.8 Flash Vision (Civic Triage)',
            confidence: triageResult.confidence,
            hazardAnalysis: triageResult.hazardAnalysis,
            recommendedGear: triageResult.recommendedGear,
          }
        : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-[#CBD5E1] rounded-[8px] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12)] my-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0F172A] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[3px] bg-[#059669] flex items-center justify-center text-white">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white leading-none">
                  {lang === 'en' ? 'Report Garbage Hazard' : 'చెత్త సమస్యను నమోదు చేయండి'}
                </h2>
                <span className="px-1.5 py-0.2 bg-[#F59E0B] text-slate-950 text-[9px] font-mono font-bold rounded-[2px]">
                  DEMO DATA
                </span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[9px] font-mono rounded-[2px]">
                  20M DEDUPLICATION ACTIVE
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono">
                MVP Colony, Visakhapatnam (GVMC Zone-2)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[3px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DUPLICATE INTERCEPT VIEW: Shown when submitted within 20m of existing ticket */}
        {duplicateIntercept ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-[6px] space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F59E0B] text-slate-950 rounded-[4px] shrink-0 mt-0.5">
                  <Copy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#78350F] text-white px-2 py-0.5 rounded-[2px]">
                      POSSIBLE DUPLICATE INTERCEPTED
                    </span>
                    <span className="text-xs font-mono font-bold text-[#92400E]">
                      DISTANCE: {duplicateIntercept.distanceMeters} METRES (≤ 20M)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Existing Ticket {duplicateIntercept.existingIncident.ticketNumber} already covers this hazard
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Municipal Policy Enforcement: A second independent ticket was <strong>not created</strong> because this report is within {duplicateIntercept.distanceMeters} metres of existing ticket <strong>{duplicateIntercept.existingIncident.ticketNumber}</strong>.
                  </p>
                </div>
              </div>

              {/* Existing Ticket Card Details */}
              <div className="bg-white border border-[#CBD5E1] p-3 rounded-[4px] text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {duplicateIntercept.existingIncident.ticketNumber} · {duplicateIntercept.existingIncident.categoryNameEn}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FEF2F2] text-[#991B1B] font-bold rounded-[2px]">
                    SEV-{duplicateIntercept.existingIncident.severity}
                  </span>
                </div>
                <div className="text-slate-800 font-sans font-medium">
                  {duplicateIntercept.existingIncident.titleEn}
                </div>
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span>Location: {duplicateIntercept.existingIncident.locationDetails}</span>
                  <span className="text-[#059669] font-bold">Status: {duplicateIntercept.existingIncident.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[4px] text-xs text-[#065F46] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" />
                <span>
                  <strong>Citizen Endorsement Logged:</strong> Your report has been aggregated as a <strong>+1 Neighborhood Verification</strong> on {duplicateIntercept.existingIncident.ticketNumber}.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setDuplicateIntercept(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-[4px] hover:bg-slate-50 transition-colors"
              >
                Back to Form
              </button>
              {onInspectExistingTicket && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInspectExistingTicket(duplicateIntercept.existingIncident);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-[4px] transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Existing Ticket {duplicateIntercept.existingIncident.ticketNumber}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-[4px] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Quick Preset Selector for Visakhapatnam Garbage Samples */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>1. Select MVP Colony Demo Scenario or Upload Custom Photo</span>
                <span className="text-[10px] font-mono text-[#F59E0B] font-bold">DEMO SAMPLE TICKETS</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 text-left rounded-[4px] border transition-colors text-xs flex flex-col justify-between ${
                      selectedPresetId === p.id && !imagePreview
                        ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] font-semibold ring-1 ring-[#059669]'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-[11px] block">{p.nameEn}</span>
                    <span className="text-[10px] text-slate-500 font-normal truncate block mt-0.5">
                      {lang === 'te' ? p.nameTe : p.wardName.split(' ')[0]}
                    </span>
                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded-[2px] ${
                          p.defaultSeverity === 5
                            ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#F87171]'
                            : 'bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]'
                        }`}
                      >
                        SEV-{p.defaultSeverity}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {p.stormDrainBlockage === 'severe' ? 'DRAIN CHOKED' : 'PARTIAL DRAIN'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview & AI Triage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Garbage Photo Evidence' : 'చెత్త ఫోటో సాక్ష్యం'}
                  </span>
                  <label className="cursor-pointer text-[11px] text-[#059669] hover:underline font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Upload Photo' : 'ఫోటో ఎక్కించండి'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                <IncidentThumbnail
                  category={category}
                  severity={triageResult?.severity || (selectedPresetId === 'preset-drain' ? 5 : 4)}
                  customImage={imagePreview || undefined}
                  className="w-full h-36 border border-[#CBD5E1]"
                  isDemoData={true}
                />
              </div>

              {/* AI Triage Card */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] p-3 flex flex-col justify-between min-h-36">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                      <span>GVMC AI Vision Classifier</span>
                    </span>
                    {triageResult && (
                      <span className="text-[10px] font-mono bg-[#E2E8F0] px-1.5 py-0.2 rounded-[2px]">
                        {Math.round(triageResult.confidence * 100)}% CONFIDENCE
                      </span>
                    )}
                  </div>

                  {isTriaging ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-1.5 text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin text-[#059669]" />
                      <span className="text-[11px] font-mono">Running Gemini Vision AI triage...</span>
                    </div>
                  ) : triageResult ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#991B1B] rounded-[2px]">
                          SEVERITY {triageResult.severity}/5
                        </span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          SLA: {triageResult.slaHours}h response
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 line-clamp-1 text-[11px]">
                        {lang === 'te' ? triageResult.titleTe : triageResult.titleEn}
                      </p>
                      {/* AI 3-Feature Badges */}
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#FEF2F2] text-[#991B1B] border border-[#F87171] rounded-[2px]">
                          EXP: {triageResult.exposurePriority || 'HIGH'}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[2px]">
                          REC: {triageResult.recoveryOpportunity || 'MED'}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] rounded-[2px]">
                          {(triageResult.recommendedCollectionMethod || 'small_collection_vehicle').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#991B1B] font-semibold truncate">
                        Drain: {triageResult.drainBlockageDetailsEn}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 py-1">
                      Gemini Vision automatically classifies garbage category, scores severity (1-5), and assesses exposure, recovery, and vehicle access.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRunAiTriage}
                  disabled={isTriaging}
                  className="w-full mt-2 py-1 px-3 text-xs font-semibold bg-[#0F172A] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  <Sparkles className="w-3 h-3 text-[#059669]" />
                  <span>
                    {triageResult ? 'Re-Classify with Gemini AI' : 'Run AI Garbage Triage'}
                  </span>
                </button>
              </div>
            </div>

            {/* GPS Coordinates & Haversine Proximity Radar Bar */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Radar className="w-3.5 h-3.5 text-[#059669]" />
                  <span>GPS COORDINATES & 20M HAVERSINE RADAR</span>
                </span>
                <span className="text-[10px] text-slate-500">RADIUS THRESHOLD: 20 METRES</span>
              </div>

              {/* Coordinate Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={coordinates.lat}
                    onChange={(e) =>
                      setCoordinates({ ...coordinates, lat: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-[3px] text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={coordinates.lng}
                    onChange={(e) =>
                      setCoordinates({ ...coordinates, lng: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-[3px] text-slate-900"
                  />
                </div>
              </div>

              {/* Haversine Proximity Status Banner */}
              {nearestResult ? (
                <div
                  className={`p-2 rounded-[4px] text-xs font-mono flex items-center justify-between ${
                    nearestResult.isWithin20m
                      ? 'bg-[#FEF2F2] border border-[#F87171] text-[#991B1B]'
                      : 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {nearestResult.isWithin20m ? (
                      <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" />
                    )}
                    <div>
                      <strong className="block">
                        {nearestResult.isWithin20m
                          ? `DUPLICATE ALERT: ${nearestResult.distanceMeters}m from ${nearestResult.incident.ticketNumber}`
                          : `CLEAR: ${nearestResult.distanceMeters}m from nearest ticket (${nearestResult.incident.ticketNumber})`}
                      </strong>
                      <span className="text-[10px] opacity-90 block">
                        {nearestResult.isWithin20m
                          ? `Within 20m threshold. Submission will aggregate as neighbor verification rather than duplicate ticket.`
                          : `Outside 20m threshold. New independent ticket will be generated.`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-white/70">
                    {nearestResult.distanceMeters}m
                  </span>
                </div>
              ) : null}

              {/* Proximity Test Shortcuts */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-slate-500">Test Scenarios:</span>
                <button
                  type="button"
                  onClick={handleSetTestDuplicateCoords}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] hover:bg-amber-100 rounded-[2px] transition-colors"
                >
                  Test Duplicate (&lt;20m of TKT-101)
                </button>
                <button
                  type="button"
                  onClick={handleSetTestIndependentCoords}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] hover:bg-blue-100 rounded-[2px] transition-colors"
                >
                  Test Independent (&gt;20m)
                </button>
              </div>
            </div>

            {/* Garbage Category & Storm Drain Blockage Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Garbage Classification
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GarbageCategory)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                >
                  <option value="drain_blockage">Storm Drain Plastic Choke (వర్షపు కాలువ ప్లాస్టిక్)</option>
                  <option value="bio_hazardous">Bio-Medical & Hazardous Waste (బయో-మెడికల్ వ్యర్థాలు)</option>
                  <option value="commercial_market">Commercial Market & Organic Rot (రైతు బజార్ కూరగాయలు)</option>
                  <option value="dumper_overflow">Overflowing Dumper Bin (డంపర్ బిన్ నిండిన సమస్య)</option>
                  <option value="c_and_d_rubble">Construction & Demolition Rubble (భవన నిర్మాణ శిథిలాలు)</option>
                  <option value="coastal_beach">Coastal & Beachfront Litter (బీచ్ ప్లాస్టిక్ వ్యర్థాలు)</option>
                  <option value="residential_solid">Residential Solid Waste Mound (గృహ వ్యర్థాలు)</option>
                  <option value="bulk_green">Bulk Greenery & Tree Branches (కొబ్బరి ఆకులు / కొమ్మలు)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storm Drain Blockage Status
                </label>
                <select
                  value={stormDrainBlockage}
                  onChange={(e) => setStormDrainBlockage(e.target.value as StormDrainBlockageStatus)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669] font-medium"
                >
                  <option value="severe">Severe Blockage (90% choke - flash flood threat)</option>
                  <option value="partial">Partial Choke (40% restriction - runoff trapped)</option>
                  <option value="none">None / Clear (No drain or drain is clear)</option>
                </select>
              </div>
            </div>

            {/* Municipal Ward (Visakhapatnam GVMC) & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visakhapatnam Ward (GVMC)
                </label>
                <select
                  value={wardNumber}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    setWardNumber(num);
                    if (num === 18) {
                      setWardName('MVP Colony (Sector 1-4)');
                      setWardNameTe('ఎం.వి.పి. కాలనీ (సెక్టార్ 1-4)');
                    } else if (num === 19) {
                      setWardName("Lawson's Bay & Beach Road");
                      setWardNameTe('లాసన్స్ బే & బీచ్ రోడ్');
                    } else if (num === 20) {
                      setWardName('Ushodaya Junction & Sector 6');
                      setWardNameTe('ఉషోదయ జంక్షన్ & సెక్టార్ 6');
                    } else if (num === 17) {
                      setWardName('Sivajipalem & Appughar');
                      setWardNameTe('శివాజీపాలెం & అప్పుఘర్');
                    } else if (num === 21) {
                      setWardName('Isukathota & Venkojipalem');
                      setWardNameTe('ఇసుకతోట & వెంకోజీపాలెం');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                >
                  <option value={18}>Ward 18 - MVP Colony (ఎం.వి.పి. కాలనీ)</option>
                  <option value={19}>Ward 19 - Lawson's Bay Colony & Beach Road (లాసన్స్ బే)</option>
                  <option value={20}>Ward 20 - Ushodaya Junction & Sector 6 (ఉషోదయ)</option>
                  <option value={17}>Ward 17 - Sivajipalem & Appughar (శివాజీపాలెం)</option>
                  <option value={21}>Ward 21 - Isukathota & Venkojipalem (ఇసుకతోట)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Landmark
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 1, MVP Double Road"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    required
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Garbage & Drainage Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe garbage composition and storm drain blockage details..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] text-slate-900 focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                required
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded-[4px] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-xs font-semibold text-white rounded-[4px] transition-colors shadow-xs ${
                  nearestResult?.isWithin20m
                    ? 'bg-[#D97706] hover:bg-[#B45309]'
                    : 'bg-[#059669] hover:bg-[#047857]'
                }`}
              >
                {nearestResult?.isWithin20m
                  ? 'Verify Existing Ticket (<20m Duplicate)'
                  : 'Submit to GVMC Live Queue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
