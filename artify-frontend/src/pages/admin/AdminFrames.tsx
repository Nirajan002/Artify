import { useState } from "react";
import {
  useCreateFrameMutation, useDeleteFrameMutation, useGetFramesQuery, useUpdateFrameMutation,
  type Frame, type SaveFrameRequest,
} from "../../features/admin/adminApi";

const empty: SaveFrameRequest = { name: "", description: "", additionalPrice: 0, isActive: true };

export default function AdminFrames() {
  const { data, isLoading } = useGetFramesQuery();
  const [create] = useCreateFrameMutation();
  const [update] = useUpdateFrameMutation();
  const [remove] = useDeleteFrameMutation();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);

  const edit = (f: Frame) => { setForm(f); setEditingId(f.frameId); };
  const reset = () => { setForm(empty); setEditingId(null); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await update({ id: editingId, body: form });
    else await create(form);
    reset();
  };

  return (
    <main>
      <h1 style={{ marginBottom: "1.5rem" }}>Frames</h1>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Additional price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((f) => (
              <tr key={f.frameId}>
                <td style={{ color: "#d4e8d8" }}>{f.name}</td>
                <td style={{ color: "#C8FF00" }}>Rs. {f.additionalPrice}</td>
                <td>
                  <span style={{ color: f.isActive ? "#50dc8c" : "#ff8080", fontWeight: 600, fontSize: "0.85rem" }}>
                    {f.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => edit(f)} style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}>Edit</button>
                  {f.isActive && (
                    <button
                      onClick={() => remove(f.frameId)}
                      style={{ background: "none", color: "#ff8080", border: "1px solid rgba(255,128,128,0.3)", padding: "0.3rem 0.65rem", fontSize: "0.8rem", boxShadow: "none" }}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={onSubmit} className="submit-form" style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>{editingId ? "Edit frame" : "New frame"}</h2>
        <label className="field"><span>Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="field"><span>Description</span>
          <input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="field"><span>Additional price (Rs.)</span>
          <input type="number" min={0} step="any" value={form.additionalPrice}
            onChange={(e) => setForm({ ...form, additionalPrice: Number(e.target.value) })} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", color: "#8ab89e", fontSize: "0.9rem" }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div>
          <button type="submit">{editingId ? "Save changes" : "Create frame"}</button>
          {editingId && (
            <button type="button" onClick={reset}
              style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)" }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </main>
  );
}