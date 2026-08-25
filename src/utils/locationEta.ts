// Real-time GPS Geolocation & Dynamic Delivery ETA Utility

export interface LocationState {
  status: 'detecting' | 'located' | 'denied' | 'prompt' | 'error';
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  etaMins: number;
  etaDisplay: string;
  etaTimeStr: string;
  distanceKm: number;
  lastUpdated: number;
}

// Unga Market Central Fulfillment Hub (Chennai)
export const STORE_HUB = {
  latitude: 12.9815,
  longitude: 80.2180,
  name: 'Unga Market Express Dispatch Hub'
};

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Compute dynamic Delivery ETA in minutes based on distance
export function computeDeliveryEta(distanceKm: number): {
  distanceKm: number;
  etaMins: number;
  etaDisplay: string;
  etaTimeStr: string;
} {
  // Base packing & inspection time: 4 mins + 2.0 mins per km transit in express urban grid
  // Minimum ETA: 10 mins; Maximum urban express: 22 mins
  let etaMins = Math.round(4 + distanceKm * 2.0);
  if (etaMins < 10) etaMins = 10;
  if (etaMins > 22) etaMins = 22;

  const etaDisplay = `${etaMins} mins`;
  const etaDate = new Date(Date.now() + etaMins * 60 * 1000);
  const etaTimeStr = etaDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return { distanceKm, etaMins, etaDisplay, etaTimeStr };
}

// Request real-time GPS Geolocation from browser
export function fetchRealtimeGeolocation(): Promise<LocationState> {
  return new Promise((resolve) => {
    const fallbackEta = computeDeliveryEta(2.1);
    const fallbackState: LocationState = {
      status: 'denied',
      coords: null,
      distanceKm: fallbackEta.distanceKm,
      etaMins: fallbackEta.etaMins,
      etaDisplay: fallbackEta.etaDisplay,
      etaTimeStr: fallbackEta.etaTimeStr,
      lastUpdated: Date.now()
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(fallbackState);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const distanceKm = calculateDistanceKm(
          latitude,
          longitude,
          STORE_HUB.latitude,
          STORE_HUB.longitude
        );
        const { etaMins, etaDisplay, etaTimeStr } = computeDeliveryEta(distanceKm);

        resolve({
          status: 'located',
          coords: { latitude, longitude, accuracy },
          distanceKm,
          etaMins,
          etaDisplay,
          etaTimeStr,
          lastUpdated: Date.now()
        });
      },
      () => {
        resolve(fallbackState);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
}
