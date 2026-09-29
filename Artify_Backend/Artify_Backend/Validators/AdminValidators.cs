using Artify.API.DTOs;
using FluentValidation;

namespace Artify.API.Validators;

public class SaveMaterialDtoValidator : AbstractValidator<SaveMaterialDto>
{
    public SaveMaterialDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PricePerSquareUnit).GreaterThanOrEqualTo(0);
    }
}

public class SaveFrameDtoValidator : AbstractValidator<SaveFrameDto>
{
    public SaveFrameDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AdditionalPrice).GreaterThanOrEqualTo(0);
    }
}