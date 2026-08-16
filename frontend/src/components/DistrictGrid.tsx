import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { districts } from '../data/districts';

const severityColors = ['#22C55E', '#22C55E', '#EAB308', '#F59E0B', '#22C55E', '#EAB308', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#EAB308', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E', '#22C55E'];
const severityLabels = ['safe', 'safe', 'watch', 'danger', 'safe', 'watch', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'watch', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe'];

export default function DistrictGrid({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const displayed = compact ? districts.slice(0, 8) : districts;

  return (
    <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
      {displayed.map((d, i) => (
        <div
          key={d.slug}
          className="glass-card-hover p-3 cursor-pointer animate-slide-up"
          style={{ animationDelay: `${i * 30}ms` }}
          onClick={() => navigate(`/district/${d.slug}`)}
        >
          <div className="flex items-start justify-between mb-1">
            <p className="text-xs font-semibold text-heading leading-tight flex-1 mr-1">
              {i18n.language === 'bn' ? d.namebn : d.name}
            </p>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: severityColors[i] }} />
          </div>
          <p className="text-[10px] text-body/50">{i18n.language === 'bn' ? d.headquartersbn : d.headquarters}</p>
          <span className="inline-block mt-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${severityColors[i]}15`, color: severityColors[i] }}>
            {i18n.language === 'bn'
              ? { safe: 'নিরাপদ', watch: 'সতর্ক', danger: 'বিপদ', severe: 'তীব্র' }[severityLabels[i]]
              : severityLabels[i].charAt(0).toUpperCase() + severityLabels[i].slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
