# CLAUDE.md - AI Assistant Guide for Demand Planner Website

## Project Overview

**Project Name:** Demand Planner Website
**Current State:** Early initialization phase
**Purpose:** Web-based demand planning application for forecasting, inventory management, and supply chain optimization

## Repository Status

### Current State (as of 2026-01-22)

- **Development Stage:** Initial repository setup
- **Tracked Files:** README.md only
- **No codebase yet:** Technology stack and architecture to be determined
- **No dependencies:** Package management not yet configured
- **No build system:** Build tools and configuration pending

### Git Information

- **Main Branch:** Not yet established
- **Current Branch:** `claude/claude-md-mkpyf6782iftztj2-ylwaL`
- **Commit History:** Single initial commit (c8a00c5)

## Recommended Architecture & Technology Stack

### Frontend (Recommended)

**Framework Options:**
- **React** with TypeScript (recommended for component-based UI)
- **Next.js** (if SSR/SSG is needed)
- **Vue.js** as alternative

**UI Components:**
- Material-UI, Ant Design, or Tailwind CSS
- Chart.js or Recharts for data visualization
- AG Grid or React Table for data grids

**State Management:**
- Redux Toolkit or Zustand for complex state
- React Query for server state management

### Backend (Recommended)

**Options:**
- **Node.js + Express** (JavaScript/TypeScript ecosystem)
- **Python + FastAPI** (good for data science integration)
- **Python + Django** (full-featured framework)

**Database:**
- PostgreSQL (recommended for relational data)
- MongoDB (if flexible schema needed)
- Redis for caching

**API Design:**
- RESTful API or GraphQL
- OpenAPI/Swagger documentation

### Development Tools

**Essential:**
- ESLint/Prettier for code formatting
- TypeScript for type safety
- Jest/Vitest for testing
- Husky for git hooks
- Docker for containerization

## Recommended Directory Structure

When implementing the project, follow this structure:

```
Demand-Planner-Website/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── frontend/               # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   ├── store/         # State management
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/                # Backend application
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utility functions
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── migrations/        # Database migrations
│   └── seeds/             # Seed data
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── docker-compose.yml
├── .gitignore
├── README.md
└── CLAUDE.md             # This file
```

## Core Features for Demand Planning

### Phase 1: Foundation
1. User authentication and authorization
2. Dashboard with key metrics
3. Product catalog management
4. Basic data import/export

### Phase 2: Core Functionality
1. Historical sales data tracking
2. Demand forecasting algorithms
3. Inventory level monitoring
4. Reorder point calculations

### Phase 3: Advanced Features
1. Seasonal trend analysis
2. Multi-location inventory management
3. Supplier lead time tracking
4. Automated alerts and notifications
5. Advanced reporting and analytics

### Phase 4: Optimization
1. Machine learning forecasting models
2. What-if scenario analysis
3. Integration with ERP systems
4. Mobile responsive design
5. Real-time data updates

## Development Workflows

### For AI Assistants: Getting Started

1. **First-Time Setup:**
   ```bash
   # Check current state
   git status
   git log --oneline

   # Explore existing structure
   ls -la
   tree -L 2 (if available)
   ```

2. **Before Making Changes:**
   - Read existing code before modifying
   - Understand the current architecture
   - Check for existing patterns and conventions
   - Review recent commits for context

3. **When Implementing Features:**
   - Create todo list for multi-step tasks
   - Break down complex features into smaller commits
   - Write tests alongside implementation
   - Update documentation as you go

4. **Git Workflow:**
   ```bash
   # Always work on feature branches starting with 'claude/'
   git checkout -b claude/feature-name-sessionid

   # Make commits with clear messages
   git add .
   git commit -m "feat: add user authentication"

   # Push with upstream tracking
   git push -u origin claude/feature-name-sessionid
   ```

### Commit Message Conventions

Follow Conventional Commits specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

**Examples:**
```
feat: add demand forecasting algorithm
fix: resolve calculation error in inventory levels
docs: update API documentation for forecast endpoints
test: add unit tests for forecast service
```

## Coding Conventions

### General Principles

1. **Keep It Simple:**
   - Avoid over-engineering
   - Don't add features not explicitly requested
   - Prefer clarity over cleverness
   - Delete unused code completely (no comments about removed code)

