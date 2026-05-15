"use client";

import { useState, useCallback, useRef } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const resolveRef = useRef<((coords: { lat: number; lng: number; accuracy: number }) => void) | null>(null);

  const requestLocation = useCallback((): Promise<{ lat: number; lng: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Geolocation is not supported by your browser";
        setState((prev) => ({ ...prev, error: msg }));
        reject(new Error(msg));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      resolveRef.current = resolve;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setState({
            latitude: coords.lat,
            longitude: coords.lng,
            accuracy: coords.accuracy,
            error: null,
            loading: false,
          });
          resolve(coords);
        },
        (error) => {
          let message = "Unable to get your location";
          if (error.code === error.PERMISSION_DENIED) {
            message = "Location permission denied. Please enable it in your browser settings.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            message = "Location request timed out.";
          }
          setState((prev) => ({ ...prev, error: message, loading: false }));
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { ...state, requestLocation };
}
