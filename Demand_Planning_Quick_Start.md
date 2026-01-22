# Quick Start: Demand Planning Analytics App

## What to Build

A React web application for demand planning analytics that:
1. Parses budget tracker Excel files to extract hours data
2. Displays 8 interactive dashboards for capacity planning
3. Embeds in Microsoft Teams and SharePoint

---

## Step 1: Excel Parser

Create a parser that reads budget tracker .xlsx files with this structure:

```
Detail Sheet:
- Row 3: Week dates (columns H onwards)
- Row 4: Phase names (columns H onwards)  
- Row 5: Milestone names (columns H onwards)
- Row 6+: Employee data rows

Column Structure:
- A: Activity/Role
- B: Employee ID (can be 10+ digits - use string)
- C: Resource Name
- D: Rate
- E: Activity ID
- H+: Hours per week
```

**Extraction Rules:**
- Only process Row 6 onwards for employee data
- Skip if Employee ID (col B) is empty
- Skip if Hours <= 0 or > 500
- Skip date columns outside 2020-2035
- Get Phase from Row 4, Milestone from Row 5 at each date column

---

## Step 2: Data Model

```typescript
interface HoursRecord {
  project: string;           // Row 1, Col A
  employeeId: string;        // Row N, Col B (string for large IDs)
  resourceName: string;      // Row N, Col C
  rate: number;              // Row N, Col D
  activityId: string;        // Row N, Col E
  weekStartDate: Date;       // Row 3, Col X (adjusted to Sunday)
  actualOrProposed: 'A'|'P'; // Row 1, Col X
  hours: number;             // Row N, Col X
  demandType: 'Hard'|'Soft';
  projectId: string;         // Row 1, Col B
  phase: string;             // Row 4, Col X
  milestone: string;         // Row 5, Col X
}
```

---

## Step 3: Build These 8 Dashboards

### 1. Weekly Demand Trend
- Line chart: Total hours by week (26-week horizon)
- Show peak week, average, trend direction

### 2. Implied FTE Requirement  
- Line chart: Hours / 40 = FTE needed per week
- Show peak FTE, average FTE

### 3. Utilization Distribution
- Histogram with buckets: 0-25%, 25-50%, 50-75%, 75-100%, 100-125%, 125%+
- Utilization = Weekly Hours / 40

### 4. Over-Allocated Pools
- Table: Resource pools (names like "FNC - General", IDs starting "9999999") with >40 hrs/week
- Show: Pool Name, Week, Hours, Implied FTE Needed

### 5. Over-Allocated Individuals
- Table: Named people with >45 hrs/week
- Risk levels: 🟢 ≤45, 🟡 45-55, 🔴 >55 hours

### 6. Under-Allocated Resources
- Table: Resources averaging <60% utilization
- Show: Name, Avg Hours, Avg Utilization %, Weeks

### 7. Resource Heatmap
- Grid: Top 20 resources × weeks
- Cell color by utilization (white→blue→orange→red)

### 8. Demand Realism Score
- Summary cards: Total hours, Implied FTE, Pool %, Named %
- Pie chart: Hard vs Soft demand
- Warning list for data quality issues

---

## Step 4: UI Layout

```
┌─────────────────────────────────────────────────┐
│ [Logo] Demand Planning    [Filters] [Date Range]│
├─────────┬───────────────────────────────────────┤
│ 📊 Dash │                                       │
│ 📈 Trend│     Main Content Area                 │
│ 👥 Util │                                       │
│ ⚠️ Over │     (Charts, Tables, Heatmaps)        │
│ 📉 Under│                                       │
│ 🗓️ Heat │                                       │
│ ✅ Valid│                                       │
│ 📤 Upload                                       │
└─────────┴───────────────────────────────────────┘
```

---

## Step 5: Tech Stack

```json
{
  "frontend": {
    "framework": "React 18 + TypeScript",
    "styling": "Tailwind CSS",
    "charts": "Recharts",
    "tables": "TanStack Table",
    "icons": "Lucide React",
    "excel": "SheetJS (xlsx)"
  },
  "backend": {
    "runtime": "Node.js",
    "framework": "Express",
    "database": "SQLite (better-sqlite3)"
  }
}
```

---

## Step 6: Key Calculations

```typescript
// FTE Calculation
const impliedFTE = weeklyHours / 40;

// Utilization Calculation
const utilizationPct = (weeklyHours / standardCapacity) * 100;

// Pool Detection
const isPool = (name: string, id: string) => 
  /General|Pool|TBD|Placeholder|Offshore/i.test(name) ||
  id.startsWith('9999999');

// Over-allocation Detection
const isOverAllocated = (hours: number) => hours > 45;
const isCritical = (hours: number) => hours > 55;

// Under-utilization Detection  
const isUnderUtilized = (avgUtilization: number) => avgUtilization < 0.6;
```

---

## Step 7: File Upload Flow

1. User drops Excel file(s)
2. Parse with SheetJS
3. Extract hours per the rules
4. Insert into SQLite database
5. Show success/error summary
6. Refresh dashboards

---

## Step 8: Teams/SharePoint Embed

The app must work when embedded via iframe:
- No popup windows
- Responsive to container size
- Handle postMessage for Teams SDK if needed
- Support `?embed=true` query param for minimal chrome

---

## Start Building

Begin with:
1. File upload component + Excel parser
2. Hours data display table (prove extraction works)
3. Weekly trend chart
4. Then add remaining dashboards

Use this as the foundation - all dashboards derive from the Hours table.
