const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface LevelFilterProps {
  selectedLevel: string;
  onChange: (level: string) => void;
  placeholder?: string;
}

export default function LevelFilter({
  selectedLevel,
  onChange,
  placeholder = 'Todos los niveles',
}: LevelFilterProps) {
  return (
    <select
      value={selectedLevel}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
    >
      <option value="">{placeholder}</option>
      {LEVELS.map(level => (
        <option key={level} value={level}>{level}</option>
      ))}
    </select>
  );
}