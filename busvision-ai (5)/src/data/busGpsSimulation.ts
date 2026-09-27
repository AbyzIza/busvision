import { AKTAU_ROUTE_42_STOPS, BusStop, getDistanceMeters } from './routes';

export interface BusTelemetry {
  lat: number;
  lng: number;
  speedKmH: number;
  headingDeg: number;
  currentStopIndex: number;
  nextStopIndex: number;
  distanceToNextStopMeters: number;
  direction: 'forward' | 'backward';
  timestamp: number;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

function interpolate(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }, factor: number) {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * factor,
    lng: p1.lng + (p2.lng - p1.lng) * factor,
  };
}

export class BusGpsSimulator {
  private stopIndex: number = 3; 
  private progress: number = 0.25;
  private direction: 'forward' | 'backward' = 'forward';
  private currentSpeed: number = 34; // km/h
  private lastUpdate: number = Date.now();

  public getTelemetry(): BusTelemetry {
    const stops = AKTAU_ROUTE_42_STOPS;
    const currentStop = stops[this.stopIndex];
    const nextStopIndex = this.direction === 'forward' 
      ? Math.min(this.stopIndex + 1, stops.length - 1)
      : Math.max(this.stopIndex - 1, 0);
    const nextStop = stops[nextStopIndex];

    const currentCoords = interpolate(currentStop, nextStop, this.progress);
    const heading = calculateBearing(currentStop.lat, currentStop.lng, nextStop.lat, nextStop.lng);
    const distToNext = getDistanceMeters(currentCoords.lat, currentCoords.lng, nextStop.lat, nextStop.lng);

    return {
      lat: currentCoords.lat,
      lng: currentCoords.lng,
      speedKmH: Math.round(this.currentSpeed),
      headingDeg: Math.round(heading),
      currentStopIndex: this.stopIndex,
      nextStopIndex: nextStopIndex,
      distanceToNextStopMeters: Math.round(distToNext),
      direction: this.direction,
      timestamp: Date.now(),
    };
  }

  public step(): BusTelemetry {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Small random fluctuations in urban speed (between 25 and 44 km/h)
    const targetSpeed = 30 + Math.sin(now / 5000) * 10 + (Math.random() * 4 - 2);
    this.currentSpeed = Math.max(18, Math.min(48, this.currentSpeed * 0.8 + targetSpeed * 0.2));

    const stops = AKTAU_ROUTE_42_STOPS;
    const currentStop = stops[this.stopIndex];
    const nextStopIndex = this.direction === 'forward' 
      ? Math.min(this.stopIndex + 1, stops.length - 1)
      : Math.max(this.stopIndex - 1, 0);
    const nextStop = stops[nextStopIndex];

    const segmentDistance = Math.max(300, getDistanceMeters(currentStop.lat, currentStop.lng, nextStop.lat, nextStop.lng));
    
    // distance moved = speed (m/s) * dt
    const distanceMoved = (this.currentSpeed * 1000 / 3600) * (dt || 2.5);
    const progressDelta = distanceMoved / segmentDistance;

    this.progress += progressDelta;

    if (this.progress >= 1) {
      this.progress = 0;
      if (this.direction === 'forward') {
        if (this.stopIndex >= stops.length - 2) {
          this.stopIndex = stops.length - 1;
          this.direction = 'backward';
        } else {
          this.stopIndex += 1;
        }
      } else {
        if (this.stopIndex <= 1) {
          this.stopIndex = 0;
          this.direction = 'forward';
        } else {
          this.stopIndex -= 1;
        }
      }
    }

    return this.getTelemetry();
  }
}
