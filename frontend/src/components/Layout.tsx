import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Map, Users, Bell, ShieldAlert, AlertTriangle, Droplets, Mountain, Info, Settings } from 'lucide-react';
import OfflineBanner from './OfflineBanner';
import Footer from './Footer';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/map', icon: Map, labelKey: 'nav.map' },
  { path: '/districts', icon: Users, labelKey: 'nav.districts' },
  { path: '/alerts', icon: Bell, labelKey: 'nav.alerts' },
  { path: '/sos', icon: ShieldAlert, labelKey: 'nav.sos' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLang = () => {
    const newLang = i18n.language === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
  };

  const unreadCount = parseInt(localStorage.getItem('unread_alerts') || '0');

  return (
    <div className="min-h-screen bg-white pb-20 font-inter">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <span className="font-poppins font-bold text-heading text-sm">
              {i18n.language === 'bn' ? 'বিএম ওয়াচ' : 'BM Watch'}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-lg bg-surface text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {i18n.language === 'bn' ? 'EN' : 'বাংলা'}
            </button>
            <Link to="/alerts" className="relative p-2">
              <Bell className="w-5 h-5 text-heading" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-severity-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-bell">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <OfflineBanner />

      <main className="pt-14 max-w-lg mx-auto">
        {children}
        <Footer />
      </main>

      <nav className="bottom-nav">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
          {navItems.map(({ path, icon: Icon, labelKey }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : ''}`}>
                  {t(labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
