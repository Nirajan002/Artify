namespace Artify.API.Helpers;

public class ShippingSettings
{
    public decimal FlatFee { get; set; } = 150;
    public decimal FreeThreshold { get; set; } = 5000;   // orders at or above this ship free
}