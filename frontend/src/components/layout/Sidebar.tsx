import { NavLink } from 'react-router-dom';
import { Home, Sprout, ScanSearch, Droplets, Activity, Settings } from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: Home },
  { name: 'My Plants', path: '/plants', icon: Sprout },
  { name: 'AI Diagnosis', path: '/diagnosis', icon: ScanSearch },
  { name: 'Watering & Care', path: '/care', icon: Droplets },
  { name: 'Health History', path: '/history', icon: Activity },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Sprout className="w-8 h-8 text-forest-green mr-2" />
        <span className="text-xl font-bold text-main-text">LeafLogic</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-soft-mint text-forest-dark'
                    : 'text-secondary-text hover:bg-gray-50 hover:text-main-text'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <NavLink to="/settings" className={({ isActive }) => `flex items-center text-sm font-medium w-full px-3 py-2 rounded-lg ${isActive ? 'text-forest-green bg-soft-mint' : 'text-secondary-text hover:text-main-text'}`}>
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
