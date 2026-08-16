import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Send, Clock, Shield, Plus } from 'lucide-react';
import { districts } from '../data/districts';

interface Bulletin {
  id: string;
  title: string;
  titlebn: string;
  body: string;
  bodybn: string;
  severity: 'green' | 'yellow' | 'orange' | 'red';
  district: string;
  postedBy: string;
  expiresAt: string;
  publishedAt: string;
}

const SEVERITY_OPTIONS = [
  { value: 'green', label: 'Green', color: 'bg-green-500', textColor: 'text-green-700', bg: 'bg-green-50' },
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50' },
  { value: 'red', label: 'Red', color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50' },
];

const MOCK_BULLETINS: Bulletin[] = [
  {
    id: '1',
    title: 'Heavy Rainfall Warning - South Bengal',
    titlebn: 'ভারী বৃষ্টি সতর্কতা - দক্ষিণ বাংলা',
    body: 'IMD predicts heavy to very heavy rainfall across South Bengal districts over the next 48 hours. Farmers are advised to postpone harvesting activities.',
    bodybn: 'আইএমডি পূর্বাভাস দক্ষিণ বাংলার জেলাগুলিতে পরবর্তী ৪৮ ঘণ্টায় ভারী থেকে অতি ভারী বৃষ্টির।',
    severity: 'red',
    district: 'kolkata',
    expiresAt: '2026-08-18T18:00:00Z',
    publishedAt: '2026-08-16T08:00:00Z',
    postedBy: 'admin',
  },
  {
    id: '2',
    title: 'Cyclone Watch - Coastal Districts',
    titlebn: 'ঘূর্ণিঝড় পর্যবেক্ষণ - উপকূীয় জেলা',
    body: 'A low-pressure system over the Bay of Bengal may intensify. Coastal fishermen are advised not to venture into the sea.',
    bodybn: 'বঙ্গোপসাগরে একটি নিম্নচাপ ব্যবস্থা তীব্র হতে পারে।',
    severity: 'orange',
    district: 'south-24-parganas',
    expiresAt: '2026-08-19T12:00:00Z',
    publishedAt: '2026-08-16T06:30:00Z',
    postedBy: 'admin',
  },
  {
    id: '3',
    title: 'Heat Wave Advisory - Western Districts',
    titlebn: 'তাপপ্রবাহ পরামর্শ - পশ্চিমাঞ্চলীয় জেলা',
    body: 'Temperatures expected to exceed 40°C in Purulia, Bankura, and Jhargram.',
    bodybn: 'পুরুলিয়া, বাঁকুড়া ও ঝাড়গ্রামে তাপমাত্রা ৪০°C ছাড়তে পারে।',
    severity: 'yellow',
    district: 'purulia',
    expiresAt: '2026-08-17T18:00:00Z',
    publishedAt: '2026-08-15T22:00:00Z',
    postedBy: 'admin',
  },
  {
    id: '4',
    title: 'Normal Weather Conditions - All Districts',
    titlebn: 'স্বাভাবিক আবহাওয়া - সকল জেলা',
    body: 'No significant weather events expected.',
    bodybn: 'কোনো উল্লেখযোগ্য আবহাওয়ার ঘটনা প্রত্যাশিত নেই।',
    severity: 'green',
    district: '',
    expiresAt: '2026-08-20T00:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    postedBy: 'admin',
  },
];

function getSeverityConfig(severity: string) {
  return SEVERITY_OPTIONS.find(s => s.value === severity) || SEVERITY_OPTIONS[0];
}

function formatBulletinDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Admin() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<string>('green');
  const [district, setDistrict] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [bulletins, setBulletins] = useState<Bulletin[]>(MOCK_BULLETINS);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'bmwatch2024') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError(t('admin.incorrect_password') || 'Incorrect password');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const newBulletin: Bulletin = {
      id: String(Date.now()),
      title,
      titlebn: title,
      body,
      bodybn: body,
      severity: severity as Bulletin['severity'],
      district,
      postedBy: 'admin',
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      publishedAt: new Date().toISOString(),
    };
    setBulletins(prev => [newBulletin, ...prev]);
    setTitle('');
    setBody('');
    setSeverity('green');
    setDistrict('');
    setExpiresAt('');
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-card p-6 w-full max-w-sm animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-heading">{t('admin.title') || 'Admin Panel'}</h1>
            <p className="text-sm text-body mt-1">{t('admin.login_subtitle') || 'Enter password to continue'}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-heading mb-1">{t('admin.password') || 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-xl text-sm text-heading placeholder:text-body/40 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                placeholder={t('admin.password_placeholder') || 'Enter admin password'}
                autoFocus
              />
              {loginError && (
                <p className="text-xs text-red-500 mt-1.5">{loginError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            >
              <Shield className="w-4 h-4" />
              {t('admin.login') || 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 px-4 pt-4">
      {/* Header */}
      <section className="animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary-600" />
          <h1 className="text-xl font-bold text-heading">{t('admin.title') || 'Admin Panel'}</h1>
        </div>
        <p className="text-xs text-body/70">{t('admin.subtitle') || 'Manage weather bulletins and alerts'}</p>
      </section>

      {/* Bulletin Creation Form */}
      <form onSubmit={handlePublish} className="glass-card p-5 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-accent-500" />
          <h2 className="text-sm font-bold text-heading">{t('admin.create_bulletin') || 'Create Bulletin'}</h2>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-heading mb-1">{t('admin.bulletin_title') || 'Title'}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/60 border border-white/40 rounded-xl text-sm text-heading placeholder:text-body/40 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            placeholder={t('admin.title_placeholder') || 'e.g. Heavy Rainfall Warning'}
            required
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-heading mb-1">{t('admin.bulletin_body') || 'Body'}</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 bg-white/60 border border-white/40 rounded-xl text-sm text-heading placeholder:text-body/40 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all resize-none"
            placeholder={t('admin.body_placeholder') || 'Describe the weather event and recommended actions...'}
            required
          />
        </div>

        {/* Severity Selector */}
        <div>
          <label className="block text-xs font-medium text-heading mb-2">{t('admin.severity') || 'Severity'}</label>
          <div className="grid grid-cols-4 gap-2">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  severity === opt.value
                    ? `${opt.bg} ${opt.textColor} border-current shadow-md`
                    : 'bg-white/40 text-body/60 border-transparent hover:bg-white/60'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${opt.color}`} />
                <span className="text-[10px] font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* District Selector */}
        <div>
          <label className="block text-xs font-medium text-heading mb-1">
            {t('admin.district') || 'District'}
            <span className="text-body/40 font-normal ml-1">({t('admin.optional') || 'optional'})</span>
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/60 border border-white/40 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all appearance-none"
          >
            <option value="">{t('admin.all_districts') || 'All Districts (Statewide)'}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.namebn})
              </option>
            ))}
          </select>
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-xs font-medium text-heading mb-1">{t('admin.expiry') || 'Expiry Date & Time'}</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body/40 pointer-events-none" />
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-white/40 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              required
            />
          </div>
        </div>

        {/* Success Message */}
        {publishSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium animate-slide-up">
            <Send className="w-4 h-4" />
            {t('admin.publish_success') || 'Bulletin published successfully!'}
          </div>
        )}

        {/* Publish Button */}
        <button
          type="submit"
          className="w-full btn-accent flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        >
          <Send className="w-4 h-4" />
          {t('admin.publish_bulletin') || 'Publish Bulletin'}
        </button>
      </form>

      {/* Published Bulletins */}
      <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-body/60" />
          <h2 className="text-sm font-bold text-heading">{t('admin.published_bulletins') || 'Published Bulletins'}</h2>
        </div>

        <div className="space-y-3">
          {bulletins.map((bulletin) => {
            const sev = getSeverityConfig(bulletin.severity);
            const districtObj = districts.find(d => d.slug === bulletin.district);
            return (
              <div key={bulletin.id} className="glass-card glass-card-hover p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${sev.color} shrink-0`} />
                    <h3 className="text-sm font-semibold text-heading leading-tight">{bulletin.title}</h3>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${sev.bg} ${sev.textColor}`}>
                    {sev.label}
                  </span>
                </div>
                <p className="text-xs text-body leading-relaxed">{bulletin.body}</p>
                <div className="flex items-center justify-between text-[10px] text-body/50 pt-1 border-t border-white/30">
                  <span>
                    {districtObj
                      ? `${districtObj.name} (${districtObj.namebn})`
                      : t('admin.statewide') || 'Statewide'}
                  </span>
                  <span>{formatBulletinDate(bulletin.publishedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
