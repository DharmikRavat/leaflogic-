import { Plant } from '../../types';
import { Leaf, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-fresh-green/10 text-fresh-green';
      case 'Needs Attention': return 'bg-warning-amber/10 text-warning-amber';
      case 'Critical': return 'bg-error-red/10 text-error-red';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-soft-mint flex items-center justify-center overflow-hidden">
          {plant.image_url ? (
            <img src={plant.image_url} alt={plant.name} className="w-full h-full object-cover" />
          ) : (
            <Leaf className="w-6 h-6 text-forest-green" />
          )}
        </div>
        <span className="text-xs text-secondary-text">{plant.growth_stage || 'Growth stage not set'}</span>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-main-text">{plant.name}</h3>
        <p className="text-sm text-secondary-text mb-3">{plant.species} • {plant.location}</p>
        
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(plant.health_status)}`}>
          {plant.health_status}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center text-sm text-secondary-text">
          <Droplets className="w-4 h-4 mr-1 text-blue-500" />
          <Link to={`/care?plantId=${plant.id}`} className="hover:text-forest-green">Log care</Link>
        </div>
        <Link 
          to={`/plants/${plant.id}`}
          className="text-sm font-medium text-forest-green hover:text-forest-deep"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
