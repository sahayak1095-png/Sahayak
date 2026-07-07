# Sahayak Full Stack Application - Complete File Manifest

## Project Overview

A fully functional full-stack web application for managing doorstep helper services (Sahayak) built with .NET 8, ASP.NET Core, React, TypeScript, and PostgreSQL.

---

## Directory Structure

```
Sahayak/
├── README.md                           # Main project documentation
├── QUICK_START.md                      # Quick setup guide
├── ARCHITECTURE.md                     # Architecture documentation
├── .gitignore                          # Git ignore rules
├── docker-compose.yml                  # Docker Compose for database
├── setup.bat                           # Windows setup script
├── setup.sh                            # Unix setup script
│
├── Sahayak.Backend/                    # Backend (.NET Core)
│   ├── Sahayak.Backend.csproj         # Project file with dependencies
│   ├── Program.cs                      # Application entry point & configuration
│   ├── appsettings.json               # Configuration (DB connection, admin password)
│   │
│   ├── Models/
│   │   ├── DomainModels.cs            # Entity models (ServiceRequest, Category, etc.)
│   │   └── DTOs.cs                    # Data transfer objects for API
│   │
│   ├── Controllers/
│   │   └── ApiControllers.cs          # REST API controllers
│   │       - RequestsController
│   │       - CategoriesController
│   │       - AreasController
│   │       - LogsController
│   │       - AdminController
│   │
│   ├── Services/
│   │   └── BusinessServices.cs        # Business logic services
│   │       - ServiceRequestService
│   │       - CategoryService
│   │       - AreaService
│   │       - ServiceLogService
│   │
│   └── Data/
│       ├── SahayakContext.cs          # EF Core DbContext
│       └── SeedData.cs                # Database seeding with sample data
│
└── Sahayak.Frontend/                   # Frontend (React + TypeScript)
    ├── package.json                    # Dependencies & scripts
    ├── vite.config.ts                 # Vite build configuration
    ├── tsconfig.json                  # TypeScript configuration
    ├── tsconfig.node.json             # TypeScript config for build tools
    ├── index.html                     # HTML template
    ├── .env.example                   # Environment variables template
    │
    └── src/
        ├── main.tsx                   # Application entry point
        ├── App.tsx                    # Root component with routing
        ├── styles.css                 # Global styles (responsive CSS)
        │
        ├── pages/
        │   ├── HomePage.tsx           # Home page with hero & categories
        │   ├── ServicesPage.tsx       # Service catalog page
        │   ├── RegisterPage.tsx       # Multi-step registration form
        │   ├── ConfirmationPage.tsx   # Success confirmation page
        │   └── AdminPage.tsx          # Admin dashboard with auth
        │
        ├── components/
        │   ├── Navigation.tsx         # Header/navigation bar
        │   └── Footer.tsx             # Footer component
        │
        └── services/
            └── api.ts                 # API client with TypeScript types
```

---

## Backend Files Detailed

### Sahayak.Backend/Sahayak.Backend.csproj
**Purpose**: Project configuration file specifying dependencies
**Key Dependencies**:
- Microsoft.EntityFrameworkCore (8.0.0)
- Microsoft.EntityFrameworkCore.PostgreSQL (8.0.0)
- Microsoft.EntityFrameworkCore.Tools (8.0.0)
- Swashbuckle.AspNetCore (6.4.6)
- AutoMapper.Extensions.Microsoft.DependencyInjection (12.0.1)

### Sahayak.Backend/Program.cs
**Purpose**: Application startup and configuration
**Responsibilities**:
- Register services in dependency injection container
- Configure Entity Framework Core with PostgreSQL
- Setup CORS for frontend communication
- Add Swagger/OpenAPI documentation
- Apply database migrations and seed data on startup

### Sahayak.Backend/appsettings.json
**Purpose**: Configuration file for environment-specific settings
**Configuration Fields**:
- Connection string for PostgreSQL
- Admin authentication password
- Logging levels
- Allowed hosts

### Sahayak.Backend/Models/DomainModels.cs
**Purpose**: Core business entities for database
**Entity Classes**:
- `ServiceCategory`: Service categories (10 total)
- `ServiceItem`: Individual service tasks (20+ per category)
- `ServiceRequest`: Main service request records
- `AreaCoordinate`: Bengaluru neighborhood GPS coordinates (50+ areas)
- `AdminUser`: Admin user records (for future use)
- `ServiceLog`: Activity logs for live display

