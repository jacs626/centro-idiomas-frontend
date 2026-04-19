import { formatPercent } from '../utils/constants';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({ value, max = 100, color = 'indigo', showLabel = false, label, size = 'md' }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full">
      <div className={`w-full ${heightMap[size]} bg-slate-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colorMap[color]} rounded-full transition-all`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-1 text-right">{label ? `${label}: ${formatPercent(percent)}` : formatPercent(percent)}</p>
      )}
    </div>
  );
}