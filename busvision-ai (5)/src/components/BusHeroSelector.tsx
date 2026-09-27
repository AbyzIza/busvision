import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, 
  ChevronRight, 
  Check, 
  Clock, 
  Radio, 
  MapPin, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';
import { AKTAU_ROUTES, BusRoute } from '../data/routes';

interface BusHeroSelectorProps {
  currentRouteId: string;
  onSelectRoute?: (routeId: string) => void;
  nearestStopName?: string;
  distanceToNearestStop?: number;
  occupancy?: number;
  busCoords?: { lat: number; lng: number };
  busSpeed?: number;
  userGpsActive?: boolean;
}

export const BusHeroSelector: React.FC<BusHeroSelectorProps> = ({
  currentRouteId = '42',
  onSelectRoute,
  nearestStopName = 'ТРК Актау',
  distanceToNearestStop,
  occupancy = 11,
  busCoords,
  busSpeed = 34,
  userGpsActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
  const [isEntering, setIsEntering] = useState(false);
  const [enterSequence, setEnterSequence] = useState(0);
  const prevOccupancyRef = useRef(occupancy);

  useEffect(() => {
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [isEntering, enterSequence]);

  useEffect(() => {
    if (occupancy > prevOccupancyRef.current) {
      setIsEntering(true);
      setEnterSequence((s) => s + 1);
    }
    prevOccupancyRef.current = occupancy;
  }, [occupancy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(true);
      setEnterSequence(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const selectedRoute = AKTAU_ROUTES.find((r) => r.id === currentRouteId) || AKTAU_ROUTES[0];

  const handleRouteClick = (route: BusRoute) => {
    if (route.status === 'active') {
      onSelectRoute?.(route.id);
      setIsOpen(false);
    } else {
      setAlertMessage(
        `Маршрут №${route.number} готовится к подключению: сенсоры пассажиропотока устанавливаются. Сейчас в реальном времени работает маршрут №42.`
      );
      setTimeout(() => {
        setAlertMessage(null);
      }, 4500);
    }
  };

  return (
    <>
      {/* Interactive Hero Bus Card */}
      <div 
        id="bus-hero-card"
        onClick={() => setIsOpen(true)}
        className="group relative bg-gradient-to-br from-[#084C6F] via-[#0A5880] to-[#05324A] text-white rounded-[28px] p-4 shadow-[0_15px_30px_-8px_rgba(8,76,111,0.35)] cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_20px_35px_-6px_rgba(8,76,111,0.45)] active:scale-[0.99] border border-white/15"
      >
        {/* Soft background ambient light */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top bar with Route Chip and LIVE GPS */}
        <div className="flex items-center justify-between relative z-10 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 border border-white/20">
              <Bus className="w-3.5 h-3.5 text-cyan-300" />
              <span>Маршрут №{selectedRoute.number}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE GPS • {busSpeed} км/ч</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-white/80 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors">
            <span>Маршруты</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Beautiful Detailed Vector Bus Illustration */}
        <div className="relative z-10 my-1 flex items-center justify-center">
          <div className="w-full max-w-[320px] relative">
            <svg 
              viewBox="0 0 460 175" 
              className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-[1.02]"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic body gradient */}
                <linearGradient id="busBodyGrad" x1="0" y1="0" x2="460" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#EBF4F9" />
                  <stop offset="100%" stopColor="#D2E4F0" />
                </linearGradient>
                {/* Brand blue livery wave */}
                <linearGradient id="busLiveryGrad" x1="0" y1="60" x2="440" y2="130" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#084C6F" />
                  <stop offset="70%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                {/* Dark glass tint */}
                <linearGradient id="busGlassGrad" x1="0" y1="30" x2="0" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                {/* Headlight beam glow */}
                <linearGradient id="headlightBeam" x1="435" y1="105" x2="475" y2="135" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
                </linearGradient>
                {/* Aura for entering passenger */}
                <radialGradient id="passengerAuraGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#0284C7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#084C6F" stopOpacity="0" />
                </radialGradient>
                {/* Glow filter for AI sensor and door */}
                <filter id="sensorGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Clean keyframe styles for smooth boarding animation */}
              <style>{`
                @keyframes passengerBoardingStep {
                  0% {
                    transform: translate(208px, 150px) scale(0.6);
                    opacity: 0;
                  }
                  15% {
                    transform: translate(208px, 120px) scale(0.95);
                    opacity: 1;
                  }
                  38% {
                    transform: translate(208px, 92px) scale(1);
                    opacity: 1;
                  }
                  65% {
                    transform: translate(238px, 66px) scale(1.05);
                    opacity: 0.95;
                  }
                  88% {
                    transform: translate(272px, 54px) scale(0.95);
                    opacity: 0.9;
                  }
                  100% {
                    transform: translate(275px, 52px) scale(0.85);
                    opacity: 0;
                  }
                }
                @keyframes floatEntryBadge {
                  0% {
                    transform: translateY(6px) scale(0.75);
                    opacity: 0;
                  }
                  20% {
                    transform: translateY(-4px) scale(1.08);
                    opacity: 1;
                  }
                  75% {
                    transform: translateY(-18px) scale(1);
                    opacity: 0.95;
                  }
                  100% {
                    transform: translateY(-30px) scale(0.88);
                    opacity: 0;
                  }
                }
                @keyframes seatLightUp {
                  0% {
                    filter: drop-shadow(0 0 0px rgba(56,189,248,0));
                  }
                  45% {
                    filter: drop-shadow(0 0 8px rgba(56,189,248,1));
                  }
                  100% {
                    filter: drop-shadow(0 0 0px rgba(56,189,248,0));
                  }
                }
              `}</style>

              {/* Road shadow */}
              <ellipse cx="230" cy="155" rx="205" ry="12" fill="#000000" fillOpacity="0.25" />

              {/* Headlight beam */}
              <polygon points="428,102 458,92 458,136 426,112" fill="url(#headlightBeam)" />

              {/* Bus Main Chassis & Body */}
              <path 
                d="M 35 125 L 35 46 C 35 34 46 25 60 25 L 385 25 C 415 25 432 40 435 72 L 436 122 C 436 130 430 135 422 135 L 375 135 C 375 118 360 105 342 105 C 324 105 310 118 310 135 L 145 135 C 145 118 130 105 112 105 C 94 105 80 118 80 135 L 45 135 C 39 135 35 130 35 125 Z" 
                fill="url(#busBodyGrad)" 
                stroke="#084C6F" 
                strokeWidth="2.5" 
              />

              {/* Roof AC Unit / CNG Pod */}
              <path d="M 120 25 L 125 15 C 127 12 135 11 142 11 L 305 11 C 315 11 320 13 322 15 L 328 25 Z" fill="#DDE8F0" stroke="#084C6F" strokeWidth="1.8" />
              <line x1="145" y1="17" x2="165" y2="17" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="175" y1="17" x2="195" y2="17" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="205" y1="17" x2="225" y2="17" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

              {/* Brand Livery Swoop / Wave Accent */}
              <path 
                d="M 35 88 C 110 88 170 108 240 108 C 310 108 370 85 435 85 L 436 118 C 436 124 430 130 422 130 L 372 130 C 372 118 360 110 342 110 C 324 110 312 118 312 130 L 143 130 C 143 118 130 110 112 110 C 94 110 82 118 82 130 L 45 130 C 39 130 35 125 35 120 Z" 
                fill="url(#busLiveryGrad)" 
              />

              {/* Side Striping */}
              <path d="M 40 78 Q 230 78 433 78" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 3" opacity="0.8" />

              {/* Windows Belt (Tinted panoramic glass) */}
              <path 
                d="M 52 35 L 105 35 L 105 74 L 52 74 Z 
                   M 112 35 L 172 35 L 172 74 L 112 74 Z 
                   M 179 35 L 239 35 L 239 74 L 179 74 Z 
                   M 246 35 L 306 35 L 306 74 L 246 74 Z 
                   M 313 35 L 368 35 L 368 74 L 313 74 Z 
                   M 375 35 L 422 35 C 428 35 431 42 431 52 L 430 74 L 375 74 Z" 
                fill="url(#busGlassGrad)" 
                stroke="#084C6F" 
                strokeWidth="1.5" 
              />

              {/* Passenger silhouettes inside windows */}
              <circle cx="78" cy="52" r="5.5" fill="#64748B" opacity="0.6" />
              <path d="M 68 67 C 68 60 72 58 78 58 C 84 58 88 60 88 67 Z" fill="#64748B" opacity="0.6" />
              
              <circle cx="142" cy="52" r="5.5" fill="#64748B" opacity="0.6" />
              <path d="M 132 67 C 132 60 136 58 142 58 C 148 58 152 60 152 67 Z" fill="#64748B" opacity="0.6" />

              {/* Passenger silhouette inside window 3 with glowing welcome animation on boarding */}
              <g style={isEntering ? { animation: 'seatLightUp 2.2s ease-in-out' } : undefined}>
                <circle cx="275" cy="52" r="5.5" fill={isEntering ? "#38BDF8" : "#64748B"} opacity={isEntering ? 0.95 : 0.6} className="transition-colors duration-500" />
                <path d="M 265 67 C 265 60 269 58 275 58 C 281 58 285 60 285 67 Z" fill={isEntering ? "#38BDF8" : "#64748B"} opacity={isEntering ? 0.95 : 0.6} className="transition-colors duration-500" />
              </g>

              {/* Front Windshield Angle & Driver */}
              <circle cx="400" cy="50" r="5.5" fill="#94A3B8" opacity="0.8" />
              <path d="M 390 68 C 390 60 394 57 400 57 C 406 57 410 60 410 68 Z" fill="#94A3B8" opacity="0.8" />

              {/* Glass reflection streak */}
              <line x1="58" y1="40" x2="422" y2="40" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />

              {/* Electronic Route LED Display above windshield */}
              <rect x="375" y="27" width="46" height="7" rx="2" fill="#090D16" />
              <text x="398" y="33" fill="#F59E0B" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                42 АКТАУ
              </text>

              {/* Passenger Doors (Twin double doors with glass) */}
              <g>
                <rect 
                  x="180" 
                  y="38" 
                  width="56" 
                  height="92" 
                  fill={isEntering ? "#052e42" : "#000000"} 
                  fillOpacity={isEntering ? 0.35 : 0.08} 
                  stroke={isEntering ? "#10B981" : "#084C6F"} 
                  strokeWidth={isEntering ? 2.5 : 1.5} 
                  rx="1"
                  className="transition-colors duration-300"
                />
                <line 
                  x1="208" 
                  y1="38" 
                  x2="208" 
                  y2="130" 
                  stroke={isEntering ? "#34D399" : "#084C6F"} 
                  strokeWidth={isEntering ? 2 : 1.5} 
                  className="transition-colors duration-300"
                />

                {/* AI YOLO Optical Detection Sensor Line above door */}
                {isEntering && (
                  <g>
                    <rect x="180" y="37" width="56" height="3" rx="1.5" fill="#10B981" filter="url(#sensorGlow)" />
                    <line x1="184" y1="38.5" x2="232" y2="38.5" stroke="#ECFDF5" strokeWidth="1.5" strokeDasharray="3 2" />
                    {/* Soft downward light beam scan */}
                    <rect x="182" y="40" width="52" height="22" fill="url(#passengerAuraGrad)" opacity="0.35" />
                  </g>
                )}
              </g>

              {/* Animated Entering Passenger Figure */}
              {isEntering && (
                <g 
                  key={`passenger-${enterSequence}`} 
                  style={{ 
                    animation: 'passengerBoardingStep 2.1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    pointerEvents: 'none' 
                  }}
                >
                  {/* Glowing Aura Halo */}
                  <circle cx="0" cy="0" r="10" fill="url(#passengerAuraGrad)" />
                  {/* Expanding Ping Wave */}
                  <circle cx="0" cy="0" r="8" fill="none" stroke="#38BDF8" strokeWidth="1.2" opacity="0.8" className="animate-ping" />
                  {/* Passenger Head */}
                  <circle cx="0" cy="-3.5" r="4.2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
                  {/* Passenger Torso */}
                  <path d="M -5.5 5 C -5.5 0.5 -2.5 -0.5 0 -0.5 C 2.5 -0.5 5.5 0.5 5.5 5 Z" fill="#0284C7" />
                  {/* AI Vision Sensor Dot */}
                  <circle cx="4" cy="-5" r="1.5" fill="#10B981" />
                </g>
              )}

              {/* Floating +1 Entrance Pill Badge */}
              {isEntering && (
                <g 
                  key={`badge-${enterSequence}`} 
                  style={{ 
                    animation: 'floatEntryBadge 1.9s ease-out forwards',
                    pointerEvents: 'none' 
                  }}
                >
                  <rect x="190" y="24" width="36" height="13" rx="6.5" fill="#10B981" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="1" filter="url(#sensorGlow)" />
                  <text x="208" y="33" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                    +1 ВХОД
                  </text>
                </g>
              )}

              {/* BusVision Logo Badge on Side */}
              <rect x="250" y="92" width="46" height="12" rx="3" fill="#FFFFFF" fillOpacity="0.9" />
              <text x="273" y="100.5" fill="#084C6F" fontSize="6.5" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
                BUSVISION
              </text>

              {/* Front Headlight & Turn Signal */}
              <path d="M 432 98 C 435 98 436 102 436 108 L 428 108 L 428 98 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
              <circle cx="431" cy="103" r="3" fill="#FFFFFF" />
              <rect x="428" y="110" width="7" height="4" rx="1" fill="#F97316" />

              {/* Rear Tail Light */}
              <rect x="34" y="65" width="3" height="18" rx="1" fill="#EF4444" />
              <rect x="34" y="86" width="3" height="8" rx="1" fill="#F59E0B" />

              {/* Front Side Mirror */}
              <path d="M 425 45 C 435 43 444 48 444 58 L 440 70 L 436 70 L 438 58 C 438 52 432 50 425 48 Z" fill="#084C6F" />
              <rect x="439" y="58" width="5" height="14" rx="2" fill="#1E293B" stroke="#084C6F" strokeWidth="0.8" />

              {/* Front Wheel & Arch */}
              <circle cx="112" cy="135" r="24" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
              <circle cx="112" cy="135" r="14" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
              <circle cx="112" cy="135" r="5" fill="#334155" />
              {/* Wheel Spokes */}
              <line x1="112" y1="123" x2="112" y2="147" stroke="#475569" strokeWidth="2" />
              <line x1="100" y1="135" x2="124" y2="135" stroke="#475569" strokeWidth="2" />

              {/* Rear Wheel & Arch */}
              <circle cx="342" cy="135" r="24" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
              <circle cx="342" cy="135" r="14" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
              <circle cx="342" cy="135" r="5" fill="#334155" />
              {/* Wheel Spokes */}
              <line x1="342" y1="123" x2="342" y2="147" stroke="#475569" strokeWidth="2" />
              <line x1="330" y1="135" x2="354" y2="135" stroke="#475569" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Dynamic Nearest Stop & Location Indicator */}
        <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-white/70 truncate text-[11px]">Ближайшая ост.:</span>
            <strong className="text-white font-semibold truncate text-[11px] bg-white/10 px-2 py-0.5 rounded-md">
              {nearestStopName}
            </strong>
          </div>

          {distanceToNearestStop !== undefined && (
            <span className="text-[10px] text-cyan-200 font-mono shrink-0 ml-2">
              ~{distanceToNearestStop < 1000 ? `${distanceToNearestStop} м` : `${(distanceToNearestStop/1000).toFixed(1)} км`}
            </span>
          )}
        </div>
      </div>

      {/* Routes Selection Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-2xl border border-slate-100 relative max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#084C6F] flex items-center justify-center">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3142]">Маршруты Актау</h3>
                  <p className="text-[11px] text-gray-400">Выберите автобус для мониторинга</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-95 cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Message for upcoming routes */}
            {alertMessage && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{alertMessage}</span>
              </div>
            )}

            {/* Routes List */}
            <div className="overflow-y-auto py-3 space-y-2.5 no-scrollbar">
              {AKTAU_ROUTES.map((route) => {
                const isActive = route.status === 'active';
                const isSelected = selectedRoute.id === route.id;

                return (
                  <div
                    key={route.id}
                    onClick={() => handleRouteClick(route)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#084C6F] shadow-sm'
                        : isActive
                        ? 'bg-white border-slate-200 hover:border-blue-300'
                        : 'bg-slate-50/80 border-slate-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isActive
                            ? 'bg-[#084C6F] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          №{route.number}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#2D3142]">{route.name}</p>
                          <p className="text-[10px] text-gray-400">Интервал: {route.interval}</p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          В сети
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Скоро
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100/80 mt-2">
                      <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{route.from} → {route.to}</span>
                      </div>

                      {isSelected && (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold text-[10px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Выбран</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note footer */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[11px] text-gray-400">
                Оснащение других городских маршрутов Актау датчиками AI продолжается.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
