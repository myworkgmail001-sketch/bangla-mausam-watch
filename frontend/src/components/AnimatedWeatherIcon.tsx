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

const EASE_PREMIUM = [0.4, 0, 0.2, 1] as const;

function SunIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Ambient: slow background glow */}
      <motion.circle
        cx="32" cy="32" r="20"
        fill="#FBBF24"
        opacity={0.08}
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Primary: rotating rays */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '32px 32px' }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.line
            key={angle}
            x1="32" y1="5" x2="32" y2="11"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transformOrigin: '32px 32px', transform: `rotate(${angle}deg)` }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: angle / 360 * 3, ease: 'easeInOut' }}
          />
        ))}
      </motion.g>
      {/* Secondary: sun body with bounce settle */}
      <motion.circle
        cx="32" cy="32" r="12"
        fill="#FBBF24"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_PREMIUM }}
      />
      <circle cx="32" cy="32" r="10" fill="#F59E0B" />
      {/* Secondary: highlight glint */}
      <motion.circle
        cx="28" cy="28" r="3.5"
        fill="#FCD34D"
        opacity={0.5}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function CloudIcon({ size, color = '#94A3B8' }: { size: number; color?: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      animate={{ x: [0, 4, 0, -3, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Ambient shadow */}
      <motion.ellipse
        cx="34" cy="46" rx="16" ry="3"
        fill={color}
        opacity={0.06}
        animate={{ scaleX: [1, 1.05, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Primary cloud shape */}
      <path
        d="M18 42a9 9 0 01.5-18A14 14 0 0145 24a8 8 0 01-1 16H18z"
        fill={color}
        opacity="0.85"
      />
      <ellipse cx="38" cy="36" rx="14" ry="8" fill={color} opacity="0.5" />
      {/* Secondary: highlight edge */}
      <path
        d="M22 38a7 7 0 01.4-14A11 11 0 0140 26"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.25"
        fill="none"
      />
    </motion.svg>
  );
}

function RainIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <CloudIcon size={size} color="#64748B" />
      {/* Rain drops with staggered wave pattern */}
      {[
        { x: 20, delay: 0 },
        { x: 27, delay: 0.2 },
        { x: 34, delay: 0.4 },
        { x: 41, delay: 0.6 },
        { x: 24, delay: 0.8 },
        { x: 37, delay: 1.0 },
      ].map((drop, i) => (
        <motion.line
          key={i}
          x1={drop.x} y1="40" x2={drop.x - 1.5} y2="47"
          stroke="#3B82F6"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{ y: [0, 8, 0], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: drop.delay,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      ))}
    </svg>
  );
}

function StormIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <CloudIcon size={size} color="#475569" />
      {/* Lightning with anticipation flash */}
      <motion.polygon
        points="34,32 28,42 33,42 30,52 40,40 35,40 38,32"
        fill="#FBBF24"
        animate={{
          opacity: [0, 0, 1, 1, 0.3, 0.8, 0],
          scale: [1, 1, 1.02, 1, 0.98, 1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          times: [0, 0.4, 0.42, 0.44, 0.46, 0.48, 0.55],
          ease: 'easeOut',
        }}
      />
      {/* Ambient flash glow */}
      <motion.circle
        cx="34" cy="40" r="8"
        fill="#FBBF24"
        animate={{ opacity: [0, 0, 0.15, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          times: [0, 0.4, 0.43, 0.5],
        }}
      />
    </svg>
  );
}

function SnowIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <CloudIcon size={size} color="#94A3B8" />
      {[
        { cx: 22, delay: 0 },
        { cx: 29, delay: 0.4 },
        { cx: 36, delay: 0.8 },
        { cx: 43, delay: 1.2 },
        { cx: 25, delay: 1.6 },
        { cx: 39, delay: 2.0 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx} cy="42" r="1.8"
          fill="#DBEAFE"
          animate={{
            y: [0, 10, 0],
            x: [0, (i % 2 === 0 ? 3 : -3), 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
}

function FogIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {[22, 30, 38, 46].map((y, i) => (
        <motion.line
          key={i}
          x1="12" y1={y} x2="52" y2={y}
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            x1: [12, 16, 12],
            x2: [52, 48, 52],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
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
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_PREMIUM }}
      key={condition}
    >
      <IconComponent size={size} />
    </motion.div>
  );
}
