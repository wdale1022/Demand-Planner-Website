-- Demand Planning Analytics Database Schema

-- Main Hours table - stores all demand/capacity data extracted from budget trackers
CREATE TABLE IF NOT EXISTS hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    rate REAL,
    activity_id TEXT,
    week_start_date TEXT NOT NULL,  -- ISO format: YYYY-MM-DD (always Sunday)
    actual_or_proposed TEXT CHECK(actual_or_proposed IN ('A', 'P')),
    hours REAL NOT NULL CHECK(hours >= 0 AND hours <= 500),
    demand_type TEXT CHECK(demand_type IN ('Hard Demand', 'Soft Demand')),
    project_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    phase TEXT,
    milestone TEXT
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_hours_week ON hours(week_start_date);
CREATE INDEX IF NOT EXISTS idx_hours_employee ON hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_hours_resource ON hours(resource_name);
CREATE INDEX IF NOT EXISTS idx_hours_project ON hours(project);
CREATE INDEX IF NOT EXISTS idx_hours_demand_type ON hours(demand_type);
CREATE INDEX IF NOT EXISTS idx_hours_week_employee ON hours(week_start_date, employee_id);

-- Resources reference table (optional - for future enhancement)
CREATE TABLE IF NOT EXISTS resources (
    employee_id TEXT PRIMARY KEY,
    resource_name TEXT NOT NULL,
    primary_role TEXT,
    employee_type TEXT CHECK(employee_type IN ('INTERNAL', 'CONTRACTOR')),
    location_type TEXT CHECK(location_type IN ('Onshore', 'Offshore')),
    standard_capacity REAL DEFAULT 40.0
);

-- Projects reference table (optional - for future enhancement)
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    client_name TEXT,
    status TEXT,
    start_date TEXT,
    end_date TEXT
);

-- Upload tracking table
CREATE TABLE IF NOT EXISTS file_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    records_imported INTEGER DEFAULT 0,
    errors TEXT,
    warnings TEXT
);
