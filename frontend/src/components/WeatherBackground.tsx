import { useMemo } from 'react';
import { motion } from 'framer-motion';

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

  const showRain = precipProb > 70 || weatherCode >= 51;

  // Ambient rain drops — max 18 elements for performance, each unique duration
  const rainDrops = useMemo(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      left: `${(i * 5.56) % 100}%`,
      delay: (i * 0.35) % 3,
      duration: 1.4 + (i % 4) * 0.2,
      height: 10 + (i % 3) * 3,
    })), []);

  return (
    <div className="absolute inset-x-0 top-0 h-80 overflow-hidden pointer-events-none -z-10">
      {/* Ambient: multi-layer gradient shift */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isNight
            ? [
                'linear-gradient(180deg, rgba(99,102,241,0) 0%, rgba(139,92,246,0.08) 40%, rgba(30,41,59,0) 100%)',
                'linear-gradient(180deg, rgba(99,102,241,0) 0%, rgba(139,92,246,0.12) 45%, rgba(30,41,59,0) 100%)',
                'linear-gradient(180deg, rgba(99,102,241,0) 0%, rgba(139,92,246,0.08) 40%, rgba(30,41,59,0) 100%)',
              ]
            : condition === 'rain' || condition === 'heavy-rain'
            ? [
                'linear-gradient(180deg, rgba(56,189,248,0) 0%, rgba(14,165,233,0.1) 30%, rgba(99,102,241,0.06) 60%, rgba(56,189,248,0) 100%)',
                'linear-gradient(180deg, rgba(56,189,248,0) 0%, rgba(14,165,233,0.15) 35%, rgba(99,102,241,0.08) 65%, rgba(56,189,248,0) 100%)',
                'linear-gradient(180deg, rgba(56,189,248,0) 0%, rgba(14,165,233,0.1) 30%, rgba(99,102,241,0.06) 60%, rgba(56,189,248,0) 100%)',
              ]
            : condition === 'clear'
            ? [
                'linear-gradient(180deg, rgba(251,191,36,0) 0%, rgba(245,158,11,0.06) 30%, rgba(56,189,248,0.04) 60%, rgba(255,255,255,0) 100%)',
                'linear-gradient(180deg, rgba(251,191,36,0) 0%, rgba(245,158,11,0.1) 35%, rgba(56,189,248,0.06) 65%, rgba(255,255,255,0) 100%)',
                'linear-gradient(180deg, rgba(251,191,36,0) 0%, rgba(245,158,11,0.06) 30%, rgba(56,189,248,0.04) 60%, rgba(255,255,255,0) 100%)',
              ]
            : [
                'linear-gradient(180deg, rgba(148,163,184,0) 0%, rgba(148,163,184,0.06) 35%, rgba(255,255,255,0) 100%)',
                'linear-gradient(180deg, rgba(148,163,184,0) 0%, rgba(148,163,184,0.1) 40%, rgba(255,255,255,0) 100%)',
                'linear-gradient(180deg, rgba(148,163,184,0) 0%, rgba(148,163,184,0.06) 35%, rgba(255,255,255,0) 100%)',
              ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating ambient orbs — 3 layers at different speeds (parallax) */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)',
          top: '10%', left: '15%',
        }}
        animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)',
          top: '20%', right: '10%',
        }}
        animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.03) 0%, transparent 70%)',
          top: '5%', left: '55%',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Rain drops — ambient layer, low opacity */}
      {showRain && (
        <div className="absolute inset-0 opacity-[0.05]">
          {rainDrops.map((drop, i) => (
            <div
              key={i}
              className="absolute bg-primary-400 rounded-full"
              style={{
                width: 1.5,
                height: drop.height,
                left: drop.left,
                animationDelay: `${drop.delay}s`,
                animationDuration: `${drop.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
