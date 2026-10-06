import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Droplets } from 'lucide-react';
import { api } from '../services/api';
import { Diagnosis, Plant } from '../types';
import { DiagnosisResult } from '../components/diagnosis/DiagnosisResult';
import { PlantForm } from '../components/plants/PlantForm';

export function PlantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [plantData, diagnosisData] = await Promise.all([
          api.getPlant(id), api.getPlantDiagnoses(id),
        ]);
        setPlant(plantData);
        setDiagnoses(diagnosisData);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load plant.');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id]);

  const deletePlant = async () => {
    if (!plant || !window.confirm(`Delete ${plant.name}? This cannot be undone.`)) return;
    try {
      await api.deletePlant(plant.id);
      navigate('/plants', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete plant.');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" /></div>;
  }

  if (editing && plant) {
    return <PlantForm initialPlant={plant} onSuccess={(updated) => { setPlant(updated); setEditing(false); }} onCancel={() => setEditing(false)} />;
  }

  if (!plant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-main-text">Plant not found</h2>
        {error && <p role="alert" className="mt-2 text-sm text-error-red">{error}</p>}
        <button onClick={() => navigate('/plants')} className="text-forest-green mt-4 hover:underline">Return to My Plants</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-secondary-text mb-4">
        <button onClick={() => navigate('/plants')} className="flex items-center hover:text-main-text">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Plants
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} title="Edit plant" aria-label="Edit plant" className="p-2 text-gray-500 hover:text-forest-green"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => void deletePlant()} title="Delete plant" aria-label="Delete plant" className="p-2 text-gray-500 hover:text-error-red"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-sm text-error-red">{error}</p>}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="card text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-soft-mint flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
              {plant.image_url ? <img src={plant.image_url} alt={plant.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🌱</span>}
            </div>
            <h1 className="text-2xl font-bold text-main-text">{plant.name}</h1>
            <p className="text-secondary-text mb-4">{plant.species}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${plant.health_status === 'Healthy' ? 'bg-fresh-green/10 text-fresh-green' : 'bg-warning-amber/10 text-warning-amber'}`}>
              {plant.health_status}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          <div className="card grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-sm text-secondary-text">Location</p><p className="font-medium text-main-text">{plant.location}</p></div>
            <div><p className="text-sm text-secondary-text">Pot Size</p><p className="font-medium text-main-text">{plant.pot_size || 'Not set'}</p></div>
            <div><p className="text-sm text-secondary-text">Sunlight</p><p className="font-medium text-main-text">{plant.sunlight_hours}h/day</p></div>
            <div><p className="text-sm text-secondary-text">Planted At</p><p className="font-medium text-main-text">{plant.planted_at ? new Date(plant.planted_at).toLocaleDateString() : 'Not set'}</p></div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-main-text">Care Status</h3>
              <button onClick={() => navigate(`/care?plantId=${plant.id}`)} className="btn-secondary text-sm">Log Watering</button>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
              <Droplets className="w-6 h-6 text-blue-500 mr-3 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Check soil moisture</h4>
                <p className="text-sm text-blue-700 mt-1">Check the top 2 inches of soil before watering, then record the result in your care log.</p>
              </div>
            </div>
          </div>

          {diagnoses.length > 0 && (
            <section>
              <h3 className="font-semibold text-main-text mb-4">Recent Diagnoses</h3>
              <div className="space-y-4">{diagnoses.map((diagnosis) => <DiagnosisResult key={diagnosis.id} diagnosis={diagnosis} onReset={() => navigate('/diagnosis')} />)}</div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}