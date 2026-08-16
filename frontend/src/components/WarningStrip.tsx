import { AlertTriangle, CloudRain, Thermometer, Wind, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSeverityColor } from '../utils/helpers';

const mockWarnings = [
  { severity: 'Orange', title: 'Heavy Rainfall Warning', titlebn: 'ভারী বৃষ্টিপাতের সতরকতা', district: 'Kolkata', districtbn: 'কোলকাতা', icon: CloudRain },
  { severity: 'Yellow', title: 'Thunderstorm Alert', titlebn: 'বজ্রঝড়ের সতরকতা', district: 'North 24 Parganas', districtbn: 'উত্তর ২৪ পরগনা', icon: Zap },
  { severity: 'Green', title: 'Normal Weather', titlebn: 'স্বাভাবিক আবহাওয়া', district: 'Darjeeling', districtbn: 'দার্জিলিং', icon: Wind },
  { severity: 'Yellow', title: 'Heat Wave Watch', titlebn: 'তাপপ্রবাহের সতরকতা', district: 'Bankura', districtbn: 'বাঁকুড়া', icon: Thermometer },
];

function formatTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function WarningStrip() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <section className="px-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-severity-orange" />
        <h3 className="text-sm font-semibold text-heading">{t('home.imd_warnings')}</h3>
      </div>
      <div className="warning-strip">
        {mockWarnings.map((w, i) => (
          <div
            key={i}
            className="glass-card-hover p-3 min-w-[160px] snap-start cursor-pointer animate-slide-up"
            style={{ animationDelay: `${i * 80}ms`, borderLeft: `3px solid ${getSeverityColor(w.severity)}` }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <w.icon className="w-4 h-4" style={{ color: getSeverityColor(w.severity) }} />
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${getSeverityColor(w.severity)}15`, color: getSeverityColor(w.severity) }}>
                {w.severity}
              </span>
            </div>
            <p className="text-xs font-semibold text-heading leading-tight mb-0.5">
              {isBn ? w.titlebn : w.title}
            </p>
            <p className="text-[10px] text-body/60">
              {isBn ? w.districtbn : w.district}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-body/50 mt-1.5">
        {t('home.data_updated')}: {formatTime()}
      </p>
    </section>
  );
}