2. **Type Safety:**
   - Use TypeScript for type checking
   - Define interfaces for all data structures
   - Avoid `any` type unless absolutely necessary

3. **Error Handling:**
   - Handle errors at system boundaries (user input, external APIs)
   - Use try-catch for async operations
   - Provide meaningful error messages
   - Log errors appropriately

4. **Security:**
   - Validate all user inputs
   - Sanitize data before database operations
   - Use parameterized queries (prevent SQL injection)
   - Implement proper authentication/authorization
   - Never commit secrets (.env files in .gitignore)

5. **Testing:**
   - Write unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for critical user flows
   - Aim for meaningful coverage, not just high percentages

### Code Style

**JavaScript/TypeScript:**
```typescript
// Use descriptive variable names
const forecastedDemand = calculateDemand(historicalData);

// Prefer const over let
const maxInventory = 1000;

// Use async/await over promises
async function fetchForecast(productId: string): Promise<Forecast> {
  const response = await api.get(`/forecasts/${productId}`);
  return response.data;
}

// Destructure for clarity
const { productId, quantity, date } = orderData;

// Use arrow functions for short callbacks
const activeProducts = products.filter(p => p.status === 'active');
```

**Component Structure (React):**
```typescript
// Functional components with TypeScript
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect
}) => {
  // Hooks at the top
  const [isExpanded, setIsExpanded] = useState(false);

  // Event handlers
  const handleClick = () => {
    onSelect(product.id);
  };

  // Render
  return (
    <div onClick={handleClick}>
      {/* Component JSX */}
    </div>
  );
};
```

### File Naming Conventions

- **Components:** PascalCase - `ProductCard.tsx`, `DemandChart.tsx`
- **Utilities:** camelCase - `formatDate.ts`, `calculateForecast.ts`
- **Types:** PascalCase - `Product.ts`, `Forecast.ts`
- **Tests:** Same as file + `.test` - `ProductCard.test.tsx`
- **Constants:** UPPER_SNAKE_CASE - `API_ENDPOINTS.ts`

## API Design Guidelines

### RESTful Endpoints

```
GET    /api/products              # List all products
GET    /api/products/:id          # Get single product
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product

GET    /api/forecasts             # List forecasts
GET    /api/forecasts/:id         # Get forecast
POST   /api/forecasts/generate    # Generate new forecast

GET    /api/inventory             # Get inventory levels
PUT    /api/inventory/:id         # Update inventory
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product A"
  },
  "message": "Product retrieved successfully"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 123 not found"
  }
}
```

## Database Schema Considerations

### Core Entities

**Products:**
- id (UUID/Int primary key)
- sku (unique)
- name
- description
- category
- unit_cost
- created_at, updated_at

**Demand_Forecasts:**
- id
- product_id (foreign key)
- forecast_date
- predicted_demand
- confidence_level
- algorithm_used
- created_at

**Inventory:**
- id
- product_id (foreign key)
- location_id (foreign key)
- quantity_on_hand
- reorder_point
- safety_stock
- last_updated

**Sales_History:**
- id
- product_id (foreign key)
- sale_date
- quantity_sold
- revenue
- location_id

## Testing Strategy

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Focus on business logic

### Integration Tests
- Test API endpoints
- Test database interactions
- Verify data flow between layers

### E2E Tests
- Test complete user workflows
- Use tools like Cypress or Playwright
- Focus on critical paths

### Example Test Structure
```typescript
describe('DemandForecastService', () => {
  describe('generateForecast', () => {
    it('should calculate forecast based on historical data', () => {
      const historicalData = mockSalesData();
      const forecast = generateForecast(historicalData);

      expect(forecast).toBeDefined();
      expect(forecast.predictedDemand).toBeGreaterThan(0);
    });

    it('should handle empty historical data', () => {
      expect(() => generateForecast([])).toThrow('Insufficient data');
    });
  });
});
```

## AI Assistant Best Practices

### When Starting Work

1. **Explore First:** Use the Explore agent to understand codebase structure
2. **Read Before Editing:** Always read files before modifying them
3. **Check Dependencies:** Review package.json, imports, and relationships
4. **Understand Context:** Look at recent commits and related files

### During Implementation

1. **Use Todo Lists:** Track multi-step tasks with TodoWrite tool
2. **One Task at a Time:** Mark only one task as in_progress
3. **Incremental Commits:** Commit logical units of work
4. **Test as You Go:** Run tests after significant changes

