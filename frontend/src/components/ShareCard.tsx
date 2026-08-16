import { useTranslation } from 'react-i18next';
import { Share2, MessageCircle } from 'lucide-react';

interface ShareCardProps {
  district: string;
  districtBn: string;
  temperature: number;
  condition: string;
  conditionIcon: string;
  warning?: string;
}

export default function ShareCard({ district, districtBn, temperature, condition, conditionIcon, warning }: ShareCardProps) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const shareText = isBn
    ? `🌤️ ${districtBn} আবহাওয়া\n🌡️ ${temperature}°C — ${condition}\n${warning ? `⚠️ ${warning}\n` : ''}\n📱 বাংলা মৌসুম ওয়াচ — bmwatch-wb.netlify.app`
    : `🌤️ ${district} Weather\n🌡️ ${temperature}°C — ${condition}\n${warning ? `⚠️ ${warning}\n` : ''}\n📱 Bangla Mausam Watch — bmwatch-wb.netlify.app`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${district} Weather`, text: shareText });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert(isBn ? 'কপি হয়েছে!' : 'Copied!');
    }
  };

  const shareWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{conditionIcon}</span>
        <div>
          <h3 className="text-sm font-semibold text-heading">{isBn ? districtBn : district}</h3>
          <p className="text-xs text-body/60">{temperature}°C — {condition}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-500 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-primary-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {isBn ? 'শেয়ার করুন' : 'Share'}
        </button>
        <button
          onClick={shareWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
