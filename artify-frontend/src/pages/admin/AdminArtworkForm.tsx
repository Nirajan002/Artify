import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useCreateArtworkMutation,
  useGetAdminArtworkQuery,
  useGetCategoriesQuery,
  useUpdateArtworkMutation,
  useUploadArtworkImageMutation,
  type SaveVariantRequest,
} from "../../features/artworks/artworksApi";

import { ARTWORK_TYPES, humanize } from "../../utils/constants";
import { validateImageFile } from "../../utils/files";
import { imageUrl } from "../../utils/image";
import { getErrorMessage } from "../../utils/errors";

const STATUSES = ["Draft", "Published", "Unpublished", "Sold", "Archived"];
const VARIANT_TYPES = ["Original", "Poster", "Canvas", "FramedPrint"] as const;

type ArtworkFormProps = {
  categories: { id: number; name: string }[];
  existing?: {
    data: {
      title: string; description: string; categoryId: number;
      artworkType: string; originalPrice: number; status: string;
      isOriginalAvailable: boolean; isPrintAvailable: boolean; imageUrl: string;
      variants: { variantType: string; basePrice: number; stockQuantity: number; isAvailable: boolean }[];
    };
  };
  isEdit: boolean;
};

function ArtworkForm({ existing, isEdit, categories }: ArtworkFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [upload, { isLoading: uploading }] = useUploadArtworkImageMutation();
  const [create, { isLoading: creating }] = useCreateArtworkMutation();
  const [update, { isLoading: updating }] = useUpdateArtworkMutation();

  const artwork = existing?.data;

  const [title, setTitle] = useState(artwork?.title ?? "");
  const [description, setDescription] = useState(artwork?.description ?? "");
  const [categoryId, setCategoryId] = useState(artwork ? String(artwork.categoryId) : "");
  const [artworkType, setArtworkType] = useState(artwork?.artworkType ?? "Painting");
  const [originalPrice, setOriginalPrice] = useState(artwork ? String(artwork.originalPrice) : "");
  const [status, setStatus] = useState(artwork?.status ?? "Draft");
  const [isOriginalAvailable, setIsOriginalAvailable] = useState(artwork?.isOriginalAvailable ?? true);
  const [isPrintAvailable, setIsPrintAvailable] = useState(artwork?.isPrintAvailable ?? true);
  const [imageUrlValue] = useState(artwork?.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [variants, setVariants] = useState<SaveVariantRequest[]>(
    artwork?.variants?.map((v) => ({
      variantType: v.variantType as SaveVariantRequest["variantType"],
      basePrice: v.basePrice,
      stockQuantity: v.stockQuantity,
      isAvailable: v.isAvailable,
    })) ?? [{ variantType: "Original", basePrice: 0, stockQuantity: 1, isAvailable: true }],
  );
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateImageFile(f);
    if (problem) { setFileError(problem); return; }
    setFileError(""); setFile(f);
  };

  const updateVariant = (i: number, patch: Partial<SaveVariantRequest>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const addVariant = () => {
    const unused = VARIANT_TYPES.find((t) => !variants.some((v) => v.variantType === t));
    if (unused) setVariants((vs) => [...vs, { variantType: unused, basePrice: 0, stockQuantity: 1, isAvailable: true }]);
  };

  const removeVariant = (i: number) => setVariants((vs) => vs.filter((_, idx) => idx !== i));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let img = imageUrlValue;
      if (file) img = (await upload(file).unwrap()).data;
      if (!img) { setError("Upload an artwork image"); return; }

      const body = {
        title, description,
        categoryId: Number(categoryId),
        imageUrl: img, thumbnailUrl: img,
        artworkType: artworkType as (typeof ARTWORK_TYPES)[number],
        originalPrice: Number(originalPrice),
        isOriginalAvailable, isPrintAvailable, status, variants,
      };

      if (isEdit) await update({ id: Number(id), body }).unwrap();
      else await create(body).unwrap();

      navigate("/admin/artworks");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: "0.4rem",
    fontSize: "0.875rem",
  };
  const spanStyle: React.CSSProperties = {
    fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase",
    letterSpacing: "0.08em", color: "#6a9a80",
  };

  return (
    <main>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Link to="/admin/artworks" style={{ color: "#5a8070", fontSize: "0.875rem" }}>← Back</Link>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{isEdit ? "Edit artwork" : "New artwork"}</h1>
      </div>

      <form onSubmit={onSubmit} noValidate style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <label style={fieldStyle}>
            <span style={spanStyle}>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label style={fieldStyle}>
            <span style={spanStyle}>Description</span>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>

          <label style={fieldStyle}>
            <span style={spanStyle}>Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={spanStyle}>Type</span>
            <select value={artworkType} onChange={(e) => setArtworkType(e.target.value)}>
              {ARTWORK_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={spanStyle}>Original price (Rs.)</span>
            <input type="number" min={0} step="any" value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)} required />
          </label>

          <label style={fieldStyle}>
            <span style={spanStyle}>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", color: "#8ab89e", fontSize: "0.9rem" }}>
              <input type="checkbox" checked={isOriginalAvailable}
                onChange={(e) => setIsOriginalAvailable(e.target.checked)} />
              Original available for sale
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", color: "#8ab89e", fontSize: "0.9rem" }}>
              <input type="checkbox" checked={isPrintAvailable}
                onChange={(e) => setIsPrintAvailable(e.target.checked)} />
              Prints available
            </label>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Image */}
          <label style={fieldStyle}>
            <span style={spanStyle}>Artwork image</span>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onFile} />
            {fileError && <small className="error">{fileError}</small>}
          </label>

          {(file || imageUrlValue) && (
            <img
              src={file ? URL.createObjectURL(file) : imageUrl(imageUrlValue)}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(200,255,0,0.15)" }}
            />
          )}

          {/* Variants */}
          <fieldset style={{ border: "1px solid rgba(200,255,0,0.15)", borderRadius: "10px", padding: "1.25rem" }}>
            <legend style={{ color: "#6a9a80", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 0.4rem" }}>
              Variants
            </legend>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {variants.map((v, i) => (
                <div key={v.variantType} style={{
                  background: "#0d1f17", border: "1px solid rgba(200,255,0,0.08)",
                  borderRadius: "8px", padding: "0.85rem",
                  display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto auto", gap: "0.5rem", alignItems: "center",
                }}>
                  <select
                    value={v.variantType}
                    onChange={(e) => updateVariant(i, { variantType: e.target.value as (typeof VARIANT_TYPES)[number] })}
                  >
                    {VARIANT_TYPES.filter((t) => t === v.variantType || !variants.some((x) => x.variantType === t)).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <input type="number" min={0} placeholder="Price"
                    value={v.basePrice} onChange={(e) => updateVariant(i, { basePrice: Number(e.target.value) })} />

                  <input type="number" min={0} placeholder="Stock"
                    value={v.stockQuantity} onChange={(e) => updateVariant(i, { stockQuantity: Number(e.target.value) })} />

                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.8rem", color: "#8ab89e", whiteSpace: "nowrap" }}>
                    <input type="checkbox" checked={v.isAvailable}
                      onChange={(e) => updateVariant(i, { isAvailable: e.target.checked })} />
                    Active
                  </label>

                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(i)}
                      style={{ background: "none", color: "#ff8080", border: "1px solid rgba(255,128,128,0.3)", padding: "0.25rem 0.5rem", fontSize: "0.75rem", boxShadow: "none" }}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {variants.length < 4 && (
              <button type="button" onClick={addVariant}
                style={{ marginTop: "0.85rem", background: "none", color: "#C8FF00", border: "1px solid rgba(200,255,0,0.3)", fontSize: "0.85rem" }}>
                + Add variant
              </button>
            )}
          </fieldset>
        </div>

        {/* Submit row — full width */}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {error && <p className="error" role="alert" style={{ flex: 1 }}>{error}</p>}
          <button type="submit" disabled={uploading || creating || updating} style={{ padding: "0.75rem 2rem" }}>
            {uploading ? "Uploading…" : creating || updating ? "Saving…" : isEdit ? "Save changes" : "Create artwork"}
          </button>
          <button type="button" onClick={() => navigate("/admin/artworks")}
            style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)" }}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

export default function AdminArtworkForm() {
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useGetAdminArtworkQuery(Number(id), { skip: !isEdit });
  const { data: cats } = useGetCategoriesQuery();

  if (isEdit && loadingExisting) {
    return <div style={{ padding: "2rem" }}><p className="muted">Loading artwork…</p></div>;
  }

  return (
    <ArtworkForm
      key={isEdit ? `edit-${id}` : "new"}
      existing={existing}
      isEdit={isEdit}
      categories={cats?.data?.map((c) => ({ id: c.categoryId, name: c.name })) ?? []}
    />
  );
}
