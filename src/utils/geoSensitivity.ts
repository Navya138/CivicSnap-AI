import { calculateHaversineDistanceMeters } from './geo';
import {
  NearbySensitivePlace,
  ExposurePriority,
  CollectionAccessibility,
  RecommendedCollectionMethod,
  StormDrainBlockageStatus,
} from '../types';

/**
 * Key Public Health Sensitive Facilities in and around MVP Colony, Visakhapatnam (GVMC Zone-2)
 * Grounded in local municipal planning and public utility registries.
 */
export const MVP_COLONY_SENSITIVE_LANDMARKS: Array<{
  name: string;
  type: 'school' | 'hospital' | 'food_market' | 'residential' | 'other';
  coordinates: { lat: number; lng: number };
}> = [
  {
    name: 'AS Raja High School & Junior College',
    type: 'school',
    coordinates: { lat: 17.7396, lng: 83.3311 },
  },
  {
    name: 'MVP Urban Community Health Center',
    type: 'hospital',
    coordinates: { lat: 17.7412, lng: 83.334 },
  },
  {
    name: 'MVP Rythu Bazaar (Daily Agro-Produce Market)',
    type: 'food_market',
    coordinates: { lat: 17.7432, lng: 83.3365 },
  },
  {
    name: 'Ushodaya Junction Vegetable & Seafood Complex',
    type: 'food_market',
    coordinates: { lat: 17.7441, lng: 83.3372 },
  },
  {
    name: 'Care Hospitals Outpatient Clinic & Diagnostics',
    type: 'hospital',
    coordinates: { lat: 17.7424, lng: 83.3352 },
  },
  {
    name: 'Sri Chaitanya Childrens Academy (Sector 2)',
    type: 'school',
    coordinates: { lat: 17.7405, lng: 83.3322 },
  },
  {
    name: 'Sivajipalem Municipal Primary School',
    type: 'school',
    coordinates: { lat: 17.7378, lng: 83.3275 },
  },
  {
    name: 'MVP Sector 1-4 Residential Dwellings & Apartments',
    type: 'residential',
    coordinates: { lat: 17.739, lng: 83.3318 },
  },
  {
    name: 'Lawson’s Bay Fishermens Colony & Beach Promenade',
    type: 'residential',
    coordinates: { lat: 17.7348, lng: 83.3382 },
  },
  {
    name: 'Sector 8 Senior Living & Residential Apartments',
    type: 'residential',
    coordinates: { lat: 17.7448, lng: 83.3355 },
  },
];

/**
 * Identify nearby sensitive places within given radius (default 650m) using the Haversine formula.
 */
export function getNearbySensitivePlaces(
  lat: number,
  lng: number,
  maxDistanceMeters = 650
): NearbySensitivePlace[] {
  const results: NearbySensitivePlace[] = [];

  for (const landmark of MVP_COLONY_SENSITIVE_LANDMARKS) {
    const dist = calculateHaversineDistanceMeters(
      lat,
      lng,
      landmark.coordinates.lat,
      landmark.coordinates.lng
    );

    if (dist <= maxDistanceMeters) {
      results.push({
        name: landmark.name,
        type: landmark.type,
        distanceMeters: Math.round(dist),
      });
    }
  }

  // Sort by closest first
  results.sort((a, b) => a.distanceMeters - b.distanceMeters);

  // If none within max radius, return nearest landmark as reference
  if (results.length === 0 && MVP_COLONY_SENSITIVE_LANDMARKS.length > 0) {
    let nearest = MVP_COLONY_SENSITIVE_LANDMARKS[0];
    let minD = calculateHaversineDistanceMeters(
      lat,
      lng,
      nearest.coordinates.lat,
      nearest.coordinates.lng
    );
    for (let i = 1; i < MVP_COLONY_SENSITIVE_LANDMARKS.length; i++) {
      const d = calculateHaversineDistanceMeters(
        lat,
        lng,
        MVP_COLONY_SENSITIVE_LANDMARKS[i].coordinates.lat,
        MVP_COLONY_SENSITIVE_LANDMARKS[i].coordinates.lng
      );
      if (d < minD) {
        minD = d;
        nearest = MVP_COLONY_SENSITIVE_LANDMARKS[i];
      }
    }
    results.push({
      name: nearest.name,
      type: nearest.type,
      distanceMeters: Math.round(minD),
    });
  }

  return results.slice(0, 3);
}

/**
 * FEATURE 1: Public Health Exposure Priority Calculator
 * Explainable heuristic: Combines waste severity (1-5), proximity to schools/hospitals/food markets,
 * and environmental factors (stagnant storm drain leachate, fly/mosquito vectors).
 *
 * ETHICAL GUARDRAIL: Never claims disease or actual health damage has been detected.
 */
