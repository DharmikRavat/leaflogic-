export interface Plant {
  id: string;
  name: string;
  species: string;
  planted_at: string;
  growth_stage: string;
  pot_size: string;
  location: string;
  sunlight_hours: number;
  drainage: string;
  health_status: 'Healthy' | 'Needs Attention' | 'Critical';
  image_url?: string;
  notes?: string;
}

export interface Diagnosis {
  id: string;
  plant_id: string;
  image_url: string;
  predicted_class: string;
  confidence: number;
  status: 'pending' | 'completed' | 'failed';
  symptoms?: string[];
  recommendations?: string[];
  created_at: string;
}

export interface WateringLog {
  id: string;
  plant_id: string;
  watered_at: string;
  amount_ml?: number;
  soil_condition: 'Wet' | 'Moist' | 'Slightly Dry' | 'Dry';
  notes?: string;
}

export interface CareRecommendation {
  id: string;
  plant_id: string;
  type: string;
  message: string;
  due_at: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface HealthLog {
  id: string;
  plant_id: string;
  status: string;
  notes?: string;
  recorded_at: string;
}
