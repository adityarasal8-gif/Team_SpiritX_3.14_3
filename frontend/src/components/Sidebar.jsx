/**
 * Dashboard Sidebar Component
 * 
 * Left navigation with tabs for different sections
 */

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hospital, 
  Database, 
  TrendingUp, 
  BarChart3,
  BellRing,
  FileText,
  Settings,
  Heart
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/hospitals', icon: Hospital, label: 'Hospitals' },
    { to: '/dashboard/ehr-data', icon: Database, label: 'EHR Data' },
    { to: '/dashboard/predictions', icon: TrendingUp, label: 'Predictions' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/alerts', icon: BellRing, label: 'Alerts' },
    { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              BedPredict AI
            </div>
            <div className="text-xs text-gray-500">Healthcare Dashboard</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : ''}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-100">
          <div className="text-sm font-semibold text-gray-900 mb-1">Need Help?</div>
          <div className="text-xs text-gray-600 mb-3">Check our documentation</div>
          <button className="w-full px-3 py-2 bg-white text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-50 transition-colors border border-sky-200">
            View Docs
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
