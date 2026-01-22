# Demand Planning Analytics Dashboard

A comprehensive web-based application for analyzing resource capacity, demand forecasting, and utilization planning. Built with React, TypeScript, Node.js, and SQLite.

## Features

### 📊 8 Interactive Dashboards

1. **Dashboard Overview** - Summary metrics and quick access to all analytics
2. **Weekly Demand Trend** - Line chart showing total hours demand over time
3. **Implied FTE Requirements** - Calculate required headcount based on demand
4. **Utilization Distribution** - Histogram of resource-week utilization buckets
5. **Over-Allocated Resources** - Identify pools and individuals exceeding capacity
6. **Under-Allocated Resources** - Find resources with low utilization
7. **Resource Heatmap** - Visual week-by-week capacity planning grid
8. **Demand Realism Validation** - Data quality metrics and insights

### 🎯 Key Capabilities

- **Excel File Processing** - Upload budget tracker .xlsx files with drag-and-drop
- **Automatic Data Extraction** - Parse hours data following specific VBA extraction rules
- **Interactive Filtering** - Date range, demand type, and project filters
- **Real-time Analytics** - Instant dashboard updates based on uploaded data
- **Teams/SharePoint Ready** - Designed for Microsoft integration

## Architecture

```
demand-planning-app/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/   # Dashboard pages
│   │   │   ├── Charts/      # Recharts visualizations
│   │   │   ├── Tables/      # Data tables
│   │   │   ├── Upload/      # File upload UI
│   │   │   └── Layout/      # Sidebar, Header
│   │   ├── services/        # API clients
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Helper functions
│   └── package.json
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── excelParser.ts      # Excel file parsing
│   │   │   └── analyticsService.ts # SQL queries
│   │   └── models/          # Database connection
│   └── package.json
├── database/
│   └── schema.sql          # SQLite schema
└── README.md
```

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualizations
- **React Router** - Navigation
- **SheetJS (xlsx)** - Excel file parsing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **better-sqlite3** - Database (fast, embedded)
- **Multer** - File upload handling
- **CORS** - Cross-origin support

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Demand-Planner-Website
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend will start on **http://localhost:3001**

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will start on **http://localhost:3000**

### Step 4: Open Application

Navigate to **http://localhost:3000** in your browser.

## Usage Guide

### 1. Upload Budget Tracker Files

1. Go to **Upload Data** in the sidebar
2. Select **Hard Demand** or **Soft Demand**
3. Drag and drop Excel files or click to browse
4. Click **Upload** to process files
5. Review import results and any warnings/errors

### 2. Excel File Requirements

Budget tracker files must have a **"Detail"** sheet with this structure:

| Row | Content | Description |
|-----|---------|-------------|
| 1 | Header | Project Name (Col A), Project ID (Col B), A/P indicators |
| 2 | Sub-header | Labels like "Week Ending" |
| 3 | **Week Dates** | Date values for each week (starting Col H) |
| 4 | **Phases** | Phase name for each week column |
| 5 | **Milestones** | Milestone name for each week column |
| 6+ | **Data Rows** | Employee hours by week |

**Data Row Columns:**
- Col A: Activity/Role
- Col B: Employee ID
- Col C: Resource Name
- Col D: Rate
- Col E: Activity ID
- Col H+: Hours per week

### 3. Explore Dashboards

- **Dashboard** - Overview and quick links
- **Demand Trend** - View weekly hours forecast with peak/average metrics
- **Utilization** - See how resources are distributed across utilization buckets
- **Over-Allocations** - Identify overbooked pools and individuals
- **Under-Allocations** - Find resources with capacity to take on more work
- **Heatmap** - Visual grid of top 20 resources by peak demand
- **Realism Check** - Assess data quality with pool vs named resource breakdown

### 4. Apply Filters

Use the header filters to:
- Adjust date range (default: today + 26 weeks)
- Filter by demand type (Hard/Soft/Both)
- Focus on specific projects or phases

## Database Schema

### Hours Table

