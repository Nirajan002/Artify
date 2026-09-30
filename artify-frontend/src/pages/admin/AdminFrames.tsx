import { useState } from "react";
import {
  useCreateFrameMutation, useDeleteFrameMutation, useGetFramesQuery, useUpdateFrameMutation,
  type Frame, type SaveFrameRequest,
} from "../../features/admin/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { getErrorMessage } from "../../utils/errors";

const empty: SaveFrameRequest = { name: "", description: "", additionalPrice: 0, isActive: true };

export default function AdminFrames() {
  const { data, isLoading, isError, refetch } = useGetFramesQuery();
  const [create, { isLoading: creating }] = useCreateFrameMutation();
  const [update, { isLoading: updating }] = useUpdateFrameMutation();
  const [remove] = useDeleteFrameMutation();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Frame | null>(null);
  const [formError, setFormError] = useState("");

  const edit = (f: Frame) => { setForm(f); setEditingId(f.frameId); setFormError(""); };
  const reset = () => { setForm(empty); setEditingId(null); setFormError(""); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await update({ id: editingId, body: form }).unwrap();
        showToast(`Frame "${form.name}" updated.`, "success");
      } else {
        await create(form).unwrap();
        showToast(`Frame "${form.name}" created.`, "success");
      }
      reset();
    } catch (e) {
      setFormError(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.frameId).unwrap();
      showToast(`Frame "${deleteTarget.name}" deactivated.`, "info");
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
        <h1>Frames</h1>
        <button onClick={() => { reset(); }} className="button--outline button">+ New frame</button>
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Failed to load frames.</p>
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
                <th>Additional Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((f) => (
                <tr key={f.frameId} className={editingId === f.frameId ? "row--editing" : ""}>
                  <td className="user-name">{f.name}</td>
                  <td className="muted">{f.description || "—"}</td>
                  <td style={{ color: "#C8FF00" }}>Rs. {f.additionalPrice.toLocaleString()}</td>
                  <td>
                    <span className={`status-dot ${f.isActive ? "status-dot--active" : "status-dot--inactive"}`}>
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => edit(f)} className="btn-action">Edit</button>
                      {f.isActive && (
                        <button onClick={() => setDeleteTarget(f)} className="btn-action btn-action--danger">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: "2rem" }}>No frames yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="admin-form">
        <h2 className="admin-form__title">{editingId ? "Edit Frame" : "New Frame"}</h2>

        <div className="admin-form__grid">
          <label className="field">
            <span>Name *</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Black Oak"
            />
          </label>
          <label className="field">
            <span>Additional Price (Rs.)</span>
            <input
              type="number"
              min={0}
              step="any"
              value={form.additionalPrice}
              onChange={(e) => setForm({ ...form, additionalPrice: Number(e.target.value) })}
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
          <span>Active (visible to customers)</span>
        </label>

        {formError && <p className="error">{formError}</p>}

        <div className="admin-form__actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : editingId ? "Save changes" : "Create frame"}
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
        title="Deactivate Frame"
        message={`Deactivate "${deleteTarget?.name}"? It will no longer be available for custom prints.`}
        confirmLabel="Deactivate"
        confirmDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
