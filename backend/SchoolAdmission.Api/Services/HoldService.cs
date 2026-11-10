using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Models;
using SchoolAdmission.Api.DTOs;
namespace SchoolAdmission.Api.Services;

public class HoldService
{
    private readonly ApplicationDbContext _db;
    private readonly int _holdDurationSeconds;

    public HoldService(
        ApplicationDbContext db,
        IConfiguration configuration)
    {
        _db = db;

        _holdDurationSeconds = int.TryParse(
            Environment.GetEnvironmentVariable("HOLD_DURATION_SECONDS"),
            out var envDuration)
            ? envDuration
            : configuration.GetValue<int>("HoldDurationSeconds", 600);

        if (_holdDurationSeconds <= 0)
            throw new InvalidOperationException(
                "HOLD_DURATION_SECONDS must be greater than zero.");
    }

    public async Task<(SeatHold? Hold, string? Error, bool NotFound)>
        CreateHoldAsync(Guid classId, string studentId)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync();


        var admissionClass = await _db.Classes
            .FromSqlInterpolated($"""
                SELECT * FROM "Classes"
                WHERE "Id" = {classId}
                FOR UPDATE
                """)
            .FirstOrDefaultAsync();

        if (admissionClass is null)
            return (null, "Class not found.", true);

        var now = DateTimeOffset.UtcNow;


        await _db.Holds
            .Where(h =>
                h.ClassId == classId &&
                h.Status == HoldStatus.HELD &&
                h.ExpiresAt <= now)
            .ExecuteUpdateAsync(update => update
                .SetProperty(h => h.Status, HoldStatus.EXPIRED));


        var existingHold = await _db.Holds.AnyAsync(h =>
            h.ClassId == classId &&
            h.StudentId == studentId &&
            (h.Status == HoldStatus.HELD ||
             h.Status == HoldStatus.CONFIRMED));

        if (existingHold)
            return (null,
                "You already have an active or confirmed application for this class.",
                false);

        var occupiedSeats = await _db.Holds.CountAsync(h =>
            h.ClassId == classId &&
            (h.Status == HoldStatus.CONFIRMED ||
             (h.Status == HoldStatus.HELD && h.ExpiresAt > now)));

        if (occupiedSeats >= admissionClass.TotalSeats)
            return (null, "No seats are currently available.", false);

        var hold = new SeatHold
        {
            ClassId = classId,
            StudentId = studentId,
            Status = HoldStatus.HELD,
            CreatedAt = now,
            ExpiresAt = now.AddSeconds(_holdDurationSeconds)
        };

        _db.Holds.Add(hold);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (hold, null, false);
    }



public async Task<SeatHold?> GetHoldAsync(Guid holdId)
{
    var hold = await _db.Holds
        .FirstOrDefaultAsync(h => h.Id == holdId);

    if (hold == null)
        return null;

    if (hold.Status == HoldStatus.HELD &&
        hold.ExpiresAt <= DateTimeOffset.UtcNow)
    {
        hold.Status = HoldStatus.EXPIRED;
        await _db.SaveChangesAsync();
    }

    return hold;
}



public async Task<(SeatHold? Hold, string? Error, int StatusCode)>
    ConfirmHoldAsync(Guid holdId, string studentId)
{
    var initialHold = await _db.Holds
        .AsNoTracking()
        .FirstOrDefaultAsync(h => h.Id == holdId);

    if (initialHold == null)
        return (null, "Hold not found.", 404);

    await using var transaction =
        await _db.Database.BeginTransactionAsync();

  
    await _db.Classes
        .FromSqlInterpolated($"""
            SELECT * FROM "Classes"
            WHERE "Id" = {initialHold.ClassId}
            FOR UPDATE
            """)
        .FirstOrDefaultAsync();

    var hold = await _db.Holds
        .FirstOrDefaultAsync(h => h.Id == holdId);

    if (hold == null || hold.StudentId != studentId)
        return (null, "Hold not found.", 404);


    if (hold.Status == HoldStatus.CONFIRMED)
    {
        await transaction.CommitAsync();
        return (hold, null, 200);
    }

    if (hold.Status == HoldStatus.HELD &&
        hold.ExpiresAt <= DateTimeOffset.UtcNow)
    {
        hold.Status = HoldStatus.EXPIRED;
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (null, "This hold has expired.", 409);
    }

    if (hold.Status != HoldStatus.HELD)
    {
        return (null, "This hold cannot be confirmed.", 409);
    }

    hold.Status = HoldStatus.CONFIRMED;
    hold.ConfirmedAt = DateTimeOffset.UtcNow;

    await _db.SaveChangesAsync();
    await transaction.CommitAsync();

    return (hold, null, 200);
}



public async Task<(bool Success, string? Error, int StatusCode)>
    CancelHoldAsync(Guid holdId, string studentId)
{
    var initialHold = await _db.Holds
        .AsNoTracking()
        .FirstOrDefaultAsync(h => h.Id == holdId);

    if (initialHold == null)
        return (false, "Hold not found.", 404);

    await using var transaction =
        await _db.Database.BeginTransactionAsync();

    await _db.Classes
        .FromSqlInterpolated($"""
            SELECT * FROM "Classes"
            WHERE "Id" = {initialHold.ClassId}
            FOR UPDATE
            """)
        .FirstOrDefaultAsync();

    var hold = await _db.Holds
        .FirstOrDefaultAsync(h => h.Id == holdId);

    if (hold == null || hold.StudentId != studentId)
        return (false, "Hold not found.", 404);

    if (hold.Status == HoldStatus.CANCELLED)
    {
        await transaction.CommitAsync();
        return (true, null, 204);
    }

    if (hold.Status == HoldStatus.HELD &&
        hold.ExpiresAt <= DateTimeOffset.UtcNow)
    {
        hold.Status = HoldStatus.EXPIRED;
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (false, "This hold has already expired.", 409);
    }

    if (hold.Status != HoldStatus.HELD &&
        hold.Status != HoldStatus.CONFIRMED)
    {
        return (false, "This application cannot be cancelled.", 409);
    }

    hold.Status = HoldStatus.CANCELLED;

    await _db.SaveChangesAsync();
    await transaction.CommitAsync();

    return (true, null, 204);
}



public async Task<List<StudentHoldResponse>> GetStudentHoldsAsync(
    string studentId)
{
    var now = DateTimeOffset.UtcNow;

    await _db.Holds
        .Where(h =>
            h.StudentId == studentId &&
            h.Status == HoldStatus.HELD &&
            h.ExpiresAt <= now)
        .ExecuteUpdateAsync(update => update
            .SetProperty(h => h.Status, HoldStatus.EXPIRED));

    return await _db.Holds
        .AsNoTracking()
        .Where(h => h.StudentId == studentId)
        .OrderByDescending(h => h.CreatedAt)
        .Select(h => new StudentHoldResponse
        {
            HoldId = h.Id,
            ClassId = h.ClassId,
            ClassName = h.AdmissionClass!.Name,
            Status = h.Status.ToString(),
            ExpiresAt = h.ExpiresAt,
            // CreatedAt = h.CreatedAt,
            // ConfirmedAt = h.ConfirmedAt
        })
        .ToListAsync();
}
}