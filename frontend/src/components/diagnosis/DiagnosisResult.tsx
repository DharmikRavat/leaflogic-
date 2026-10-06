import { Diagnosis } from '../../types';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  onReset: () => void;
}

export function DiagnosisResult({ diagnosis, onReset }: DiagnosisResultProps) {
  const isHealthy = diagnosis.predicted_class === 'Healthy';
  const isUncertain = diagnosis.confidence < 60;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`card border-l-4 ${isHealthy ? 'border-l-fresh-green' : isUncertain ? 'border-l-gray-400' : 'border-l-warning-amber'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-main-text mb-1">
              {isUncertain ? 'Uncertain Diagnosis' : diagnosis.predicted_class}
            </h2>
            <div className="flex items-center text-sm text-secondary-text mb-4">
              <span>AI Confidence:</span>
              <div className="ml-2 bg-gray-200 rounded-full h-2 w-24 overflow-hidden">
                <div 
                  className={`h-full ${isHealthy ? 'bg-fresh-green' : 'bg-warning-amber'}`} 
                  style={{ width: `${diagnosis.confidence}%` }}
                />
              </div>
              <span className="ml-2 font-medium text-main-text">{diagnosis.confidence.toFixed(1)}%</span>
            </div>
          </div>
          <div className={`p-2 rounded-full ${isHealthy ? 'bg-fresh-green/10 text-fresh-green' : isUncertain ? 'bg-gray-100 text-gray-500' : 'bg-warning-amber/10 text-warning-amber'}`}>
            {isHealthy ? <CheckCircle2 className="w-8 h-8" /> : isUncertain ? <Info className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
        </div>

        {!isHealthy && !isUncertain && (
          <div className="mt-4 p-4 bg-warning-amber/5 rounded-lg border border-warning-amber/20">
            <h4 className="font-semibold text-warning-amber mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Symptoms Detected
            </h4>
            <ul className="list-disc list-inside text-sm text-secondary-text space-y-1">
              {diagnosis.symptoms?.map((sym, i) => (
                <li key={i}>{sym}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-semibold text-main-text mb-3">Recommended Actions</h4>
          <ul className="space-y-2">
            {diagnosis.recommendations?.map((rec, i) => (
              <li key={i} className="flex items-start">
                <span className="text-forest-green mr-2 mt-0.5">•</span>
                <span className="text-sm text-secondary-text">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button onClick={onReset} className="btn-secondary">
          Diagnose Another Image
        </button>
      </div>
    </div>
  );
}
