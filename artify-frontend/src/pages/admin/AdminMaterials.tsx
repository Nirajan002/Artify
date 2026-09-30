import { useState } from "react";
import {
  useCreateMaterialMutation, useDeleteMaterialMutation, useGetMaterialsQuery, useUpdateMaterialMutation,
  type Material, type SaveMaterialRequest,
} from "../../features/admin/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { getErrorMessage } from "../../utils/errors";

const empty: SaveMaterialRequest = { name: "", description: "", pricePerSquareUnit: 0, isActive: true };

export default function AdminMaterials() {
  const { data, isLoading, isError, refetch } = useGetMaterialsQuery();
  const [create, { isLoading: creating }] = useCreateMaterialMutation();
  const [update, { isLoading: updating }] = useUpdateMaterialMutation();
  const [remove] = useDeleteMaterialMutation();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [formError, setFormError] = useState("");

  const edit = (m: Material) => { setForm(m); setEditingId(m.materialId); setFormError(""); };
  const reset = () => { setForm(empty); setEditingId(null); setFormError(""); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await update({ id: editingId, body: form }).unwrap();
        showToast(`Material "${form.name}" updated.`, "success");
      } else {
        await create(form).unwrap();
        showToast(`Material "${form.name}" created.`, "success");
      }
      reset();
    } catch (e) {
      setFormError(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.materialId).unwrap();
      showToast(`Material "${deleteTarget.name}" deactivated.`, "info");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const submitting = creating || updating;

  return (
    <main>
      <div className="page-header">
        <h1>Print Materials</h1>
        <button onClick={() => reset()} className="button--outline button">+ New material</button>
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Failed to load materials.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price / sq in</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((m) => (
                <tr key={m.materialId} className={editingId === m.materialId ? "row--editing" : ""}>
                  <td className="user-name">{m.name}</td>
                  <td className="muted">{m.description || "—"}</td>
                  <td style={{ color: "#C8FF00" }}>Rs. {m.pricePerSquareUnit}</td>
                  <td>
                    <span className={`status-dot ${m.isActive ? "status-dot--active" : "status-dot--inactive"}`}>
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => edit(m)} className="btn-action">Edit</button>
                      {m.isActive && (
                        <button onClick={() => setDeleteTarget(m)} className="btn-action btn-action--danger">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: "2rem" }}>No materials yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="admin-form">
        <h2 className="admin-form__title">{editingId ? "Edit Material" : "New Material"}</h2>

        <div className="admin-form__grid">
          <label className="field">
            <span>Name *</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Matte Canvas"
            />
          </label>
          <label className="field">
            <span>Price per sq inch (Rs.)</span>
            <input
              type="number"
              min={0}
              step="any"
              value={form.pricePerSquareUnit}
              onChange={(e) => setForm({ ...form, pricePerSquareUnit: Number(e.target.value) })}
            />
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <input
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
          />
        </label>

        <label className="toggle-field">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <span>Active (available for custom prints)</span>
        </label>

        {formError && <p className="error">{formError}</p>}

        <div className="admin-form__actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : editingId ? "Save changes" : "Create material"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="button--outline button">
              Cancel
            </button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate Material"
        message={`Deactivate "${deleteTarget?.name}"? It will no longer be available for custom prints.`}
        confirmLabel="Deactivate"
        confirmDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
