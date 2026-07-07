using Microsoft.AspNetCore.Mvc;
using Sahayak.Backend.Models;
using Sahayak.Backend.Services;

namespace Sahayak.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly IServiceRequestService _requestService;

    public RequestsController(IServiceRequestService requestService)
    {
        _requestService = requestService;
    }

    [HttpPost("create")]
    public async Task<ActionResult<ServiceRequestDto>> CreateRequest([FromBody] CreateServiceRequestDto dto)
    {
        var result = await _requestService.CreateRequestAsync(dto);
        return CreatedAtAction(nameof(GetRequest), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceRequestDto>> GetRequest(int id)
    {
        var result = await _requestService.GetRequestAsync(id);
        if (result == null)
            return NotFound();
        return result;
    }

    [HttpGet("reference/{referenceId}")]
    public async Task<ActionResult<ServiceRequestDto>> GetRequestByReference(string referenceId)
    {
        var result = await _requestService.GetRequestByReferenceAsync(referenceId);
        if (result == null)
            return NotFound();
        return result;
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<ServiceRequestDto>>> GetAllRequests([FromQuery] string? status = null, [FromQuery] string? search = null)
    {
        var results = await _requestService.GetAllRequestsAsync(status, search);
        return Ok(results);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ServiceRequestDto>> UpdateStatus(int id, [FromBody] UpdateServiceRequestStatusDto dto)
    {
        var result = await _requestService.UpdateStatusAsync(id, dto.Status);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var stats = await _requestService.GetStatsAsync();
        return Ok(stats);
    }
}

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceCategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceCategoryDto>> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryAsync(id);
        if (category == null)
            return NotFound();
        return Ok(category);
    }
}

[ApiController]
[Route("api/[controller]")]
public class AreasController : ControllerBase
{
    private readonly IAreaService _areaService;

    public AreasController(IAreaService areaService)
    {
        _areaService = areaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AreaCoordinateDto>>> GetAreas()
    {
        var areas = await _areaService.GetAllAreasAsync();
        return Ok(areas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AreaCoordinateDto>> GetArea(int id)
    {
        var area = await _areaService.GetAreaAsync(id);
        if (area == null)
            return NotFound();
        return Ok(area);
    }
}

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly IServiceLogService _logService;

    public LogsController(IServiceLogService logService)
    {
        _logService = logService;
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<ServiceLogDto>>> GetRecentLogs([FromQuery] int count = 6)
    {
        var logs = await _logService.GetRecentLogsAsync(count);
        return Ok(logs);
    }
}

[ApiController]
[Route("api/[controller]")]
public class ServiceItemsController : ControllerBase
{
    private readonly IServiceItemService _serviceItemService;

    public ServiceItemsController(IServiceItemService serviceItemService)
    {
        _serviceItemService = serviceItemService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceItemDto>>> GetAllItems()
    {
        var items = await _serviceItemService.GetAllItemsAsync();
        return Ok(items);
    }

    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<List<ServiceItemDto>>> GetItemsByCategory(int categoryId)
    {
        var items = await _serviceItemService.GetItemsByCategoryIdAsync(categoryId);
        return Ok(items);
    }
}

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IServiceRequestService _requestService;
    private readonly IConfiguration _configuration;

    public AdminController(IServiceRequestService requestService, IConfiguration configuration)
    {
        _requestService = requestService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login([FromBody] LoginDto dto)
    {
        var adminPassword = _configuration["AdminSettings:Password"] ?? "sahayak";
        
        if (dto.Password == adminPassword)
        {
            return Ok(new LoginResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = GenerateSimpleToken()
            });
        }

        return Unauthorized(new LoginResponseDto
        {
            Success = false,
            Message = "Invalid password"
        });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var stats = await _requestService.GetStatsAsync();
        return Ok(stats);
    }

    private static string GenerateSimpleToken()
    {
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(DateTime.UtcNow.Ticks.ToString()));
    }
}
