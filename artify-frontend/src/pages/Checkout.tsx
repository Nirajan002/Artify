import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useGetCartQuery } from "../features/cart/cartApi";

import {
  useCreateAddressMutation,
  useGetAddressesQuery,
  type SaveAddressRequest,
} from "../features/addresses/addressApi";

import {
  useCreateOrderMutation,
  type PaymentMethodType,
} from "../features/orders/ordersApi";

import { formatPrice } from "../utils/image";
import { estimateShipping } from "../utils/shipping";
import { getErrorMessage } from "../utils/errors";

const emptyAddress: SaveAddressRequest = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nepal",
  isDefault: false,
};

const ADDRESS_FIELDS = [
  "fullName", "phoneNumber", "addressLine1", "addressLine2",
  "city", "state", "postalCode", "country",
] as const;

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full name", phoneNumber: "Phone",
  addressLine1: "Address line 1", addressLine2: "Address line 2 (optional)",
  city: "City", state: "State / Province",
  postalCode: "Postal code", country: "Country",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { data: cartRes, isLoading: cartLoading } = useGetCartQuery();
  const { data: addrRes, isLoading: addrLoading } = useGetAddressesQuery();
  const [createAddress, { isLoading: savingAddress }] = useCreateAddressMutation();
  const [createOrder, { isLoading: placing }] = useCreateOrderMutation();

  const cart = cartRes?.data;
  const addresses = addrRes?.data ?? [];

  const [addressId, setAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<SaveAddressRequest>(emptyAddress);
  const [method, setMethod] = useState<PaymentMethodType>("CashOnDelivery");
  const [error, setError] = useState("");

  const defaultAddressId =
    addresses.find((a) => a.isDefault)?.addressId ??
    addresses[0]?.addressId ?? null;
  const selectedAddressId = addressId ?? defaultAddressId;
  const shouldShowNewAddress = addresses.length === 0 || showNewAddress;

  if (cartLoading || addrLoading) {
    return <div className="page" style={{ textAlign: "center" }}><p className="muted">Loading checkout…</p></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="page">
        <h1>Checkout</h1>
        <p className="muted">Your cart is empty. <Link to="/shop" style={{ color: "#C8FF00" }}>Browse artwork</Link></p>
      </main>
    );
  }

  if (cart.hasIssues) {
    return (
      <main className="page">
        <h1>Checkout</h1>
        <p className="muted">
          Some items in your cart can't be purchased right now.{" "}
          <Link to="/cart" style={{ color: "#C8FF00" }}>Return to cart</Link> to remove them.
        </p>
      </main>
    );
  }

  const saveNewAddress = async () => {
    setError("");
    try {
      const res = await createAddress(newAddress).unwrap();
      setAddressId(res.data.addressId);
      setShowNewAddress(false);
      setNewAddress(emptyAddress);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId) { setError("Select a shipping address"); return; }
    setError("");
    try {
      const res = await createOrder({ addressId: selectedAddressId, paymentMethod: method }).unwrap();
      navigate(`/orders/${res.data.orderId}`, { state: { justPlaced: true } });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const shippingEstimate = estimateShipping(cart.subtotal);

  const sectionStyle: React.CSSProperties = {
    background: "#0d1f17",
    border: "1px solid rgba(200,255,0,0.1)",
    borderRadius: "12px",
    padding: "1.75rem",
    marginBottom: "1.5rem",
  };

  const sectionHeadStyle: React.CSSProperties = {
    fontSize: "1.05rem",
    marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid rgba(200,255,0,0.08)",
    color: "#C8FF00",
  };

  return (
    <main className="page checkout">
      <h1>Checkout</h1>

      {/* 1. Shipping address */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadStyle}>1. Shipping address</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {addresses.map((a) => (
            <label key={a.addressId} className="address-option">
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === a.addressId}
                onChange={() => setAddressId(a.addressId)}
              />
              <span>
                <strong style={{ color: "#d4e8d8" }}>{a.fullName}</strong>
                {" — "}{a.addressLine1}, {a.city}, {a.state} {a.postalCode}, {a.country}
              </span>
            </label>
          ))}
        </div>

        {!shouldShowNewAddress ? (
          <button type="button" onClick={() => setShowNewAddress(true)}
            style={{ marginTop: "1rem", background: "none", color: "#C8FF00", border: "1px solid rgba(200,255,0,0.3)" }}>
            + Add a new address
          </button>
        ) : (
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {ADDRESS_FIELDS.map((k) => (
              <label key={k} className="field">
                <span>{FIELD_LABELS[k]}</span>
                <input
                  value={newAddress[k] as string}
                  onChange={(e) => setNewAddress({ ...newAddress, [k]: e.target.value })}
                />
              </label>
            ))}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={saveNewAddress} disabled={savingAddress}>
                {savingAddress ? "Saving…" : "Save address"}
              </button>
              {addresses.length > 0 && (
                <button type="button" onClick={() => setShowNewAddress(false)}
                  style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 2. Payment method */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadStyle}>2. Payment method</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { value: "CashOnDelivery", label: "Cash on delivery" },
            { value: "MockOnline", label: "Pay online (demo)" },
          ].map((opt) => (
            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", color: "#d4e8d8", fontSize: "0.9rem" }}>
              <input
                type="radio"
                name="method"
                checked={method === opt.value}
                onChange={() => setMethod(opt.value as PaymentMethodType)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* 3. Order review */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadStyle}>3. Review order</h2>
        <ul className="checkout-review">
          {cart.items.map((i) => (
            <li key={i.cartItemId}>
              <span style={{ color: "#d4e8d8" }}>{i.title} × {i.quantity}</span>
              <span style={{ color: "#C8FF00", fontWeight: 600 }}>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div style={{ borderTop: "1px solid rgba(200,255,0,0.08)", marginTop: "1rem", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem", color: "#8ab89e" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Shipping</span><span>{formatPrice(shippingEstimate)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", color: "#C8FF00", marginTop: "0.5rem" }}>
            <span>Total</span><span>{formatPrice(cart.subtotal + shippingEstimate)}</span>
          </div>
        </div>
        <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
          The final total is confirmed by the server when you place your order.
        </p>
      </section>

      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}

      <button
        onClick={placeOrder}
        disabled={placing || !selectedAddressId}
        style={{ width: "100%", padding: "1rem", fontSize: "1.05rem", fontWeight: 800 }}
      >
        {placing ? "Placing order…" : "Place order →"}
      </button>
    </main>
  );
}
