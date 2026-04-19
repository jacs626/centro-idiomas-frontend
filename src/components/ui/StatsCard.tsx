import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  items: {
    label: string;
    value: string | number;
    color?: string;
    subValue?: string;
  }[];
  children?: ReactNode;
}

export default function StatsCard({ title, items, children }: StatsCardProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      {title && <h4 className="font-medium text-slate-700 mb-3">{title}</h4>}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className={`text-2xl font-bold ${item.color || 'text-slate-900'}`}>{item.value}</p>
            <p className="text-xs text-slate-500">{item.label}</p>
            {item.subValue && <p className="text-xs text-slate-400">{item.subValue}</p>}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}