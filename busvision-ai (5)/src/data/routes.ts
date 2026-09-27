export interface BusStop {
  id: string;
  name: string;
  shortName: string;
  microdistrict: string;
  lat: number;
  lng: number;
}

export interface BusRoute {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  status: 'active' | 'upcoming';
  busesCount: number;
  interval: string;
  stops: BusStop[];
}

export const AKTAU_ROUTE_42_STOPS: BusStop[] = [
  {
    id: 'avtovokzal',
    name: 'Автовокзал (28 мкр)',
    shortName: 'Автовокзал',
    microdistrict: '28-й микрорайон',
    lat: 43.6625,
    lng: 51.1885,
  },
  {
    id: 'rynok_olzha',
    name: 'Рынок «Олжа» (24 мкр)',
    shortName: 'Рын. Олжа',
    microdistrict: '24-й микрорайон',
    lat: 43.6568,
    lng: 51.1812,
  },
  {
    id: 'mkr_11',
    name: '11-й микрорайон',
    shortName: '11 мкр',
    microdistrict: '11-й микрорайон',
    lat: 43.6518,
    lng: 51.1762,
  },
  {
    id: 'trk_aktau',
    name: 'ТРК «Актау» (16 мкр)',
    shortName: 'ТРК Актау',
    microdistrict: '16-й микрорайон',
    lat: 43.6481,
    lng: 51.1706,
  },
  {
    id: 'yesenov_univ',
    name: 'Университет Есенова (32 мкр)',
    shortName: 'Ун-т Есенова',
    microdistrict: '32-й микрорайон',
    lat: 43.6425,
    lng: 51.1625,
  },
  {
    id: 'akimat_14',
    name: 'Акимат (14 мкр)',
    shortName: 'Акимат',
    microdistrict: '14-й микрорайон',
    lat: 43.6372,
    lng: 51.1552,
  },
  {
    id: 'naberezhnaya_15',
    name: 'Набережная (15 мкр)',
    shortName: 'Набережная',
    microdistrict: '15-й микрорайон',
    lat: 43.6322,
    lng: 51.1482,
  },
];

export const AKTAU_ROUTES: BusRoute[] = [
  {
    id: '42',
    number: '42',
    name: 'Автовокзал — ТРК Актау — Набережная',
    from: 'Автовокзал (28 мкр)',
    to: 'Набережная (15 мкр)',
    status: 'active',
    busesCount: 1,
    interval: '8–12 мин',
    stops: AKTAU_ROUTE_42_STOPS,
  },
  {
    id: '2',
    number: '2',
    name: 'Рынок Олжа — 14 мкр — Морпорт',
    from: 'Рынок Олжа',
    to: 'Морпорт',
    status: 'upcoming',
    busesCount: 0,
    interval: '10–15 мин',
    stops: [],
  },
  {
    id: '3',
    number: '3',
    name: '28 мкр — Больничный городок — 4 мкр',
    from: '28-й микрорайон',
    to: '4-й микрорайон',
    status: 'upcoming',
    busesCount: 0,
    interval: '12–15 мин',
    stops: [],
  },
  {
    id: '5',
    number: '5',
    name: 'Базар Желтый — ТРК Актау — Теплый пляж',
    from: 'Базар Желтый',
    to: 'Теплый пляж',
    status: 'upcoming',
    busesCount: 0,
    interval: '15–20 мин',
    stops: [],
  },
];

export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} м`;
  }
  return `${(meters / 1000).toFixed(1)} км`;
}

export function getNearestBusStop(
  lat: number,
  lng: number,
  stops: BusStop[] = AKTAU_ROUTE_42_STOPS
): { stop: BusStop; distance: number; index: number } {
  let minDistance = Infinity;
  let nearestStop = stops[0];
  let nearestIndex = 0;

  stops.forEach((stop, index) => {
    const dist = getDistanceMeters(lat, lng, stop.lat, stop.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStop = stop;
      nearestIndex = index;
    }
  });

  return { stop: nearestStop, distance: minDistance, index: nearestIndex };
}
