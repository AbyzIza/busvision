import { useState, useEffect, useRef } from 'react';
import { 
  db, 
  ref, 
  onValue, 
  runTransaction, 
  get, 
  set,
  auth,
  onAuthStateChanged,
  FirebaseUser
} from './firebase';
import { 
  Home, 
  Map as MapIcon, 
  Ticket, 
  User, 
  Bell, 
  Users, 
  Navigation2, 
  CheckCircle2, 
  MapPin,
  Clock3,
  Bus,
  LogIn,
  LogOut,
  ShieldCheck,
  Crosshair,
  RefreshCw,
  Edit3,
  UserPlus,
  Compass,
  Radio
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, Tooltip, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import BusVisionLogo from './components/BusVisionLogo';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BusHeroSelector } from './components/BusHeroSelector';
import { GoogleAuthModal, SavedAccount } from './components/GoogleAuthModal';
import { 
  AKTAU_ROUTE_42_STOPS, 
  getNearestBusStop, 
  getDistanceMeters, 
  formatDistance 
} from './data/routes';
import { useUserGeolocation } from './hooks/useUserGeolocation';
import { BusGpsSimulator, BusTelemetry } from './data/busGpsSimulation';

// Styled Leaflet marker with official BusVision logo
const softBusIcon = L.divIcon({
  className: 'soft-bus-marker',
  html: `
    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: -5px; border-radius: 9999px; background: rgba(8, 76, 111, 0.22); animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 36px; height: 36px; border-radius: 9999px; background-color: #084C6F; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(8,76,111,0.4); border: 2.5px solid #FFFFFF;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="22" height="22" fill="#FFFFFF">
          <path d="M 120 178 C 165 150 215 118 245 105 C 275 92 335 105 372 130 C 390 142 396 156 392 178 C 388 190 378 198 374 206 C 370 212 372 238 372 242 L 392 242 C 393 230 395 206 395 194 C 395 168 390 142 370 122 C 335 92 270 82 235 100 C 200 116 148 152 120 178 Z" />
          <path d="M 372 205 C 370 210 370 238 370 242 C 370 244 392 244 392 242 C 392 218 392 198 385 194 C 380 190 374 198 372 205 Z" />
          <path d="M 252 148 C 256 156 278 172 280 188 L 280 224 L 256 224 L 256 184 C 256 168 248 156 252 148 Z" />
          <path d="M 238 116 C 246 122 258 132 258 144 L 262 305 L 252 305 L 246 148 C 243 140 237 132 233 124 L 238 116 Z" />
          <path d="M 170 185 C 195 170 220 150 234 134 L 224 142 C 198 174 165 202 178 242 C 186 266 206 286 230 298 C 218 286 202 266 198 242 C 192 210 178 193 170 185 Z" />
          <path d="M 142 258 C 164 258 194 246 215 230 C 198 246 168 260 142 258 Z" />
          <path d="M 142 256 C 168 256 206 238 232 298 C 218 282 188 258 142 256 Z" />
          <path d="M 244 294 C 284 302 344 302 384 282 C 388 286 388 314 386 350 C 382 360 374 362 360 362 C 318 366 276 354 242 346 C 244 342 246 330 248 318 C 284 326 344 326 378 310 L 376 298 C 336 310 284 310 246 302 L 244 294 Z" />
          <path d="M 242 350 C 276 360 326 364 382 342 C 380 350 374 358 360 360 C 310 366 268 358 242 350 Z" />
          <path d="M 288 314 L 360 314 C 360 326 344 334 324 334 C 304 334 288 326 288 314 Z" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// Styled Leaflet marker for real User Device GPS position
const userGpsIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(37, 99, 235, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 18px; height: 18px; border-radius: 9999px; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(37,99,235,0.45); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: #FFFFFF;"></div>
      </div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Styled Leaflet marker for bus stops
const stopIcon = L.divIcon({
  className: 'bus-stop-marker',
  html: `
    <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #FFFFFF; border: 2.5px solid #084C6F; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Helper component to center map smoothly
function MapController({ 
  centerCoords, 
  zoom 
}: { 
  centerCoords: { lat: number; lng: number } | null; 
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (centerCoords) {
      map.setView([centerCoords.lat, centerCoords.lng], zoom || map.getZoom(), { animate: true });
    }
  }, [centerCoords, zoom, map]);
  return null;
}

export default function App() {
  const [occupancy, setOccupancy] = useState<number>(11);
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 43.6481,
    lng: 51.1706
  });
  const [selectedRouteId, setSelectedRouteId] = useState<string>('42');
  const [manualStopId, setManualStopId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'ticket' | 'profile'>('home');
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [hasVotedWaiting, setHasVotedWaiting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Real Device Geolocation Hook
  const { 
    userCoords, 
    gpsStatus, 
    refreshLocation, 
    isNearAktau, 
    nearestUserStop 
  } = useUserGeolocation();

  // Bus Real-time GPS Telemetry & Movement along Route 42
  const busSimulatorRef = useRef<BusGpsSimulator>(new BusGpsSimulator());
  const [busTelemetry, setBusTelemetry] = useState<BusTelemetry>(() => busSimulatorRef.current.getTelemetry());

  // Focus target on map ('bus' or 'user')
  const [mapFocusTarget, setMapFocusTarget] = useState<'bus' | 'user'>('bus');

  // Google Auth User State & Mode
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'default' | 'register'>('default');

  // Continuous Bus GPS progression along Route 42
  useEffect(() => {
    const interval = setInterval(() => {
      const next = busSimulatorRef.current.step();
      setBusTelemetry(next);
      setLocation({ lat: next.lat, lng: next.lng });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Listen to Firebase Auth state + localStorage restoration
  useEffect(() => {
    // 1. Instant session restore from localStorage
    try {
      const savedUserStr = localStorage.getItem('busvision_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.email) {
          setCurrentUser(parsed as FirebaseUser);
        }
      }
    } catch (e) {
      console.warn('Failed restoring user from localStorage:', e);
    }

    // 2. Firebase live auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          localStorage.setItem('busvision_user', JSON.stringify({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          }));
        } catch {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Dynamic calculations based on real GPS coordinates
  const nearestInfo = getNearestBusStop(location.lat, location.lng, AKTAU_ROUTE_42_STOPS);
  const currentWaitingStop = manualStopId 
    ? (AKTAU_ROUTE_42_STOPS.find(s => s.id === manualStopId) || nearestInfo.stop) 
    : nearestInfo.stop;

  // Track vote state per stop in sessionStorage
  useEffect(() => {
    try {
      const voted = sessionStorage.getItem(`voted_${currentWaitingStop.id}`) === 'true';
      setHasVotedWaiting(voted);
    } catch {
      setHasVotedWaiting(false);
    }
  }, [currentWaitingStop.id]);

  // Firebase Realtime Database Listeners
  useEffect(() => {
    // 1. Listen to 'bus/42/occupancy'
    const occupancyRef = ref(db, 'bus/42/occupancy');
    const unsubOccupancy = onValue(occupancyRef, (snapshot) => {
      const val = snapshot.val();
      if (val === null || val === undefined) {
        setOccupancy(0);
      } else {
        const parsed = typeof val === 'number' ? val : parseInt(val, 10);
        setOccupancy(isNaN(parsed) ? 0 : parsed);
      }
    }, (err) => {
      console.warn('Firebase RTDB occupancy error:', err);
    });

    // 2. Listen to 'bus/42/location'
    const locationRef = ref(db, 'bus/42/location');
    const unsubLocation = onValue(locationRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        if (typeof val.lat === 'number' && typeof val.lng === 'number') {
          setLocation({ lat: val.lat, lng: val.lng });
        } else if (typeof val.latitude === 'number' && typeof val.longitude === 'number') {
          setLocation({ lat: val.latitude, lng: val.longitude });
        } else if (Array.isArray(val) && val.length >= 2) {
          setLocation({ lat: Number(val[0]), lng: Number(val[1]) });
        }
      }
    }, (err) => {
      console.warn('Firebase RTDB location error:', err);
    });

    return () => {
      unsubOccupancy();
      unsubLocation();
    };
  }, []);

  // 3. Listen to dynamic stop waiting count: 'stops/${currentWaitingStop.id}/waitingCount'
  useEffect(() => {
    const waitingPath = `stops/${currentWaitingStop.id}/waitingCount`;
    const waitingRef = ref(db, waitingPath);
    const unsubWaiting = onValue(waitingRef, (snapshot) => {
      const val = snapshot.val();
      let count = 0;
      if (val !== null && val !== undefined) {
        const parsed = typeof val === 'number' ? val : parseInt(val, 10);
        count = isNaN(parsed) ? 0 : parsed;
      }
      setWaitingCount(count);

      // Когда автобус забирает людей и счетчик обнуляется (0), разблокируем кнопку для пассажиров
      if (count === 0) {
        setHasVotedWaiting(false);
        setIsSubmitting(false);
        try {
          sessionStorage.removeItem(`voted_${currentWaitingStop.id}`);
        } catch {
          // ignore
        }
      }
    }, (err) => {
      console.warn(`Firebase RTDB waiting count error for ${waitingPath}:`, err);
    });

    return () => {
      unsubWaiting();
    };
  }, [currentWaitingStop.id]);

  // Crowdsourcing action handler for the current stop
  const handleWaitingClick = async () => {
    if (hasVotedWaiting || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const waitingRef = ref(db, `stops/${currentWaitingStop.id}/waitingCount`);
      
      try {
        await runTransaction(waitingRef, (currentValue) => {
          const current = (currentValue === null || currentValue === undefined) 
            ? 0 
            : (typeof currentValue === 'number' ? currentValue : parseInt(currentValue, 10) || 0);
          return current + 1;
        });
      } catch (transactionErr) {
        console.warn('runTransaction failed, falling back to get/set:', transactionErr);
        const snapshot = await get(waitingRef);
        const current = snapshot.exists() ? (Number(snapshot.val()) || 0) : 0;
        await set(waitingRef, current + 1);
      }

      setHasVotedWaiting(true);
      try {
        sessionStorage.setItem(`voted_${currentWaitingStop.id}`, 'true');
      } catch {
        // storage ignored
      }
    } catch (error) {
      console.error('Error updating waiting count:', error);
      if (!hasVotedWaiting) {
        setWaitingCount((prev) => prev + 1);
        setHasVotedWaiting(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soft, pastel aesthetics matching exact prompt constraints
  const getStatusStyles = (count: number) => {
    if (count < 15) {
      return {
        label: 'Свободно',
        subtext: 'Есть свободные сидячие места',
        iconBg: 'bg-emerald-50',
        textColor: 'text-emerald-500',
        barColor: 'bg-emerald-400',
        pillBg: 'bg-emerald-50 text-emerald-600',
        gradientTint: 'from-emerald-50/40 via-white to-white',
      };
    } else if (count >= 15 && count <= 30) {
      return {
        label: 'Плотненько',
        subtext: 'Остались только стоячие места',
        iconBg: 'bg-orange-50',
        textColor: 'text-orange-400',
        barColor: 'bg-orange-400',
        pillBg: 'bg-orange-50 text-orange-600',
        gradientTint: 'from-orange-50/40 via-white to-white',
      };
    } else {
      return {
        label: 'Перегруз',
        subtext: 'Мест нет, ожидайте следующий автобус',
        iconBg: 'bg-rose-50',
        textColor: 'text-rose-400',
        barColor: 'bg-rose-400',
        pillBg: 'bg-rose-50 text-rose-500',
        gradientTint: 'from-rose-50/40 via-white to-white',
      };
    }
  };

  const status = getStatusStyles(occupancy);
  const fillPercent = Math.min(100, Math.max(0, Math.round((occupancy / 45) * 100)));

  return (
    <div className="min-h-screen bg-[#E5ECF2] flex items-center justify-center p-0 sm:p-6 font-sans">
      {/* Phone Mockup Screen */}
      <div 
        id="app-screen"
        className="max-w-[420px] mx-auto h-[100dvh] sm:h-[850px] w-full bg-[#F0F4F8] relative overflow-hidden shadow-2xl sm:rounded-[3rem] sm:border-[8px] sm:border-white pb-24 flex flex-col"
      >
        {/* Offline Status Toast */}
        <OfflineIndicator />

        {/* Subtle decorative background ambient glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute top-96 left-0 w-72 h-72 bg-purple-50/40 rounded-full blur-3xl pointer-events-none -ml-20"></div>

        {/* Scrollable Main Interface */}
        <div id="scroll-content" className="flex-1 overflow-y-auto px-5 pt-4 pb-24 no-scrollbar relative z-10">
          
          {/* 1. Header: Brand Logo Pill Left, Avatar & Bell Right */}
          <header id="app-header" className="pt-3 pb-2">
            <div className="flex items-center justify-between mb-3">
              {/* Official Brand Pill */}
              <button 
                id="brand-logo-btn"
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2.5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] border border-white/80 py-1.5 px-3 rounded-full cursor-pointer transition-transform active:scale-95 text-left"
              >
                <BusVisionLogo className="w-7 h-7 shrink-0" color="#084C6F" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-tight text-[#084C6F] leading-tight">
                    BusVision
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 leading-tight">
                    Актау
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2">
                {/* Profile Avatar / Google Login Button */}
                <button 
                  id="user-avatar-btn"
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`h-10 rounded-full bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border p-0.5 flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                    currentUser ? 'w-10 border-emerald-400' : 'px-3 gap-1.5 border-slate-200 hover:border-blue-300'
                  }`}
                  aria-label="Профиль / Авторизация через Google"
                  title={currentUser ? (currentUser.displayName || currentUser.email || 'Профиль') : 'Войти через Google'}
                >
                  {currentUser ? (
                    currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Аватар" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#2D3142]">Войти</span>
                    </>
                  )}
                </button>

                {/* Notification Bell in circle */}
                <button 
                  id="notifications-btn"
                  type="button"
                  aria-label="Уведомления"
                  className="w-10 h-10 rounded-full bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-white/60 flex items-center justify-center text-[#2D3142] hover:text-slate-900 transition-transform active:scale-95 cursor-pointer relative"
                >
                  <Bell className="w-4 h-4 text-[#2D3142]" strokeWidth={1.8} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white"></span>
                </button>
              </div>
            </div>

            {/* Dynamic Title & Geolocation-driven Stop Subtitle */}
            <div className="flex items-baseline justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2D3142]">
                  {activeTab === 'home' && 'Explore'}
                  {activeTab === 'map' && 'Карта маршрута'}
                  {activeTab === 'ticket' && 'Билеты'}
                  {activeTab === 'profile' && 'Профиль'}
                </h1>
                <p className="text-xs font-medium text-gray-500 mt-0.5 tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#084C6F] shrink-0" />
                  <span>Маршрут №42 • ост. <strong className="text-[#084C6F]">{nearestInfo.stop.name}</strong></span>
                </p>
              </div>

              {activeTab === 'home' && (
                <span className="text-[10px] text-gray-400 font-mono bg-white/70 px-2 py-0.5 rounded-md border border-slate-200/50">
                  {formatDistance(nearestInfo.distance)}
                </span>
              )}
            </div>
          </header>

          {/* HOME TAB VIEW */}
          {activeTab === 'home' && (
            <>
              {/* Real GPS Telemetry Status Strip */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.04)] mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${gpsStatus === 'active' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${gpsStatus === 'active' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#2D3142]">
                        {gpsStatus === 'active' && userCoords
                          ? `GPS устройства: ${userCoords.lat.toFixed(4)}°, ${userCoords.lng.toFixed(4)}°`
                          : gpsStatus === 'requesting'
                          ? 'Определение спутников GPS...'
                          : 'GPS устройства активен'}
                      </span>
                      {userCoords?.accuracy && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md font-mono font-medium border border-emerald-100">
                          ±{userCoords.accuracy}м
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isNearAktau && nearestUserStop
                        ? `Вы в ${formatDistance(nearestUserStop.distance)} от ост. ${nearestUserStop.stop.shortName}`
                        : `Автобус №42 на линии • ${busTelemetry.speedKmH} км/ч • ост. ${nearestInfo.stop.shortName}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={refreshLocation}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                    title="Обновить сигнал GPS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gpsStatus === 'requesting' ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 1. Interactive Bus Drawing & Route Selector at the beginning */}
              <div className="mt-1 mb-3">
                <BusHeroSelector 
                  currentRouteId={selectedRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  nearestStopName={nearestInfo.stop.name}
                  distanceToNearestStop={nearestInfo.distance}
                  occupancy={occupancy}
                  busCoords={location}
                  busSpeed={busTelemetry.speedKmH}
                  userGpsActive={gpsStatus === 'active'}
                />
              </div>

              {/* PWA Install Banner */}
              <PWAInstallButton variant="banner" className="mb-3" />

              {/* 2. Smart Status Card (AI Monitoring) */}
              <section 
                id="smart-status-card"
                className={`bg-white rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 relative overflow-hidden bg-gradient-to-br ${status.gradientTint}`}
              >
                {/* Top row with Title & Pastel Status Pill */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium tracking-wider uppercase text-gray-400">
                      Мониторинг AI
                    </span>
                    <h2 className="text-lg font-semibold text-[#2D3142] mt-0.5">
                      Загруженность салона
                    </h2>
                  </div>

                  {/* Pastel Status Badge */}
                  <div 
                    id="status-badge"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 ${status.iconBg} ${status.textColor} transition-colors duration-300`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.barColor}`}></span>
                    <span>{status.label}</span>
                  </div>
                </div>

                {/* Occupancy Big Number & Label */}
                <div className="mt-6 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span 
                      id="occupancy-number"
                      className="text-5xl font-bold tracking-tight text-[#2D3142]"
                    >
                      {occupancy}
                    </span>
                    <span className="text-sm font-medium text-gray-400">
                      человек внутри
                    </span>
                  </div>

                  {/* Pastel Icon Circle */}
                  <div className={`w-12 h-12 rounded-2xl ${status.iconBg} flex items-center justify-center transition-colors duration-300`}>
                    <Users className={`w-6 h-6 ${status.textColor}`} strokeWidth={1.8} />
                  </div>
                </div>

                {/* Soft Pastel Progress Indicator */}
                <div className="mt-6">
                  <div className="flex justify-between items-center text-xs font-medium text-gray-400 mb-2">
                    <span>{status.subtext}</span>
                    <span className="text-[#2D3142] font-semibold">{fillPercent}%</span>
                  </div>

                  {/* Bar track */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${status.barColor}`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* Dynamic Crowdsourcing Card ("Помоги городу") */}
              <section 
                id="crowdsourcing-card"
                className="bg-white rounded-[32px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] mt-4 border border-slate-100/60 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium tracking-wider uppercase text-gray-400">
                    Помоги городу • Актау
                  </span>
                  {waitingCount > 0 && (
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F0F4F8] px-2.5 py-0.5 rounded-full">
                      Ждут на ост.: <strong className="text-[#2D3142] font-semibold">{waitingCount}</strong>
                    </span>
                  )}
                </div>

                {/* Stop Selector Pill */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mb-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-[#084C6F] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block leading-tight">Остановка ожидания:</span>
                      <span className="font-bold text-[#2D3142] truncate block leading-tight">
                        {currentWaitingStop.name}
                      </span>
                    </div>
                  </div>

                  <select
                    value={currentWaitingStop.id}
                    onChange={(e) => setManualStopId(e.target.value)}
                    aria-label="Выбрать остановку"
                    className="text-[11px] font-medium text-[#084C6F] bg-white border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer max-w-[125px] truncate"
                  >
                    {AKTAU_ROUTE_42_STOPS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortName} {s.id === nearestInfo.stop.id ? '(рядом)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  id="crowdsource-waiting-btn"
                  type="button"
                  onClick={handleWaitingClick}
                  disabled={hasVotedWaiting || isSubmitting}
                  className={`w-full py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed ${
                    hasVotedWaiting
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20 active:scale-100'
                      : 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white shadow-blue-500/25'
                  }`}
                >
                  {hasVotedWaiting ? (
                    <span>✓ Отмечено на ост. {currentWaitingStop.shortName}. Спасибо!</span>
                  ) : (
                    <span>📍 Я жду на ост. {currentWaitingStop.shortName}</span>
                  )}
                </button>
              </section>

              {/* 3. Map Card (Leaflet with all stops and live bus) */}
              <section 
                id="map-bento-card"
                className="bg-white rounded-[32px] p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] mt-4"
              >
                <div className="flex items-center justify-between px-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Navigation2 className="w-3.5 h-3.5 text-[#2D3142]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2D3142]">
                      Автобус на карте
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400">
                    GPS в реальном времени
                  </span>
                </div>

                {/* Leaflet container */}
                <div className="h-52 rounded-2xl overflow-hidden relative shadow-inner border border-slate-100/60 z-0">
                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={14}
                    zoomControl={false}
                    attributionControl={false}
                    className="w-full h-full"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Polyline of Route 42 */}
                    <Polyline
                      positions={AKTAU_ROUTE_42_STOPS.map(s => [s.lat, s.lng])}
                      pathOptions={{
                        color: '#084C6F',
                        weight: 4,
                        opacity: 0.7,
                        dashArray: '6, 8',
                      }}
                    />

                    {/* Stops along Route 42 */}
                    {AKTAU_ROUTE_42_STOPS.map((stop) => (
                      <Marker 
                        key={stop.id}
                        position={[stop.lat, stop.lng]}
                        icon={stopIcon}
                      >
                        <Tooltip direction="top" offset={[0, -6]}>
                          <span className="text-xs font-semibold">{stop.name}</span>
                        </Tooltip>
                      </Marker>
                    ))}

                    {/* Live bus marker with speed badge */}
                    <Marker 
                      position={[location.lat, location.lng]} 
                      icon={softBusIcon} 
                    >
                      <Tooltip direction="bottom" offset={[0, 10]}>
                        <span className="text-xs font-bold text-[#084C6F]">Автобус №42 • {busTelemetry.speedKmH} км/ч</span>
                      </Tooltip>
                    </Marker>

                    {/* Real User Device GPS Marker */}
                    {userCoords && (
                      <>
                        <Marker 
                          position={[userCoords.lat, userCoords.lng]} 
                          icon={userGpsIcon} 
                        >
                          <Tooltip direction="top" offset={[0, -10]}>
                            <span className="text-xs font-bold text-blue-600">Вы здесь (GPS)</span>
                          </Tooltip>
                        </Marker>
                        <Circle
                          center={[userCoords.lat, userCoords.lng]}
                          radius={Math.min(userCoords.accuracy || 20, 200)}
                          pathOptions={{
                            color: '#2563EB',
                            fillColor: '#3B82F6',
                            fillOpacity: 0.12,
                            weight: 1.5,
                          }}
                        />
                      </>
                    )}

                    <MapController 
                      centerCoords={mapFocusTarget === 'user' && userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: location.lat, lng: location.lng }} 
                    />
                  </MapContainer>

                  {/* Floating map focus controls */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-[400]">
                    <button
                      type="button"
                      onClick={() => setMapFocusTarget('bus')}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer backdrop-blur-md ${
                        mapFocusTarget === 'bus'
                          ? 'bg-[#084C6F] text-white border border-white/20'
                          : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200/80'
                      }`}
                      title="Центрировать на автобусе"
                    >
                      <Bus className="w-3 h-3" />
                      <span>Автобус</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMapFocusTarget('user');
                        if (gpsStatus !== 'active') refreshLocation();
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer backdrop-blur-md ${
                        mapFocusTarget === 'user'
                          ? 'bg-blue-600 text-white border border-white/20'
                          : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200/80'
                      }`}
                      title="Центрировать на вашем местоположении"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Мой GPS</span>
                    </button>
                  </div>

                  {/* Floating soft badge inside map */}
                  <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs border border-white/80 flex items-center gap-1.5 pointer-events-none z-[400]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-medium text-[#2D3142]">
                      ост. {nearestInfo.stop.shortName} • {busTelemetry.speedKmH} км/ч
                    </span>
                  </div>
                </div>
              </section>

              {/* 4. Timeline Card (Dynamic stops based on real GPS location) */}
              <section 
                id="timeline-stops-card"
                className="bg-white rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] mt-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#2D3142]">
                      Остановки маршрута №42
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Автовокзал → Набережная (15 мкр)
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#084C6F] bg-blue-50 px-2 py-0.5 rounded-full">
                    GPS Активен
                  </span>
                </div>

                <div className="relative pl-3 space-y-3">
                  {/* Vertical connector line */}
                  <div className="absolute left-[18px] top-2.5 bottom-2.5 w-[2px] bg-slate-100"></div>

                  {AKTAU_ROUTE_42_STOPS.map((stop, idx) => {
                    const isCurrent = idx === nearestInfo.index;
                    const isPassed = idx < nearestInfo.index;
                    const distToBus = getDistanceMeters(location.lat, location.lng, stop.lat, stop.lng);
                    const estimatedMinutes = Math.max(1, Math.round(distToBus / 350));

                    return (
                      <div 
                        key={stop.id}
                        onClick={() => setManualStopId(stop.id)}
                        className={`relative flex items-center justify-between p-2 -mx-2 rounded-2xl transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-blue-50/70 border border-blue-200/60 shadow-xs' 
                            : currentWaitingStop.id === stop.id
                            ? 'bg-slate-100/70 border border-slate-200'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-3.5 h-3.5 rounded-full z-10 flex items-center justify-center shrink-0 ${
                            isCurrent 
                              ? 'bg-[#084C6F] ring-4 ring-blue-100' 
                              : isPassed 
                              ? 'bg-slate-300 ring-2 ring-white' 
                              : 'bg-white border-2 border-slate-300 ring-2 ring-white'
                          }`}>
                            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-semibold truncate ${
                                isCurrent ? 'text-[#084C6F]' : isPassed ? 'text-gray-400 line-through' : 'text-[#2D3142]'
                              }`}>
                                {stop.name}
                              </span>
                              {currentWaitingStop.id === stop.id && (
                                <span className="text-[9px] bg-[#084C6F] text-white px-1.5 py-0.2 rounded-full font-medium shrink-0">
                                  Я здесь
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 truncate">
                              {isCurrent 
                                ? (distToBus < 200 ? 'Автобус на остановке' : `Автобус рядом (~${distToBus} м)`)
                                : isPassed 
                                ? 'Остановка пройдена' 
                                : `Расстояние: ~${formatDistance(distToBus)}`}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-2xs border border-blue-100">
                              {distToBus < 200 ? 'Здесь' : '~1 мин'}
                            </span>
                          ) : isPassed ? (
                            <span className="text-[10px] font-medium text-gray-400">Пройдена</span>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              ~{estimatedMinutes} мин
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* MAP TAB VIEW */}
          {activeTab === 'map' && (
            <div className="space-y-4 mt-3">
              <div className="bg-white rounded-[32px] p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                {/* GPS Status Banner in Map view */}
                <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-100 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${gpsStatus === 'active' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${gpsStatus === 'active' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                    </span>
                    <span className="font-bold text-[#2D3142]">
                      {gpsStatus === 'active' && userCoords
                        ? `Ваш GPS: ${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E (±${userCoords.accuracy}м)`
                        : 'Спутниковый GPS активен'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshLocation}
                    className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 cursor-pointer"
                    title="Обновить координаты GPS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gpsStatus === 'requesting' ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>

                <div className="h-96 rounded-2xl overflow-hidden relative shadow-inner border border-slate-100">
                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={14}
                    zoomControl={false}
                    attributionControl={false}
                    className="w-full h-full"
                  >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    
                    {/* Polyline Route 42 */}
                    <Polyline
                      positions={AKTAU_ROUTE_42_STOPS.map(s => [s.lat, s.lng])}
                      pathOptions={{
                        color: '#084C6F',
                        weight: 4.5,
                        opacity: 0.75,
                        dashArray: '6, 8',
                      }}
                    />

                    {/* All Stops along Route 42 */}
                    {AKTAU_ROUTE_42_STOPS.map((stop) => (
                      <Marker 
                        key={stop.id}
                        position={[stop.lat, stop.lng]}
                        icon={stopIcon}
                      >
                        <Tooltip direction="top" offset={[0, -6]}>
                          <span className="text-xs font-semibold">{stop.name}</span>
                        </Tooltip>
                      </Marker>
                    ))}

                    {/* Live bus marker */}
                    <Marker position={[location.lat, location.lng]} icon={softBusIcon}>
                      <Tooltip direction="bottom" offset={[0, 10]}>
                        <span className="text-xs font-bold text-[#084C6F]">Автобус №42 • {busTelemetry.speedKmH} км/ч</span>
                      </Tooltip>
                    </Marker>

                    {/* Real User Device GPS Marker */}
                    {userCoords && (
                      <>
                        <Marker position={[userCoords.lat, userCoords.lng]} icon={userGpsIcon}>
                          <Tooltip direction="top" offset={[0, -10]}>
                            <span className="text-xs font-bold text-blue-600">Вы здесь (GPS)</span>
                          </Tooltip>
                        </Marker>
                        <Circle
                          center={[userCoords.lat, userCoords.lng]}
                          radius={Math.min(userCoords.accuracy || 20, 200)}
                          pathOptions={{
                            color: '#2563EB',
                            fillColor: '#3B82F6',
                            fillOpacity: 0.12,
                            weight: 1.5,
                          }}
                        />
                      </>
                    )}

                    <MapController 
                      centerCoords={mapFocusTarget === 'user' && userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: location.lat, lng: location.lng }}
                      zoom={mapFocusTarget === 'user' ? 15 : 14}
                    />
                  </MapContainer>

                  {/* Floating map switch controls */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[400]">
                    <button
                      type="button"
                      onClick={() => setMapFocusTarget('bus')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                        mapFocusTarget === 'bus'
                          ? 'bg-[#084C6F] text-white border border-white/20'
                          : 'bg-white/95 text-slate-700 hover:bg-white border border-slate-200/80'
                      }`}
                      title="Центрировать на автобусе"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span>Автобус №42</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMapFocusTarget('user');
                        if (gpsStatus !== 'active') refreshLocation();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                        mapFocusTarget === 'user'
                          ? 'bg-blue-600 text-white border border-white/20'
                          : 'bg-white/95 text-slate-700 hover:bg-white border border-slate-200/80'
                      }`}
                      title="Центрировать на вашем местоположении"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Мой GPS</span>
                    </button>
                  </div>

                  {/* Bottom live telematics bar */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/80 z-[400] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Телеметрия GPS • Линия №42
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#2D3142] mt-0.5">
                        След. ост: {AKTAU_ROUTE_42_STOPS[busTelemetry.nextStopIndex]?.shortName || nearestInfo.stop.shortName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        Скорость: {busTelemetry.speedKmH} км/ч • До остановки: ~{busTelemetry.distanceToNextStopMeters} м
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/80 shadow-2xs">
                      В пути
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TICKET TAB VIEW */}
          {activeTab === 'ticket' && (
            <div className="space-y-4 mt-3">
              <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <BusVisionLogo className="w-4 h-4 shrink-0" color="#084C6F" />
                      <span className="text-[10px] font-bold text-[#084C6F] uppercase tracking-wider">BusVision • Актау</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2D3142]">Маршрут №42</h3>
                    <p className="text-xs text-gray-400">ост. {nearestInfo.stop.shortName} • Электронный билет</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50/80 p-2 flex items-center justify-center shadow-xs border border-blue-100/50">
                    <BusVisionLogo className="w-8 h-8" color="#084C6F" />
                  </div>
                </div>

                <div className="my-6 p-4 rounded-2xl bg-[#F0F4F8] flex flex-col items-center justify-center text-center">
                  <div className="w-36 h-36 bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200 flex items-center justify-center">
                    {/* Visual QR Code Mockup */}
                    <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-2 border-white rounded-xs"></div>
                        <div className="w-6 h-6 border-2 border-white rounded-xs"></div>
                      </div>
                      <div className="text-[9px] text-white/80 font-mono tracking-widest text-center">
                        BUSVISION-42
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-2 border-white rounded-xs"></div>
                        <div className="w-3 h-3 bg-emerald-400 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-3 font-mono">
                    ID: BV-PASS-AKTAU-42
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Пассажир:</span>
                    <strong className="text-[#2D3142] font-semibold">
                      {currentUser ? (currentUser.displayName || currentUser.email) : 'Городской билет'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Посадка:</span>
                    <strong className="text-[#084C6F] font-semibold">{nearestInfo.stop.shortName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Тариф:</span>
                    <span className="text-emerald-600 font-semibold">Городской (70 ₸)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB VIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-4 mt-3">
              <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="flex flex-col items-center text-center">
                  {currentUser ? (
                    <div className="relative mb-2">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt={currentUser.displayName || 'Пользователь'} 
                          className="w-20 h-20 rounded-full border-4 border-emerald-50 shadow-sm object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border-4 border-emerald-50">
                          {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-50 to-white flex items-center justify-center text-[#2D3142] shadow-sm mb-2 border border-slate-100 p-3">
                      <BusVisionLogo className="w-14 h-14" color="#084C6F" />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <h3 className="text-lg font-bold text-[#2D3142]">
                      {currentUser ? (currentUser.displayName || 'Пользователь Google') : 'Гость BusVision'}
                    </h3>
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('default');
                          setIsAuthModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Изменить настоящее имя"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
                    {currentUser ? currentUser.email : 'Городской транспорт Актау • Маршрут №42'}
                  </p>
                  
                  {currentUser ? (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/80">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Аккаунт сохранен</span>
                    </div>
                  ) : (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Гостевой режим</span>
                    </div>
                  )}
                </div>

                {/* Google Sign-in / Manage Account Button */}
                <div className="mt-5 space-y-2">
                  {currentUser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('default');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#084C6F]" />
                        <span>Управление аккаунтом и именем</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('register');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-blue-200 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Зарегистрировать другой аккаунт</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('default');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-[#2D3142] font-semibold text-xs transition-all flex items-center justify-center gap-2.5 border border-slate-200 shadow-sm cursor-pointer"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Быстрый вход через Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('register');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Регистрация с вводом настоящего имени</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#F0F4F8] flex items-center justify-between">
                    <span className="text-xs text-gray-500">Активный маршрут:</span>
                    <span className="text-xs font-semibold text-[#2D3142]">№42 ({nearestInfo.stop.shortName})</span>
                  </div>

                  {/* Real Device GPS Status in Profile */}
                  <div className="p-3.5 rounded-2xl bg-[#F0F4F8] flex items-center justify-between">
                    <span className="text-xs text-gray-500">GPS смартфона:</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>
                        {userCoords ? `${userCoords.lat.toFixed(4)}°, ${userCoords.lng.toFixed(4)}° (±${userCoords.accuracy}м)` : 'Определяется'}
                      </span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F0F4F8] flex items-center justify-between">
                    <span className="text-xs text-gray-500">Статус краудсорсинга:</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {hasVotedWaiting ? `✓ Отметка на ост. ${currentWaitingStop.shortName}` : 'Готов к отметке'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F0F4F8] flex items-center justify-between">
                    <span className="text-xs text-gray-500">Ожидающих на остановке:</span>
                    <span className="text-xs font-semibold text-[#2D3142]">{waitingCount} чел.</span>
                  </div>
                </div>
              </div>

              {/* PWA Mobile App Card */}
              <div className="pt-1">
                <PWAInstallButton variant="card" />
              </div>
            </div>
          )}

        </div>

        {/* Google Authentication Modal */}
        <GoogleAuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          user={currentUser} 
          onUserChange={(newUser) => setCurrentUser(newUser)}
          initialMode={authModalMode}
        />

        {/* 5. Floating Bottom Tab Bar (Плавающая таблетка внизу по центру) */}
        <nav 
          id="floating-tab-bar"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-[#1E2028] text-white rounded-full py-4 px-6 flex justify-between items-center shadow-xl z-50 backdrop-blur-md"
        >
          {/* Item 1: Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            aria-label="Главная"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'home' 
                ? 'text-white bg-white/15 scale-110' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Item 2: Map */}
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            aria-label="Карта"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'map' 
                ? 'text-white bg-white/15 scale-110' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Item 3: Tickets / Routes */}
          <button
            type="button"
            onClick={() => setActiveTab('ticket')}
            aria-label="Билеты"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'ticket' 
                ? 'text-white bg-white/15 scale-110' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Ticket className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Item 4: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            aria-label="Профиль"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'profile' 
                ? 'text-white bg-white/15 scale-110' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" strokeWidth={2} />
          </button>
        </nav>
      </div>
    </div>
  );
}
