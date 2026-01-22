import { db } from '../models/database.js';

export interface WeeklyDemandResult {
  weekStartDate: string;
  totalHours: number;
  resourceCount: number;
  projectCount: number;
  demandType?: string;
}

export interface WeeklyFTEResult {
  weekStartDate: string;
  totalHours: number;
  impliedFTE: number;
}

export interface UtilizationBucketResult {
  bucket: string;
  count: number;
  percentage: number;
}

export interface OverAllocatedPoolResult {
  resourceName: string;
  weekStartDate: string;
  totalHours: number;
  impliedFTE: number;
  projects: string;
}

export interface OverAllocatedIndividualResult {
  employeeId: string;
  resourceName: string;
  weekStartDate: string;
  totalHours: number;
  hoursOver: number;
  riskLevel: string;
  projects: string;
}

export interface UnderAllocatedResourceResult {
  employeeId: string;
  resourceName: string;
  avgHoursPerWeek: number;
  avgUtilizationPct: number;
  weeksCount: number;
}

export interface HeatmapDataResult {
  employeeId: string;
  resourceName: string;
  weekStartDate: string;
  hours: number;
  utilizationPct: number;
}

export interface DemandRealismResult {
  totalHours: number;
  avgWeeklyFTE: number;
  uniqueResources: number;
  uniqueProjects: number;
}

export class AnalyticsService {
  /**
   * Get weekly demand hours trend
   */
  getWeeklyDemandTrend(startDate: string, endDate: string, demandType?: string): WeeklyDemandResult[] {
    let query = `
      SELECT
        week_start_date as weekStartDate,
        SUM(hours) as totalHours,
        COUNT(DISTINCT employee_id) as resourceCount,
        COUNT(DISTINCT project) as projectCount
      FROM hours
      WHERE week_start_date >= ? AND week_start_date <= ?
    `;

    const params: any[] = [startDate, endDate];

    if (demandType) {
      query += ' AND demand_type = ?';
      params.push(demandType);
    }

    query += ' GROUP BY week_start_date ORDER BY week_start_date';

    const stmt = db.prepare(query);
    return stmt.all(...params) as WeeklyDemandResult[];
  }

