using Sahayak.Backend.Models;
using Sahayak.Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Sahayak.Backend.Services;

public interface IServiceRequestService
{
    Task<ServiceRequestDto> CreateRequestAsync(CreateServiceRequestDto dto);
    Task<ServiceRequestDto?> GetRequestAsync(int id);
    Task<ServiceRequestDto?> GetRequestByReferenceAsync(string referenceId);
    Task<List<ServiceRequestDto>> GetAllRequestsAsync(string? statusFilter = null, string? searchQuery = null);
    Task<ServiceRequestDto?> UpdateStatusAsync(int id, string status);
    Task<bool> DeleteRequestAsync(int id);
    Task<AdminStatsDto> GetStatsAsync();
}

public class ServiceRequestService : IServiceRequestService
{
    private readonly SahayakContext _context;
    private readonly IEmailService _emailService;

    public ServiceRequestService(SahayakContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<ServiceRequestDto> CreateRequestAsync(CreateServiceRequestDto dto)
    {
        var referenceId = "SHK-" + DateTime.UtcNow.Ticks.ToString().Substring(Math.Max(0, DateTime.UtcNow.Ticks.ToString().Length - 6));

        var request = new ServiceRequest
        {
            ReferenceId = referenceId,
            Name = dto.Name,
            Phone = dto.Phone,
            Floor = dto.Floor,
            Building = dto.Building,
            Street = dto.Street,
            Area = dto.Area,
            City = dto.City,
            PinCode = dto.PinCode,
            Landmark = dto.Landmark,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Category = dto.Category,
            SelectedServices = dto.SelectedServices.Any() ? System.Text.Json.JsonSerializer.Serialize(dto.SelectedServices) : null,
            PreferredDate = dto.PreferredDate,
            PreferredTime = dto.PreferredTime,
            Notes = dto.Notes,
            Status = "New",
            SubmittedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ServiceRequests.Add(request);
        await _context.SaveChangesAsync();

        var result = MapToDto(request);

        // Send confirmation email
        _ = _emailService.SendServiceRequestConfirmationAsync(result);

        return result;
    }

    public async Task<ServiceRequestDto?> GetRequestAsync(int id)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        return request == null ? null : MapToDto(request);
    }

    public async Task<ServiceRequestDto?> GetRequestByReferenceAsync(string referenceId)
    {
        var request = await _context.ServiceRequests.FirstOrDefaultAsync(r => r.ReferenceId == referenceId);
        return request == null ? null : MapToDto(request);
    }

    public async Task<List<ServiceRequestDto>> GetAllRequestsAsync(string? statusFilter = null, string? searchQuery = null)
    {
        var query = _context.ServiceRequests.AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter) && statusFilter != "All")
        {
            query = query.Where(r => r.Status == statusFilter);
        }

        if (!string.IsNullOrEmpty(searchQuery))
        {
            var lowerQuery = searchQuery.ToLower();
            query = query.Where(r =>
                r.Name.ToLower().Contains(lowerQuery) ||
                r.Phone.Contains(searchQuery) ||
                r.Area.ToLower().Contains(lowerQuery) ||
                r.City.ToLower().Contains(lowerQuery)
            );
        }

        var requests = await query.OrderByDescending(r => r.SubmittedAt).ToListAsync();
        return requests.Select(MapToDto).ToList();
    }

    public async Task<ServiceRequestDto?> UpdateStatusAsync(int id, string status)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null)
            return null;

        request.Status = status;
        request.UpdatedAt = DateTime.UtcNow;

        _context.ServiceRequests.Update(request);
        await _context.SaveChangesAsync();

        return MapToDto(request);
    }

    public async Task<bool> DeleteRequestAsync(int id)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null)
            return false;

        _context.ServiceRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var total = await _context.ServiceRequests.CountAsync();
        var newCount = await _context.ServiceRequests.CountAsync(r => r.Status == "New");
        var contactedCount = await _context.ServiceRequests.CountAsync(r => r.Status == "Contacted");
        var completedCount = await _context.ServiceRequests.CountAsync(r => r.Status == "Completed");

        return new AdminStatsDto
        {
            TotalRequests = total,
            NewRequests = newCount,
            ContactedRequests = contactedCount,
            CompletedRequests = completedCount
        };
    }

    private static ServiceRequestDto MapToDto(ServiceRequest request)
    {
        var services = new List<string>();
        if (!string.IsNullOrEmpty(request.SelectedServices))
        {
            try
            {
                services = System.Text.Json.JsonSerializer.Deserialize<List<string>>(request.SelectedServices) ?? new();
            }
            catch { }
        }

        return new ServiceRequestDto
        {
            Id = request.Id,
            ReferenceId = request.ReferenceId,
            Name = request.Name,
            Phone = request.Phone,
            Floor = request.Floor,
            Building = request.Building,
            Street = request.Street,
            Area = request.Area,
            City = request.City,
            PinCode = request.PinCode,
            Landmark = request.Landmark,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Category = request.Category,
            SelectedServices = services,
            PreferredDate = request.PreferredDate,
            PreferredTime = request.PreferredTime,
            Notes = request.Notes,
            Status = request.Status,
            SubmittedAt = request.SubmittedAt,
            UpdatedAt = request.UpdatedAt
        };
    }
}

