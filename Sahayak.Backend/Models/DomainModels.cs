using System.ComponentModel.DataAnnotations;

namespace Sahayak.Backend.Models;

public class ServiceCategory
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Icon { get; set; } = string.Empty;

    public List<ServiceItem> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ServiceItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public ServiceCategory? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AreaCoordinate
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string AreaName { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string PinCode { get; set; } = string.Empty;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ServiceRequest
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string ReferenceId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    // Address
    [MaxLength(50)]
    public string Floor { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Building { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Street { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Area { get; set; } = string.Empty;

    [MaxLength(50)]
    public string City { get; set; } = "Bengaluru";

    [MaxLength(10)]
    public string PinCode { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Landmark { get; set; } = string.Empty;

    // Location
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Service Info
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public string? SelectedServices { get; set; } // JSON array

    // Schedule
    [MaxLength(50)]
    public string? PreferredDate { get; set; }

    [MaxLength(50)]
    public string? PreferredTime { get; set; }

    // Additional Info
    public string? Notes { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "New";

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class AdminUser
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ServiceLog
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string PersonName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TaskDescription { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ServiceType { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
