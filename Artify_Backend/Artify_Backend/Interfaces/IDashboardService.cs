using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<DashboardChartsDto> GetChartsAsync();
}