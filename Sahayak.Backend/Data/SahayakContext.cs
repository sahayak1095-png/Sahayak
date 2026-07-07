using Microsoft.EntityFrameworkCore;
using Sahayak.Backend.Models;

namespace Sahayak.Backend.Data;

public class SahayakContext : DbContext
{
    public SahayakContext(DbContextOptions<SahayakContext> options) : base(options)
    {
    }

    public DbSet<ServiceCategory> ServiceCategories { get; set; }
    public DbSet<ServiceItem> ServiceItems { get; set; }
    public DbSet<AreaCoordinate> AreaCoordinates { get; set; }
    public DbSet<ServiceRequest> ServiceRequests { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<ServiceLog> ServiceLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ServiceCategory relationships
        modelBuilder.Entity<ServiceCategory>()
            .HasMany(c => c.Items)
            .WithOne(i => i.Category)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure decimal for coordinates
        modelBuilder.Entity<AreaCoordinate>()
            .Property(a => a.Latitude)
            .HasPrecision(18, 6);

        modelBuilder.Entity<AreaCoordinate>()
            .Property(a => a.Longitude)
            .HasPrecision(18, 6);

        modelBuilder.Entity<ServiceRequest>()
            .Property(s => s.Latitude)
            .HasPrecision(18, 6);

        modelBuilder.Entity<ServiceRequest>()
            .Property(s => s.Longitude)
            .HasPrecision(18, 6);

        // Add index on ReferenceId for quick lookups
        modelBuilder.Entity<ServiceRequest>()
            .HasIndex(s => s.ReferenceId)
            .IsUnique();
    }
}
