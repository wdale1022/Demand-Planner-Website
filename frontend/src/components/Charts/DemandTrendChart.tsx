import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';

interface DemandTrendChartProps {
  filters: DashboardFilters;
}

export default function DemandTrendChart({ filters }: DemandTrendChartProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    peakWeek: '',
    peakHours: 0,
    avgHours: 0,
    totalHours: 0,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;

      const trendData = await analyticsAPI.getDemandTrend(startDate, endDate);

      // Calculate statistics
      let peakWeek = '';
      let peakHours = 0;
      let totalHours = 0;

      trendData.forEach((item) => {
        if (item.totalHours > peakHours) {
          peakHours = item.totalHours;
          peakWeek = item.weekStartDate;
        }
        totalHours += item.totalHours;
      });

      const avgHours = trendData.length > 0 ? totalHours / trendData.length : 0;

      setStats({ peakWeek, peakHours, avgHours, totalHours });
      setData(trendData);
    } catch (error) {
      console.error('Failed to load demand trend:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Weekly Demand Trend</h1>
        <p className="text-gray-600 mt-2">
          Total hours demand across all resources and projects by week
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Hours</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHours.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Average Weekly Hours</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(stats.avgHours).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Peak Week</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.peakWeek || 'N/A'}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Peak Hours</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(stats.peakHours).toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Demand Over Time</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="weekStartDate"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ value: 'Total Hours', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                formatter={(value: number) => [`${value.toLocaleString()} hours`, 'Total Hours']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalHours"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Total Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available for the selected date range
          </div>
        )}
      </div>
    </div>
  );
}
