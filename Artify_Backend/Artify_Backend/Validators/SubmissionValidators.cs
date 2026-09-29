using Artify.API.DTOs;
using FluentValidation;

namespace Artify.API.Validators;

public class CreateSubmissionDtoValidator : AbstractValidator<CreateSubmissionDto>
{
    public CreateSubmissionDtoValidator()
    {
        RuleFor(x => x.SubmitterName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.PhoneNumber).NotEmpty().Matches(@"^\+?[0-9\s\-]{7,20}$")
            .WithMessage("Enter a valid phone number");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MinimumLength(10).MaximumLength(4000);
        RuleFor(x => x.CategoryId).GreaterThan(0).WithMessage("Choose a category");
        RuleFor(x => x.ArtworkType).IsInEnum();
        RuleFor(x => x.OriginalPrice).GreaterThan(0).LessThanOrEqualTo(10_000_000);
        RuleFor(x => x.ImageUrl).NotEmpty().MaximumLength(500).WithMessage("Artwork image is required");
        RuleFor(x => x.AdditionalInformation).MaximumLength(2000);
    }
}

public class RejectSubmissionDtoValidator : AbstractValidator<RejectSubmissionDto>
{
    public RejectSubmissionDtoValidator() =>
        RuleFor(x => x.Reason).NotEmpty().WithMessage("A rejection reason is required")
            .MinimumLength(5).MaximumLength(1000);
}