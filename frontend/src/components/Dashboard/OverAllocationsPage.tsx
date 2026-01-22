import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';

interface OverAllocationsPageProps {
  filters: DashboardFilters;
}

export default function OverAllocationsPage({ filters }: OverAllocationsPageProps) {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<any[]>([]);
  const [individuals, setIndividuals] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;

      const [poolsData, individualsData] = await Promise.all([
        analyticsAPI.getOverAllocatedPools(startDate, endDate),
        analyticsAPI.getOverAllocatedIndividuals(startDate, endDate),
      ]);

      setPools(poolsData);
      setIndividuals(individualsData);
    } catch (error) {
      console.error('Failed to load over-allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const styles = {
      Critical: 'bg-red-100 text-red-800',
      Warning: 'bg-yellow-100 text-yellow-800',
      Normal: 'bg-green-100 text-green-800',
    };
    return styles[riskLevel as keyof typeof styles] || styles.Normal;
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
        <h1 className="text-3xl font-bold text-gray-900">Over-Allocations</h1>
        <p className="text-gray-600 mt-2">
          Resources and pools with weekly demand exceeding capacity thresholds
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Over-Allocated Pools</p>
              <p className="text-3xl font-bold text-gray-900">{pools.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Over-Allocated Individuals</p>
              <p className="text-3xl font-bold text-gray-900">{individuals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Over-Allocated Pools */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Over-Allocated Pools (>40 hours/week)</h2>
        {pools.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource Pool</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Implied FTE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pools.map((pool, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{pool.resourceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pool.weekStartDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pool.totalHours.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pool.impliedFTE.toFixed(1)}</td>
                    <td className="px-6 py-4">{pool.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No over-allocated pools found</p>
        )}
      </div>

      {/* Over-Allocated Individuals */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Over-Allocated Individuals (>45 hours/week)</h2>
        {individuals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Over By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {individuals.map((person, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{person.resourceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.weekStartDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.totalHours.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.hoursOver.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadge(person.riskLevel)}`}>
                        {person.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">{person.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No over-allocated individuals found</p>
        )}
      </div>
    </div>
  );
}
