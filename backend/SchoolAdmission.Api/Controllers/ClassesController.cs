
using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly ClassService _classService;


    public ClassesController(ClassService classService)
    {
        _classService = classService;
    }


    [HttpPost]
    public async Task<ActionResult<ClassResponse>> CreateClass(
        [FromBody] CreateClassRequest request)
    {
       
        var response = await _classService.CreateClassAsync(request);


        return CreatedAtAction(
            nameof(GetClass),
            new { classId = response.Id },
            new
            {
                id = response.Id,
                name = response.Name,
                totalSeats = response.TotalSeats
            });
    }

   
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClassResponse>>> GetClasses()
    {
     
        var classes = await _classService.GetClassesAsync();

        return Ok(classes);
    }

   
    [HttpGet("{classId:guid}")]
    public async Task<ActionResult<ClassResponse>> GetClass(Guid classId)
    {
        
        var result = await _classService.GetClassByIdAsync(classId);

  
        if (result is null)
            return NotFound(new { message = "Class not found." });

        return Ok(result);
    }
}
