import { motion } from 'framer-motion';

interface Props {
  code: number;
  size?: number;
  className?: string;
}

function getCondition(code: number): 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow' {
  if (code <= 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95 && code <= 99) return 'storm';
  if (code >= 45 && code <= 48) return 'fog';
  return 'cloudy';
}

function SunIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '32px 32px' }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.line
            key={angle}
            x1="32" y1="6" x2="32" y2="12"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transformOrigin: '32px 32px', transform: `rotate(${angle}deg)` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: angle / 360 }}
          />
        ))}
      </motion.g>
      <circle cx="32" cy="32" r="12" fill="#FBBF24" />
      <circle cx="32" cy="32" r="10" fill="#F59E0B" />
      <circle cx="29" cy="29" r="3" fill="#FCD34D" opacity="0.6" />
    </svg>
  );
}

function CloudIcon({ size, color = '#94A3B8' }: { size: number; color?: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      animate={{ x: [0, 3, 0, -2, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M18 42a9 9 0 01.5-18A14 14 0 0145 24a8 8 0 01-1 16H18z"
        fill={color}
        opacity="0.9"
      />
      <ellipse cx="38" cy="36" rx="14" ry="8" fill={color} opacity="0.6" />
    </motion.svg>
  );
}

function RainIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <CloudIcon size={size} color="#64748B" />
      {[
        { x: 22, delay: 0 },
        { x: 30, delay: 0.3 },
        { x: 38, delay: 0.6 },
        { x: 26, delay: 0.9 },
        { x: 34, delay: 1.2 },
      ].map((drop, i) => (
        <motion.line
          key={i}
          x1={drop.x} y1="40" x2={drop.x - 2} y2="48"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ y: [0, 6, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: drop.delay, ease: 'easeIn' }}
        />
      ))}
    </svg>
  );
}

function StormIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <CloudIcon size={size} color="#475569" />
      <motion.polygon
        points="34,32 28,42 33,42 30,52 40,40 35,40 38,32"
        fill="#FBBF24"
        animate={{ opacity: [0, 1, 1, 0, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 1] }}
      />
    </svg>
  );
}

function SnowIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <CloudIcon size={size} color="#94A3B8" />
      {[
        { cx: 24, delay: 0 },
        { cx: 32, delay: 0.5 },
        { cx: 40, delay: 1 },
        { cx: 28, delay: 1.5 },
        { cx: 36, delay: 2 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx} cy="42" r="2"
          fill="#DBEAFE"
          animate={{ y: [0, 8, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

function FogIcon({ size }: { size: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {[24, 32, 40, 48].map((y, i) => (
        <motion.line
          key={i}
          x1="14" y1={y} x2="50" y2={y}
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ x1: [14, 18, 14], x2: [50, 46, 50] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </motion.svg>
  );
}

export default function AnimatedWeatherIcon({ code, size = 56, className = '' }: Props) {
  const condition = getCondition(code);

  const IconComponent = {
    clear: SunIcon,
    cloudy: CloudIcon,
    rain: RainIcon,
    storm: StormIcon,
    snow: SnowIcon,
    fog: FogIcon,
  }[condition];

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <IconComponent size={size} />
    </div>
  );
}
