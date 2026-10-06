import { LogOut, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export function Topbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const searchPlants = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/plants${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
  };

  const signOut = () => {
    api.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8">
      <div className="flex-1 max-w-lg">
        <form className="relative" onSubmit={searchPlants}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-forest-green focus:border-forest-green sm:text-sm transition-colors"
            placeholder="Search plants..."
            aria-label="Search plants"
          />
        </form>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={signOut} title="Sign out" aria-label="Sign out" className="p-2 text-secondary-text hover:text-error-red transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
