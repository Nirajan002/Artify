interface Props { page: number; totalPages: number; onChange: (p: number) => void }

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
      >
        ← Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
      >
        Next →
      </button>
    </nav>
  );
}