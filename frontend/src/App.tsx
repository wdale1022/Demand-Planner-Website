import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import DemandTrend from './components/Charts/DemandTrendChart';
import UtilizationPage from './components/Dashboard/UtilizationPage';
import OverAllocationsPage from './components/Dashboard/OverAllocationsPage';
import UnderAllocationsPage from './components/Dashboard/UnderAllocationsPage';
import HeatmapPage from './components/Dashboard/HeatmapPage';
import RealismPage from './components/Dashboard/RealismPage';
import UploadPage from './components/Upload/UploadPage';
import { DashboardFilters } from './types';

function App() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 182 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    projects: [],
    demandTypes: ['Hard Demand', 'Soft Demand'],
    resourceTypes: ['Named', 'Pool'],
    phases: [],
  });

  return (
    <Router>
      <Layout filters={filters} onFiltersChange={setFilters}>
        <Routes>
          <Route path="/" element={<Dashboard filters={filters} />} />
          <Route path="/demand-trend" element={<DemandTrend filters={filters} />} />
          <Route path="/utilization" element={<UtilizationPage filters={filters} />} />
          <Route path="/over-allocations" element={<OverAllocationsPage filters={filters} />} />
          <Route path="/under-allocations" element={<UnderAllocationsPage filters={filters} />} />
          <Route path="/heatmap" element={<HeatmapPage filters={filters} />} />
          <Route path="/realism" element={<RealismPage filters={filters} />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