**Features**:
- Proper foreign key relationships
- Data annotations for validation
- Decimal precision for GPS coordinates

### Sahayak.Backend/Models/DTOs.cs
**Purpose**: Data transfer objects for API requests/responses
**Key DTOs**:
- `CreateServiceRequestDto`: Input for creating requests
- `ServiceRequestDto`: Output for request details
- `ServiceCategoryDto`: Category information with items
- `AreaCoordinateDto`: Area coordinates
- `AdminStatsDto`: Statistics for admin dashboard
- `LoginDto` / `LoginResponseDto`: Authentication
- `ServiceLogDto`: Activity log entries
- `UpdateServiceRequestStatusDto`: Status update

**Purpose**: Type-safe API contracts and data validation

### Sahayak.Backend/Controllers/ApiControllers.cs
**Purpose**: RESTful API endpoints
**Controllers**:
1. **RequestsController**: Handle service requests
   - POST /api/requests/create
   - GET /api/requests/{id}
   - GET /api/requests/reference/{refId}
   - GET /api/requests/all
   - PUT /api/requests/{id}/status
   - GET /api/requests/stats

2. **CategoriesController**: Manage service categories
   - GET /api/categories
   - GET /api/categories/{id}

3. **AreasController**: Area information
   - GET /api/areas
   - GET /api/areas/{id}

4. **LogsController**: Activity logs
   - GET /api/logs/recent

5. **AdminController**: Admin operations
   - POST /api/admin/login
   - GET /api/admin/stats

### Sahayak.Backend/Services/BusinessServices.cs
**Purpose**: Business logic layer implementing service interfaces
**Services Implemented**:

1. **IServiceRequestService** / **ServiceRequestService**
   - Create new service requests
   - Retrieve requests by ID or reference
   - Get all requests with filtering
   - Update request status
   - Generate statistics

2. **ICategoryService** / **CategoryService**
   - Get all categories with items
   - Get specific category

3. **IAreaService** / **AreaService**
   - List all areas sorted
   - Get specific area

4. **IServiceLogService** / **ServiceLogService**
   - Retrieve recent activity logs

**Pattern**: Dependency injection of DbContext for database access

### Sahayak.Backend/Data/SahayakContext.cs
**Purpose**: Entity Framework Core database context
**Key Features**:
- DbSet declarations for all entities
- Foreign key relationships configuration
- Composite key setup if needed
- Index definitions for performance
- Decimal precision configuration for coordinates

**Methods**:
- `OnModelCreating()`: Fluent API configuration

### Sahayak.Backend/Data/SeedData.cs
**Purpose**: Initialize database with sample data
**Seeding Data**:
- 10 service categories with 20+ items each
- 50+ Bengaluru neighborhood coordinates
- 6 sample service logs
- Admin user (optional)

**Features**:
- Only seeds if database is empty
- Organized data structure
- Complete geographic coverage of Bengaluru

---

## Frontend Files Detailed

### Sahayak.Frontend/package.json
**Purpose**: Project metadata and dependencies
**Key Scripts**:
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

**Dependencies**:
- react (18.2.0)
- react-dom (18.2.0)
- leaflet (1.9.4): Interactive maps

**DevDependencies**:
- @vitejs/plugin-react: React support for Vite
- typescript: Type safety
- vite: Modern build tool

### Sahayak.Frontend/vite.config.ts
**Purpose**: Build tool configuration
**Configuration**:
- React plugin setup
- Development server settings (port 3000)
- Proxy configuration for API calls

### Sahayak.Frontend/tsconfig.json
**Purpose**: TypeScript compiler options
**Settings**:
- Target: ES2020
- Module: ESNext
- Strict type checking enabled
- React JSX support

### Sahayak.Frontend/index.html
**Purpose**: HTML template for React app
**Content**:
- Meta tags for responsiveness
- Link to Google Fonts (Space Grotesk, Work Sans, IBM Plex Mono)
- Leaflet CSS from CDN
- Root div for React mounting
- Script tag for main.tsx entry point

