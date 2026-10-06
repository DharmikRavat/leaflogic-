import { Diagnosis, Plant, WateringLog } from '../types';

const defaultApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const tokenKey = 'leaflogic_access_token';
const apiUrlKey = 'leaflogic_api_base_url';

function getApiBaseUrl() {
  return (localStorage.getItem(apiUrlKey) || defaultApiBaseUrl).replace(/\/$/, '');
}

interface ApiPlant extends Omit<Plant, 'location' | 'drainage' | 'health_status'> {
  growing_location?: string | null;
  drainage_quality?: string | null;
  health_status?: string | null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem(tokenKey);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string | { msg?: string }[] } | null;
    if (response.status === 401) localStorage.removeItem(tokenKey);
    const message = Array.isArray(body?.detail)
      ? body.detail.map((item) => item.msg).filter(Boolean).join('; ')
      : body?.detail;
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function mapPlant(plant: ApiPlant): Plant {
  const status = (plant.health_status || 'Healthy').toLowerCase();
  return {
    ...plant,
    planted_at: plant.planted_at || '',
    growth_stage: plant.growth_stage || '',
    pot_size: plant.pot_size || '',
    location: plant.growing_location || 'Unknown',
    sunlight_hours: plant.sunlight_hours ?? 0,
    drainage: plant.drainage_quality || 'Unknown',
    health_status: status === 'critical' ? 'Critical' : status.includes('attention') ? 'Needs Attention' : 'Healthy',
  };
}

function plantPayload(plant: Partial<Plant>) {
  return {
    name: plant.name,
    species: plant.species,
    planted_at: plant.planted_at ? new Date(plant.planted_at).toISOString() : null,
    growth_stage: plant.growth_stage || null,
    pot_size: plant.pot_size || null,
    growing_location: plant.location || null,
    sunlight_hours: plant.sunlight_hours ?? null,
    drainage_quality: plant.drainage || null,
    image_url: plant.image_url || null,
    notes: plant.notes || null,
  };
}

export const api = {
  isAuthenticated: () => Boolean(localStorage.getItem(tokenKey)),
  getApiBaseUrl,
  setApiBaseUrl: (url: string) => localStorage.setItem(apiUrlKey, url.replace(/\/$/, '')),
  testConnection: async () => {
    const baseUrl = getApiBaseUrl().replace(/\/api\/v1$/, '');
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    return response.json() as Promise<{ status: string; app: string }>;
  },

  register: (account: { email: string; password: string; full_name?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(account) }),

  login: async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const result = await request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    localStorage.setItem(tokenKey, result.access_token);
  },

  logout: () => localStorage.removeItem(tokenKey),

  getPlants: async (): Promise<Plant[]> => {
    const plants = await request<ApiPlant[]>('/plants');
    return plants.map(mapPlant);
  },

  getPlant: async (id: string): Promise<Plant> => mapPlant(await request<ApiPlant>(`/plants/${id}`)),

  addPlant: async (plant: Partial<Plant>): Promise<Plant> =>
    mapPlant(await request<ApiPlant>('/plants', { method: 'POST', body: JSON.stringify(plantPayload(plant)) })),

  updatePlant: async (id: string, plant: Partial<Plant>): Promise<Plant> =>
    mapPlant(await request<ApiPlant>(`/plants/${id}`, { method: 'PATCH', body: JSON.stringify(plantPayload(plant)) })),

  deletePlant: (id: string) => request<void>(`/plants/${id}`, { method: 'DELETE' }),

  diagnoseImage: async (plantId: string, imageFile: File): Promise<Diagnosis> => {
    const body = new FormData();
    body.append('image', imageFile);
    return request(`/plants/${plantId}/diagnose`, { method: 'POST', body });
  },

  getDiagnoses: async (): Promise<Diagnosis[]> => {
    const plants = await api.getPlants();
    const groups = await Promise.all(plants.map((plant) =>
      request<Diagnosis[]>(`/plants/${plant.id}/diagnoses`),
    ));
    return groups.flat().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  getPlantDiagnoses: (plantId: string) =>
    request<Diagnosis[]>(`/plants/${plantId}/diagnoses`),

  getWaterings: () => request<WateringLog[]>('/care/waterings'),

  logWatering: (log: Omit<WateringLog, 'id'>) =>
    request<WateringLog>('/care/waterings', { method: 'POST', body: JSON.stringify(log) }),
};