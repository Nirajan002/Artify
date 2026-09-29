using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Services;
using FluentValidation;

namespace Artify.API.Validators;

public class AddCartItemDtoValidator : AbstractValidator<AddCartItemDto>
{
    public AddCartItemDtoValidator()
    {
        RuleFor(x => x.ItemType).IsInEnum();
        RuleFor(x => x.Quantity).InclusiveBetween(1, CartRules.MaxQuantityPerItem);

        When(x => x.ItemType == CartItemType.Artwork, () =>
            RuleFor(x => x.ArtworkVariantId).NotNull().WithMessage("Choose a version to add"));

        When(x => x.ItemType == CartItemType.CustomPrint, () =>
        {
            RuleFor(x => x.CustomArtworkUrl).NotEmpty().WithMessage("Upload your artwork first");
            RuleFor(x => x.CustomWidth).NotNull().GreaterThan(0);
            RuleFor(x => x.CustomHeight).NotNull().GreaterThan(0);
            RuleFor(x => x.MaterialId).NotNull().WithMessage("Choose a material");
            RuleFor(x => x.FrameId).NotNull().WithMessage("Choose a frame");
        });
    }
}

public class UpdateCartItemDtoValidator : AbstractValidator<UpdateCartItemDto>
{
    public UpdateCartItemDtoValidator() =>
        RuleFor(x => x.Quantity).InclusiveBetween(1, CartRules.MaxQuantityPerItem);
}

public class SaveAddressDtoValidator : AbstractValidator<SaveAddressDto>
{
    public SaveAddressDtoValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PhoneNumber).NotEmpty().Matches(@"^\+?[0-9\s\-]{7,20}$")
            .WithMessage("Enter a valid phone number");
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AddressLine2).MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}