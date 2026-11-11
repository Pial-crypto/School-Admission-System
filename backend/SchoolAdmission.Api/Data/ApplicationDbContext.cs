using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<AdmissionClass> Classes => Set<AdmissionClass>();

    public DbSet<SeatHold> Holds => Set<SeatHold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<SeatHold>()
    .HasIndex(h => h.StudentId)
    .IsUnique()
    .HasFilter("\"Status\" = 'CONFIRMED'");
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AdmissionClass>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(c => c.TotalSeats)
                .IsRequired();

            entity.ToTable(table =>
                table.HasCheckConstraint(
                    "CK_Classes_TotalSeats",
                    "\"TotalSeats\" > 0"));
        });

        modelBuilder.Entity<SeatHold>(entity =>
        {
            entity.HasKey(h => h.Id);

            entity.Property(h => h.StudentId)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(h => h.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.HasOne(h => h.AdmissionClass)
                .WithMany(c => c.Holds)
                .HasForeignKey(h => h.ClassId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(h => new { h.ClassId, h.StudentId })
                .IsUnique()
                .HasFilter("\"Status\" IN ('HELD', 'CONFIRMED')");
        });
    }
}