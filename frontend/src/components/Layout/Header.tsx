import { Calendar, Filter } from 'lucide-react';
import type { DashboardFilters } from '../../types';

interface HeaderProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export default function Header({ filters, onFiltersChange }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              value={filters.dateRange.startDate}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, startDate: e.target.value },
                })
              }
              className="input-field text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={filters.dateRange.endDate}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, endDate: e.target.value },
                })
              }
              className="input-field text-sm"
            />
          </div>

          {/* Demand Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filters.demandTypes.join(',')}
              onChange={(e) => {
                const values = e.target.value.split(',').filter(Boolean);
                onFiltersChange({
                  ...filters,
                  demandTypes: values as ('Hard Demand' | 'Soft Demand')[],
                });
              }}
              className="input-field text-sm"
            >
              <option value="Hard Demand,Soft Demand">All Demand Types</option>
              <option value="Hard Demand">Hard Demand Only</option>
              <option value="Soft Demand">Soft Demand Only</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing data from {filters.dateRange.startDate} to {filters.dateRange.endDate}
        </div>
      </div>
    </div>
  );
}
