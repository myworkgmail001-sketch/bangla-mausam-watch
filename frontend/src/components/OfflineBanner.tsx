import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastOnline, setLastOnline] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastOnline(new Date().toLocaleTimeString());
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center gap-2 text-xs font-medium shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span>{t('common.offline')}</span>
      {lastOnline && <span className="text-amber-100">— {t('common.last_updated')}: {lastOnline}</span>}
    </div>
  );
}
