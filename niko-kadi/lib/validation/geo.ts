export const KENYA_BOUNDS = {
  lat: { min: -5.0, max: 5.5 },
  lng: { min: 33.5, max: 42.0 },
} as const;

export function isWithinKenya(lat: number, lng: number): boolean {
  return (
    lat >= KENYA_BOUNDS.lat.min &&
    lat <= KENYA_BOUNDS.lat.max &&
    lng >= KENYA_BOUNDS.lng.min &&
    lng <= KENYA_BOUNDS.lng.max
  );
}

/**
 * Calculate the haversine distance between two points in kilometers.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function isWithinCountyProximity(
  lat: number,
  lng: number,
  countyLat: number,
  countyLng: number,
  radiusKm: number = 75
): boolean {
  const distance = haversineDistance(lat, lng, countyLat, countyLng);
  return distance <= radiusKm;
}

export function validateCoordinates(
  lat: number,
  lng: number
): { valid: boolean; error?: string } {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return { valid: false, error: "Coordinates must be numbers" };
  }

  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: "Coordinates must not be NaN" };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }

  if (!isWithinKenya(lat, lng)) {
    return { valid: false, error: "Coordinates must be within Kenya" };
  }

  return { valid: true };
}
