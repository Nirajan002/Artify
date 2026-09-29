using Artify.API.DTOs;
using FluentValidation;

namespace Artify.API.Validators;

public class SaveArtworkDtoValidator : AbstractValidator<SaveArtworkDto>
{
    public SaveArtworkDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.ImageUrl).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ArtworkType).IsInEnum();
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.OriginalPrice).GreaterThanOrEqualTo(0);
        RuleForEach(x => x.Variants).ChildRules(v =>
        {
            v.RuleFor(y => y.VariantType).IsInEnum();
            v.RuleFor(y => y.BasePrice).GreaterThanOrEqualTo(0);
            v.RuleFor(y => y.StockQuantity).GreaterThanOrEqualTo(0);
        });
        RuleFor(x => x.Variants).Must(v => v.Select(i => i.VariantType).Distinct().Count() == v.Count)
            .WithMessage("Each variant type can only appear once");
    }
}

public class SaveCategoryDtoValidator : AbstractValidator<SaveCategoryDto>
{
    public SaveCategoryDtoValidator() => RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
}