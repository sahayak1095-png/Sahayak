# Quick Start Guide for Sahayak Full Stack Application

## Prerequisites Checklist

- [ ] .NET 8 SDK installed (`dotnet --version`)
- [ ] Node.js 16+ installed (`node --version`, `npm --version`)
- [ ] PostgreSQL installed and running
- [ ] Git (optional, for version control)

## Step 1: Database Setup

```bash
# Connect to PostgreSQL and create database
psql -U postgres
```

In psql prompt:
```sql
CREATE DATABASE sahayak_db;
\q
```

Or if using createdb:
```bash
createdb -U postgres sahayak_db
```

## Step 2: Backend Setup

```bash
cd Sahayak.Backend

# Restore dependencies
dotnet restore

# Apply database migrations (creates tables and seeds data)
dotnet ef database update

# Run the server
dotnet run
```

Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5000
```

**Backend is ready at**: `https://localhost:5000`

## Step 3: Frontend Setup

In a new terminal:

```bash
cd Sahayak.Frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:3000/
```

**Frontend is ready at**: `http://localhost:3000`

## Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Explore the home page
3. Browse services
4. Fill out a test registration form
5. Login to admin panel with password: `sahayak`

## Key Features to Test

### Home Page
- ✓ Dynamic headline text changes every 2.6 seconds
- ✓ Real-time service logs display
- ✓ Category cards with hover preview

### Services Page
- ✓ Browse all 10 categories
- ✓ Search functionality
- ✓ Category preview with service items

### Registration Form
- ✓ Step 1: Personal info validation
- ✓ Step 2: Address auto-complete from areas
- ✓ Step 3: Interactive map with drag/click
- ✓ Step 4: Dynamic service selection
- ✓ Step 5: Schedule selection

### Admin Panel
- ✓ Authentication with password
- ✓ Request statistics display
- ✓ Filter by status
- ✓ Search functionality
- ✓ Status updates saved to database
- ✓ Map link to OpenStreetMap

## Common Tasks

### Add New Service Category

Edit `Sahayak.Backend/Data/SeedData.cs` and add to `GetCategories()` method:

```csharp
new() { 
  Name = "New Category", 
  Icon = "icon_name", 
  Items = new()
  {
    new() { Name = "Service 1" },
    new() { Name = "Service 2" }
  }
}
```

Then reset database:
```bash
cd Sahayak.Backend
dotnet ef database drop
dotnet ef database update
```

### Change Admin Password

Edit `Sahayak.Backend/appsettings.json`:

```json
"AdminSettings": {
  "Password": "your_new_password"
}
```

### View Database

Use pgAdmin or psql:
```bash
psql -U postgres -d sahayak_db
```

Sample queries:
```sql
SELECT COUNT(*) FROM "ServiceRequests";
SELECT * FROM "ServiceRequests" ORDER BY "SubmittedAt" DESC LIMIT 5;
SELECT "Status", COUNT(*) FROM "ServiceRequests" GROUP BY "Status";
```

### Check API Documentation

While backend is running, visit:
```
https://localhost:5000/swagger
```

## Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# If port in use, kill the process or change port in launchSettings.json
```

### Database connection error

```bash
# Verify PostgreSQL is running
psql -U postgres -l

# Check connection string in appsettings.json
# Default: Host=localhost;Port=5432;Database=sahayak_db;Username=postgres;Password=postgres
```

### Frontend shows blank page

```bash
# Check browser console (F12) for errors
# Verify API URL is correct in .env.local
# Ensure backend is running and accessible
```

### Map not loading

```bash
# Check browser console for Leaflet errors
# Verify CDN links in index.html are accessible
# Ensure no CORS issues
```

## Build for Production

### Backend

```bash
cd Sahayak.Backend
dotnet publish -c Release
# Output: bin/Release/net8.0/publish/
```

### Frontend

```bash
cd Sahayak.Frontend
npm run build
npm run preview
# Output: dist/
```

## Next Steps

1. **Customize styling**: Edit `Sahayak.Frontend/src/styles.css`
2. **Add more categories**: Update `SeedData.cs`
3. **Implement payments**: Add Razorpay/Stripe integration
4. **Add notifications**: Implement email/SMS via SendGrid/Twilio
5. **Setup authentication**: Replace demo auth with JWT
6. **Deploy**: Deploy to AWS/Azure/Heroku

## File Structure Reference

```
Sahayak/
├── README.md                    # Main documentation
├── QUICK_START.md              # This file
├── Sahayak.Backend/
│   ├── Models/
│   │   ├── DomainModels.cs     # Entity models
│   │   └── DTOs.cs             # Data transfer objects
│   ├── Controllers/
│   │   └── ApiControllers.cs   # API endpoints
│   ├── Services/
│   │   └── BusinessServices.cs # Business logic
│   ├── Data/
│   │   ├── SahayakContext.cs   # EF Core DbContext
│   │   └── SeedData.cs         # Database seeding
│   ├── Program.cs              # App configuration
│   └── appsettings.json        # Settings
└── Sahayak.Frontend/
    ├── src/
    │   ├── pages/              # Page components
    │   ├── components/         # Reusable components
    │   ├── services/           # API client
    │   ├── App.tsx             # Main app
    │   └── styles.css          # Global styles
    ├── package.json            # Dependencies
    ├── vite.config.ts          # Vite config
    └── index.html              # HTML entry point
```

## Support

For help, check:
1. Backend logs: `dotnet run` console output
2. Frontend logs: Browser DevTools (F12)
3. Database logs: Check PostgreSQL logs
4. Documentation: Comments in code files

## Success Indicators

- [ ] Backend running on https://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can view home page with dynamic content
- [ ] Can navigate between pages
- [ ] Can submit a service request
- [ ] Can login to admin panel
- [ ] Admin shows registered requests
- [ ] Can update request status
- [ ] Database has service data
- [ ] No console errors

If all checks pass, the application is ready! 🎉
