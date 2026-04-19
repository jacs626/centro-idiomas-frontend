import { Card, CardContent } from './Card';

interface GroupCardProps {
  id: number;
  name: string;
  schedule?: string;
  onClick?: (id: number) => void;
}

export default function GroupCard({ id, name, schedule, onClick }: GroupCardProps) {
  return (
    <Card hover className="cursor-pointer" onClick={() => onClick?.(id)}>
      <CardContent>
        <h4 className="font-semibold text-slate-800">{name}</h4>
        <p className="text-sm text-slate-500">{schedule || 'Sin horario'}</p>
      </CardContent>
    </Card>
  );
}