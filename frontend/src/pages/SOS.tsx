import { useTranslation } from 'react-i18next';
import { ShieldAlert, Phone, MapPin, Users, AlertTriangle } from 'lucide-react';

interface EmergencyService {
  id: string;
  nameKey: string;
  nameEn: string;
  number: string;
  color: string;
  bgColor: string;
  icon: string;
}

interface ReliefCamp {
  district: string;
  districtBn: string;
  name: string;
  nameBn: string;
  address: string;
  addressBn: string;
  capacity: number;
}

const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: 'disaster',
    nameKey: 'sos.disaster_mgmt',
    nameEn: 'Disaster Management',
    number: '1078',
    color: '#EF4444',
    bgColor: 'bg-red-50',
    icon: '🚨',
  },
  {
    id: 'police',
    nameKey: 'sos.police',
    nameEn: 'Police',
    number: '100',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    icon: '🚔',
  },
  {
    id: 'ambulance',
    nameKey: 'sos.ambulance',
    nameEn: 'Ambulance',
    number: '108',
    color: '#22C55E',
    bgColor: 'bg-green-50',
    icon: '🚑',
  },
  {
    id: 'fire',
    nameKey: 'sos.fire',
    nameEn: 'Fire Brigade',
    number: '101',
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    icon: '🚒',
  },
];

const RELIEF_CAMPS: ReliefCamp[] = [
  {
    district: 'Kolkata',
    districtBn: 'কলকাতা',
    name: 'Netaji Indoor Stadium Relief Camp',
    nameBn: 'নেতাজি ইনডোর স্টেডিয়াম ত্রাণ শিবির',
    address: '226, AJC Bose Road, Kolkata - 700020',
    addressBn: '২২৬, এজেসি বোস রোড, কলকাতা - ৭০০০২০',
    capacity: 2000,
  },
  {
    district: 'Kolkata',
    districtBn: 'কলকাতা',
    name: 'Salt Lake Stadium Camp',
    nameBn: 'সল্ট লেক স্টেডিয়াম শিবির',
    address: 'Salt Lake Sector III, Kolkata - 700106',
    addressBn: 'সল্ট লেক সেক্টর III, কলকাতা - ৭০০১০৬',
    capacity: 1500,
  },
  {
    district: 'Howrah',
    districtBn: 'হাওড়া',
    name: 'Howrah Municipal Corporation Camp',
    nameBn: 'হাওড়া পৌরসভা ত্রাণ শিবির',
    address: 'Howrah Maidan, Howrah - 711101',
    addressBn: 'হাওড়া ময়দান, হাওড়া - ৭১১১০১',
    capacity: 1200,
  },
  {
    district: 'North 24 Parganas',
    districtBn: 'উত্তর ২৪ পরগনা',
    name: 'Barrackpore Union Club Camp',
    nameBn: 'ব্যারাকপুর ইউনিয়ন ক্লাব শিবির',
    address: '67, Grand Trunk Road, Barrackpore - 700120',
    addressBn: '৬৭, গ্র্যান্ড ট্রাঙ্ক রোড, ব্যারাকপুর - ৭০০১২০',
    capacity: 800,
  },
  {
    district: 'South 24 Parganas',
    districtBn: 'দক্ষিণ ২৪ পরগনা',
    name: 'Diamond Harbour Block Office Camp',
    nameBn: 'ডায়মন্ড হারবার ব্লক অফিস শিবির',
    address: 'Diamond Harbour, South 24 Parganas - 743331',
    addressBn: 'ডায়মন্ড হারবার, দক্ষিণ ২৪ পরগনা - ৭৪৩৩৩১',
    capacity: 600,
  },
  {
    district: 'Hooghly',
    districtBn: 'হুগলি',
    name: 'Chinsurah Municipality Camp',
    nameBn: 'চিঁশুড়া পৌরসভা শিবির',
    address: 'GT Road, Chinsurah, Hooghly - 712103',
    addressBn: 'জি.টি. রোড, চিঁশুড়া, হুগলি - ৭১২১০৩',
    capacity: 500,
  },
];

