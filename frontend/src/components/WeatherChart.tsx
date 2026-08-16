import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  hourly: { time: string; temperature: number; precipitationProbability: number }[];
}

export default function WeatherChart({ hourly }: Props) {
  const data = hourly.map((h) => ({
    time: new Date(h.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    temp: Math.round(h.temperature),
    rain: h.precipitationProbability,
  }));

  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            interval={3}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
              fontSize: '12px',
              padding: '8px 12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#0EA5E9"
            strokeWidth={2}
            fill="url(#tempGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#0EA5E9' }}
          />
          <Area
            type="monotone"
            dataKey="rain"
            stroke="#6366F1"
            strokeWidth={1.5}
            fill="url(#rainGrad)"
            dot={false}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
