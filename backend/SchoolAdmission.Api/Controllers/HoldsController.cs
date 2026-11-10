using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes/{classId:guid}/holds")]
public class HoldsController : ControllerBase
{
    private readonly HoldService _holdService;

    public HoldsController(HoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateHold(
        Guid classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new
            {
                message = "X-Student-Id header is required."
            });
        }

        studentId = studentId.Trim();
        //Console.WriteLine(studentId);

        if (studentId.Length > 100)
        {
            return BadRequest(new
            {
                message = "Student ID cannot exceed 100 characters."
            });
        }

        var result = await _holdService.CreateHoldAsync(
            classId,
            studentId);

        if (result.NotFound)
        {
            return NotFound(new { message = result.Error });
        }

        if (result.Hold is null)
        {
            return Conflict(new { message = result.Error });
        }

        var response = new HoldResponse
        {
            HoldId = result.Hold.Id,
            ClassId = result.Hold.ClassId,
            StudentId = result.Hold.StudentId,
            Status = result.Hold.Status.ToString(),
            ExpiresAt = result.Hold.ExpiresAt
        };

        return StatusCode(StatusCodes.Status201Created, response);
    }
}