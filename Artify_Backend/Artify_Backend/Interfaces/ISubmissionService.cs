using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface ISubmissionService
{
    Task<SubmissionCreatedDto> CreateAsync(CreateSubmissionDto dto);
    Task<PagedResult<SubmissionListDto>> GetListAsync(SubmissionQuery query);
    Task<SubmissionDetailDto> GetByIdAsync(int id);
    Task<SubmissionDetailDto> ApproveAsync(int id, int adminId, string? comment);
    Task<SubmissionDetailDto> RejectAsync(int id, int adminId, string reason);
}