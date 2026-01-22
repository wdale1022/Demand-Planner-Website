import { useEffect, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, Activity } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';

interface DashboardProps {
  filters: DashboardFilters;
}

export default function Dashboard({ filters }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    avgFTE: 0,
    peakFTE: 0,
    uniqueResources: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;

      const [fteData, realismData] = await Promise.all([
        analyticsAPI.getImpliedFTE(startDate, endDate),
        analyticsAPI.getDemandRealism(startDate, endDate),
      ]);

      setStats({
        totalHours: realismData.totalHours || 0,
        avgFTE: fteData.summary.avgFTE || 0,
        peakFTE: fteData.summary.peakFTE || 0,
        uniqueResources: realismData.uniqueResources || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Hours',
      value: stats.totalHours.toLocaleString(),
      icon: Activity,
      color: 'blue',
    },
    {
      name: 'Average FTE',
      value: stats.avgFTE.toFixed(1),
      icon: Users,
      color: 'green',
    },
    {
      name: 'Peak FTE',
      value: stats.peakFTE.toFixed(1),
      icon: TrendingUp,
      color: 'orange',
    },
    {
      name: 'Unique Resources',
      value: stats.uniqueResources.toLocaleString(),
      icon: AlertTriangle,
      color: 'purple',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Summary of demand planning metrics across the selected time period
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/demand-trend" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900">Demand Trend</h3>
            <p className="text-sm text-gray-600 mt-1">View weekly hours forecast</p>
          </a>
          <a href="/utilization" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900">Utilization</h3>
            <p className="text-sm text-gray-600 mt-1">Analyze resource utilization</p>
          </a>
          <a href="/over-allocations" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900">Over-Allocations</h3>
            <p className="text-sm text-gray-600 mt-1">Identify overbooked resources</p>
          </a>
          <a href="/heatmap" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900">Resource Heatmap</h3>
            <p className="text-sm text-gray-600 mt-1">Visual capacity planning</p>
          </a>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card bg-primary-50 border-primary-200">
        <h2 className="text-xl font-semibold text-primary-900 mb-2">Getting Started</h2>
        <ul className="text-primary-800 space-y-2">
          <li>📊 Use the sidebar to navigate between different analytics views</li>
          <li>📅 Adjust the date range in the header to focus on specific time periods</li>
          <li>📤 Upload budget tracker Excel files using the Upload Data page</li>
          <li>🔍 Explore utilization, over/under-allocations, and demand realism metrics</li>
        </ul>
      </div>
    </div>
  );
}
