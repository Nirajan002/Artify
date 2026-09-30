import { useState } from "react";
import {
  useCreateAddressMutation, useDeleteAddressMutation, useGetAddressesQuery,
  useSetDefaultAddressMutation, useUpdateAddressMutation,
  type Address, type SaveAddressRequest,
} from "../features/addresses/addressApi";
import { getErrorMessage, getFieldErrors } from "../utils/errors";
import ConfirmDialog from "../components/ConfirmDialog";
import { showToast } from "../components/Toast";

const empty: SaveAddressRequest = {
  fullName: "", phoneNumber: "", addressLine1: "", addressLine2: "",
  city: "", state: "", postalCode: "", country: "Nepal", isDefault: false,
};

const FIELDS: { key: keyof SaveAddressRequest; label: string }[] = [
  { key: "fullName", label: "Full name" },
  { key: "phoneNumber", label: "Phone" },
  { key: "addressLine1", label: "Address line 1" },
  { key: "addressLine2", label: "Address line 2 (optional)" },
  { key: "city", label: "City" },
  { key: "state", label: "State / Province" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
];

export default function Addresses() {
  const { data, isLoading, isError, refetch } = useGetAddressesQuery();
  const [create, { isLoading: creating }] = useCreateAddressMutation();
  const [update, { isLoading: updating }] = useUpdateAddressMutation();
  const [setDefault] = useSetDefaultAddressMutation();
  const [remove] = useDeleteAddressMutation();

  const [form, setForm] = useState<SaveAddressRequest>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const open = (a?: Address) => {
    setForm(a ? { ...a } : empty);
    setEditingId(a?.addressId ?? null);
    setError(""); setFieldErrors({}); setShowForm(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setFieldErrors({});
    try {
      if (editingId) await update({ id: editingId, body: form }).unwrap();
      else await create(form).unwrap();
      setShowForm(false);
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    }
  };

  const onDelete = async (id: number) => {
    try {
      await remove(id).unwrap();
      showToast("Address deleted.", "info");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) return <div className="page" style={{ textAlign: "center" }}><p className="muted">Loading addresses…</p></div>;
  if (isError) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Could not load addresses. <button onClick={refetch}>Try again</button></p>
    </div>
  );

  const addresses = data?.data ?? [];

  return (
    <main className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Saved addresses</h1>
        {!showForm && (
          <button onClick={() => open()}>+ Add new address</button>
        )}
      </div>

      {error && !showForm && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="submit-form" noValidate style={{ marginTop: 0, marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem" }}>{editingId ? "Edit address" : "New address"}</h2>
          {FIELDS.map(({ key, label }) => (
            <label key={key} className="field">
              <span>{label}</span>
              <input
                value={(form[key] as string) ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
              {fieldErrors[key] && <small className="error">{fieldErrors[key]}</small>}
            </label>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", color: "#8ab89e", fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Use as default address
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" disabled={creating || updating}>
              {creating || updating ? "Saving…" : "Save address"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p className="muted">You haven't saved any addresses yet.</p>
        </div>
      )}

      <ul className="address-list">
        {addresses.map((a) => (
          <li key={a.addressId} className="address-card">
            {a.isDefault && <span className="badge badge--approved" style={{ marginBottom: "0.5rem" }}>Default</span>}
            <strong>{a.fullName}</strong>
            <span>{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</span>
            <span>{a.city}, {a.state} {a.postalCode}</span>
            <span>{a.country} · {a.phoneNumber}</span>
            <div style={{ marginTop: "0.75rem" }}>
              <button onClick={() => open(a)}>Edit</button>
              {!a.isDefault && (
                <button onClick={() => setDefault(a.addressId)}
                  style={{ background: "none", color: "#8ab89e", border: "1px solid rgba(200,255,0,0.1)" }}>
                  Make default
                </button>
              )}
              <button className="danger" onClick={() => setDeleteTarget(a.addressId)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Address"
        message="Are you sure you want to delete this address? This cannot be undone."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={() => deleteTarget !== null && onDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}