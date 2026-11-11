
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Services;

public class ClassService
{
    private readonly ApplicationDbContext _db;

  
    public ClassService(ApplicationDbContext db)
    {
        _db = db;
    }


public async Task<ClassResponse> CreateClassAsync(
    CreateClassRequest request)
{
    var className = request.Name.Trim();

    if (await _db.Classes.AnyAsync(c => c.Name == className))
    {
        throw new Exception("Class name already exists.");
    }

    var admissionClass = new AdmissionClass
    {
        Name = className,
        TotalSeats = request.TotalSeats
    };

    _db.Classes.Add(admissionClass);

    await _db.SaveChangesAsync();

    var response = new ClassResponse
    {
        Id = admissionClass.Id,
        Name = admissionClass.Name,
        TotalSeats = admissionClass.TotalSeats,
        HeldSeats = 0,
        ConfirmedSeats = 0,
        AvailableSeats = admissionClass.TotalSeats
    };

    return response;
}
  
    public async Task<List<ClassResponse>> GetClassesAsync()
    {
    
        var now = DateTimeOffset.UtcNow;

       
        var classes = await _db.Classes
            .AsNoTracking()
            .Select(c => new ClassResponse
            {
                Id = c.Id,
                Name = c.Name,
                TotalSeats = c.TotalSeats,


                HeldSeats = c.Holds.Count(h =>
                    h.Status == HoldStatus.HELD &&
                    h.ExpiresAt > now),

            
                ConfirmedSeats = c.Holds.Count(h =>
                    h.Status == HoldStatus.CONFIRMED),


                AvailableSeats = c.TotalSeats -
                    c.Holds.Count(h =>
                        h.Status == HoldStatus.HELD &&
                        h.ExpiresAt > now) -
                    c.Holds.Count(h =>
                        h.Status == HoldStatus.CONFIRMED)
            })
            .ToListAsync();

        return classes;
    }

    
    public async Task<ClassResponse?> GetClassByIdAsync(Guid classId)
    {
        var now = DateTimeOffset.UtcNow;

        var result = await _db.Classes
            .AsNoTracking()
            .Where(c => c.Id == classId)
            .Select(c => new ClassResponse
            {
                Id = c.Id,
                Name = c.Name,
                TotalSeats = c.TotalSeats,

                HeldSeats = c.Holds.Count(h =>
                    h.Status == HoldStatus.HELD &&
                    h.ExpiresAt > now),

                ConfirmedSeats = c.Holds.Count(h =>
                    h.Status == HoldStatus.CONFIRMED),

                AvailableSeats = c.TotalSeats -
                    c.Holds.Count(h =>
                        h.Status == HoldStatus.HELD &&
                        h.ExpiresAt > now) -
                    c.Holds.Count(h =>
                        h.Status == HoldStatus.CONFIRMED)
            })
            .FirstOrDefaultAsync();

  
        return result;
    }
}
