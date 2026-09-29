using Artify.API.DTOs;
using Artify.API.Services;
using FluentValidation;

namespace Artify.API.Validators;

public class PrintPriceRequestDtoValidator : AbstractValidator<PrintPriceRequestDto>
{
    public PrintPriceRequestDtoValidator()
    {
        RuleFor(x => x.Width).GreaterThan(0);
        RuleFor(x => x.Height).GreaterThan(0);
        RuleFor(x => x.MaterialId).GreaterThan(0).WithMessage("Choose a material");
        RuleFor(x => x.FrameId).GreaterThan(0).WithMessage("Choose a frame");
        RuleFor(x => x.Quantity).InclusiveBetween(1, CartRules.MaxQuantityPerItem);
    }
}