import { useState, useEffect } from 'react';
import { Sprout, AlertTriangle, Droplets, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Plant, WateringLog } from '../types';
import { Link } from 'react-router-dom';
import { PlantHealthChart } from '../components/dashboard/PlantHealthChart';

export function DashboardPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [waterings, setWaterings] = useState<WateringLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getPlants(), api.getWaterings()]).then(([plantData, wateringData]) => {
      setPlants(plantData);
      setWaterings(wateringData);
    }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Could not load dashboard data.');
    }).finally(() => setLoading(false));
  }, []);

  const totalPlants = plants.length;
  const healthyPlants = plants.filter(p => p.health_status === 'Healthy').length;
  const needsAttention = plants.filter(p => p.health_status === 'Needs Attention' || p.health_status === 'Critical').length;
  const wateredToday = waterings.filter((log) => new Date(log.watered_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-main-text">Welcome back, Gardener</h1>
        <p className="text-secondary-text mt-1">Here is what's happening with your plants today.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-sm text-error-red">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Plants', value: loading ? '-' : totalPlants, icon: Sprout, color: 'text-forest-green' },
          { title: 'Healthy Plants', value: loading ? '-' : healthyPlants, icon: Activity, color: 'text-fresh-green' },
          { title: 'Needs Attention', value: loading ? '-' : needsAttention, icon: AlertTriangle, color: 'text-warning-amber' },
          { title: 'Watering Logs Today', value: loading ? '-' : wateredToday, icon: Droplets, color: 'text-blue-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card flex items-center p-5">
              <div className={`p-3 rounded-lg bg-gray-50 mr-4 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-text">{stat.title}</p>
                <p className="text-2xl font-semibold text-main-text mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-main-text mb-4">Current Plant Health</h2>
          <PlantHealthChart plants={plants} />
        </div>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-main-text">Needs Attention</h2>
            <Link to="/plants" className="text-sm text-forest-green hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {plants.filter(p => p.health_status !== 'Healthy').map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-warning-amber/10 flex items-center justify-center mr-3">
                    <span className="text-lg">🌱</span>
                  </div>
                  <div>
                    <p className="font-medium text-main-text text-sm">{p.name}</p>
                    <p className="text-xs text-warning-amber font-medium">{p.health_status}</p>
                  </div>
                </div>
                <Link to={`/plants/${p.id}`} className="text-xs font-medium text-forest-green border border-forest-green px-2 py-1 rounded hover:bg-forest-green hover:text-white transition-colors">Fix</Link>
              </div>
            ))}
            {!loading && needsAttention === 0 && (
              <div className="text-sm text-secondary-text text-center py-8">All plants are healthy!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
