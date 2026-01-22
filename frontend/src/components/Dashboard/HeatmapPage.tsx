import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import type { DashboardFilters } from '../../types';

interface HeatmapPageProps {
  filters: DashboardFilters;
}

export default function HeatmapPage({ filters }: HeatmapPageProps) {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<Map<string, Map<string, any>>>(new Map());
  const [resources, setResources] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = filters.dateRange;
      const data = await analyticsAPI.getHeatmapData(startDate, endDate, 20);

      // Organize data into a nested map: resource -> week -> hours
      const map = new Map<string, Map<string, any>>();
      const uniqueResources = new Set<string>();
      const uniqueWeeks = new Set<string>();

      data.forEach((item) => {
        uniqueResources.add(item.resourceName);
        uniqueWeeks.add(item.weekStartDate);

        if (!map.has(item.resourceName)) {
          map.set(item.resourceName, new Map());
        }
        map.get(item.resourceName)!.set(item.weekStartDate, item);
      });

      setHeatmapData(map);
      setResources(Array.from(uniqueResources));
      setWeeks(Array.from(uniqueWeeks).sort());
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (hours: number | undefined): string => {
    if (!hours || hours === 0) return '#ffffff';
    if (hours < 20) return '#dbeafe'; // Light blue
    if (hours < 40) return '#3b82f6'; // Blue
    if (hours < 55) return '#f97316'; // Orange
    return '#dc2626'; // Red
  };

  const getTextColor = (hours: number | undefined): string => {
    if (!hours || hours < 40) return '#000000';
    return '#ffffff';
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
        <h1 className="text-3xl font-bold text-gray-900">Resource Heatmap</h1>
        <p className="text-gray-600 mt-2">
          Visual week-by-week view of top 20 resources by peak demand
        </p>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold mb-3">Color Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #ccc' }}></div>
            <span className="text-sm">0 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
            <span className="text-sm">1-20 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-sm">20-40 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-sm">40-55 hours (Over)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-sm">55+ hours (Critical)</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Weekly Hours Heatmap</h2>
        {resources.length > 0 ? (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                  Resource
                </th>
                {weeks.map((week) => (
                  <th key={week} className="px-2 py-2 text-xs font-medium text-gray-700 border min-w-[80px]">
                    {week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource}>
                  <td className="sticky left-0 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 border whitespace-nowrap">
                    {resource}
                  </td>
                  {weeks.map((week) => {
                    const cellData = heatmapData.get(resource)?.get(week);
                    const hours = cellData?.hours || 0;
                    return (
                      <td
                        key={week}
                        className="border text-center text-sm font-medium"
                        style={{
                          backgroundColor: getHeatmapColor(hours),
                          color: getTextColor(hours),
                        }}
                        title={`${resource} - ${week}: ${hours.toFixed(1)} hours`}
                      >
                        {hours > 0 ? hours.toFixed(0) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-8 text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
}
