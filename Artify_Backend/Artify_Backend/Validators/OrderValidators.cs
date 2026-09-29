using Artify.API.DTOs;
using FluentValidation;

namespace Artify.API.Validators;

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.AddressId).GreaterThan(0).WithMessage("Select a shipping address");
        RuleFor(x => x.PaymentMethod).IsInEnum();
    }
}