namespace SchoolAdmission.Api.Models;

public class SeatHold
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClassId { get; set; }

    public AdmissionClass? AdmissionClass { get; set; }

    public string StudentId { get; set; } = string.Empty;

    public HoldStatus Status { get; set; } = HoldStatus.HELD;

    public DateTimeOffset CreatedAt { get; set; } =
        DateTimeOffset.UtcNow;

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? ConfirmedAt { get; set; }
}