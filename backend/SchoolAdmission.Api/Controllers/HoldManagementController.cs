using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
public class HoldManagementController : ControllerBase
{
    private readonly HoldService _holdService;

    public HoldManagementController(HoldService holdService)
    {
        _holdService = holdService;
    }

    
    [HttpGet("holds/{holdId:guid}")]
    public async Task<IActionResult> GetHold(Guid holdId)
    {
        var hold = await _holdService.GetHoldAsync(holdId);
        // Console.WriteLine($"Retrieved hold: {hold?.Id}, ClassId: {hold?.ClassId}, Status: {hold?.Status}, ExpiresAt: {hold?.ExpiresAt}");

        if (hold == null)
            return NotFound(new { message = "Hold not found." });

        return Ok(new
        {
            holdId = hold.Id,
            classId = hold.ClassId,
            status = hold.Status.ToString(),
            expiresAt = hold.ExpiresAt
        });
    }

  
    [HttpPost("holds/{holdId:guid}/confirm")]
    public async Task<IActionResult> ConfirmHold(
        Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new
            {
                message = "X-Student-Id header is required."
            });
        }

        var result = await _holdService.ConfirmHoldAsync(
            holdId,
            studentId.Trim());

        if (result.Hold == null)
        {
            return StatusCode(result.StatusCode, new
            {
                message = result.Error
            });
        }

        return Ok(new
        {
            holdId = result.Hold.Id,
            status = result.Hold.Status.ToString()
        });
    }

   
    [HttpDelete("holds/{holdId:guid}")]
    public async Task<IActionResult> CancelHold(
        Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new
            {
                message = "X-Student-Id header is required."
            });
        }

        var result = await _holdService.CancelHoldAsync(
            holdId,
            studentId.Trim());

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new
            {
                message = result.Error
            });
        }

        return NoContent();
    }

    
    [HttpGet("me/holds")]
    public async Task<IActionResult> GetMyHolds(
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new
            {
                message = "X-Student-Id header is required."
            });
        }

        var holds = await _holdService.GetStudentHoldsAsync(
            studentId.Trim());

        return Ok(holds);
    }
}