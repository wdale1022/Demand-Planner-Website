import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';
import { DEFAULT_CONFIG } from '../../types';

interface UtilizationPageProps {
  filters: DashboardFilters;
}

export default function UtilizationPage({ filters }: UtilizationPageProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;
      const distribution = await analyticsAPI.getUtilizationDistribution(startDate, endDate);

      // Add colors to data
      const chartData = distribution.map((item) => {
        const bucketConfig = DEFAULT_CONFIG.utilizationBuckets.find((b) => b.label === item.bucket);
        return {
          ...item,
          color: bucketConfig?.color || '#ccc',
        };
      });

      setData(chartData);
    } catch (error) {
      console.error('Failed to load utilization data:', error);
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

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resource Utilization Distribution</h1>
        <p className="text-gray-600 mt-2">
          Distribution of resource-week utilization across capacity buckets
        </p>
      </div>

      {/* Summary */}
      <div className="card">
        <p className="text-sm font-medium text-gray-600">Total Resource-Weeks</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount.toLocaleString()}</p>
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Utilization Buckets</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Resource-Weeks">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">No data available</div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Details</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bucket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.bucket}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    {item.bucket}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.count.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