```sql
CREATE TABLE hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    rate REAL,
    activity_id TEXT,
    week_start_date TEXT NOT NULL,  -- YYYY-MM-DD (Sunday)
    actual_or_proposed TEXT CHECK(actual_or_proposed IN ('A', 'P')),
    hours REAL NOT NULL CHECK(hours >= 0 AND hours <= 500),
    demand_type TEXT CHECK(demand_type IN ('Hard Demand', 'Soft Demand')),
    project_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    phase TEXT,
    milestone TEXT
);
```

## API Endpoints

### Upload
- `POST /api/upload` - Upload Excel files
- `DELETE /api/upload/clear` - Clear all data
- `GET /api/upload/history` - Get upload history

### Analytics
- `GET /api/analytics/demand-trend` - Weekly demand hours
- `GET /api/analytics/implied-fte` - FTE requirements
- `GET /api/analytics/utilization-distribution` - Utilization histogram
- `GET /api/analytics/over-allocated-pools` - Over-allocated resource pools
- `GET /api/analytics/over-allocated-individuals` - Over-allocated people
- `GET /api/analytics/under-allocated` - Under-utilized resources
- `GET /api/analytics/heatmap` - Heatmap data for top resources
- `GET /api/analytics/demand-realism` - Demand quality metrics
- `GET /api/analytics/filters/projects` - List of projects
- `GET /api/analytics/filters/phases` - List of phases

## Excel Parser Logic

The Excel parser follows these extraction rules:

1. **Start reading data from Row 6** (rows 1-5 are headers)
2. **Skip rows** where Employee ID (Col B) is empty
3. **Skip columns** where Row 3 is not a valid date
4. **Skip hours** that are ≤0 or >500
5. **Date validation** - Only dates between 2020-2035
6. **Employee IDs** stored as strings (can be 10+ digits)
7. **Extract Phase** from Row 4 at each date column
8. **Extract Milestone** from Row 5 at each date column
9. **Week dates** adjusted to start of week (Sunday)

## Configuration

Default settings in `frontend/src/types/index.ts`:

```typescript
{
  capacitySettings: {
    standardWeeklyHours: 40,
    overAllocationThreshold: 45,
    underUtilizationThreshold: 0.6,
    severeOverAllocationThreshold: 55
  },
  displaySettings: {
    forecastHorizonWeeks: 26,
    heatmapResourceCount: 20,
    minWeeksForAnalysis: 4
  }
}
```

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with a static file server
```

## Microsoft Teams/SharePoint Integration

The application is designed to work as an embedded iframe:

1. **Teams Tab**: Use the Teams App Studio to create a custom tab pointing to your deployed URL
2. **SharePoint Web Part**: Embed using an iframe web part

Key considerations:
- Supports `?embed=true` query parameter for minimal chrome
- Responsive design works on desktop, tablet, and mobile
- No popups or external windows
- CORS configured for Teams/SharePoint domains

## Troubleshooting

### Backend won't start
- Check Node.js version (18+ required)
- Verify all dependencies installed: `cd backend && npm install`
- Check port 3001 is available

### Frontend won't start
- Verify all dependencies installed: `cd frontend && npm install`
- Check port 3000 is available
- Clear Vite cache: `rm -rf node_modules/.vite`

### Excel files not parsing
- Ensure "Detail" sheet exists in workbook
- Check Row 3 contains valid dates starting from Column H
- Verify Employee IDs are in Column B (Row 6+)
- Review upload errors in the UI after upload

### No data in dashboards
- Upload budget tracker files first (Upload Data page)
- Check date range filter matches uploaded data dates
- Verify data was imported successfully (check upload results)

## Development

### Run Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Lint Code
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Review the Quick Start guide in `Demand_Planning_Quick_Start.md`
- Check SQL queries reference in `Demand_Planning_SQL_Queries.md`

## Roadmap

Future enhancements:
- [ ] Export dashboards to PDF/PowerPoint
- [ ] Scheduled email reports
- [ ] Advanced resource pool management
- [ ] Multi-project comparison view
- [ ] Azure AD / SSO integration
- [ ] Real-time collaboration features