### Code Quality

1. **Don't Over-Engineer:**
   - Only implement what's requested
   - Avoid premature abstractions
   - Keep solutions simple and focused

2. **Security First:**
   - Validate inputs at boundaries
   - No secrets in code
   - Use parameterized queries
   - Implement proper auth/authz

3. **Maintain Consistency:**
   - Follow existing patterns
   - Match current code style
   - Use established conventions

### Communication

1. **Be Concise:** Keep responses short and actionable
2. **Reference Code:** Use `file_path:line_number` format
3. **Explain Decisions:** Briefly explain significant choices
4. **Ask When Unclear:** Don't guess at requirements

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/demand_planner
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=demand_planner
DATABASE_USER=dbuser
DATABASE_PASSWORD=securepassword

# API Configuration
API_PORT=3000
API_HOST=localhost
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# External Services
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### .gitignore Essential Entries

```gitignore
# Dependencies
node_modules/
venv/
__pycache__/

# Environment
.env
.env.local
.env.production

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/
```

## Deployment Considerations

### Development
- Use Docker Compose for local development
- Hot-reload enabled
- Debug logging enabled
- Use seed data for testing

### Staging
- Mirror production environment
- Use staging database
- Enable detailed logging
- Test migrations before production

### Production
- Enable HTTPS
- Use environment variables for config
- Enable production optimizations
- Set up monitoring and alerting
- Implement backup strategy
- Use CDN for static assets

## Performance Optimization

1. **Database:**
   - Index frequently queried fields
   - Use connection pooling
   - Implement caching strategy (Redis)
   - Optimize queries (avoid N+1)

2. **Frontend:**
   - Code splitting
   - Lazy loading components
   - Memoization for expensive calculations
   - Debounce user inputs
   - Optimize bundle size

3. **API:**
   - Implement pagination
   - Use compression (gzip)
   - Cache responses when appropriate
   - Rate limiting

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] CSRF protection
- [ ] Rate limiting on APIs
- [ ] Secure password storage (bcrypt/argon2)
- [ ] JWT token validation
- [ ] HTTPS in production
- [ ] Security headers (helmet.js)
- [ ] Dependency vulnerability scanning
- [ ] Secrets in environment variables
- [ ] Regular security audits

## Documentation Requirements

### Code Documentation
- JSDoc/TSDoc for complex functions
- README in each major directory
- API documentation (Swagger/OpenAPI)
- Database schema documentation

### User Documentation
- User guides for key features
- API integration guides
- Troubleshooting guides
- FAQ section

## Resources & References

### Demand Planning Concepts
- Forecasting algorithms (Moving Average, Exponential Smoothing, ARIMA)
- Safety stock calculations
- Reorder point formulas
- Seasonal adjustment methods
- ABC analysis for inventory classification

### Useful Libraries
- **Forecasting:** Prophet (Facebook), statsmodels (Python)
- **Data Viz:** Chart.js, D3.js, Recharts
- **Data Tables:** AG Grid, React Table
- **Forms:** React Hook Form, Formik
- **Validation:** Yup, Zod, Joi

## Update History

- **2026-01-22:** Initial CLAUDE.md creation - Repository in initialization phase
  - Established recommended architecture
  - Defined coding conventions
  - Set up development workflows
  - Created AI assistant guidelines

---

## Quick Reference Commands

```bash
# Project setup (when ready to initialize)
npm init -y                    # Initialize package.json
npm install <packages>         # Install dependencies
npx create-react-app frontend --template typescript

# Development
npm run dev                    # Start dev server
npm test                       # Run tests
npm run lint                   # Lint code
npm run build                  # Production build

# Git workflow
git status                     # Check status
git log --oneline -10         # Recent commits
git checkout -b claude/feature-name-sessionid
git add .
git commit -m "feat: description"
git push -u origin <branch>

# Docker
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
```

## Notes for Future Development

This document should be updated as the project evolves:
- When technology stack is chosen, update recommendations
- When architecture is implemented, document actual structure
- When new patterns emerge, add to conventions
- When dependencies are added, update relevant sections
- When deployment is configured, update deployment section

**Remember:** Keep this document current with the actual state of the codebase to serve as an accurate guide for AI assistants and human developers alike.