public interface ICategoryService
{
    Task<List<ServiceCategoryDto>> GetAllCategoriesAsync();
    Task<ServiceCategoryDto?> GetCategoryAsync(int id);
}

public class CategoryService : ICategoryService
{
    private readonly SahayakContext _context;

    public CategoryService(SahayakContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceCategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.ServiceCategories
            .Include(c => c.Items)
            .ToListAsync();

        return categories.Select(c => new ServiceCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Icon = c.Icon,
            Items = c.Items.Select(i => i.Name).ToList()
        }).ToList();
    }

    public async Task<ServiceCategoryDto?> GetCategoryAsync(int id)
    {
        var category = await _context.ServiceCategories
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return null;

        return new ServiceCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Icon = category.Icon,
            Items = category.Items.Select(i => i.Name).ToList()
        };
    }
}

public interface IServiceItemService
{
    Task<List<ServiceItemDto>> GetAllItemsAsync(string? search = null, int? categoryId = null);
    Task<List<ServiceItemDto>> GetItemsByCategoryIdAsync(int categoryId);
}

public class ServiceItemService : IServiceItemService
{
    private readonly SahayakContext _context;

    public ServiceItemService(SahayakContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceItemDto>> GetAllItemsAsync(string? search = null, int? categoryId = null)
    {
        var query = _context.ServiceItems
            .Include(i => i.Category)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(i => i.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lowerSearch = search.Trim().ToLower();
            query = query.Where(i => i.Name.ToLower().Contains(lowerSearch)
                                     || i.Category.Name.ToLower().Contains(lowerSearch));
        }

        var items = await query
            .OrderBy(i => i.Name)
            .ToListAsync();

        return items.Select(i => new ServiceItemDto
        {
            Id = i.Id,
            Name = i.Name,
            CategoryId = i.CategoryId,
            CategoryName = i.Category?.Name ?? string.Empty
        }).ToList();
    }

    public async Task<List<ServiceItemDto>> GetItemsByCategoryIdAsync(int categoryId)
    {
        return await GetAllItemsAsync(categoryId: categoryId);
    }
}

public interface IAreaService
{
    Task<List<AreaCoordinateDto>> GetAllAreasAsync();
    Task<AreaCoordinateDto?> GetAreaAsync(int id);
}

public class AreaService : IAreaService
{
    private readonly SahayakContext _context;

    public AreaService(SahayakContext context)
    {
        _context = context;
    }

    public async Task<List<AreaCoordinateDto>> GetAllAreasAsync()
    {
        var areas = await _context.AreaCoordinates.OrderBy(a => a.AreaName).ToListAsync();
        return areas.Select(a => new AreaCoordinateDto
        {
            Id = a.Id,
            AreaName = a.AreaName,
            PinCode = a.PinCode,
            Latitude = a.Latitude,
            Longitude = a.Longitude
        }).ToList();
    }

    public async Task<AreaCoordinateDto?> GetAreaAsync(int id)
    {
        var area = await _context.AreaCoordinates.FindAsync(id);
        if (area == null)
            return null;

        return new AreaCoordinateDto
        {
            Id = area.Id,
            AreaName = area.AreaName,
            PinCode = area.PinCode,
            Latitude = area.Latitude,
            Longitude = area.Longitude
        };
    }
}

public interface IServiceLogService
{
    Task<List<ServiceLogDto>> GetRecentLogsAsync(int count = 6);
}

public class ServiceLogService : IServiceLogService
{
    private readonly SahayakContext _context;

