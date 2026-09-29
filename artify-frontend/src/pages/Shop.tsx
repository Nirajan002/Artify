import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useGetArtworksQuery,
  useGetCategoriesQuery,
} from "../features/artworks/artworksApi";
import ArtworkCard from "../components/ArtworkCard";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";
import { ARTWORK_TYPES } from "../utils/constants";
import ArtworkCardSkeleton from "../components/ArtworkCardSkeleton";

export default function Shop() {
  const { category: categoryParam } = useParams();
  const [params, setParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput);

  const num = (k: string) => params.get(k) ? Number(params.get(k)) : undefined;
  const filters = {
    search: params.get("search") ?? undefined,
    category: categoryParam ?? params.get("category") ?? undefined,
    artworkType: params.get("artworkType") ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    originalAvailable: params.get("originalAvailable") === "true" || undefined,
    printAvailable: params.get("printAvailable") === "true" || undefined,
    minRating: num("minRating"),
    sort: params.get("sort") ?? "newest",
    page: num("page") ?? 1,
    pageSize: 12,
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetArtworksQuery(filters);
  const { data: cats } = useGetCategoriesQuery();

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k));
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  };

  useEffect(() => {
    if ((params.get("search") ?? "") !== debouncedSearch)
      update({ search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const result = data?.data;

  const pageTitle = categoryParam
    ? categoryParam.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) + " Art"
    : "Shop Art";

  const hasActiveFilters =
    params.get("category") ||
    params.get("artworkType") ||
    params.get("minPrice") ||
    params.get("maxPrice") ||
    params.get("minRating") ||
    params.get("originalAvailable") ||
    params.get("printAvailable");

  return (
    <main className="shop">
      {/* ── Hero ── */}
      <div className="shop__hero">
        <div className="shop__hero-inner">
          {categoryParam && (
            <p className="shop__breadcrumb">
              <a href="/shop">All Art</a>
              <span className="shop__breadcrumb-sep"> / </span>
              <span>{categoryParam.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
            </p>
          )}
          <h1 className="shop__hero-title">{pageTitle}</h1>
          <p className="shop__hero-sub">
            {categoryParam
              ? `Explore original and print artwork in ${categoryParam.replace(/-/g, " ")} style`
              : "Discover original artworks from talented artists around the world"}
          </p>
          <div className="shop__search-wrap">
            <svg className="shop__search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className="shop__search-input"
              placeholder="Search by title, description or category…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="shop__body">
        {/* Filters sidebar */}
        <aside className="filters">
          <div className="filters__header">
            <span className="filters__title">Filters</span>
            {hasActiveFilters && (
              <button
                className="filters__clear-btn"
                onClick={() => { setSearchInput(""); setParams({}); }}
              >
                Clear all
              </button>
            )}
          </div>

          {!categoryParam && (
            <div className="filter-group">
              <p className="filter-group__label">Category</p>
              <select
                value={params.get("category") ?? ""}
                onChange={(e) => update({ category: e.target.value || undefined })}
              >
                <option value="">All categories</option>
                {cats?.data.map((c) => (
                  <option key={c.categoryId} value={c.slug}>{c.name} ({c.artworkCount})</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <p className="filter-group__label">Type</p>
            <select
              value={params.get("artworkType") ?? ""}
              onChange={(e) => update({ artworkType: e.target.value || undefined })}
            >
              <option value="">All types</option>
              {ARTWORK_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/([A-Z])/g, " $1").trim()}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <p className="filter-group__label">Price Range</p>
            <div className="filter-group__row">
              <input
                type="number" min={0} placeholder="Min"
                defaultValue={params.get("minPrice") ?? ""}
                onBlur={(e) => update({ minPrice: e.target.value || undefined })}
              />
              <span className="filter-group__sep">—</span>
              <input
                type="number" min={0} placeholder="Max"
                defaultValue={params.get("maxPrice") ?? ""}
                onBlur={(e) => update({ maxPrice: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="filter-group">
            <p className="filter-group__label">Min Rating</p>
            <select
              value={params.get("minRating") ?? ""}
              onChange={(e) => update({ minRating: e.target.value || undefined })}
            >
              <option value="">Any rating</option>
              <option value="4">★★★★ & up</option>
              <option value="3">★★★ & up</option>
            </select>
          </div>

          <div className="filter-group">
            <p className="filter-group__label">Availability</p>
            <div className="filter-group__checks">
              <label className="filter-check">
                <input
                  type="checkbox"
                  checked={params.get("originalAvailable") === "true"}
                  onChange={(e) => update({ originalAvailable: e.target.checked ? "true" : undefined })}
                />
                <span>Original available</span>
              </label>
              <label className="filter-check">
                <input
                  type="checkbox"
                  checked={params.get("printAvailable") === "true"}
                  onChange={(e) => update({ printAvailable: e.target.checked ? "true" : undefined })}
                />
                <span>Print available</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="shop__results">
          <div className="shop__toolbar">
            <div className="shop__count">
              {result != null && (
                <span className="shop__count-badge">{result.totalCount}</span>
              )}
              <span className="shop__count-label">
                {result ? `artwork${result.totalCount !== 1 ? "s" : ""}` : ""}
              </span>
              {isFetching && !isLoading && (
                <span className="shop__updating">· updating…</span>
              )}
            </div>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value })}
              className="shop__sort"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="rating">Top rated</option>
              <option value="popular">Most reviewed</option>
            </select>
          </div>

          {isLoading && (
            <div className="art-grid">
              {Array.from({ length: 12 }).map((_, i) => <ArtworkCardSkeleton key={i} />)}
            </div>
          )}

          {isError && (
            <div className="shop__empty">
              <p className="muted" style={{ marginBottom: "1rem" }}>Something went wrong.</p>
              <button onClick={refetch}>Try again</button>
            </div>
          )}

          {result && result.items.length === 0 && !isLoading && (
            <div className="shop__empty">
              <p className="shop__empty-icon">🎨</p>
              <p className="shop__empty-title">No artwork found</p>
              <p className="muted">Try adjusting your filters or search terms.</p>
            </div>
          )}

          <div
            className="art-grid"
            style={{ opacity: isFetching && !isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}
          >
            {result?.items.map((a) => <ArtworkCard key={a.artworkId} artwork={a} />)}
          </div>

          {result && result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={(p) => {
                update({ page: String(p) });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
