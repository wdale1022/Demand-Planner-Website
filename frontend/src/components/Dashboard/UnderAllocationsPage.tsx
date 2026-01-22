import { useEffect, useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';

interface UnderAllocationsPageProps {
  filters: DashboardFilters;
}

export default function UnderAllocationsPage({ filters }: UnderAllocationsPageProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;
      const underAllocated = await analyticsAPI.getUnderAllocatedResources(startDate, endDate);
      setData(underAllocated);
    } catch (error) {
      console.error('Failed to load under-allocations:', error);
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Under-Allocated Resources</h1>
        <p className="text-gray-600 mt-2">
          Resources with sustained average utilization below 60%
        </p>
      </div>

      {/* Summary */}
      <div className="card">
        <div className="flex items-center gap-3">
          <TrendingDown className="text-blue-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-600">Under-Allocated Resources</p>
            <p className="text-3xl font-bold text-gray-900">{data.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Resources Below 60% Utilization</h2>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Hours/Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Utilization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weeks Analyzed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((resource, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{resource.resourceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{resource.avgHoursPerWeek.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(resource.avgUtilizationPct, 100)}%` }}
                          ></div>
                        </div>
                        <span>{resource.avgUtilizationPct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{resource.weeksCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No under-allocated resources found</p>
        )}
      </div>
    </div>
  );
}
