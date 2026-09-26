import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg border border-amber-400/40 animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Офлайн режим • Кэш PWA активен</span>
    </div>
  );
};
