using Artify.API.Entities;
using Artify.API.Interfaces;

namespace Artify.API.Services;

public class PaymentService : IPaymentService
{
    public Payment Process(Order order, PaymentMethod method)
    {
        var payment = new Payment { OrderId = order.OrderId, Amount = order.TotalAmount, PaymentMethod = method };

        if (method == PaymentMethod.MockOnline)
        {
            // Simulated gateway for this academic build: always succeeds
            payment.PaymentStatus = PaymentStatus.Paid;
            payment.TransactionReference = $"MOCK-{Guid.NewGuid():N}".Substring(0, 17).ToUpperInvariant();
            payment.PaidAt = DateTime.UtcNow;
            order.PaymentStatus = PaymentStatus.Paid;
        }
        else
        {
            payment.PaymentStatus = PaymentStatus.Pending;   // collected on delivery
            order.PaymentStatus = PaymentStatus.Pending;
        }

        return payment;
    }
}