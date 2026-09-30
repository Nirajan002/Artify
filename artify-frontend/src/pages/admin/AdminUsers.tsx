import { useState, useRef } from "react";
import { useGetAdminUsersQuery, useSetUserActiveMutation } from "../../features/admin/adminApi";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { getErrorMessage } from "../../utils/errors";

const ROLES = ["", "Customer", "Admin"];

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [role, setRole] = useState("");
  const [confirm, setConfirm] = useState<{ id: number; name: string; activate: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch } = useGetAdminUsersQuery({
    search: search || undefined,
    role: role || undefined,
    page,
  });
  const [setActive, { isLoading: toggling }] = useSetUserActiveMutation();
  const result = data?.data;

  const handleSearch = () => {
    setSearch(inputVal.trim());
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleToggle = async () => {
    if (!confirm) return;
    try {
      await setActive({ id: confirm.id, isActive: confirm.activate }).unwrap();
      showToast(
        confirm.activate
          ? `${confirm.name} has been activated.`
          : `${confirm.name} has been deactivated.`,
        confirm.activate ? "success" : "info"
      );
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setConfirm(null);
    }
  };

  return (
    <main>
      <div className="page-header">
        <h1>Users</h1>
        {result && (
          <span className="page-header__count">{result.totalCount} users</span>
        )}
      </div>

      {/* Search + role filter toolbar */}
      <div className="table-toolbar">
        <div className="search-row" style={{ flex: 1 }}>
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              placeholder="Search by name or email…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
            />
          </div>
          <button onClick={handleSearch} className="search-btn">Search</button>
          {(search || inputVal) && (
            <button
              className="search-clear"
              onClick={() => { setInputVal(""); setSearch(""); setPage(1); }}
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="filter-select"
          aria-label="Filter by role"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r || "All roles"}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Failed to load users.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && result && (
        <>
          {result.items.length === 0 ? (
            <div className="state-card">
              <div className="state-card__icon">👥</div>
              <p className="muted">No users found{search ? ` for "${search}"` : ""}.</p>
              {(search || role) && (
                <button onClick={() => { setInputVal(""); setSearch(""); setRole(""); setPage(1); }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Orders</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((u) => (
                    <tr key={u.userId}>
                      <td>
                        <span className="user-name">{u.firstName} {u.lastName}</span>
                      </td>
                      <td className="muted">{u.email}</td>
                      <td>
                        <span className={`role-badge role-badge--${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.orderCount}</td>
                      <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-dot ${u.isActive ? "status-dot--active" : "status-dot--inactive"}`}>
                          {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td>
                        {u.role !== "Admin" && (
                          <button
                            onClick={() =>
                              setConfirm({
                                id: u.userId,
                                name: `${u.firstName} ${u.lastName}`,
                                activate: !u.isActive,
                              })
                            }
                            disabled={toggling}
                            className={
                              u.isActive
                                ? "btn-action btn-action--danger"
                                : "btn-action btn-action--success"
                            }
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(p) => setPage(p)}
          />
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.activate ? "Activate User" : "Deactivate User"}
        message={
          confirm?.activate
            ? `Activate ${confirm?.name}? They will regain access to the platform.`
            : `Deactivate ${confirm?.name}? They will lose access to the platform.`
        }
        confirmLabel={confirm?.activate ? "Activate" : "Deactivate"}
        confirmDanger={!confirm?.activate}
        onConfirm={handleToggle}
        onCancel={() => setConfirm(null)}
      />
    </main>
  );
}
