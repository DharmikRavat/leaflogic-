import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Plant } from '../../types';

export function PlantHealthChart({ plants }: { plants: Plant[] }) {
  const data = [
    { status: 'Healthy', plants: plants.filter((plant) => plant.health_status === 'Healthy').length },
    { status: 'Needs attention', plants: plants.filter((plant) => plant.health_status === 'Needs Attention').length },
    { status: 'Critical', plants: plants.filter((plant) => plant.health_status === 'Critical').length },
  ];

  if (plants.length === 0) return <p className="py-12 text-center text-secondary-text">Add plants to see their health summary.</p>;

  return (
    <div className="h-64 w-full" role="img" aria-label="Current plant health counts">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#647067' }} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#647067' }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="plants" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}