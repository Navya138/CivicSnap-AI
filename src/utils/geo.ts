import { Incident } from '../types';

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula.
 * @returns distance in metres
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Mean Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearestIncidentResult {
  incident: Incident;
  distanceMeters: number;
  isWithin20m: boolean;
}

/**
 * Finds the nearest existing non-duplicate incident to the given coordinates.
 */
export function findNearestIncident(
  lat: number,
  lng: number,
  incidents: Incident[]
): NearestIncidentResult | null {
  if (!incidents || incidents.length === 0) return null;

  let nearest: Incident | null = null;
  let minDistance = Infinity;

  for (const item of incidents) {
    if (!item.coordinates) continue;
    const dist = calculateHaversineDistanceMeters(
      lat,
      lng,
      item.coordinates.lat,
      item.coordinates.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearest = item;
    }
  }

  if (!nearest) return null;

  return {
    incident: nearest,
    distanceMeters: Math.round(minDistance * 10) / 10,
    isWithin20m: minDistance <= 20.0,
  };
}
