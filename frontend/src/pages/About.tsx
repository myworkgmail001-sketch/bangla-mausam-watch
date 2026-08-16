import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, ExternalLink, Globe, Cloud, Droplets, AlertTriangle, Download } from 'lucide-react';

const DATA_SOURCES = [
  {
    id: 'nasa-eonet',
    name: 'NASA EONET',
    nameKey: 'about.sources.nasa',
    description: 'Real-time natural event tracking from NASA\'s Earth Observatory Natural Event Tracker. Provides wildfire, storm, volcanic, and flood data worldwide.',
    descKey: 'about.sources.nasa_desc',
    url: 'https://eonet.gsfc.nasa.gov/',
    icon: Globe,
  },
  {
    id: 'imd',
    name: 'India Meteorological Department',
    nameKey: 'about.sources.imd',
    description: 'Official weather bulletins, cyclone warnings, and forecast data from India\'s national meteorological agency.',
    descKey: 'about.sources.imd_desc',
    url: 'https://mausam.imd.gov.in/',
    icon: Cloud,
  },
  {
    id: 'open-meteo',
    name: 'Open-Meteo',
    nameKey: 'about.sources.openmeteo',
    description: 'Free, open-source weather API providing temperature, rainfall, wind, and forecast data without API key requirements.',
    descKey: 'about.sources.openmeteo_desc',
    url: 'https://open-meteo.com/',
    icon: Droplets,
  },
  {
    id: 'cwc',
    name: 'Central Water Commission',
    nameKey: 'about.sources.cwc',
    description: 'River level data, flood forecasting, and reservoir storage information from India\'s CWC for major river basins.',
    descKey: 'about.sources.cwc_desc',
    url: 'https://cwc.gov.in/',
    icon: Droplets,
  },
];

export default function About() {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed'>('idle');

  const handleInstall = async () => {
    if (installPrompt) {
      setInstallStatus('installing');
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallStatus('installed');
      } else {
        setInstallStatus('idle');
      }
      setInstallPrompt(null);
    }
  };

  return (
    <div className="space-y-4 pb-4 px-4 pt-4">
      {/* Header */}
      <section className="text-center py-6 animate-slide-up">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <span className="text-3xl">🌦️</span>
        </div>
        <h1 className="text-2xl font-bold text-heading">{t('about.app_name') || 'Bangla Mausam Watch'}</h1>
        <p className="text-sm text-body mt-2 max-w-xs mx-auto leading-relaxed">
          {t('about.app_description') || 'Real-time weather monitoring, disaster alerts, and agricultural advisories for West Bengal — built for farmers, fishermen, and every citizen.'}
        </p>
        <span className="inline-block mt-3 text-[10px] font-mono text-body/40 bg-white/40 px-3 py-1 rounded-full">
          v1.0.0
        </span>
      </section>

      {/* Data Sources */}
      <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-bold text-heading">{t('about.data_sources') || 'Data Sources'}</h2>
        </div>

        <div className="space-y-3">
          {DATA_SOURCES.map((source, i) => {
            const Icon = source.icon;
            return (
              <div
                key={source.id}
                className="glass-card glass-card-hover p-4"
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-heading">{source.name}</h3>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-body mt-1 leading-relaxed">{source.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Farmer & Fishermen Mode */}
      <section className="glass-card p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-accent-500" />
          <h2 className="text-sm font-bold text-heading">
            {t('farmer.mode_title') || 'Farmer & Fishermen Mode'}
          </h2>
        </div>
        <p className="text-xs text-body leading-relaxed">
          {t('farmer.mode_description') || 'Toggle Farmer & Fishermen Mode from the app settings to see simplified weather reports tailored for agricultural and fishing activities. This includes crop advisories, fishing safety warnings, and optimal working hour forecasts.'}
        </p>
        <div className="mt-3 p-3 bg-accent-50/50 rounded-xl border border-accent-200/30">
          <p className="text-[11px] text-accent-700 font-medium">
            {t('farmer.mode_toggle_info') || 'Enable this mode for voice-guided weather updates in Bangla, simplified severity colors, and larger touch targets designed for field use.'}
          </p>
        </div>
      </section>

      {/* PWA Install Prompt */}
      <section className="glass-card p-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-bold text-heading">
            {t('about.install_title') || 'Install as App'}
          </h2>
        </div>
        <p className="text-xs text-body leading-relaxed mb-3">
          {t('about.install_description') || 'Install Bangla Mausam Watch on your phone for instant access to weather alerts, even with poor connectivity. Works offline after first load.'}
        </p>
        {installPrompt ? (
          <button
            onClick={handleInstall}
            disabled={installStatus === 'installing'}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            {installStatus === 'installing'
              ? (t('about.installing') || 'Installing...')
              : (t('about.install_now') || 'Install Now')}
          </button>
        ) : (
          <p className="text-[11px] text-body/50 italic">
            {t('about.install_hint') || 'Use your browser\'s "Add to Home Screen" option to install.'}
          </p>
        )}
      </section>

      {/* Disclaimer */}
      <section className="glass-card p-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-heading mb-1">
              {t('about.disclaimer_title') || 'Disclaimer'}
            </h2>
            <p className="text-[11px] text-body/70 leading-relaxed">
              {t('about.disclaimer_text') || 'This app provides weather information aggregated from multiple third-party sources. While we strive for accuracy, data may be delayed or incomplete. Always follow official government advisories from IMD and the Indian National Centre for Ocean Information Services (INCOIS) for life-safety decisions. This app is not a substitute for official weather warnings.'}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center py-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <p className="text-[10px] text-body/40">
          Bangla Mausam Watch v1.0.0
        </p>
        <p className="text-[10px] text-body/30 mt-1">
          {t('about.built_with') || 'Built with ❤️ for the people of West Bengal'}
        </p>
      </section>
    </div>
  );
}
