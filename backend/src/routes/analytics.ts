import express from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { getDefaultDateRange } from '../models/database.js';

const router = express.Router();

/**
 * GET /api/analytics/demand-trend
 * Get weekly demand hours trend
 */
router.get('/demand-trend', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const demandType = req.query.demandType as string | undefined;

    const data = analyticsService.getWeeklyDemandTrend(startDate, endDate, demandType);

    res.json(data);
  } catch (error) {
    console.error('Demand trend error:', error);
    res.status(500).json({ error: 'Failed to fetch demand trend data' });
  }
});

/**
 * GET /api/analytics/demand-by-type
 * Get weekly demand broken down by type
 */
router.get('/demand-by-type', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const data = analyticsService.getWeeklyDemandByType(startDate, endDate);

    res.json(data);
  } catch (error) {
    console.error('Demand by type error:', error);
    res.status(500).json({ error: 'Failed to fetch demand by type data' });
  }
});

/**
 * GET /api/analytics/implied-fte
 * Get implied FTE requirements
 */
router.get('/implied-fte', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const data = analyticsService.getImpliedFTE(startDate, endDate);
    const summary = analyticsService.getFTESummary(startDate, endDate);

    res.json({ data, summary });
  } catch (error) {
    console.error('Implied FTE error:', error);
    res.status(500).json({ error: 'Failed to fetch FTE data' });
  }
});

/**
 * GET /api/analytics/utilization-distribution
 * Get utilization distribution histogram
 */
router.get('/utilization-distribution', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const data = analyticsService.getUtilizationDistribution(startDate, endDate);

    res.json(data);
  } catch (error) {
    console.error('Utilization distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch utilization data' });
  }
});

/**
 * GET /api/analytics/over-allocated-pools
 * Get over-allocated resource pools
 */
router.get('/over-allocated-pools', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 40;

    const data = analyticsService.getOverAllocatedPools(startDate, endDate, threshold);

    res.json(data);
  } catch (error) {
    console.error('Over-allocated pools error:', error);
    res.status(500).json({ error: 'Failed to fetch over-allocated pools data' });
  }
});

/**
 * GET /api/analytics/over-allocated-individuals
 * Get over-allocated individuals
 */
router.get('/over-allocated-individuals', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 45;

    const data = analyticsService.getOverAllocatedIndividuals(startDate, endDate, threshold);

    res.json(data);
  } catch (error) {
    console.error('Over-allocated individuals error:', error);
    res.status(500).json({ error: 'Failed to fetch over-allocated individuals data' });
  }
});

/**
 * GET /api/analytics/under-allocated
 * Get under-allocated resources
 */
router.get('/under-allocated', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const utilizationThreshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 60;
    const minWeeks = req.query.minWeeks ? parseInt(req.query.minWeeks as string) : 4;

    const data = analyticsService.getUnderAllocatedResources(startDate, endDate, utilizationThreshold, minWeeks);

    res.json(data);
  } catch (error) {
    console.error('Under-allocated error:', error);
    res.status(500).json({ error: 'Failed to fetch under-allocated resources data' });
  }
});

/**
 * GET /api/analytics/heatmap
 * Get resource heatmap data
 */
router.get('/heatmap', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const topN = req.query.topN ? parseInt(req.query.topN as string) : 20;

    const data = analyticsService.getHeatmapData(startDate, endDate, topN);

    res.json(data);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

/**
 * GET /api/analytics/demand-realism
 * Get demand realism metrics
 */
router.get('/demand-realism', (req, res) => {
  try {
    const { startDate, endDate } = req.query.startDate && req.query.endDate
      ? { startDate: req.query.startDate as string, endDate: req.query.endDate as string }
      : getDefaultDateRange();

    const metrics = analyticsService.getDemandRealismMetrics(startDate, endDate);
    const poolVsNamed = analyticsService.getPoolVsNamedBreakdown(startDate, endDate);
    const demandTypeBreakdown = analyticsService.getDemandTypeBreakdown(startDate, endDate);

    // Calculate realism score
    const poolRow = poolVsNamed.find((r: any) => r.resourceType === 'Pool/Placeholder');
    const namedRow = poolVsNamed.find((r: any) => r.resourceType === 'Named Resource');

    const poolPct = poolRow?.pctOfTotal || 0;
    const namedPct = namedRow?.pctOfTotal || 0;

    // Simple realism score (higher is better)
    // Based on: named resources %, optimal utilization %, and low over-allocation
    const realismScore = Math.round(namedPct * 0.6 + 40); // Simplified calculation

    res.json({
      ...metrics,
      poolVsNamed,
      demandTypeBreakdown,
      realismScore,
    });
  } catch (error) {
    console.error('Demand realism error:', error);
    res.status(500).json({ error: 'Failed to fetch demand realism data' });
  }
});

/**
 * GET /api/analytics/filters/projects
 * Get list of available projects
 */
router.get('/filters/projects', (req, res) => {
  try {
    const projects = analyticsService.getProjects();
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/analytics/filters/phases
 * Get list of available phases
 */
router.get('/filters/phases', (req, res) => {
  try {
    const phases = analyticsService.getPhases();
    res.json(phases);
  } catch (error) {
    console.error('Get phases error:', error);
    res.status(500).json({ error: 'Failed to fetch phases' });
  }
});

/**
 * GET /api/analytics/date-range
 * Get available date range of data
 */
router.get('/date-range', (req, res) => {
  try {
    const dateRange = analyticsService.getDataDateRange();
    res.json(dateRange);
  } catch (error) {
    console.error('Get date range error:', error);
    res.status(500).json({ error: 'Failed to fetch date range' });
  }
});

export default router;
