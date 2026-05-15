export interface NavigationLinks {
  google_maps: string;
  waze: string;
  apple_maps: string;
  uber: string;
  geo: string;
}

/**
 * Generate deep links for various navigation apps given a location.
 */
export function generateNavigationLinks(
  lat: number,
  lng: number
): NavigationLinks {
  return {
    google_maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    apple_maps: `https://maps.apple.com/?daddr=${lat},${lng}`,
    uber: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`,
    geo: `geo:${lat},${lng}`,
  };
}
