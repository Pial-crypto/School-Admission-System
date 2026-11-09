using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ClassesController(ApplicationDbContext db)
    {
        _db = db;
    }

 
    [HttpPost]
    public async Task<ActionResult<ClassResponse>> CreateClass(
        [FromBody] CreateClassRequest request)
    {
        var admissionClass = new AdmissionClass
        {
            Name = request.Name.Trim(),
            TotalSeats = request.TotalSeats
        };

        _db.Classes.Add(admissionClass);

        await _db.SaveChangesAsync();

        var response = new ClassResponse
        {
            Id = admissionClass.Id,
            Name = admissionClass.Name,
            TotalSeats = admissionClass.TotalSeats,
            // HeldSeats = 0,
            // ConfirmedSeats = 0,
            // AvailableSeats = admissionClass.TotalSeats
        };

        return CreatedAtAction(
            nameof(GetClass),
            new { classId = admissionClass.Id },
            response);
    }

    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClassResponse>>> GetClasses()
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

        return Ok(classes);
    }

  
    [HttpGet("{classId:guid}")]
    public async Task<ActionResult<ClassResponse>> GetClass(
        Guid classId)
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

        if (result is null)
            return NotFound(new { message = "Class not found." });

        return Ok(result);
    }
}