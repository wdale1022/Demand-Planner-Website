import type {
  WeeklyDemand,
  WeeklyFTE,
  UtilizationBucket,
  OverAllocatedPool,
  OverAllocatedIndividual,
  UnderAllocatedResource,
  HeatmapData,
  DemandRealismMetrics,
  FileUploadResult,
} from '../types';

const API_BASE_URL = '/api';

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Upload API
export const uploadAPI = {
  async uploadFiles(files: File[], demandType: 'Hard Demand' | 'Soft Demand'): Promise<{
    success: boolean;
    results: FileUploadResult[];
    totalRecordsImported: number;
  }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('demandType', demandType);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    return apiRequest('/upload/clear', { method: 'DELETE' });
  },

  async getUploadHistory(): Promise<any[]> {
    return apiRequest('/upload/history');
  },
};

// Analytics API
export const analyticsAPI = {
  async getDemandTrend(startDate: string, endDate: string, demandType?: string): Promise<WeeklyDemand[]> {
    const params = new URLSearchParams({ startDate, endDate });
    if (demandType) params.append('demandType', demandType);
    return apiRequest(`/analytics/demand-trend?${params}`);
  },

  async getDemandByType(startDate: string, endDate: string): Promise<WeeklyDemand[]> {
    const params = new URLSearchParams({ startDate, endDate });
    return apiRequest(`/analytics/demand-by-type?${params}`);
  },

  async getImpliedFTE(startDate: string, endDate: string): Promise<{
    data: WeeklyFTE[];
    summary: {
      avgFTE: number;
      peakFTE: number;
      minFTE: number;
    };
  }> {
    const params = new URLSearchParams({ startDate, endDate });
    return apiRequest(`/analytics/implied-fte?${params}`);
  },

  async getUtilizationDistribution(startDate: string, endDate: string): Promise<UtilizationBucket[]> {
    const params = new URLSearchParams({ startDate, endDate });
    return apiRequest(`/analytics/utilization-distribution?${params}`);
  },

  async getOverAllocatedPools(
    startDate: string,
    endDate: string,
    threshold: number = 40
  ): Promise<OverAllocatedPool[]> {
    const params = new URLSearchParams({ startDate, endDate, threshold: threshold.toString() });
    return apiRequest(`/analytics/over-allocated-pools?${params}`);
  },

  async getOverAllocatedIndividuals(
    startDate: string,
    endDate: string,
    threshold: number = 45
  ): Promise<OverAllocatedIndividual[]> {
    const params = new URLSearchParams({ startDate, endDate, threshold: threshold.toString() });
    return apiRequest(`/analytics/over-allocated-individuals?${params}`);
  },

  async getUnderAllocatedResources(
    startDate: string,
    endDate: string,
    utilizationThreshold: number = 60,
    minWeeks: number = 4
  ): Promise<UnderAllocatedResource[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      threshold: utilizationThreshold.toString(),
      minWeeks: minWeeks.toString(),
    });
    return apiRequest(`/analytics/under-allocated?${params}`);
  },

  async getHeatmapData(startDate: string, endDate: string, topN: number = 20): Promise<HeatmapData[]> {
    const params = new URLSearchParams({ startDate, endDate, topN: topN.toString() });
    return apiRequest(`/analytics/heatmap?${params}`);
  },

  async getDemandRealism(startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({ startDate, endDate });
    return apiRequest(`/analytics/demand-realism?${params}`);
  },

  async getProjects(): Promise<string[]> {
    return apiRequest('/analytics/filters/projects');
  },

  async getPhases(): Promise<string[]> {
    return apiRequest('/analytics/filters/phases');
  },

  async getDateRange(): Promise<{
    earliestDate: string;
    latestDate: string;
    weekCount: number;
  }> {
    return apiRequest('/analytics/date-range');
  },
};

// Health check
export async function checkHealth(): Promise<{ status: string; timestamp: string; version: string }> {
  return apiRequest('/health');
}
