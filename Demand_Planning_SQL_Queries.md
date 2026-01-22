# SQL Queries for Demand Planning Dashboards

## Base Table Schema

```sql
CREATE TABLE hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT,
    employee_id TEXT,
    resource_name TEXT,
    rate REAL,
    activity_id TEXT,
    week_start_date TEXT,  -- ISO format: YYYY-MM-DD
    actual_or_proposed TEXT,
    hours REAL,
    demand_type TEXT,
    project_id TEXT,
    created_at TEXT,
    phase TEXT,
    milestone TEXT
);

-- Index for common queries
CREATE INDEX idx_hours_week ON hours(week_start_date);
CREATE INDEX idx_hours_employee ON hours(employee_id);
CREATE INDEX idx_hours_resource ON hours(resource_name);
```

---

## 1. Weekly Demand Hours Trend

```sql
-- Total hours by week
SELECT 
    week_start_date,
    SUM(hours) as total_hours,
    COUNT(DISTINCT employee_id) as resource_count,
    COUNT(DISTINCT project) as project_count
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY week_start_date
ORDER BY week_start_date;

-- By demand type
SELECT 
    week_start_date,
    demand_type,
    SUM(hours) as total_hours
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY week_start_date, demand_type
ORDER BY week_start_date;

-- By project
SELECT 
    week_start_date,
    project,
    SUM(hours) as total_hours
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY week_start_date, project
ORDER BY week_start_date, project;
```

---

## 2. Implied FTE Requirement

```sql
-- Weekly FTE calculation
SELECT 
    week_start_date,
    SUM(hours) as total_hours,
    ROUND(SUM(hours) / 40.0, 2) as implied_fte
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY week_start_date
ORDER BY week_start_date;

-- Summary statistics
SELECT 
    ROUND(AVG(weekly_hours) / 40.0, 2) as avg_fte,
    ROUND(MAX(weekly_hours) / 40.0, 2) as peak_fte,
    ROUND(MIN(weekly_hours) / 40.0, 2) as min_fte
FROM (
    SELECT week_start_date, SUM(hours) as weekly_hours
    FROM hours
    WHERE week_start_date >= date('now')
      AND week_start_date <= date('now', '+182 days')
    GROUP BY week_start_date
);
```

---

## 3. Resource-Week Utilization Distribution

```sql
-- Calculate utilization for each resource-week
WITH resource_weeks AS (
    SELECT 
        employee_id,
        resource_name,
        week_start_date,
        SUM(hours) as weekly_hours,
        ROUND((SUM(hours) / 40.0) * 100, 1) as utilization_pct
    FROM hours
    WHERE week_start_date >= date('now')
      AND week_start_date <= date('now', '+182 days')
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
    END as utilization_bucket,
    COUNT(*) as resource_week_count
FROM resource_weeks
GROUP BY utilization_bucket
ORDER BY 
    CASE utilization_bucket
        WHEN '0-25%' THEN 1
        WHEN '25-50%' THEN 2
        WHEN '50-75%' THEN 3
        WHEN '75-100%' THEN 4
        WHEN '100-125%' THEN 5
        ELSE 6
    END;
```

---

## 4. Over-Allocated Pools

```sql
-- Identify pool/placeholder resources with >40 hours/week
SELECT 
    resource_name,
    week_start_date,
    SUM(hours) as total_hours,
    ROUND(SUM(hours) / 40.0, 1) as implied_fte_needed,
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
AND week_start_date >= date('now')
AND week_start_date <= date('now', '+182 days')
GROUP BY resource_name, week_start_date
HAVING SUM(hours) > 40
ORDER BY total_hours DESC;
```

---

## 5. Over-Allocated Named Individuals

```sql
-- Named individuals (not pools) with >45 hours/week
SELECT 
    employee_id,
    resource_name,
    week_start_date,
    SUM(hours) as total_hours,
    SUM(hours) - 45 as hours_over,
    CASE 
        WHEN SUM(hours) > 55 THEN 'Critical'
        WHEN SUM(hours) > 45 THEN 'Warning'
        ELSE 'Normal'
    END as risk_level,
    GROUP_CONCAT(DISTINCT project) as projects
FROM hours
WHERE employee_id NOT LIKE '9999999%'
  AND resource_name NOT LIKE '%General%'
  AND resource_name NOT LIKE '%Pool%'
  AND resource_name NOT LIKE '%TBD%'
  AND week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY employee_id, resource_name, week_start_date
HAVING SUM(hours) > 45
ORDER BY total_hours DESC;
```

