namespace Artify.API.Entities;

public enum UserRole { Customer, Admin }
public enum ArtworkType { Painting, DigitalArt, Photography, Illustration, Sketch, Abstract, TraditionalArt }
public enum ArtworkStatus { Draft, Published, Unpublished, Sold, Archived }
public enum SubmissionStatus { Pending, Approved, Rejected }
public enum VariantType { Original, Poster, Canvas, FramedPrint }
public enum CartItemType { Artwork, CustomPrint }
public enum OrderStatus { Pending, Confirmed, Processing, Printing, Framing, Shipped, Delivered, Cancelled }
public enum PaymentMethod { CashOnDelivery, MockOnline }
public enum PaymentStatus { Pending, Paid, Failed, Refunded }