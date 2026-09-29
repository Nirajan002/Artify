using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[Authorize]
[Route("api/addresses")]
public class AddressesController(IAddressService addresses) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AddressDto>>>> GetAll()
        => Ok(ApiResponse<List<AddressDto>>.Ok(await addresses.GetAllAsync(UserId)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AddressDto>>> Create(SaveAddressDto dto)
        => Ok(ApiResponse<AddressDto>.Ok(await addresses.CreateAsync(UserId, dto), "Address saved"));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<AddressDto>>> Update(int id, SaveAddressDto dto)
        => Ok(ApiResponse<AddressDto>.Ok(await addresses.UpdateAsync(UserId, id, dto), "Address updated"));

    [HttpPut("{id:int}/default")]
    public async Task<ActionResult<ApiResponse<object>>> SetDefault(int id)
    {
        await addresses.SetDefaultAsync(UserId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Default address updated"));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await addresses.DeleteAsync(UserId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Address deleted"));
    }
}