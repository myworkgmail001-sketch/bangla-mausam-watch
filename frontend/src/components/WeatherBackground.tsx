import { useMemo } from 'react';

interface Props {
  weatherCode: number;
  precipProb: number;
  isNight?: boolean;
}

export default function WeatherBackground({ weatherCode, precipProb, isNight = false }: Props) {
  const condition = useMemo(() => {
    if (isNight) return 'night';
    if (weatherCode >= 80 && weatherCode <= 82) return 'heavy-rain';
    if (weatherCode >= 51 && weatherCode <= 67) return 'rain';
    if (weatherCode >= 95 && weatherCode <= 99) return 'storm';
    if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
    if (weatherCode >= 45 && weatherCode <= 48) return 'fog';
    if (weatherCode <= 1) return 'clear';
    return 'cloudy';
  }, [weatherCode, isNight]);

  const gradients: Record<string, string> = {
    clear: 'from-amber-50/0 via-sky-50/30 to-blue-50/0',
    rain: 'from-blue-50/0 via-sky-100/40 to-indigo-50/0',
    'heavy-rain': 'from-blue-100/0 via-indigo-100/50 to-slate-100/0',
    storm: 'from-slate-100/0 via-purple-100/30 to-indigo-100/0',
    snow: 'from-blue-50/0 via-slate-50/40 to-white/0',
    fog: 'from-gray-50/0 via-gray-100/30 to-white/0',
    cloudy: 'from-gray-50/0 via-slate-50/30 to-white/0',
    night: 'from-indigo-100/0 via-purple-50/30 to-slate-50/0',
  };

  const showRain = precipProb > 70 || weatherCode >= 51;

  return (
    <div className="absolute inset-x-0 top-0 h-80 overflow-hidden pointer-events-none -z-10">
      {/* Animated gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradients[condition]} weather-gradient-drift`} />

      {/* Rain drops effect */}
      {showRain && (
        <div className="absolute inset-0 weather-rain-drops opacity-[0.07]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-primary-400 rounded-full"
              style={{
                width: 1.5,
                height: 12,
                left: `${(i * 4.17) % 100}%`,
                animationDelay: `${(i * 0.3) % 3}s`,
                animationDuration: `${1.2 + (i % 3) * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
