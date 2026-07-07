# Sahayak Architecture Documentation

## System Overview

Sahayak is a full-stack web application built with modern technologies to manage doorstep helper services. The application uses a clean architecture pattern with separation of concerns between frontend, backend, and database layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)           │
│  Pages: Home, Services, Register, Confirmation, Admin      │
│  Components: Navigation, Footer, Forms, Lists              │
│  Services: API Client for backend communication            │
│  Styling: Responsive CSS with design tokens               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/REST API
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Backend (ASP.NET Core 8 Web API)               │
│  Controllers: Requests, Categories, Areas, Admin, Logs     │
│  Services: Business logic layer                             │
│  Models: Domain entities and DTOs                           │
│  Data: EF Core DbContext and migrations                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ EF Core (ORM)
                 │
┌────────────────▼────────────────────────────────────────────┐
│            Database (PostgreSQL)                            │
│  Tables: Requests, Categories, Items, Areas, Logs, Users  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 8
- **Runtime**: .NET 8
- **ORM**: Entity Framework Core 8
- **Database**: PostgreSQL 12+
- **API Style**: RESTful JSON API
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Library**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3
- **Maps**: Leaflet.js
- **Package Manager**: npm

### Infrastructure
- **Database**: PostgreSQL (self-hosted or cloud)
- **API Server**: Kestrel (built-in ASP.NET)
- **Frontend Server**: Vite dev server or static hosting

## Backend Architecture

### Project Structure

```
Sahayak.Backend/
├── Controllers/
│   └── ApiControllers.cs
│       ├── RequestsController          # Service request CRUD
│       ├── CategoriesController        # Service categories
│       ├── AreasController             # Area coordinates
│       ├── LogsController              # Activity logs
│       └── AdminController             # Admin operations
│
├── Services/
│   └── BusinessServices.cs
│       ├── IServiceRequestService      # Request business logic
│       ├── ICategoryService            # Category operations
│       ├── IAreaService                # Area operations
│       └── IServiceLogService          # Log operations
│
├── Models/
│   ├── DomainModels.cs
│   │   ├── ServiceCategory
│   │   ├── ServiceItem
│   │   ├── ServiceRequest
│   │   ├── AreaCoordinate
│   │   ├── AdminUser
│   │   └── ServiceLog
│   │
│   └── DTOs.cs
│       ├── CreateServiceRequestDto
│       ├── ServiceRequestDto
│       ├── ServiceCategoryDto
│       ├── AreaCoordinateDto
│       ├── AdminStatsDto
│       └── LoginResponseDto
│
├── Data/
│   ├── SahayakContext.cs               # EF Core DbContext
│   └── SeedData.cs                     # Database seeding
│
├── Program.cs                          # Application startup
├── appsettings.json                    # Configuration
└── Sahayak.Backend.csproj
```

### API Endpoints

#### Service Requests
```
POST   /api/requests/create              Create new request
GET    /api/requests/{id}                Get by ID
GET    /api/requests/reference/{refId}   Get by reference ID
GET    /api/requests/all                 Get all (with filters)
PUT    /api/requests/{id}/status         Update status
GET    /api/requests/stats               Get statistics
```

#### Service Categories
```
GET    /api/categories                   Get all categories
GET    /api/categories/{id}              Get category by ID
```

#### Area Coordinates
```
GET    /api/areas                        Get all areas
GET    /api/areas/{id}                   Get area by ID
```

#### Service Logs
```
GET    /api/logs/recent                  Get recent activity logs
```

#### Admin
```
POST   /api/admin/login                  Admin authentication
GET    /api/admin/stats                  Get admin statistics
```

### Data Models

