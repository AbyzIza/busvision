import { useState, useEffect, useCallback } from 'react';
import { AKTAU_ROUTE_42_STOPS, BusStop, getDistanceMeters } from '../data/routes';

export interface UserGpsData {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

export function useUserGeolocation() {
  const [userCoords, setUserCoords] = useState<UserGpsData | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unavailable'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updatePosition = useCallback((pos: GeolocationPosition) => {
    setUserCoords({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy),
      altitude: pos.coords.altitude,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp,
    });
    setGpsStatus('active');
    setErrorMessage(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.warn('Geolocation warning:', err.code, err.message);
    if (err.code === err.PERMISSION_DENIED) {
      setGpsStatus('denied');
      setErrorMessage('Доступ к GPS отклонен. Разрешите геолокацию в браузере.');
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      setGpsStatus('unavailable');
      setErrorMessage('Сигнал GPS недоступен.');
    } else {
      setGpsStatus('unavailable');
      setErrorMessage('Таймаут получения геопозиции.');
    }
  }, []);

  const refreshLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable');
      setErrorMessage('Геолокация не поддерживается вашим устройством.');
      return;
    }

    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => updatePosition(pos),
      (err) => handleError(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [updatePosition, handleError]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable');
      setErrorMessage('Геолокация не поддерживается браузером.');
      return;
    }

    refreshLocation();

    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [refreshLocation, updatePosition, handleError]);

  // Check if user is located inside or near Aktau (lat: ~43.5 - 43.8, lng: ~51.0 - 51.4)
  const isNearAktau = userCoords 
    ? userCoords.lat >= 43.45 && userCoords.lat <= 43.85 && userCoords.lng >= 50.95 && userCoords.lng <= 51.45
    : false;

  // Find nearest stop to user if in Aktau
  const nearestUserStop = userCoords && isNearAktau
    ? AKTAU_ROUTE_42_STOPS.reduce<{ stop: BusStop; distance: number }>(
        (acc, stop) => {
          const dist = getDistanceMeters(userCoords.lat, userCoords.lng, stop.lat, stop.lng);
          if (dist < acc.distance) {
            return { stop, distance: dist };
          }
          return acc;
        },
        { stop: AKTAU_ROUTE_42_STOPS[0], distance: Infinity }
      )
    : null;

  return {
    userCoords,
    gpsStatus,
    errorMessage,
    refreshLocation,
    isNearAktau,
    nearestUserStop,
  };
}
