using System.Text.Json;
using Artify.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await next(ctx); }
        catch (Exception ex)
        {
            var (status, message) = ex switch
            {
                KeyNotFoundException => (404, ex.Message),
                UnauthorizedAccessException => (401, ex.Message),
                InvalidOperationException => (400, ex.Message),
                DbUpdateConcurrencyException => (409, "This record was changed by someone else. Refresh and try again."),
                _ => (500, "An unexpected error occurred")   // never leak internals
            };
            if (status == 500) logger.LogError(ex, "Unhandled exception");

            ctx.Response.StatusCode = status;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(
                ApiResponse<object>.Fail(message),
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        }
    }
}