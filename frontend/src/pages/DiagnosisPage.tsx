import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Diagnosis, Plant } from '../types';
import { ImageUploader } from '../components/diagnosis/ImageUploader';
import { DiagnosisResult } from '../components/diagnosis/DiagnosisResult';
import { Leaf } from 'lucide-react';

export function DiagnosisPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPlants().then(data => {
      setPlants(data);
      if (data.length > 0) setSelectedPlantId(data[0].id);
    }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Could not load plants.');
    });
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
  };

  const handleDiagnose = async () => {
    if (!imageFile || !selectedPlantId) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await api.diagnoseImage(selectedPlantId, imageFile);
      setDiagnosis(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to submit image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setDiagnosis(null);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-main-text">AI Disease Diagnosis</h1>
        <p className="text-secondary-text mt-1">Upload a clear picture of a leaf to identify potential diseases and get care recommendations.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-sm text-error-red">{error}</p>}

      {!diagnosis ? (
        <div className="space-y-6">
          <div className="card">
            <label className="block text-sm font-medium text-main-text mb-2">Select Plant</label>
            <div className="relative">
              <select 
                className="input-field appearance-none"
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
              >
                {plants.length === 0 && <option value="">No plants available</option>}
                {plants.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                ))}
              </select>
            </div>
            {plants.length === 0 && !error && (
              <p className="text-sm text-warning-amber mt-2 flex items-center">
                <Leaf className="w-4 h-4 mr-1" />
                Add a plant before submitting an image for diagnosis.
              </p>
            )}
          </div>

          <div className="card p-6 md:p-8">
            <ImageUploader onImageSelect={handleImageSelect} onImageRemove={() => setImageFile(null)} isLoading={isAnalyzing} />
            
            {imageFile && plants.length > 0 && !isAnalyzing && (
              <div className="mt-6 flex justify-end">
                <button onClick={handleDiagnose} className="btn-primary">
                  Analyze Image
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <DiagnosisResult diagnosis={diagnosis} onReset={handleReset} />
      )}
    </div>
  );
}
