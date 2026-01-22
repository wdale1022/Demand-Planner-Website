// Core data types based on the database schema

export interface HoursRecord {
  id?: number;
  project: string;
  employeeId: string;
  resourceName: string;
  rate: number;
  activityId: string;
  weekStartDate: string; // ISO date format YYYY-MM-DD
  actualOrProposed: 'A' | 'P';
  hours: number;
  demandType: 'Hard Demand' | 'Soft Demand';
  projectId: string;
  createdAt?: string;
  phase: string;
  milestone: string;
}

export interface Resource {
  employeeId: string;
  resourceName: string;
  primaryRole?: string;
  employeeType?: 'INTERNAL' | 'CONTRACTOR';
  locationType?: 'Onshore' | 'Offshore';
  standardCapacity?: number;
}

export interface Project {
  projectId: string;
  projectName: string;
  clientName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Analytics response types

export interface WeeklyDemand {
  weekStartDate: string;
  totalHours: number;
  resourceCount: number;
  projectCount: number;
  demandType?: 'Hard Demand' | 'Soft Demand';
}

export interface WeeklyFTE {
  weekStartDate: string;
  totalHours: number;
  impliedFTE: number;
}

export interface UtilizationBucket {
  bucket: string;
  count: number;
  percentage: number;
  color: string;
}

export interface OverAllocatedPool {
  resourceName: string;
  weekStartDate: string;
  totalHours: number;
  impliedFTE: number;
  projects: string[];
}

export interface OverAllocatedIndividual {
  employeeId: string;
  resourceName: string;
  weekStartDate: string;
  totalHours: number;
  hoursOver: number;
  riskLevel: 'Normal' | 'Warning' | 'Critical';
  projects: string[];
}

export interface UnderAllocatedResource {
  employeeId: string;
  resourceName: string;
  avgHoursPerWeek: number;
  avgUtilizationPct: number;
  weeksCount: number;
}

export interface HeatmapData {
  employeeId: string;
  resourceName: string;
  weekStartDate: string;
  hours: number;
  utilizationPct: number;
}

export interface DemandRealismMetrics {
  totalHours: number;
  avgWeeklyFTE: number;
  uniqueResources: number;
  uniqueProjects: number;
  poolHours: number;
  poolPct: number;
  namedHours: number;
  namedPct: number;
  hardDemandPct: number;
  softDemandPct: number;
  realismScore: number;
  warnings: string[];
}

// Filter types

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface DashboardFilters {
  dateRange: DateRangeFilter;
  projects: string[];
  demandTypes: ('Hard Demand' | 'Soft Demand')[];
  resourceTypes: ('Named' | 'Pool')[];
  phases: string[];
}

// Upload types

export interface FileUploadResult {
  filename: string;
  recordsImported: number;
  errors: string[];
  warnings: string[];
  success: boolean;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

// Configuration types

export interface CapacitySettings {
  standardWeeklyHours: number;
  overAllocationThreshold: number;
  underUtilizationThreshold: number;
  severeOverAllocationThreshold: number;
}

export interface DisplaySettings {
  forecastHorizonWeeks: number;
  heatmapResourceCount: number;
  minWeeksForAnalysis: number;
}

export interface PoolIdentifiers {
  patterns: string[];
  employeeIdPrefixes: string[];
}

export interface UtilizationBucketConfig {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface AppConfig {
  capacitySettings: CapacitySettings;
  displaySettings: DisplaySettings;
  poolIdentifiers: PoolIdentifiers;
  utilizationBuckets: UtilizationBucketConfig[];
}

// Default configuration
export const DEFAULT_CONFIG: AppConfig = {
  capacitySettings: {
    standardWeeklyHours: 40,
    overAllocationThreshold: 45,
    underUtilizationThreshold: 0.6,
    severeOverAllocationThreshold: 55,
  },
  displaySettings: {
    forecastHorizonWeeks: 26,
    heatmapResourceCount: 20,
    minWeeksForAnalysis: 4,
  },
  poolIdentifiers: {
    patterns: ['General', 'Pool', 'TBD', 'Placeholder', 'Offshore', 'Onshore'],
    employeeIdPrefixes: ['9999999'],
  },
  utilizationBuckets: [
    { min: 0, max: 25, label: '0-25%', color: '#fee2e2' },
    { min: 25, max: 50, label: '25-50%', color: '#fef3c7' },
    { min: 50, max: 75, label: '50-75%', color: '#fef9c3' },
    { min: 75, max: 100, label: '75-100%', color: '#d1fae5' },
    { min: 100, max: 125, label: '100-125%', color: '#fed7aa' },
    { min: 125, max: 999, label: '125%+', color: '#fecaca' },
  ],
};
