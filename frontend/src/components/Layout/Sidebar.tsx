import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  AlertTriangle,
  TrendingDown,
  Grid3x3,
  CheckCircle,
  Upload,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Demand Trend', href: '/demand-trend', icon: TrendingUp },
  { name: 'Utilization', href: '/utilization', icon: Users },
  { name: 'Over-Allocations', href: '/over-allocations', icon: AlertTriangle },
  { name: 'Under-Allocations', href: '/under-allocations', icon: TrendingDown },
  { name: 'Heatmap', href: '/heatmap', icon: Grid3x3 },
  { name: 'Realism Check', href: '/realism', icon: CheckCircle },
  { name: 'Upload Data', href: '/upload', icon: Upload },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Demand Planning</h1>
        <p className="text-xs text-gray-500 mt-1">Analytics Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