---

## 6. Under-Allocated Resources

```sql
-- Resources with average utilization <60%
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
        WHERE week_start_date >= date('now')
          AND week_start_date <= date('now', '+182 days')
        GROUP BY employee_id, resource_name, week_start_date
    )
    GROUP BY employee_id, resource_name
    HAVING COUNT(*) >= 4  -- Minimum 4 weeks of data
)
SELECT 
    employee_id,
    resource_name,
    ROUND(avg_hours, 1) as avg_hours_per_week,
    avg_utilization_pct,
    weeks_count
FROM resource_stats
WHERE avg_utilization_pct < 60
ORDER BY avg_utilization_pct ASC;
```

---

## 7. High-Demand Heatmap Data

```sql
-- Get top 20 resources by peak demand with weekly breakdown
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
        WHERE week_start_date >= date('now')
          AND week_start_date <= date('now', '+182 days')
        GROUP BY employee_id, resource_name, week_start_date
    )
    GROUP BY employee_id, resource_name
    ORDER BY peak_hours DESC
    LIMIT 20
)
SELECT 
    h.employee_id,
    h.resource_name,
    h.week_start_date,
    SUM(h.hours) as hours,
    ROUND(SUM(h.hours) / 40.0 * 100, 0) as utilization_pct
FROM hours h
INNER JOIN peak_demand pd ON h.employee_id = pd.employee_id
WHERE h.week_start_date >= date('now')
  AND h.week_start_date <= date('now', '+182 days')
GROUP BY h.employee_id, h.resource_name, h.week_start_date
ORDER BY pd.peak_hours DESC, h.week_start_date;
```

---

## 8. Demand Realism Validation

```sql
-- Overall metrics
SELECT 
    SUM(hours) as total_hours,
    ROUND(SUM(hours) / 40.0 / 26, 1) as avg_weekly_fte,
    COUNT(DISTINCT employee_id) as unique_resources,
    COUNT(DISTINCT project) as unique_projects
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days');

-- Pool vs Named breakdown
SELECT 
    CASE 
        WHEN employee_id LIKE '9999999%' 
          OR resource_name LIKE '%General%'
          OR resource_name LIKE '%Pool%'
          OR resource_name LIKE '%TBD%'
        THEN 'Pool/Placeholder'
        ELSE 'Named Resource'
    END as resource_type,
    SUM(hours) as total_hours,
    ROUND(SUM(hours) * 100.0 / (SELECT SUM(hours) FROM hours), 1) as pct_of_total
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY resource_type;

-- Demand type breakdown
SELECT 
    demand_type,
    SUM(hours) as total_hours,
    ROUND(SUM(hours) * 100.0 / (SELECT SUM(hours) FROM hours), 1) as pct_of_total
FROM hours
WHERE week_start_date >= date('now')
  AND week_start_date <= date('now', '+182 days')
GROUP BY demand_type;

-- Over-allocation count by week
SELECT 
    week_start_date,
    COUNT(*) as over_allocated_count
FROM (
    SELECT week_start_date, employee_id, SUM(hours) as weekly_hours
    FROM hours
    WHERE week_start_date >= date('now')
      AND week_start_date <= date('now', '+182 days')
    GROUP BY week_start_date, employee_id
    HAVING weekly_hours > 45
)
GROUP BY week_start_date
ORDER BY week_start_date;
```

---

## Utility Queries

### Clear All Data
```sql
DELETE FROM hours;
```

### Get Date Range
```sql
SELECT 
    MIN(week_start_date) as earliest_date,
    MAX(week_start_date) as latest_date,
    COUNT(DISTINCT week_start_date) as week_count
FROM hours;
```

### Project Summary
```sql
SELECT 
    project,
    project_id,
    SUM(hours) as total_hours,
    COUNT(DISTINCT employee_id) as resource_count,
    MIN(week_start_date) as start_date,
    MAX(week_start_date) as end_date
FROM hours
GROUP BY project, project_id
ORDER BY total_hours DESC;
```

### Resource Summary
```sql
SELECT 
    employee_id,
    resource_name,
    SUM(hours) as total_hours,
    COUNT(DISTINCT project) as project_count,
    COUNT(DISTINCT week_start_date) as weeks_active
FROM hours
GROUP BY employee_id, resource_name
ORDER BY total_hours DESC;
```