#### ServiceRequest (Main Entity)
```csharp
public class ServiceRequest
{
    public int Id { get; set; }
    public string ReferenceId { get; set; }          // SHK-XXXXXX
    
    // Personal Info
    public string Name { get; set; }
    public string Phone { get; set; }
    
    // Address
    public string Floor { get; set; }
    public string Building { get; set; }
    public string Street { get; set; }
    public string Area { get; set; }
    public string City { get; set; }
    public string PinCode { get; set; }
    public string Landmark { get; set; }
    
    // Location
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Service Info
    public string Category { get; set; }
    public string? SelectedServices { get; set; }    // JSON
    
    // Schedule
    public string? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    
    // Meta
    public string? Notes { get; set; }
    public string Status { get; set; }               // New, Contacted, Completed
    public DateTime SubmittedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

#### ServiceCategory
```csharp
public class ServiceCategory
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Icon { get; set; }
    public List<ServiceItem> Items { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### AreaCoordinate
```csharp
public class AreaCoordinate
{
    public int Id { get; set; }
    public string AreaName { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Database Schema

#### ServiceRequests Table
```sql
CREATE TABLE "ServiceRequests" (
    "Id" integer PRIMARY KEY,
    "ReferenceId" varchar(20) UNIQUE NOT NULL,
    "Name" varchar(100) NOT NULL,
    "Phone" varchar(20) NOT NULL,
    "Floor" varchar(50),
    "Building" varchar(100),
    "Street" varchar(100),
    "Area" varchar(100),
    "City" varchar(50),
    "PinCode" varchar(10),
    "Landmark" varchar(100),
    "Latitude" numeric(18,6),
    "Longitude" numeric(18,6),
    "Category" varchar(100),
    "SelectedServices" text,
    "PreferredDate" varchar(50),
    "PreferredTime" varchar(50),
    "Notes" text,
    "Status" varchar(20) DEFAULT 'New',
    "SubmittedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
```

### Service Layer Pattern

All business logic is isolated in services:

```csharp
public interface IServiceRequestService
{
    Task<ServiceRequestDto> CreateRequestAsync(CreateServiceRequestDto dto);
    Task<ServiceRequestDto?> GetRequestAsync(int id);
    Task<List<ServiceRequestDto>> GetAllRequestsAsync(string? statusFilter, string? searchQuery);
    Task<ServiceRequestDto?> UpdateStatusAsync(int id, string status);
    Task<AdminStatsDto> GetStatsAsync();
}
```

Benefits:
- Testability: Easy to mock for unit tests
- Reusability: Can be used by multiple controllers
- Separation of concerns: Business logic separate from HTTP
- Maintainability: Changes centralized in service class

## Frontend Architecture

### Project Structure

```
Sahayak.Frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx                 # Home page component
│   │   ├── ServicesPage.tsx             # Services catalog
│   │   ├── RegisterPage.tsx             # Multi-step form
│   │   ├── ConfirmationPage.tsx         # Success page
│   │   └── AdminPage.tsx                # Admin dashboard
│   │
│   ├── components/
│   │   ├── Navigation.tsx               # Header/nav bar
│   │   └── Footer.tsx                   # Footer
│   │
│   ├── services/
│   │   └── api.ts                       # API client
│   │
│   ├── App.tsx                          # Main app component
│   ├── main.tsx                         # Entry point
│   └── styles.css                       # Global styles
│
├── public/
│   └── (static assets)
│
├── index.html                           # HTML template
├── package.json                         # Dependencies
├── vite.config.ts                       # Build config
├── tsconfig.json                        # TS config
└── .env.example                         # Env template
```

### Component Hierarchy

```
App
├── Navigation
├── HomePage
│   ├── Hero Section
│   ├── Category Grid
│   └── Live Requests Panel
├── ServicesPage
│   ├── Search Bar
│   ├── Category Bento Grid
│   └── Items Panel
├── RegisterPage
│   └── Multi-Step Form (5 steps)
│       ├── Step 1: Personal Details
│       ├── Step 2: Address
│       ├── Step 3: Map
│       ├── Step 4: Category & Services
│       └── Step 5: Schedule
├── ConfirmationPage
│   └── Success Card
├── AdminPage
│   ├── Login Gate (if not authenticated)
│   └── Dashboard (if authenticated)
│       ├── Stats Cards
│       ├── Filter Tabs
│       ├── Search Bar
│       └── Request Cards List
└── Footer
```

### API Client Pattern

Organized by resource:

```typescript
export const categoriesAPI = {
  getAll: async (): Promise<ServiceCategory[]> => { ... },
  getById: async (id: number): Promise<ServiceCategory> => { ... }
}

export const requestsAPI = {
  create: async (data: CreateServiceRequestDTO): Promise<ServiceRequest> => { ... },
  getById: async (id: number): Promise<ServiceRequest> => { ... },
  getAll: async (status?: string, search?: string): Promise<ServiceRequest[]> => { ... },
  updateStatus: async (id: number, status: string): Promise<ServiceRequest> => { ... },
  getStats: async (): Promise<AdminStats> => { ... }
}

export const adminAPI = {
  login: async (password: string): Promise<LoginResponse> => { ... },
  getStats: async (): Promise<AdminStats> => { ... }
}
```

### State Management

Uses React hooks for state:

```typescript
// Local component state
const [formData, setFormData] = useState({...})
const [selectedCategory, setSelectedCategory] = useState(null)
const [filteredRequests, setFilteredRequests] = useState([])

// Effects for data loading
useEffect(() => {
  loadData()
}, [])

// Event handlers
const handleInputChange = (e) => { ... }
const handleCategoryClick = (cat) => { ... }
```

### Styling Approach

CSS custom properties (CSS variables) for theming:

```css
:root {
  --bg: #F7F5EF;
  --surface: #FFFFFF;
  --teal: #0F3D39;
  --marigold: #F2A93B;
  /* ... more variables */
}
```

Organized CSS sections:
- CSS Variables
- Base styles
- Page routing
- Navigation
- Hero section
- Forms & wizard
- Admin styles
- Responsive media queries

## Data Flow

### Request Creation Flow

```
Frontend (RegisterPage)
    ↓
Form Submit Event
    ↓
Validate Form Data
    ↓
Call requestsAPI.create(data)
    ↓
POST /api/requests/create
    ↓
RequestsController.CreateRequest()
    ↓
IServiceRequestService.CreateRequestAsync()
    ↓
Create ServiceRequest entity
    ↓
_context.SaveChangesAsync()
    ↓
EF Core ORM
    ↓
PostgreSQL INSERT
    ↓
Return ServiceRequestDto
    ↓
Frontend: Show confirmation page
```

### Admin Dashboard Flow

```
Frontend (AdminPage)
    ↓
Enter password and login
    ↓
POST /api/admin/login
    ↓
AdminController.Login()
    ↓
Verify password
    ↓
Return LoginResponse { success: true }
    ↓
Load Dashboard
    ↓
GET /api/admin/stats
GET /api/requests/all
    ↓
AdminStatsDto & List<ServiceRequestDto>
    ↓
Display stats and request list
    ↓
Filter/Search requests
    ↓
Update status via PUT /api/requests/{id}/status
```

## Security Considerations

### Current Implementation
- Simple password authentication for admin
- No JWT tokens (suitable for demo)
- CORS enabled for frontend origin

### Production Recommendations
- [ ] Implement JWT-based authentication
- [ ] Add role-based access control (RBAC)
- [ ] Hash passwords using bcrypt
- [ ] Add request validation & sanitization
- [ ] Implement rate limiting
- [ ] Use HTTPS only
- [ ] Add API key authentication for third-party integrations
- [ ] Implement audit logging
- [ ] Add request encryption for sensitive data

## Performance Considerations

### Frontend Optimization
- Lazy loading of pages
- Component-level code splitting
- Image optimization
- CSS minification via Vite
- HTTP caching headers

### Backend Optimization
- Database indexing on frequently queried columns
- EF Core query optimization
- Pagination for large result sets
- Caching strategies for static data

### Database Optimization
- Foreign key relationships properly indexed
- Query optimization
- Connection pooling
- Backup and recovery strategy

## Deployment Architecture

### Current Setup
- Local development on single machine
- PostgreSQL local or remote

### Production Deployment Options

#### Option 1: Cloud Platforms
```
Azure App Service (Backend API)
  ↓
Azure Database for PostgreSQL
  
Azure Static Web Apps (Frontend)
  ↓
CDN for static assets
```

#### Option 2: Docker Containers
```
Docker Compose with:
- Backend container (ASP.NET Core)
- Frontend container (Node.js)
- PostgreSQL container
```

#### Option 3: Traditional Hosting
```
Windows/Linux Server:
- IIS hosting .NET backend
- Nginx/Apache for frontend
- PostgreSQL database server
```

## Scalability Roadmap

### Phase 1: MVP (Current)
- Single backend instance
- Single database
- Frontend static hosting
- ~100 concurrent users

### Phase 2: Growth
- Load balancer for backend
- Read replicas for database
- CDN for frontend assets
- Caching layer (Redis)
- ~1000 concurrent users

### Phase 3: Enterprise
- Microservices architecture
- Message queues (RabbitMQ)
- Elasticsearch for search
- Multi-region deployment
- ~10,000+ concurrent users

## Future Architecture Enhancements

### Feature Additions
- [ ] Real-time notifications (SignalR)
- [ ] Payment processing (Stripe/Razorpay)
- [ ] Email/SMS notifications (SendGrid/Twilio)
- [ ] File uploads (Azure Blob/S3)
- [ ] Helper profile management
- [ ] Rating & review system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Infrastructure Improvements
- [ ] Kubernetes orchestration
- [ ] API Gateway (Kong/AWS API Gateway)
- [ ] Service mesh (Istio)
- [ ] Distributed tracing (Jaeger)
- [ ] CI/CD pipeline (GitHub Actions/Azure DevOps)
- [ ] Infrastructure as Code (Terraform)

## Monitoring & Logging

### Application Metrics
- Request response times
- Error rates
- API usage statistics
- User activity logs

### Database Metrics
- Query performance
- Connection pool usage
- Transaction rates

### Infrastructure Metrics
- CPU/Memory usage
- Disk I/O
- Network bandwidth

### Recommended Tools
- **Logs**: ELK Stack, Datadog, New Relic
- **Metrics**: Prometheus, Grafana
- **Tracing**: Jaeger, Zipkin
- **Monitoring**: Azure Monitor, CloudWatch

## Testing Strategy

### Backend Testing
```csharp
// Unit Tests
[Test]
public async Task CreateRequest_WithValidData_ReturnsSuccessResponse()
{
    // Arrange
    var service = new ServiceRequestService(mockContext);
    var dto = new CreateServiceRequestDto { ... };
    
    // Act
    var result = await service.CreateRequestAsync(dto);
    
    // Assert
    Assert.IsNotNull(result);
    Assert.AreEqual(dto.Name, result.Name);
}

// Integration Tests
[Test]
public async Task CreateRequest_API_ReturnsCreatedAtAction()
{
    // Uses actual DbContext with test database
}
```

### Frontend Testing
```typescript
// Unit Tests (Jest)
test('HomePage renders with categories', () => {
  render(<HomePage />);
  // assertions...
});

// Integration Tests (React Testing Library)
test('Can submit registration form', async () => {
  render(<RegisterPage />);
  // fill form, submit, verify
});

// E2E Tests (Cypress/Playwright)
it('User can register and get confirmation', () => {
  cy.visit('http://localhost:3000');
  cy.get('button').contains('Register a request').click();
  // fill steps, submit, verify confirmation
});
```

## Development Workflow

### Local Development
1. Start PostgreSQL
2. Start backend (`dotnet run`)
3. Start frontend (`npm run dev`)
4. Make changes
5. Test in browser/API client
6. Commit changes

### Code Organization
- Meaningful commit messages
- Feature branches for new functionality
- Pull request reviews before merging
- Automated tests on CI/CD

### Debugging
- VS Code for frontend debugging
- VS 2022 for backend debugging
- Browser DevTools for frontend
- SQL client for database inspection

## Conclusion

Sahayak demonstrates a modern, scalable full-stack architecture using industry-standard technologies. The separation of concerns, clean code practices, and well-organized project structure make it easy to maintain, test, and extend with new features.

The architecture supports growth from MVP to enterprise-scale deployments through thoughtful design decisions and clear paths for enhancement.
