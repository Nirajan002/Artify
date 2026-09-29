using Artify.API.Entities;

namespace Artify.API.Services;

public static class OrderStatusFlow
{
    public static readonly OrderStatus[] ArtworkFlow =
        { OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered };

    public static readonly OrderStatus[] CustomPrintFlow =
        { OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Printing, OrderStatus.Framing, OrderStatus.Shipped, OrderStatus.Delivered };

    public static OrderStatus[] For(bool hasCustomPrint) => hasCustomPrint ? CustomPrintFlow : ArtworkFlow;

    // Customers can only back out before printing/processing has started
    public static bool CanCancel(OrderStatus status) => status is OrderStatus.Pending or OrderStatus.Confirmed;

    // Used by the Phase 9 admin panel: the next status in this order's flow, or null once delivered
    public static OrderStatus? Next(OrderStatus current, bool hasCustomPrint)
    {
        var flow = For(hasCustomPrint);
        var idx = Array.IndexOf(flow, current);
        return idx >= 0 && idx < flow.Length - 1 ? flow[idx + 1] : null;
    }
}