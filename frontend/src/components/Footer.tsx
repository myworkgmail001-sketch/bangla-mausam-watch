import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, X, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <footer className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-body/50">
            {isBn ? 'ডেটা সূত্র' : 'Data sources'}: NASA EONET, IMD, Open-Meteo • {isBn ? 'আপডেট প্রতি ৫ মিনিট' : 'Updates every 5 min'}
          </p>
          <button onClick={() => setShowAbout(true)} className="text-[10px] text-primary-500 font-medium flex items-center gap-1">
            <Info className="w-3 h-3" />
            {isBn ? 'এই সাইট সম্পর্কে' : 'About'}
          </button>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-body/40">
          <a href="https://eonet.gsfc.nasa.gov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-primary-500">
            NASA EONET <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-primary-500">
            Open-Meteo <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-primary-500">
            IMD <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-heading">{isBn ? 'বিএম ওয়াচ সম্পর্কে' : 'About BM Watch'}</h2>
              <button onClick={() => setShowAbout(false)} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-body mb-4">
              {isBn
                ? 'বাংলা মৌসুম ওয়াচ ভারতের পশ্চিমবঙ্গের সকল ২৩টি জেলার জন্য তাৎক্ষণিক আবহাওয়া ও প্রাকৃতিক দুর্যোগ সতর্কতা প্রদান করে।'
                : 'Bangla Mausam Watch provides real-time weather and natural disaster alerts for all 23 districts of West Bengal, India.'}
            </p>
            <h3 className="text-sm font-semibold text-heading mb-2">{isBn ? 'তথ্য উৎস' : 'Data Sources'}</h3>
            <div className="space-y-2 mb-4">
              {[
                { name: 'NASA EONET', desc: isBn ? 'তাৎক্ষণিক প্রাকৃতিক ঘটনা' : 'Real-time natural events', url: 'https://eonet.gsfc.nasa.gov' },
                { name: 'IMD', desc: isBn ? 'ভারতীয় আবহাওয়া বিভাগ' : 'India Meteorological Department', url: 'https://mausam.imd.gov.in' },
                { name: 'Open-Meteo', desc: isBn ? 'আবহাওয়া পূর্বাভাস' : 'Weather forecasts', url: 'https://open-meteo.com' },
              ].map(src => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                  <div>
                    <p className="text-xs font-medium text-heading">{src.name}</p>
                    <p className="text-[10px] text-body/50">{src.desc}</p>
                  </div>
                </a>
              ))}
            </div>
            <p className="text-[10px] text-body/40">
              {isBn ? 'দায়মুক্তি: এই অ্যাপ পাবলিক এপিআই থেকে তথ্য প্রদান করে। সর্বদা সরকারি পরামর্শ অনুসরণ করুন।' : 'Disclaimer: This app provides information from public APIs. Always follow official government advisories.'}
            </p>
            <p className="text-[10px] text-body/30 mt-2 text-center">v1.0.0</p>
          </div>
        </div>
      )}
    </>
  );
}