  /**
   * Get weekly demand by type
   */
  getWeeklyDemandByType(startDate: string, endDate: string): WeeklyDemandResult[] {
    const query = `
      SELECT
        week_start_date as weekStartDate,
        demand_type as demandType,
        SUM(hours) as totalHours
      FROM hours
      WHERE week_start_date >= ? AND week_start_date <= ?
      GROUP BY week_start_date, demand_type
      ORDER BY week_start_date
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate) as WeeklyDemandResult[];
  }

  /**
   * Get implied FTE requirement
   */
  getImpliedFTE(startDate: string, endDate: string): WeeklyFTEResult[] {
    const query = `
      SELECT
        week_start_date as weekStartDate,
        SUM(hours) as totalHours,
        ROUND(SUM(hours) / 40.0, 2) as impliedFTE
      FROM hours
      WHERE week_start_date >= ? AND week_start_date <= ?
      GROUP BY week_start_date
      ORDER BY week_start_date
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate) as WeeklyFTEResult[];
  }

  /**
   * Get FTE summary statistics
   */
  getFTESummary(startDate: string, endDate: string) {
    const query = `
      SELECT
        ROUND(AVG(weekly_hours) / 40.0, 2) as avgFTE,
        ROUND(MAX(weekly_hours) / 40.0, 2) as peakFTE,
        ROUND(MIN(weekly_hours) / 40.0, 2) as minFTE
      FROM (
        SELECT week_start_date, SUM(hours) as weekly_hours
        FROM hours
        WHERE week_start_date >= ? AND week_start_date <= ?
        GROUP BY week_start_date
      )
    `;

    const stmt = db.prepare(query);
    return stmt.get(startDate, endDate);
  }

  /**
   * Get utilization distribution
   */
  getUtilizationDistribution(startDate: string, endDate: string): UtilizationBucketResult[] {
    const query = `
      WITH resource_weeks AS (
        SELECT
          employee_id,
          resource_name,
          week_start_date,
          SUM(hours) as weekly_hours,
          ROUND((SUM(hours) / 40.0) * 100, 1) as utilization_pct
        FROM hours
        WHERE week_start_date >= ? AND week_start_date <= ?
        GROUP BY employee_id, resource_name, week_start_date
      )
      SELECT
        CASE
          WHEN utilization_pct < 25 THEN '0-25%'
          WHEN utilization_pct < 50 THEN '25-50%'
          WHEN utilization_pct < 75 THEN '50-75%'
          WHEN utilization_pct < 100 THEN '75-100%'
          WHEN utilization_pct < 125 THEN '100-125%'
          ELSE '125%+'
        END as bucket,
        COUNT(*) as count
      FROM resource_weeks
      GROUP BY bucket
      ORDER BY
        CASE bucket
          WHEN '0-25%' THEN 1
          WHEN '25-50%' THEN 2
          WHEN '50-75%' THEN 3
          WHEN '75-100%' THEN 4
          WHEN '100-125%' THEN 5
          ELSE 6
        END
    `;

    const stmt = db.prepare(query);
    const results = stmt.all(startDate, endDate) as UtilizationBucketResult[];

    // Calculate percentages
    const total = results.reduce((sum, r) => sum + r.count, 0);
    return results.map(r => ({
      ...r,
      percentage: total > 0 ? Math.round((r.count / total) * 100 * 10) / 10 : 0
    }));
  }

  /**
   * Get over-allocated pools
   */
  getOverAllocatedPools(startDate: string, endDate: string, threshold: number = 40): OverAllocatedPoolResult[] {
    const query = `
      SELECT
        resource_name as resourceName,
        week_start_date as weekStartDate,
        SUM(hours) as totalHours,
        ROUND(SUM(hours) / 40.0, 1) as impliedFTE,
        GROUP_CONCAT(DISTINCT project) as projects
      FROM hours
      WHERE (
        resource_name LIKE '%General%'
        OR resource_name LIKE '%Pool%'
        OR resource_name LIKE '%TBD%'
        OR resource_name LIKE '%Placeholder%'
        OR resource_name LIKE '%Offshore%'
        OR employee_id LIKE '9999999%'
      )
      AND week_start_date >= ? AND week_start_date <= ?
      GROUP BY resource_name, week_start_date
      HAVING SUM(hours) > ?
      ORDER BY totalHours DESC
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate, threshold) as OverAllocatedPoolResult[];
  }

  /**
   * Get over-allocated individuals
   */
  getOverAllocatedIndividuals(startDate: string, endDate: string, threshold: number = 45): OverAllocatedIndividualResult[] {
    const query = `
      SELECT
        employee_id as employeeId,
        resource_name as resourceName,
        week_start_date as weekStartDate,
        SUM(hours) as totalHours,
        SUM(hours) - ? as hoursOver,
        CASE
          WHEN SUM(hours) > 55 THEN 'Critical'
          WHEN SUM(hours) > 45 THEN 'Warning'
          ELSE 'Normal'
        END as riskLevel,
        GROUP_CONCAT(DISTINCT project) as projects
      FROM hours
      WHERE employee_id NOT LIKE '9999999%'
        AND resource_name NOT LIKE '%General%'
        AND resource_name NOT LIKE '%Pool%'
        AND resource_name NOT LIKE '%TBD%'
        AND week_start_date >= ? AND week_start_date <= ?
      GROUP BY employee_id, resource_name, week_start_date
      HAVING SUM(hours) > ?
      ORDER BY totalHours DESC
    `;

    const stmt = db.prepare(query);
    return stmt.all(threshold, startDate, endDate, threshold) as OverAllocatedIndividualResult[];
  }

  /**
   * Get under-allocated resources
   */
  getUnderAllocatedResources(
    startDate: string,
    endDate: string,
    utilizationThreshold: number = 60,
    minWeeks: number = 4
  ): UnderAllocatedResourceResult[] {
    const query = `
      WITH resource_stats AS (
        SELECT
          employee_id,
          resource_name,
          AVG(weekly_hours) as avg_hours,
          COUNT(*) as weeks_count,
          ROUND(AVG(weekly_hours) / 40.0 * 100, 1) as avg_utilization_pct
        FROM (
          SELECT
            employee_id,
            resource_name,
            week_start_date,
            SUM(hours) as weekly_hours
          FROM hours
          WHERE week_start_date >= ? AND week_start_date <= ?
          GROUP BY employee_id, resource_name, week_start_date
        )
        GROUP BY employee_id, resource_name
        HAVING COUNT(*) >= ?
      )
      SELECT
        employee_id as employeeId,
        resource_name as resourceName,
        ROUND(avg_hours, 1) as avgHoursPerWeek,
        avg_utilization_pct as avgUtilizationPct,
        weeks_count as weeksCount
      FROM resource_stats
      WHERE avg_utilization_pct < ?
      ORDER BY avg_utilization_pct ASC
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate, minWeeks, utilizationThreshold) as UnderAllocatedResourceResult[];
  }

  /**
   * Get heatmap data for top resources
   */
  getHeatmapData(startDate: string, endDate: string, topN: number = 20): HeatmapDataResult[] {
    const query = `
      WITH peak_demand AS (
        SELECT
          employee_id,
          resource_name,
          MAX(weekly_hours) as peak_hours
        FROM (
          SELECT
            employee_id,
            resource_name,
            week_start_date,
            SUM(hours) as weekly_hours
          FROM hours
          WHERE week_start_date >= ? AND week_start_date <= ?
          GROUP BY employee_id, resource_name, week_start_date
        )
        GROUP BY employee_id, resource_name
        ORDER BY peak_hours DESC
        LIMIT ?
      )
      SELECT
        h.employee_id as employeeId,
        h.resource_name as resourceName,
        h.week_start_date as weekStartDate,
        SUM(h.hours) as hours,
        ROUND(SUM(h.hours) / 40.0 * 100, 0) as utilizationPct
      FROM hours h
      INNER JOIN peak_demand pd ON h.employee_id = pd.employee_id
      WHERE h.week_start_date >= ? AND h.week_start_date <= ?
      GROUP BY h.employee_id, h.resource_name, h.week_start_date
      ORDER BY pd.peak_hours DESC, h.week_start_date
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate, topN, startDate, endDate) as HeatmapDataResult[];
  }

  /**
   * Get demand realism metrics
   */
  getDemandRealismMetrics(startDate: string, endDate: string): DemandRealismResult {
    const query = `
      SELECT
        SUM(hours) as totalHours,
        ROUND(SUM(hours) / 40.0 / 26, 1) as avgWeeklyFTE,
        COUNT(DISTINCT employee_id) as uniqueResources,
        COUNT(DISTINCT project) as uniqueProjects
      FROM hours
      WHERE week_start_date >= ? AND week_start_date <= ?
    `;

    const stmt = db.prepare(query);
    return stmt.get(startDate, endDate) as DemandRealismResult;
  }

  /**
   * Get pool vs named breakdown
   */
  getPoolVsNamedBreakdown(startDate: string, endDate: string) {
    const query = `
      SELECT
        CASE
          WHEN employee_id LIKE '9999999%'
            OR resource_name LIKE '%General%'
            OR resource_name LIKE '%Pool%'
            OR resource_name LIKE '%TBD%'
          THEN 'Pool/Placeholder'
          ELSE 'Named Resource'
        END as resourceType,
        SUM(hours) as totalHours,
        ROUND(SUM(hours) * 100.0 / (SELECT SUM(hours) FROM hours WHERE week_start_date >= ? AND week_start_date <= ?), 1) as pctOfTotal
      FROM hours
      WHERE week_start_date >= ? AND week_start_date <= ?
      GROUP BY resourceType
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate, startDate, endDate);
  }

  /**
   * Get demand type breakdown
   */
  getDemandTypeBreakdown(startDate: string, endDate: string) {
    const query = `
      SELECT
        demand_type as demandType,
        SUM(hours) as totalHours,
        ROUND(SUM(hours) * 100.0 / (SELECT SUM(hours) FROM hours WHERE week_start_date >= ? AND week_start_date <= ?), 1) as pctOfTotal
      FROM hours
      WHERE week_start_date >= ? AND week_start_date <= ?
      GROUP BY demand_type
    `;

    const stmt = db.prepare(query);
    return stmt.all(startDate, endDate, startDate, endDate);
  }

  /**
   * Get list of unique projects
   */
  getProjects(): string[] {
    const query = 'SELECT DISTINCT project FROM hours ORDER BY project';
    const stmt = db.prepare(query);
    const results = stmt.all() as { project: string }[];
    return results.map(r => r.project);
  }

  /**
   * Get list of unique phases
   */
  getPhases(): string[] {
    const query = 'SELECT DISTINCT phase FROM hours WHERE phase IS NOT NULL AND phase != "" ORDER BY phase';
    const stmt = db.prepare(query);
    const results = stmt.all() as { phase: string }[];
    return results.map(r => r.phase);
  }

  /**
   * Get date range of data
   */
  getDataDateRange() {
    const query = `
      SELECT
        MIN(week_start_date) as earliestDate,
        MAX(week_start_date) as latestDate,
        COUNT(DISTINCT week_start_date) as weekCount
      FROM hours
    `;

    const stmt = db.prepare(query);
    return stmt.get();
  }
}

export const analyticsService = new AnalyticsService();
