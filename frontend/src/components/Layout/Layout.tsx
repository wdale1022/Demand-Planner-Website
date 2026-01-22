import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { DashboardFilters } from '../../types';

interface LayoutProps {
  children: ReactNode;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export default function Layout({ children, filters, onFiltersChange }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Filters */}
        <Header filters={filters} onFiltersChange={onFiltersChange} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
