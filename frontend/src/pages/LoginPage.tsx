import { FormEvent, useState } from 'react';
import { Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const fullName = String(form.get('full_name') || '');

    try {
      if (registering) await api.register({ email, password, full_name: fullName });
      await api.login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to connect to the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-offwhite flex items-center justify-center p-4">
      <section className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <Sprout className="w-8 h-8 text-forest-green" />
          <h1 className="text-2xl font-bold text-main-text">LeafLogic</h1>
        </div>
        <h2 className="text-xl font-semibold text-main-text">{registering ? 'Create your account' : 'Welcome back'}</h2>
        <p className="text-secondary-text mt-1 mb-6">{registering ? 'Start keeping your garden healthy.' : 'Sign in to manage your plants.'}</p>

        <form onSubmit={submit} className="space-y-4">
          {registering && (
            <label className="block text-sm font-medium text-main-text">
              Name
              <input name="full_name" autoComplete="name" className="input-field mt-1" />
            </label>
          )}
          <label className="block text-sm font-medium text-main-text">
            Email
            <input name="email" type="email" autoComplete="email" required className="input-field mt-1" />
          </label>
          <label className="block text-sm font-medium text-main-text">
            Password
            <input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={8} required className="input-field mt-1" />
          </label>
          {error && <p role="alert" className="text-sm text-error-red">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setRegistering(!registering); setError(''); }}
          className="text-sm text-forest-green hover:underline mt-5"
        >
          {registering ? 'Already registered? Sign in' : 'New to LeafLogic? Create an account'}
        </button>
      </section>
    </main>
  );
}