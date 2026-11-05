export type GarbageCategory =
  | 'drain_blockage'
  | 'bio_hazardous'
  | 'commercial_market'
  | 'dumper_overflow'
  | 'c_and_d_rubble'
  | 'coastal_beach'
  | 'residential_solid'
  | 'bulk_green';

export type IncidentCategory = GarbageCategory;

export type IncidentSeverity = 1 | 2 | 3 | 4 | 5;

export type IncidentStatus = 'open' | 'dispatched' | 'in_progress' | 'resolved';

export type StormDrainBlockageStatus = 'severe' | 'partial' | 'none';

export type ExposurePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type RecoveryOpportunity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type CollectionAccessibility = 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendedCollectionMethod =
  | 'large_compactor_truck'
  | 'small_collection_vehicle'
  | 'manual_collection';

export interface DetectedMaterial {
  material: string;
  name?: string;
  category?: 'plastic' | 'cardboard' | 'paper' | 'metal' | 'glass' | 'organic' | 'c_and_d' | 'other' | string;
  confidence?: number;
  visualStatus: 'visually_detected' | 'unconfirmed';
  recoverable: boolean;
  recommendedHandling: string;
}

export interface NearbySensitivePlace {
  name: string;
  type: 'school' | 'hospital' | 'food_market' | 'residential' | 'other';
  distanceMeters: number;
}

export interface AssignedCrew {
  id: string;
  name: string;
  vehicle: string;
  contact: string;
}

export interface AiTriageLog {
  model: string;
  confidence: number;
  hazardAnalysis: string;
  recommendedGear: string[];
  wasteType?: string;
  severityScore?: number;
  stormDrainBlocked?: boolean | StormDrainBlockageStatus;
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
}

export interface Incident {
  id: string;
  ticketNumber: string;
  category: IncidentCategory;
  categoryNameEn: string;
  categoryNameTe: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  stormDrainBlockage: StormDrainBlockageStatus;
  drainBlockageDetailsEn: string;
  drainBlockageDetailsTe: string;
  wardNumber: number;
  wardName: string;
  wardNameTe: string;
  locationDetails: string;
  coordinates: { lat: number; lng: number };
  department: string;
  departmentTe: string;
  assignedCrew?: AssignedCrew;
  reportedAt: string;
  slaDeadline: string;
  slaHours: number;
  upvotes: number;
  verifiedByCitizens: number;
  imageThumbnail?: string;
  resolutionNotes?: string;
  resolutionProofImage?: string;
  resolvedAt?: string;
  aiTriageLog?: AiTriageLog;
  isDemoData: boolean;

  // Feature 1: Public Health Exposure Mapper
  exposurePriority: ExposurePriority;
  exposureReason: string;
  nearbySensitivePlaces: NearbySensitivePlace[];

  // Feature 2: Waste Recovery Opportunity Finder
  detectedMaterials: DetectedMaterial[];
  recoveryOpportunity: RecoveryOpportunity;
  recommendedRecoveryAction: string;

  // Feature 3: Collection Accessibility Score
  collectionAccessibility: CollectionAccessibility;
  recommendedCollectionMethod: RecommendedCollectionMethod;
  visibleRoadObstacles: string[];
  accessibilityReason: string;
  humanVerifiedAccessibility?: boolean;
  humanVerifiedCollectionMethod?: RecommendedCollectionMethod;
}

export interface WardData {
  number: number;
  name: string;
  nameTe: string;
  zone: string;
  center: { lat: number; lng: number };
  polygonOffset: { x: number; y: number };
  total: number;
  active: number;
  resolved: number;
  severity5Count: number;
  resolutionRate: number;
  crewsDeployed: number;
  densityLevel: 'low' | 'moderate' | 'high' | 'critical';
  meanSlaHours: number;
  recentIncidents?: Incident[];
  drainBlockageCount: number;
  highExposureCount?: number;
  highRecoveryCount?: number;
}

export type ActiveScreen = 'home' | 'dispatch' | 'heatmap' | 'about';
export type Language = 'en' | 'te';

