using Artify.API.Entities;
namespace Artify.API.Interfaces;

public interface IPaymentService
{
    /// Creates the Payment row and sets order.PaymentStatus. Does not save — the caller controls the transaction.
    Payment Process(Order order, PaymentMethod method);
}