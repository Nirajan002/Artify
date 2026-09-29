import { Link } from "react-router-dom";
import type { Category } from "../features/artworks/artworksApi";

export default function CategoryStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="home-section">
      <h2>Browse by category</h2>
      <div className="category-strip">
        {categories.map((c) => (
          <Link key={c.categoryId} to={`/categories/${c.slug}`} className="category-chip">
            <span>{c.name}</span><small className="muted">{c.artworkCount} pieces</small>
          </Link>
        ))}
      </div>
    </section>
  );
}