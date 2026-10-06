import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../services/api';
import { Plant } from '../../types';

const plantSchema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  species: z.string().min(1, 'Species is required'),
  planted_at: z.string(),
  growth_stage: z.string(),
  pot_size: z.enum(['Small', 'Medium', 'Large', 'Raised Bed']),
  location: z.enum(['Indoor', 'Balcony', 'Rooftop', 'Outdoor']),
  sunlight_hours: z.number().min(0).max(24),
  drainage: z.string(),
  notes: z.string().optional(),
});

type PlantFormValues = z.infer<typeof plantSchema>;

interface PlantFormProps {
  onSuccess: (plant: Plant) => void;
  onCancel: () => void;
  initialPlant?: Plant;
}

export function PlantForm({ onSuccess, onCancel, initialPlant }: PlantFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PlantFormValues>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: initialPlant?.name || '',
      species: initialPlant?.species || '',
      planted_at: initialPlant?.planted_at?.slice(0, 10) || new Date().toISOString().split('T')[0],
      growth_stage: initialPlant?.growth_stage || 'Seedling',
      pot_size: (initialPlant?.pot_size as PlantFormValues['pot_size']) || 'Medium',
      location: (initialPlant?.location as PlantFormValues['location']) || 'Indoor',
      sunlight_hours: initialPlant?.sunlight_hours ?? 6,
      drainage: initialPlant?.drainage || 'Good',
      notes: initialPlant?.notes || '',
    }
  });

  const onSubmit = async (data: PlantFormValues) => {
    try {
      const savedPlant = initialPlant
        ? await api.updatePlant(initialPlant.id, data)
        : await api.addPlant(data);
      onSuccess(savedPlant);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save plant');
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-main-text mb-6">{initialPlant ? 'Edit Plant' : 'Add New Plant'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="plant-name" className="block text-sm font-medium text-main-text mb-1">Plant Name *</label>
            <input 
              id="plant-name"
              type="text" 
              {...register('name')} 
              className={`input-field ${errors.name ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : ''}`} 
              placeholder="e.g. Tommy" 
            />
            {errors.name && <p className="text-error-red text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label htmlFor="plant-species" className="block text-sm font-medium text-main-text mb-1">Species *</label>
            <input 
              id="plant-species"
              type="text" 
              list="species-suggestions"
              {...register('species')} 
              className={`input-field ${errors.species ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : ''}`} 
              placeholder="e.g. Tomato" 
            />
            <datalist id="species-suggestions">
              <option value="Tomato" />
              <option value="Basil" />
              <option value="Pepper" />
              <option value="Mint" />
              <option value="Cucumber" />
              <option value="Lettuce" />
              <option value="Spinach" />
              <option value="Strawberry" />
              <option value="Radish" />
              <option value="Carrot" />
              <option value="Zucchini" />
              <option value="Rosemary" />
              <option value="Thyme" />
            </datalist>
            {errors.species && <p className="text-error-red text-sm mt-1">{errors.species.message}</p>}
          </div>

          <div>
            <label htmlFor="plant-planted-at" className="block text-sm font-medium text-main-text mb-1">Planting Date</label>
            <input id="plant-planted-at" type="date" {...register('planted_at')} className="input-field" />
          </div>
          
          <div>
            <label htmlFor="plant-pot-size" className="block text-sm font-medium text-main-text mb-1">Pot Size</label>
            <select id="plant-pot-size" {...register('pot_size')} className="input-field bg-white">
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Raised Bed">Raised Bed</option>
            </select>
          </div>

          <div>
            <label htmlFor="plant-location" className="block text-sm font-medium text-main-text mb-1">Location</label>
            <select id="plant-location" {...register('location')} className="input-field bg-white">
              <option value="Indoor">Indoor</option>
              <option value="Balcony">Balcony</option>
              <option value="Rooftop">Rooftop</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="plant-sunlight" className="block text-sm font-medium text-main-text mb-1">Sunlight (hours/day)</label>
            <input 
              id="plant-sunlight"
              type="number" 
              {...register('sunlight_hours', { valueAsNumber: true })} 
              className={`input-field ${errors.sunlight_hours ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : ''}`} 
            />
            {errors.sunlight_hours && <p className="text-error-red text-sm mt-1">{errors.sunlight_hours.message}</p>}
          </div>
          <div>
            <label htmlFor="plant-drainage" className="block text-sm font-medium text-main-text mb-1">Drainage</label>
            <select id="plant-drainage" {...register('drainage')} className="input-field bg-white">
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="plant-notes" className="block text-sm font-medium text-main-text mb-1">Notes (optional)</label>
          <textarea id="plant-notes" {...register('notes')} className="input-field h-24" placeholder="Any special instructions..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialPlant ? 'Save Changes' : 'Save Plant'}
          </button>
        </div>
      </form>
    </div>
  );
}