### Sahayak.Frontend/.env.example
**Purpose**: Template for environment variables
**Variables**:
- VITE_API_URL: Backend API base URL

### Sahayak.Frontend/src/main.tsx
**Purpose**: Application entry point
**Responsibilities**:
- Mount React app to DOM
- Render App component
- Enable React strict mode

### Sahayak.Frontend/src/App.tsx
**Purpose**: Root component managing page routing
**Responsibilities**:
- Track current page state
- Manage page transitions
- Pass navigation callbacks to pages
- Handle confirmation data flow

**Pages Managed**:
- home
- services
- register
- confirm
- admin

### Sahayak.Frontend/src/styles.css
**Purpose**: Global styling for entire application
**Content**:
- CSS custom properties (design tokens)
- Base element styles
- Component-specific styles (1200+ lines)
- Responsive media queries
- Animations and transitions
- Color scheme and typography

**Design System**:
- Color palette (teal, marigold, coral, grays)
- Border radius tokens
- Shadow definitions
- Typography scale

### Sahayak.Frontend/src/components/Navigation.tsx
**Purpose**: Header and navigation bar component
**Features**:
- Brand logo and name
- Navigation links
- Active page indicator
- Call-to-action button
- Admin link

**Props**:
- currentPage: Current active page
- onPageChange: Callback for navigation

### Sahayak.Frontend/src/components/Footer.tsx
**Purpose**: Application footer
**Content**: Copyright and tagline

### Sahayak.Frontend/src/pages/HomePage.tsx
**Purpose**: Home page with hero section
**Sections**:
- Hero section with animated headline
- Live requests panel with activity logs
- Category grid (first 5 categories)
- Statistics display
- Call-to-action buttons

**Features**:
- Kinetic text animation (phrases rotate every 2.6s)
- Real-time clock display
- API data loading for categories and logs
- Responsive hero layout

**API Calls**:
- categoriesAPI.getAll()
- logsAPI.getRecent(6)

### Sahayak.Frontend/src/pages/ServicesPage.tsx
**Purpose**: Service catalog browsing page
**Features**:
- All 10 service categories
- Search functionality with real-time filtering
- Category preview on hover
- Service items display for selected category
- Responsive bento grid layout

**Interactions**:
- Click category to expand details
- Type to search (filters categories and items)
- Highlight search matches in chips

### Sahayak.Frontend/src/pages/RegisterPage.tsx
**Purpose**: Multi-step service request registration form
**5-Step Wizard**:
1. Personal details (name, phone)
2. Address information (with area selector)
3. Interactive map pin (Leaflet map)
4. Category & service selection
5. Schedule & notes

**Features**:
- Progress bar showing completion
- Back/Continue navigation
- Form validation
- Area autocomplete with map centering
- Dynamic service chip selection
- Leaflet map with drag & click capabilities
- Enter key navigation

**API Calls**:
- categoriesAPI.getAll()
- areasAPI.getAll()
- requestsAPI.create()

### Sahayak.Frontend/src/pages/ConfirmationPage.tsx
**Purpose**: Success confirmation after registration
**Display**:
- Checkmark animation
- Reference ID (SHK-XXXXXX)
- Process timeline showing stages
- Action buttons to register again or return home

**Props**:
- data: Confirmation data with reference ID
- onNavigate: Navigation callback

### Sahayak.Frontend/src/pages/AdminPage.tsx
**Purpose**: Admin dashboard for request management
**Features**:
1. **Authentication Gate**:
   - Password input
   - Login validation

2. **Dashboard** (after login):
   - Statistics cards (total, new, contacted, completed)
   - Filter tabs by status
   - Search by name/phone/area
   - Request list with full details
   - Status dropdown for each request
   - Map link to OpenStreetMap
   - Service tags display

**API Calls**:
- adminAPI.login()
- requestsAPI.getAll()
- adminAPI.getStats()
- requestsAPI.updateStatus()

### Sahayak.Frontend/src/services/api.ts
**Purpose**: API client for backend communication
**TypeScript Interfaces**:
- ServiceCategory
- AreaCoordinate
- ServiceRequest
- CreateServiceRequestDTO
- ServiceLog
- AdminStats
- LoginDTO / LoginResponseDTO

