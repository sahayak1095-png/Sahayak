# Sahayak - Full Stack Application

A complete full-stack web application built with .NET and React for managing doorstep helper services in Bengaluru.

## Project Structure

```
Sahayak/
├── Sahayak.Backend/          # ASP.NET Core API
│   ├── Models/               # Database models and DTOs
│   ├── Controllers/          # API endpoints
│   ├── Services/             # Business logic
│   ├── Data/                 # EF Core context and seeding
│   ├── Program.cs            # Application configuration
│   ├── appsettings.json      # Configuration
│   └── Sahayak.Backend.csproj
└── Sahayak.Frontend/         # React TypeScript app
    ├── src/
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── services/         # API client
    │   ├── App.tsx           # Main app component
    │   ├── main.tsx          # Entry point
    │   └── styles.css        # Styling
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── index.html
```

## Prerequisites

- .NET 8 SDK or later
- Node.js 16+ and npm
- PostgreSQL 12+

## Backend Setup

### 1. Install .NET (if not already installed)

```bash
# Windows
# Download from https://dotnet.microsoft.com/download

# macOS
brew install dotnet

# Linux
# Follow https://learn.microsoft.com/en-us/dotnet/core/install/linux
```

### 2. Setup PostgreSQL

```bash
# Install PostgreSQL and create a database
createdb sahayak_db

# Or update the connection string in appsettings.json
```

### 3. Configure Database Connection

Edit `Sahayak.Backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=sahayak_db;Username=postgres;Password=your_password"
  }
}
```

### 4. Run Database Migrations

```bash
cd Sahayak.Backend
dotnet ef database update
# or
dotnet run
```

### 5. Run Backend Server

```bash
cd Sahayak.Backend
dotnet run
```

The API will run at `http://localhost:4000/api`

### API Endpoints

- `POST /api/requests/create` - Create a new service request
- `GET /api/requests/{id}` - Get request by ID
- `GET /api/requests/all` - Get all requests
- `PUT /api/requests/{id}/status` - Update request status
- `GET /api/categories` - Get all service categories
- `GET /api/areas` - Get all area coordinates
- `GET /api/logs/recent` - Get recent service logs
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Get admin statistics

## Frontend Setup

### 1. Install Dependencies

```bash
cd Sahayak.Frontend
npm install
```

### 2. Configure API Base URL

Create a `.env.local` file in the frontend root:

```
VITE_API_URL=http://localhost:4000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will run at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Features

### User Features

- **Home Page**: Browse categories and view live service logs
- **Services Page**: Explore all 10 service categories with 200+ tasks
- **Registration Form**: 5-step wizard to register service requests
  - Step 1: Personal details
  - Step 2: Address information
  - Step 3: Location pin on interactive map (Leaflet)
  - Step 4: Select service category and specific tasks
  - Step 5: Schedule and additional notes
- **Confirmation Page**: Success message with reference ID

### Admin Features

- **Authentication**: Simple password-based admin login
- **Dashboard**: 
  - Statistics (total, new, contacted, completed requests)
  - Filter by status (All, New, Contacted, Completed)
  - Search by name, phone, or area
- **Request Management**: View all service requests with full details
- **Status Updates**: Change request status for tracking

### Data Models

**ServiceRequest**
- Personal information (name, phone)
- Address details (floor, building, street, area, city, pin, landmark)
- Location coordinates (latitude, longitude)
- Service information (category, selected services)
- Schedule (preferred date, time)
- Notes and status

**ServiceCategory**
- Category name and icon
- List of 20+ service items per category

**AreaCoordinate**
- 50+ Bengaluru neighborhoods with GPS coordinates

**ServiceLog**
- Recent service request activity for live display

## Database Schema

### Tables

- `ServiceCategories` - Service categories
- `ServiceItems` - Individual service tasks
- `AreaCoordinates` - Bengaluru area GPS data
- `ServiceRequests` - Main request records
- `ServiceLogs` - Activity logs
- `AdminUsers` - Admin accounts (future use)

## Authentication

- **Admin Password**: `sahayak` (can be changed in `appsettings.json`)
- No complex JWT setup required for this demo
- Production should implement proper authentication

## Technology Stack

### Backend
- **.NET 8** - Framework
- **ASP.NET Core** - Web framework
- **Entity Framework Core** - ORM
- **PostgreSQL** - Database
- **Swagger** - API documentation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Leaflet.js** - Interactive maps
- **CSS3** - Styling

## Running the Full Application

### Terminal 1: Backend

```bash
cd Sahayak.Backend
dotnet run
```

### Terminal 2: Frontend

```bash
cd Sahayak.Frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Default Data

