using Artify.API.DTOs;
using FluentValidation;

namespace Artify.API.Validators;

public class SaveReviewDtoValidator : AbstractValidator<SaveReviewDto>
{
    public SaveReviewDtoValidator()
    {
        RuleFor(x => x.OrderId).GreaterThan(0);
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(2000);
    }
}