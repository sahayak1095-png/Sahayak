using Microsoft.EntityFrameworkCore;
using Npgsql;
using Sahayak.Backend.Data;
using Sahayak.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// When deployed, DATABASE_URL is used by platforms like Railway.
// When running locally, the application falls back to DefaultConnection from appsettings.json.
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = !string.IsNullOrWhiteSpace(databaseUrl)
    ? new NpgsqlConnectionStringBuilder(databaseUrl).ToString()
    : builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<SahayakContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IServiceRequestService, ServiceRequestService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IServiceItemService, ServiceItemService>();
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddScoped<IServiceLogService, ServiceLogService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations on startup.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<SahayakContext>();
    
    try
    {
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Local development uses PORT=4000 by default.
// In production containers, ASPNETCORE_URLS can override the listening address.
var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
if (string.IsNullOrEmpty(urls))
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "4000";
    urls = $"http://0.0.0.0:{port}";
}
app.Run(urls);
