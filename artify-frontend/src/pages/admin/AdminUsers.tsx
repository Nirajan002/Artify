import { useState } from "react";
import { useGetAdminUsersQuery, useSetUserActiveMutation } from "../../features/admin/adminApi";
import Pagination from "../../components/Pagination";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetAdminUsersQuery({ search: search || undefined, page });
  const [setActive] = useSetUserActiveMutation();
  const result = data?.data;

  return (
    <main>
      <h1 style={{ marginBottom: "1.5rem" }}>Users</h1>

      <input
        type="search"
        placeholder="Search by name or email…"
        style={{ maxWidth: "320px", marginBottom: "1.25rem" }}
        onBlur={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((u) => (
              <tr key={u.userId}>
                <td style={{ color: "#d4e8d8" }}>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{
                    background: u.role === "Admin" ? "rgba(200,255,0,0.12)" : "rgba(200,255,0,0.04)",
                    color: u.role === "Admin" ? "#C8FF00" : "#8ab89e",
                    border: `1px solid ${u.role === "Admin" ? "rgba(200,255,0,0.3)" : "rgba(200,255,0,0.1)"}`,
                    borderRadius: "999px",
                    padding: "0.15rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>{u.orderCount}</td>
                <td>
                  <span style={{
                    color: u.isActive ? "#50dc8c" : "#ff8080",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td>
                  {u.role !== "Admin" && (
                    <button
                      onClick={() => setActive({ id: u.userId, isActive: !u.isActive })}
                      style={{
                        background: "none",
                        color: u.isActive ? "#ff8080" : "#50dc8c",
                        border: `1px solid ${u.isActive ? "rgba(255,128,128,0.3)" : "rgba(80,220,140,0.3)"}`,
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.8rem",
                        boxShadow: "none",
                      }}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {result && <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />}
    </main>
  );
}