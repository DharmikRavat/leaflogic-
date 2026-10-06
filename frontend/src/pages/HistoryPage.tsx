import { useEffect, useState } from 'react';
import { Activity, Droplets } from 'lucide-react';
import { api } from '../services/api';
import { Diagnosis, Plant, WateringLog } from '../types';

type HistoryItem = {
  id: string;
  date: string;
  plantName: string;
  title: string;
  detail: string;
  kind: 'diagnosis' | 'watering';
};

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [plants, diagnoses, waterings] = await Promise.all([
          api.getPlants(), api.getDiagnoses(), api.getWaterings(),
        ]);
        const names = new Map(plants.map((plant: Plant) => [plant.id, plant.name]));
        const diagnosisItems: HistoryItem[] = diagnoses.map((diagnosis: Diagnosis) => ({
          id: `diagnosis-${diagnosis.id}`,
          date: diagnosis.created_at,
          plantName: names.get(diagnosis.plant_id) || 'Plant',
          title: diagnosis.predicted_class || 'Diagnosis unavailable',
          detail: diagnosis.status === 'completed' ? `${diagnosis.confidence}% confidence` : diagnosis.status,
          kind: 'diagnosis',
        }));
        const wateringItems: HistoryItem[] = waterings.map((log: WateringLog) => ({
          id: `watering-${log.id}`,
          date: log.watered_at,
          plantName: names.get(log.plant_id) || 'Plant',
          title: 'Watered',
          detail: `${log.soil_condition}${log.amount_ml ? ` · ${log.amount_ml} ml` : ''}${log.notes ? ` · ${log.notes}` : ''}`,
          kind: 'watering',
        }));
        setItems([...diagnosisItems, ...wateringItems].sort((a, b) => b.date.localeCompare(a.date)));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load history.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-main-text">Health History</h1>
        <p className="text-secondary-text mt-1">Your recorded care and diagnosis activity.</p>
      </div>
      {error && <p role="alert" className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-sm text-error-red">{error}</p>}
      <section className="card">
        {loading ? <p className="py-8 text-center text-secondary-text">Loading history...</p> : items.length ? (
          <ol className="divide-y divide-gray-100">
            {items.map((item) => {
              const Icon = item.kind === 'watering' ? Droplets : Activity;
              return (
                <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="rounded-full bg-soft-mint p-2 text-forest-green"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="font-medium text-main-text">{item.plantName}: {item.title}</p>
                      <time className="text-sm text-secondary-text">{new Date(item.date).toLocaleString()}</time>
                    </div>
                    <p className="mt-1 text-sm text-secondary-text">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : <p className="py-8 text-center text-secondary-text">No care or diagnosis history recorded yet.</p>}
      </section>
    </div>
  );
}