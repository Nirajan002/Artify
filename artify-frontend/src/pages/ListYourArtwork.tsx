import { useEffect, useMemo, useRef, useState } from "react";
import { useGetCategoriesQuery, type ArtworkType } from "../features/artworks/artworksApi";
import {
  useCreateSubmissionMutation, useUploadSubmissionImageMutation,
} from "../features/submissions/submissionsApi";
import { ARTWORK_TYPES, humanize } from "../utils/constants";
import { getErrorMessage, getFieldErrors } from "../utils/errors";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const empty = {
  submitterName: "", email: "", phoneNumber: "", title: "", description: "",
  categoryId: "", artworkType: "", originalPrice: "", additionalInformation: "",
};
type FormState = typeof empty;
type Errors = Partial<Record<keyof FormState | "image", string>>;

function validate(f: FormState, file: File | null): Errors {
  const e: Errors = {};
  if (!f.submitterName.trim()) e.submitterName = "Full name is required";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address";
  if (!/^\+?[0-9\s-]{7,20}$/.test(f.phoneNumber)) e.phoneNumber = "Enter a valid phone number";
  if (!f.title.trim()) e.title = "Artwork title is required";
  if (f.description.trim().length < 10) e.description = "Please describe the artwork (at least 10 characters)";
  if (!f.categoryId) e.categoryId = "Choose a category";
  if (!f.artworkType) e.artworkType = "Choose an artwork type";
  if (!(Number(f.originalPrice) > 0)) e.originalPrice = "Enter a price greater than 0";
  if (!file) e.image = "Upload an image of your artwork";
  return e;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="error" role="alert">{error}</small>}
    </label>
  );
}

export default function ListYourArtwork() {
  const formRef = useRef<HTMLFormElement>(null);
  const { data: cats } = useGetCategoriesQuery();
  const [upload, { isLoading: uploading }] = useUploadSubmissionImageMutation();
  const [create, { isLoading: creating }] = useCreateSubmissionMutation();

  const [form, setForm] = useState<FormState>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setUploadedUrl(null);
    if (f && !ALLOWED.includes(f.type)) {
      setFile(null); setErrors((x) => ({ ...x, image: "Only JPG, PNG or WEBP images are allowed" })); return;
    }
    if (f && f.size > MAX_BYTES) {
      setFile(null); setErrors((x) => ({ ...x, image: "Image must be 10 MB or smaller" })); return;
    }
    setErrors((x) => ({ ...x, image: undefined }));
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const v = validate(form, file);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    try {
      let url = uploadedUrl;
      if (!url) { url = (await upload(file!).unwrap()).data; setUploadedUrl(url); }
      const res = await create({
        submitterName: form.submitterName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        artworkType: form.artworkType as ArtworkType,
        originalPrice: Number(form.originalPrice),
        imageUrl: url,
        additionalInformation: form.additionalInformation.trim() || undefined,
      }).unwrap();
      setSubmittedId(res.data.submissionId);
    } catch (err) {
      const fe = getFieldErrors(err);
      setErrors({ ...fe, image: fe.imageUrl } as Errors);
      setFormError(getErrorMessage(err));
    }
  };

  const reset = () => { setForm(empty); setFile(null); setUploadedUrl(null); setErrors({}); setSubmittedId(null); };
  const busy = uploading || creating;

  if (submittedId) {
    return (
      <main className="submit-page">
        <section className="submit-success">
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎨</div>
          <h1>Thank you!</h1>
          <p>
            Your artwork was submitted (reference #{submittedId}). Our team will review it,
            and if approved it will be listed on Artify.
          </p>
          <button onClick={reset}>Submit another artwork</button>
        </section>
      </main>
    );
  }

  return (
    <main className="submit-page">
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #0d1f17 0%, #06110D 100%)",
        border: "1px solid rgba(200,255,0,0.1)",
        borderRadius: "16px",
        padding: "4rem 2rem",
        textAlign: "center",
        marginBottom: "2rem",
      }}>
        <h1>Share Your Art With The World</h1>
        <p style={{ color: "#8ab89e", maxWidth: "500px", margin: "1rem auto 2rem", fontSize: "1.05rem" }}>
          Have an artwork you'd like to sell? Submit it to Artify and let us showcase it.
        </p>
        <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
          Submit Your Artwork ↓
        </button>
      </section>

      {/* How it works */}
      <div className="how-it-works" style={{ marginBottom: "2rem" }}>
        <h2>How it works</h2>
        <ol>
          <li><strong>Submit your artwork</strong><span>Fill in the form below.</span></li>
          <li><strong>Our team reviews it</strong><span>We check quality and details.</span></li>
          <li><strong>Approved artwork gets listed</strong><span>It appears in the Artify shop.</span></li>
          <li><strong>Customers can purchase it</strong><span>Your artwork finds a home.</span></li>
        </ol>
      </div>

      {/* Form */}
      <form ref={formRef} className="submit-form" onSubmit={onSubmit} noValidate style={{ maxWidth: "720px" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>Submission form</h2>
        <p className="muted" style={{ marginBottom: "0.5rem" }}>All fields are required unless marked optional.</p>

        <Field label="Full name" error={errors.submitterName}>
          <input value={form.submitterName} onChange={set("submitterName")} maxLength={100} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={set("email")} maxLength={256} />
        </Field>
        <Field label="Phone" error={errors.phoneNumber}>
          <input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} />
        </Field>
        <Field label="Artwork title" error={errors.title}>
          <input value={form.title} onChange={set("title")} maxLength={200} />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea rows={5} value={form.description} onChange={set("description")} maxLength={4000} />
        </Field>
        <Field label="Category" error={errors.categoryId}>
          <select value={form.categoryId} onChange={set("categoryId")}>
            <option value="">Select a category</option>
            {cats?.data.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Artwork type" error={errors.artworkType}>
          <select value={form.artworkType} onChange={set("artworkType")}>
            <option value="">Select a type</option>
            {ARTWORK_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
          </select>
        </Field>
        <Field label="Original price (Rs.)" error={errors.originalPrice}>
          <input type="number" min={1} step="any" value={form.originalPrice} onChange={set("originalPrice")} />
        </Field>
        <Field label="Artwork image (JPG, PNG or WEBP, up to 10 MB)" error={errors.image}>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onFile} />
        </Field>
        {preview && (
          <img
            className="submit-preview"
            src={preview}
            alt="Selected artwork preview"
          />
        )}
        <Field label="Additional information (optional)" error={errors.additionalInformation}>
          <textarea rows={3} value={form.additionalInformation} onChange={set("additionalInformation")} maxLength={2000} />
        </Field>

        {formError && <p className="error" role="alert">{formError}</p>}

        <button type="submit" disabled={busy} style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}>
          {uploading ? "Uploading image…" : creating ? "Submitting…" : "Submit Artwork →"}
        </button>
      </form>
    </main>
  );
}