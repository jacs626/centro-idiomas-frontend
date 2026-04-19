import { LEVELS } from '../utils/constants';

interface LevelFilterProps {
  selectedLevel: string;
  onChange: (level: string) => void;
  placeholder?: string;
  onClearOther?: () => void;
}

export default function LevelFilter({
  selectedLevel,
  onChange,
  placeholder = 'Todos los niveles',
  onClearOther,
}: LevelFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onClearOther && e.target.value) {
      onClearOther();
    }
    onChange(e.target.value);
  };

  return (
    <select
      value={selectedLevel}
      onChange={handleChange}
      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
    >
      <option value="">{placeholder}</option>
      {LEVELS.map(level => (
        <option key={level} value={level}>{level}</option>
      ))}
    </select>
  );
}