export function calculateExposureScore(
  severity: number,
  sensitivePlaces: NearbySensitivePlace[],
  drainBlockage: StormDrainBlockageStatus,
  category: string
): { priority: ExposurePriority; score: number; reason: string } {
  let score = 0;

  // Base score from waste severity
  score += severity * 12; // 12 to 60 points

  // Drain blockage exacerbates vector breeding & surface contact
  if (drainBlockage === 'severe') score += 25;
  else if (drainBlockage === 'partial') score += 12;

  // Category specific risk weights
  if (category === 'bio_hazardous') score += 30;
  else if (category === 'commercial_market') score += 18;
  else if (category === 'drain_blockage') score += 15;

  // Proximity to sensitive locations
  const closest = sensitivePlaces[0];
  if (closest) {
    if (closest.distanceMeters <= 80) score += 25;
    else if (closest.distanceMeters <= 200) score += 18;
    else if (closest.distanceMeters <= 400) score += 10;

    if (closest.type === 'hospital' || closest.type === 'school') score += 10;
    if (closest.type === 'food_market') score += 8;
  }

  let priority: ExposurePriority = 'LOW';
  if (score >= 65) priority = 'HIGH';
  else if (score >= 40) priority = 'MEDIUM';

  // Construct explainable rationale (without claiming disease)
  const proximityText = closest
    ? `Located ${closest.distanceMeters}m from ${closest.name} (${closest.type.replace('_', ' ')})`
    : 'Located near MVP Colony residential carriageway';

  let reason = '';
  if (priority === 'HIGH') {
    reason = `HIGH Exposure Priority (${score}/100): ${proximityText}. Waste severity (${severity}/5) combined with ${
      drainBlockage === 'severe'
        ? 'severe storm drain choke causing stagnant leachate run-off'
        : category === 'bio_hazardous'
        ? 'uncontained sharps and clinical items on pedestrian walkway'
        : 'dense decomposing mass in active foot-traffic zone'
    } creates elevated public exposure vulnerability. Prompt containment recommended. (Environmental proximity assessment only; no medical or health damage diagnosed).`;
  } else if (priority === 'MEDIUM') {
    reason = `MEDIUM Exposure Priority (${score}/100): ${proximityText}. Moderate accumulation with ${
      drainBlockage !== 'none' ? 'partial curb drainage interference' : 'localized perimeter spread'
    } creates moderate nuisance and pedestrian exposure. Scheduled clearance recommended within standard municipal SLA. (No direct health damage claimed).`;
  } else {
    reason = `LOW Exposure Priority (${score}/100): ${proximityText}. Low accumulation with minimal moisture stagnation and sufficient clearance from healthcare or school entries. Standard routine pickup is adequate. (No health damage diagnosed).`;
  }

  return { priority, score, reason };
}

/**
 * FEATURE 3: Collection Accessibility & Fleet Recommendation
 * Recommends large compactor, small collection vehicle (e-auto / mini-tipper), or manual collection.
 * Includes clear disclaimer that visual analysis alone cannot confirm certified road width or vehicle access.
 */
export function calculateCollectionAccessibility(
  visibleObstacles: string[] | string,
  category: string,
  severityOrBlockage?: number | string
): {
  accessibility: CollectionAccessibility;
  method: RecommendedCollectionMethod;
  reason: string;
  obstacles: string[];
} {
  const obstaclesList: string[] = Array.isArray(visibleObstacles)
    ? visibleObstacles
    : typeof visibleObstacles === 'string'
    ? [visibleObstacles]
    : [];

  const hasNarrowLane = obstaclesList.some((o) =>
    o.toLowerCase().includes('narrow') || o.toLowerCase().includes('cul-de-sac') || o.toLowerCase().includes('alley')
  );
  const hasParkedObstacles = obstaclesList.some((o) =>
    o.toLowerCase().includes('park') || o.toLowerCase().includes('two-wheeler') || o.toLowerCase().includes('auto')
  );
  const hasCulvertDepression = obstaclesList.some((o) =>
    o.toLowerCase().includes('culvert') || o.toLowerCase().includes('drain') || o.toLowerCase().includes('trench')
  );

  let accessibility: CollectionAccessibility = 'HIGH';
  let method: RecommendedCollectionMethod = 'large_compactor_truck';

  if (hasNarrowLane || (hasParkedObstacles && hasCulvertDepression)) {
    accessibility = 'LOW';
    method = 'manual_collection';
  } else if (hasParkedObstacles || hasCulvertDepression || category === 'commercial_market') {
    accessibility = 'MEDIUM';
    method = 'small_collection_vehicle';
  } else if (category === 'c_and_d_rubble') {
    accessibility = 'HIGH';
    method = 'large_compactor_truck';
  }

  const methodLabel =
    method === 'large_compactor_truck'
      ? 'Large Compactor Truck (10T Heavy GVMC Compactor)'
      : method === 'small_collection_vehicle'
      ? 'Small Collection Vehicle (GVMC Electric Auto / 2T Mini-Tipper)'
      : 'Manual Collection (Tricycle Cart, Hand Barrows & Long Rakes)';

  const reason = `Visual inspection indicates ${accessibility} accessibility for mechanical retrieval. Visible obstacles noted: ${
    obstaclesList.length > 0 ? obstaclesList.join(', ') : 'Open two-lane carriage road clear of obstructions'
  }. Recommended deployment: ${methodLabel}. (Note: Image analysis alone cannot confirm certified road load capacity or exact vehicle clearance. On-site driver/supervisor manual verification is recommended).`;

  return { accessibility, method, reason, obstacles: obstaclesList };
}
