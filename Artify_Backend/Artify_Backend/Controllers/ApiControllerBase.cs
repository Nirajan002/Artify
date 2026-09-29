using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    // Always taken from the validated JWT, never from the request
    protected int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}