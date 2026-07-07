using Microsoft.EntityFrameworkCore;
using Npgsql;
using Sahayak.Backend.Data;
using Sahayak.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// When deployed, DATABASE_URL is used by platforms like Render or Railway.
// When running locally, the application falls back to DefaultConnection from appsettings.json.
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connectionString;

if (!string.IsNullOrWhiteSpace(databaseUrl))
{
    if (databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        connectionString = ConvertPostgresUrlToConnectionString(databaseUrl);
    }
    else
    {
        connectionString = new NpgsqlConnectionStringBuilder(databaseUrl).ToString();
    }
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

builder.Services.AddDbContext<SahayakContext>(options =>
    options.UseNpgsql(connectionString));

static string ConvertPostgresUrlToConnectionString(string databaseUrl)
{
    var url = databaseUrl;
    if (url.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        url = url["postgres://".Length..];
    else if (url.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        url = url["postgresql://".Length..];

    var queryIndex = url.IndexOf('?');
    string query = null;
    if (queryIndex >= 0)
    {
        query = url[(queryIndex + 1)..];
        url = url[..queryIndex];
    }

    var atIndex = url.LastIndexOf('@');
    string userInfo = null;
    var hostPart = url;
    if (atIndex >= 0)
    {
        userInfo = url[..atIndex];
        hostPart = url[(atIndex + 1)..];
    }

    string username = string.Empty;
    string password = string.Empty;
    if (!string.IsNullOrEmpty(userInfo))
    {
        var colonIndex = userInfo.IndexOf(':');
        if (colonIndex >= 0)
        {
            username = Uri.UnescapeDataString(userInfo[..colonIndex]);
            password = Uri.UnescapeDataString(userInfo[(colonIndex + 1)..]);
        }
        else
        {
            username = Uri.UnescapeDataString(userInfo);
        }
    }

    var slashIndex = hostPart.IndexOf('/');
    var hostPort = slashIndex >= 0 ? hostPart[..slashIndex] : hostPart;
    var database = slashIndex >= 0 ? hostPart[(slashIndex + 1)..] : string.Empty;

    var host = hostPort;
    var port = 5432;

    if (hostPort.StartsWith("["))
    {
        var endBracket = hostPort.IndexOf(']');
        host = hostPort[..(endBracket + 1)];
        if (hostPort.Length > endBracket + 1 && hostPort[endBracket + 1] == ':')
        {
            var portPart = hostPort[(endBracket + 2)..];
            if (!int.TryParse(portPart, out port))
                throw new ArgumentException($"Invalid port in DATABASE_URL: {portPart}");
        }
    }
    else if (hostPort.Contains(':'))
    {
        var lastColon = hostPort.LastIndexOf(':');
        var portPart = hostPort[(lastColon + 1)..];
        if (!int.TryParse(portPart, out port))
            throw new ArgumentException($"Invalid port in DATABASE_URL: {portPart}");
        host = hostPort[..lastColon];
    }

    var builderUrl = new NpgsqlConnectionStringBuilder
    {
        Host = host,
        Port = port,
        Username = username,
        Password = password,
        Database = Uri.UnescapeDataString(database),
        SslMode = SslMode.Require,
        TrustServerCertificate = true
    };

    if (!string.IsNullOrEmpty(query))
    {
        foreach (var pair in query.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Split('=', 2);
            if (parts.Length != 2)
                continue;

            var key = parts[0];
            var value = Uri.UnescapeDataString(parts[1]);
            if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase))
            {
                builderUrl.SslMode = Enum.Parse<SslMode>(value, true);
            }
            else if (key.Equals("trustservercertificate", StringComparison.OrdinalIgnoreCase))
            {
                builderUrl.TrustServerCertificate = bool.Parse(value);
            }
        }
    }

    return builderUrl.ToString();
}

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