export default function SOS() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white px-4 py-6 max-w-2xl mx-auto">
      {/* Emergency Header */}
      <section className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
          <ShieldAlert className="w-10 h-10 text-severity-red" />
        </div>
        <h1 className="text-2xl font-bold text-heading font-poppins">
          {t('sos.title')}
        </h1>
        <p className="text-sm text-body mt-1">
          {isBn
            ? 'জরুরি পরিস্থিতিতে নিচের যেকোনো নম্বরে কল করুন'
            : 'Tap any number below to call immediately'}
        </p>
      </section>

      {/* Emergency Call Buttons */}
      <section className="space-y-3 mb-8">
        {EMERGENCY_SERVICES.map((service, i) => (
          <div
            key={service.id}
            className="glass-card-hover p-4 animate-slide-up flex items-center gap-4"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl ${service.bgColor} flex items-center justify-center text-2xl flex-shrink-0`}
            >
              {service.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading">
                {t(service.nameKey)}
              </p>
              <p className="text-lg font-bold font-poppins text-heading tracking-wide">
                {service.number}
              </p>
            </div>

            {/* Call Button */}
            <a
              href={`tel:${service.number}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white shadow-sm transition-all hover:shadow-md active:scale-95 flex-shrink-0"
              style={{ backgroundColor: service.color }}
            >
              <Phone className="w-4 h-4" />
              {t('sos.call')}
            </a>
          </div>
        ))}
      </section>

      {/* Safety Tips */}
      <section className="glass-card p-4 mb-8 border border-amber-100">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-semibold text-heading">
            {isBn ? 'নিরাপত্তা নির্দেশনা' : 'Safety Tips'}
          </h2>
        </div>
        <ul className="space-y-2">
          {(isBn
            ? [
                'সবসময় শান্ত থাকুন এবং পরিস্থিতি মূল্যায়ন করুন।',
                'আপনার অবস্থান সম্পর্কে পরিবার ও বন্ধুদের জানান।',
                'জরুরি কিট প্রস্তুত রাখুন — পানি, ওষুধ, টর্চ।',
                'সরকারি নির্দেশনা অনুসরণ করুন।',
              ]
            : [
                'Stay calm and assess the situation first.',
                'Inform family and friends about your location.',
                'Keep an emergency kit ready — water, medicine, torch.',
                'Always follow official government advisories.',
              ]
          ).map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-body leading-relaxed"
            >
              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Nearest Relief Camps */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-severity-red" />
          <h2 className="text-lg font-semibold text-heading">
            {t('sos.nearest_camps')}
          </h2>
        </div>

        <div className="space-y-3">
          {RELIEF_CAMPS.map((camp, i) => (
            <div
              key={i}
              className="glass-card p-4 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* District Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="severity-badge severity-red">
                  <MapPin className="w-3 h-3" />
                  {isBn ? camp.districtBn : camp.district}
                </span>
                <div className="flex items-center gap-1 text-xs text-body">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {isBn ? 'ধারণক্ষমতা' : 'Cap'}: {camp.capacity}
                  </span>
                </div>
              </div>

              {/* Camp Name */}
              <h3 className="text-sm font-semibold text-heading mb-1">
                {isBn ? camp.nameBn : camp.name}
              </h3>

              {/* Address */}
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-body/60 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-body leading-relaxed">
                  {isBn ? camp.addressBn : camp.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <div className="mt-8 mb-4 text-center">
        <p className="text-[10px] text-body/50">
          {isBn
            ? 'শেষ আপডেট: ১৬ আগস্ট, ২০২৬ • সরকারি নির্দেশনা অনুসরণ করুন'
            : 'Last updated: Aug 16, 2026 • Follow official advisories'}
        </p>
      </div>
    </div>
  );
}