    public ServiceLogService(SahayakContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceLogDto>> GetRecentLogsAsync(int count = 6)
    {
        var logs = await _context.ServiceLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(count)
            .ToListAsync();

        return logs.Select(l => new ServiceLogDto
        {
            Id = l.Id,
            PersonName = l.PersonName,
            TaskDescription = l.TaskDescription,
            ServiceType = l.ServiceType,
            CreatedAt = l.CreatedAt
        }).ToList();
    }
}

// Email Service
public interface IEmailService
{
    Task SendServiceRequestConfirmationAsync(ServiceRequestDto request);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendServiceRequestConfirmationAsync(ServiceRequestDto request)
    {
        try
        {
            var sendGridApiKey = _configuration["SendGrid:ApiKey"];
            if (string.IsNullOrEmpty(sendGridApiKey))
            {
                _logger.LogWarning("SendGrid API key not configured. Email not sent.");
                return;
            }

            var client = new SendGrid.SendGridClient(sendGridApiKey);
            var from = new SendGrid.Helpers.Mail.EmailAddress("noreply@sahayak.com", "Sahayak Services");
            var to = new SendGrid.Helpers.Mail.EmailAddress("lokeshnaik058@gmail.com", "Sahayak Admin");
            var subject = $"New Service Request - {request.ReferenceId}";

            var htmlContent = BuildEmailHtml(request);

            var msg = new SendGrid.Helpers.Mail.SendGridMessage()
            {
                From = from,
                Subject = subject,
                HtmlContent = htmlContent
            };
            msg.AddTo(to);

            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted || 
                response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                _logger.LogInformation($"Email sent successfully for request {request.ReferenceId}");
            }
            else
            {
                _logger.LogError($"Failed to send email for request {request.ReferenceId}. Status: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email for service request");
        }
    }

    private string BuildEmailHtml(ServiceRequestDto request)
    {
        var selectedServices = request.SelectedServices == null || request.SelectedServices.Count == 0 
            ? "Not specified" 
            : string.Join(", ", request.SelectedServices);

        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }}
        .header {{ background: #0F3D39; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
        .content {{ padding: 20px; }}
        .section {{ margin-bottom: 20px; }}
        .label {{ font-weight: bold; color: #0F3D39; }}
        .value {{ margin-left: 20px; color: #555; }}
        .footer {{ background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777; border-radius: 0 0 8px 8px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>🏠 New Service Request</h1>
        </div>
        <div class=""content"">
            <div class=""section"">
                <p><span class=""label"">Reference ID:</span></p>
                <p class=""value""><strong>{request.ReferenceId}</strong></p>
            </div>

            <div class=""section"">
                <p><span class=""label"">📋 Personal Information</span></p>
                <p class=""value"">
                    <strong>Name:</strong> {request.Name}<br>
                    <strong>Phone:</strong> {request.Phone}<br>
                </p>
            </div>

            <div class=""section"">
                <p><span class=""label"">📍 Address</span></p>
                <p class=""value"">
                    {request.Floor}, {request.Building}<br>
                    {request.Street}<br>
                    {request.Area}, {request.City} - {request.PinCode}<br>
                    {(string.IsNullOrEmpty(request.Landmark) ? "" : $"Landmark: {request.Landmark}<br>")}<br>
                    <strong>GPS:</strong> {request.Latitude:F6}, {request.Longitude:F6}
                </p>
            </div>

            <div class=""section"">
                <p><span class=""label"">🛠️ Service Details</span></p>
                <p class=""value"">
                    <strong>Category:</strong> {request.Category}<br>
                    <strong>Services:</strong> {selectedServices}
                </p>
            </div>

            <div class=""section"">
                <p><span class=""label"">⏰ Scheduling</span></p>
                <p class=""value"">
                    <strong>Preferred Date:</strong> {(string.IsNullOrEmpty(request.PreferredDate) ? "Not specified" : request.PreferredDate)}<br>
                    <strong>Preferred Time:</strong> {(string.IsNullOrEmpty(request.PreferredTime) ? "Not specified" : request.PreferredTime)}
                </p>
            </div>

            <div class=""section"">
                <p><span class=""label"">📝 Notes</span></p>
                <p class=""value"">{(string.IsNullOrEmpty(request.Notes) ? "No special notes" : request.Notes)}</p>
            </div>

            <div class=""section"">
                <p><span class=""label"">📊 Status</span></p>
                <p class=""value""><strong>{request.Status}</strong></p>
            </div>

            <div class=""section"">
                <p><span class=""label"">📅 Submitted</span></p>
                <p class=""value"">{request.SubmittedAt:g}</p>
            </div>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Sahayak Service Platform. Please do not reply to this email.</p>
            <p>© 2026 Sahayak Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }
}
