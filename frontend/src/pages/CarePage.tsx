import { FormEvent, useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Plant, WateringLog } from '../types';

export function CarePage() {
  const [searchParams] = useSearchParams();
  const requestedPlantId = searchParams.get('plantId') || '';
  const [plants, setPlants] = useState<Plant[]>([]);
  const [waterings, setWaterings] = useState<WateringLog[]>([]);
  const [plantId, setPlantId] = useState(searchParams.get('plantId') || '');
  const [soilCondition, setSoilCondition] = useState<WateringLog['soil_condition']>('Moist');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [plantData, wateringData] = await Promise.all([api.getPlants(), api.getWaterings()]);
        setPlants(plantData);
        setWaterings(wateringData);
        setPlantId(requestedPlantId || plantData[0]?.id || '');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load care data.');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [requestedPlantId]);

  const submitWatering = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!plantId) return;
    setSaving(true);
    setError('');
    try {
      const log = await api.logWatering({
        plant_id: plantId,
        watered_at: new Date().toISOString(),
        amount_ml: amount ? Number(amount) : undefined,
        soil_condition: soilCondition,
        notes: notes.trim() || undefined,
      });
      setWaterings((current) => [log, ...current]);
      setAmount('');
      setNotes('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save watering.');
    } finally {
      setSaving(false);
    }
  };

  const plantName = (id: string) => plants.find((plant) => plant.id === id)?.name || 'Plant';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-main-text">Watering & Care</h1>
        <p className="text-secondary-text mt-1">Record care events and review your garden’s watering history.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-sm text-error-red">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={submitWatering} className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-main-text">Log watering</h2>
          </div>
          {plants.length ? (
            <>
              <label className="block text-sm font-medium text-main-text">
                Plant
                <select className="input-field mt-1" value={plantId} onChange={(event) => setPlantId(event.target.value)} required>
                  {plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.name} ({plant.species})</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-main-text">
                Soil condition
                <select className="input-field mt-1" value={soilCondition} onChange={(event) => setSoilCondition(event.target.value as WateringLog['soil_condition'])}>
                  <option>Wet</option><option>Moist</option><option>Slightly Dry</option><option>Dry</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-main-text">
                Amount (ml, optional)
                <input className="input-field mt-1" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} />
              </label>
              <label className="block text-sm font-medium text-main-text">
                Notes
                <textarea className="input-field mt-1" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>
              <button type="submit" className="btn-primary w-full" disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save watering'}
              </button>
            </>
          ) : (
            <p className="text-sm text-secondary-text">Add a plant before logging care.</p>
          )}
        </form>

        <section className="card lg:col-span-3">
          <h2 className="font-semibold text-main-text mb-4">Recent watering</h2>
          {loading ? <p className="py-8 text-center text-secondary-text">Loading care history...</p> : waterings.length ? (
            <ul className="divide-y divide-gray-100">
              {waterings.map((log) => (
                <li key={log.id} className="py-4 first:pt-0 last:pb-0 flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium text-main-text">{plantName(log.plant_id)}</p>
                    <p className="text-sm text-secondary-text">Soil: {log.soil_condition}{log.amount_ml ? ` · ${log.amount_ml} ml` : ''}</p>
                    {log.notes && <p className="text-sm text-secondary-text mt-1">{log.notes}</p>}
                  </div>
                  <time className="text-sm text-secondary-text">{new Date(log.watered_at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-center text-secondary-text">No watering events recorded yet.</p>}
        </section>
      </div>
    </div>
  );
}