**API Resource Objects**:
- categoriesAPI: Category operations
- areasAPI: Area operations
- requestsAPI: Request CRUD
- logsAPI: Activity logs
- adminAPI: Admin operations

**Features**:
- Error handling
- Type-safe requests/responses
- Query parameter handling
- HTTP method management

---

## Configuration & Setup Files

### .gitignore
**Purpose**: Specify files to exclude from version control
**Excludes**:
- Build outputs (bin/, obj/, dist/)
- IDE files (.vs/, .idea/, .vscode/)
- Environment files (.env.local)
- Node modules (node_modules/)
- OS files (.DS_Store)

### docker-compose.yml
**Purpose**: Docker Compose configuration for local development
**Services**:
- PostgreSQL 15 (port 5432)
- pgAdmin 4 (port 5050)
**Volumes**: Persistent database storage

### setup.bat
**Purpose**: Windows setup script
**Tasks**:
- Check .NET SDK installation
- Check Node.js installation
- Check PostgreSQL availability
- Install backend dependencies
- Run database migrations
- Install frontend dependencies
- Create .env.local file

### setup.sh
**Purpose**: Unix/macOS setup script
**Same Tasks** as setup.bat for Unix systems

---

## Documentation Files

### README.md
**Content**:
- Project overview
- Project structure explanation
- Prerequisites listing
- Backend setup instructions
- Frontend setup instructions
- API endpoints documentation
- Features description
- Technology stack
- Running the application
- Troubleshooting guide
- Future enhancements

### QUICK_START.md
**Content**:
- Prerequisites checklist
- Step-by-step setup guide
- Database setup instructions
- Backend startup
- Frontend startup
- Testing features
- Adding new categories
- Building for production
- Troubleshooting sections

### ARCHITECTURE.md
**Content**:
- System architecture diagram
- Technology stack details
- Backend architecture explanation
- API endpoint documentation
- Data models and schema
- Service layer pattern
- Frontend architecture
- Component hierarchy
- API client pattern
- State management
- Data flow diagrams
- Security considerations
- Performance optimization
- Deployment strategies
- Scalability roadmap
- Monitoring & logging
- Testing strategy
- Development workflow

---

## File Count Summary

**Total Files**: 30+

### By Category:
- **Backend Files**: 8 (C# code files)
- **Frontend Files**: 12+ (TypeScript/React files)
- **Configuration Files**: 6
- **Documentation Files**: 3
- **Setup/Script Files**: 2

### By Type:
- C# (.cs): 8 files
- TypeScript (.tsx/.ts): 13 files
- Configuration (.json, .yml, etc): 7 files
- Documentation (.md): 3 files
- Setup Scripts: 2 files

---

## Quick File Navigation Guide

### To Add a New API Endpoint:
1. Add model in `Sahayak.Backend/Models/DomainModels.cs`
2. Add DTO in `Sahayak.Backend/Models/DTOs.cs`
3. Add service method in `Sahayak.Backend/Services/BusinessServices.cs`
4. Add controller endpoint in `Sahayak.Backend/Controllers/ApiControllers.cs`
5. Add API method in `Sahayak.Frontend/src/services/api.ts`

### To Add a New Page:
1. Create `Sahayak.Frontend/src/pages/NewPage.tsx`
2. Update routing in `Sahayak.Frontend/src/App.tsx`
3. Add page route in `Sahayak.Frontend/src/components/Navigation.tsx`
4. Add styling in `Sahayak.Frontend/src/styles.css`

### To Add a New Service Category:
1. Edit `Sahayak.Backend/Data/SeedData.cs`
2. Reset database: `dotnet ef database drop && dotnet ef database update`
3. Frontend automatically loads from API

### To Change Admin Password:
1. Edit `Sahayak.Backend/appsettings.json`
2. Change `AdminSettings:Password` value
3. Restart backend

---

## Development Workflow Summary

```
Edit Code
    ↓
Backend: Restart dotnet run
Frontend: Auto-reload in browser
    ↓
Test in Browser
    ↓
Check API with Swagger (https://localhost:5000/swagger)
    ↓
Verify Database (pgAdmin or psql)
    ↓
Commit changes to Git
```

---

This manifest provides complete documentation of every file in the Sahayak full-stack application, making it easy for developers to understand the structure and locate specific functionality.
