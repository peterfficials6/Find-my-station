interface GeoResult {
  lat: number;
  lng: number;
  country: string;
  city: string;
}

const cache = new Map<string, { result: GeoResult | null; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function geolocateIP(ip: string): Promise<GeoResult | null> {
  // Skip private/local IPs
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return null;
  }

  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) return cached.result;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,lat,lon,country,city`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "success") {
      cache.set(ip, { result: null, expires: Date.now() + CACHE_TTL });
      return null;
    }

    const result: GeoResult = {
      lat: data.lat,
      lng: data.lon,
      country: data.country,
      city: data.city,
    };
    cache.set(ip, { result, expires: Date.now() + CACHE_TTL });
    return result;
  } catch {
    return null;
  }
}
