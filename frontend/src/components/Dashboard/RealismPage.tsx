import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';

interface RealismPageProps {
  filters: DashboardFilters;
}

export default function RealismPage({ filters }: RealismPageProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;
      const realismData = await analyticsAPI.getDemandRealism(startDate, endDate);
      setData(realismData);
    } catch (error) {
      console.error('Failed to load realism data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  const poolVsNamedData = data.poolVsNamed?.map((item: any) => ({
    name: item.resourceType,
    value: item.totalHours,
    pct: item.pctOfTotal,
  })) || [];

  const demandTypeData = data.demandTypeBreakdown?.map((item: any) => ({
    name: item.demandType,
    value: item.totalHours,
    pct: item.pctOfTotal,
  })) || [];

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Demand Realism Validation</h1>
        <p className="text-gray-600 mt-2">
          Assess the quality and realism of demand forecasts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {data.totalHours?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Avg Weekly FTE</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {data.avgWeeklyFTE?.toFixed(1) || '0'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Unique Resources</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {data.uniqueResources?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Realism Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {data.realismScore || '0'}/100
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pool vs Named */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Pool vs Named Resources</h2>
          {poolVsNamedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={poolVsNamedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.pct}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {poolVsNamedData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-8 text-gray-500">No data</p>
          )}
        </div>

        {/* Demand Type */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Hard vs Soft Demand</h2>
          {demandTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demandTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.pct}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demandTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-8 text-gray-500">No data</p>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Data Quality Insights</h2>
        <div className="space-y-3">
          {poolVsNamedData.find((d: any) => d.name === 'Pool/Placeholder')?.pct > 50 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-yellow-900">High Pool Allocation</p>
                <p className="text-sm text-yellow-800">
                  {poolVsNamedData.find((d: any) => d.name === 'Pool/Placeholder')?.pct.toFixed(1)}%
                  of demand is assigned to pools. Consider assigning specific resources for better accuracy.
                </p>
              </div>
            </div>
          )}

          {data.uniqueResources < 10 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-blue-900">Low Resource Count</p>
                <p className="text-sm text-blue-800">
                  Only {data.uniqueResources} unique resources found. Upload more budget trackers for comprehensive analysis.
                </p>
              </div>
            </div>
          )}

          {data.realismScore >= 70 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-green-900">Good Demand Quality</p>
                <p className="text-sm text-green-800">
                  Demand planning data appears realistic with a good balance of named resources and allocation levels.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
