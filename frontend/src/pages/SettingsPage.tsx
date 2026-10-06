import { FormEvent, useState } from 'react';
import { api } from '../services/api';

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(api.getApiBaseUrl());
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const saveAndCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setChecking(true);
    try {
      const parsed = new URL(apiUrl.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use an HTTP or HTTPS URL.');
      const normalized = `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`;
      api.setApiBaseUrl(normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`);
      const result = await api.testConnection();
      setStatus(`${result.app} is reachable.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reach the backend.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-main-text">Settings</h1>
        <p className="text-secondary-text mt-1">Configure and verify the backend connection.</p>
      </div>
      <form onSubmit={saveAndCheck} className="card space-y-4">
        <label className="block text-sm font-medium text-main-text">
          API base URL
          <input type="url" required className="input-field mt-1" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="http://127.0.0.1:8000/api/v1" />
        </label>
        {status && <p role="status" className="text-sm text-fresh-green">{status}</p>}
        {error && <p role="alert" className="text-sm text-error-red">{error}</p>}
        <button type="submit" className="btn-primary" disabled={checking}>{checking ? 'Checking...' : 'Save and test connection'}</button>
      </form>
    </div>
  );
}