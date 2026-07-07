namespace Sahayak.Backend.Models;

public class CreateServiceRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string City { get; set; } = "Bengaluru";
    public string PinCode { get; set; } = string.Empty;
    public string Landmark { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<string> SelectedServices { get; set; } = new();
    public string? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public string? Notes { get; set; }
}

public class ServiceRequestDto
{
    public int Id { get; set; }
    public string ReferenceId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public string Landmark { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<string> SelectedServices { get; set; } = new();
    public string? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateServiceRequestStatusDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ServiceCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public List<string> Items { get; set; } = new();
}

public class ServiceItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

public class AreaCoordinateDto
{
    public int Id { get; set; }
    public string AreaName { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class ServiceLogDto
{
    public int Id { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public string TaskDescription { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminStatsDto
{
    public int TotalRequests { get; set; }
    public int NewRequests { get; set; }
    public int ContactedRequests { get; set; }
    public int CompletedRequests { get; set; }
}

public class LoginDto
{
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
}