The application comes with pre-seeded data:

- **10 Service Categories** with 20+ items each
- **50+ Bengaluru Areas** with GPS coordinates
- **6 Sample Service Logs** for the live display
- **Admin Password**: sahayak

## Configuration

### Backend Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=sahayak_db;Username=postgres;Password=postgres"
  },
  "AdminSettings": {
    "Password": "sahayak"
  }
}
```

### Frontend Configuration (`.env.local`)

```
VITE_API_URL=http://localhost:4000/api
```

## Deployment

### Railway Backend

1. Create a new Railway project.
2. Add a PostgreSQL database plugin.
3. Set environment variables:
   - `DATABASE_URL` to the Railway Postgres URL
   - `PORT` to `4000`
   - `ASPNETCORE_URLS` to `http://+:4000`
4. Configure the Railway service to build from `Sahayak.Backend`.
5. Railway will deploy the backend and expose the API.

### Vercel Frontend

1. Create a new Vercel project and connect the repository.
2. Set environment variable:
   - `VITE_API_URL` to `https://<your-backend-domain>/api`
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Deploy the frontend.

### Automated Deployment (Render + Vercel)

The repository now includes GitHub Actions workflows to automate backend and frontend deploy:

- `./.github/workflows/deploy-backend-render.yml` — trigger backend deploy on Render
- `./.github/workflows/deploy-full.yml` — trigger Render backend deploy then frontend deploy to Vercel

Required GitHub secrets:

- `RENDER_API_KEY` — create in Render account settings
- `RENDER_SERVICE_ID` — the target Render service id for the backend
- `RENDER_BACKEND_URL` — the public backend URL used by the frontend, e.g. `https://api.saha-yak.in`
- `VERCEL_TOKEN` — create in Vercel account settings
- `VERCEL_ORG_ID` — found in Vercel organization settings
- `VERCEL_PROJECT_ID` — found in Vercel project settings
- `VERCEL_DOMAIN` — optional, e.g. `saha-yak.in` to register your custom domain with Vercel

When `RENDER_BACKEND_URL` is provided, the deployment workflow will also attempt to register that backend host as a Render custom domain.

Example secrets:

- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`
- `RENDER_BACKEND_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

To run the full automated deployment, push to `main` or trigger the `deploy-full` workflow manually.

### Docker Compose (Local)

```bash
docker compose up --build
```

The frontend will be available on `http://localhost:3000` and the API on `http://localhost:4000/api`.

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check connection string in `appsettings.json`
3. Ensure database exists: `createdb sahayak_db`

### CORS Errors

- Ensure backend CORS policy includes frontend origin
- Check `Program.cs` for CORS configuration

### Map Not Loading

- Leaflet CSS/JS should load from CDN
- Check browser console for errors
- Ensure map container has proper height

### Frontend Can't Connect to API

1. Verify backend is running on port 4000
2. Check `VITE_API_URL` environment variable
3. Check browser console for network errors
4. Verify CORS is enabled

## Development Tips

- **Live Reload**: Frontend automatically reloads on changes
- **Hot Reload**: Backend may require manual restart
- **Database Migrations**: Run `dotnet ef database update` after model changes
- **Swagger UI**: Visit `http://localhost:4000/swagger` to test APIs

## Future Enhancements

- JWT-based authentication
- Payment integration
- Real-time notifications (SignalR)
- Email/SMS notifications
- Helper profile management
- Rating and review system
- Advanced analytics dashboard
- Multi-city support
- Mobile app

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please refer to the code comments and documentation within each module.
