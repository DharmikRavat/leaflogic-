import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../services/api';
import { Plant } from '../types';
import { PlantCard } from '../components/plants/PlantCard';
import { PlantForm } from '../components/plants/PlantForm';
import { useSearchParams } from 'react-router-dom';

export function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPlants();
      setPlants(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load plants.');
    } finally {
      setLoading(false);
    }
  };

  const search = (searchParams.get('search') || '').toLocaleLowerCase();
  const filteredPlants = plants.filter((plant) =>
    `${plant.name} ${plant.species} ${plant.location}`.toLocaleLowerCase().includes(search),
  );

  const handlePlantAdded = (plant: Plant) => {
    setPlants(prev => [...prev, plant]);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <PlantForm 
          onSuccess={handlePlantAdded} 
          onCancel={() => setShowForm(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main-text">My Plants</h1>
          <p className="text-secondary-text mt-1">Manage your garden and view individual plant details.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center justify-center sm:justify-start shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Plant
        </button>
      </div>
      
      {error && <div role="alert" className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-sm text-error-red flex justify-between gap-4"><span>{error}</span><button onClick={() => void loadPlants()} className="font-medium underline">Retry</button></div>}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
        </div>
      ) : filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-secondary-text mb-4">{search ? `No plants match “${searchParams.get('search')}”.` : 'No plants added yet. Add one to get started.'}</p>
          {!search && <button onClick={() => setShowForm(true)} className="btn-secondary">Add Your First Plant</button>}
        </div>
      )}
    </div>
  );
}
