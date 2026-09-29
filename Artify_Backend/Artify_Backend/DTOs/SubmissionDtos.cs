using Artify.API.Entities;

namespace Artify.API.DTOs;

public class CreateSubmissionDto
{
    public string SubmitterName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int CategoryId { get; set; }
    public ArtworkType ArtworkType { get; set; }
    public decimal OriginalPrice { get; set; }
    public string ImageUrl { get; set; } = "";          // returned by the upload endpoint
    public string? AdditionalInformation { get; set; }
}

public record SubmissionCreatedDto(int SubmissionId, string Status);

public class SubmissionQuery
{
    public SubmissionStatus? Status { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class SubmissionListDto
{
    public int SubmissionId { get; set; }
    public string Title { get; set; } = "";
    public string SubmitterName { get; set; } = "";
    public string Email { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal OriginalPrice { get; set; }
    public SubmissionStatus Status { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class SubmissionDetailDto : SubmissionListDto
{
    public string PhoneNumber { get; set; } = "";
    public string Description { get; set; } = "";
    public int CategoryId { get; set; }
    public ArtworkType ArtworkType { get; set; }
    public string? AdditionalInformation { get; set; }
    public string? AdminComment { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public int? ArtworkId { get; set; }
}

public class ApproveSubmissionDto { public string? Comment { get; set; } }
public class RejectSubmissionDto { public string Reason { get; set; } = ""; }