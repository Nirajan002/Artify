import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  useCalculatePriceQuery,
  useGetPrintOptionsQuery,
  useUploadCustomArtMutation,
  type PrintOptions,
} from "../features/customPrint/customPrintApi";

import { useAddToCartMutation } from "../features/cart/cartApi";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { validateImageFile } from "../utils/files";
import { getErrorMessage } from "../utils/errors";
import { formatPrice } from "../utils/image";

// Visual approximation of each frame for the preview
const FRAME_STYLE: Record<string, React.CSSProperties> = {
  "No Frame": {},
  Black: { border: "14px solid #111" },
  White: {
    border: "14px solid #f6f6f6",
    boxShadow: "0 0 0 1px #ddd",
  },
  Wooden: { border: "14px solid #8b5a2b" },
  Premium: { border: "14px double #b08d57" },
};

function checkSize(w: string, h: string, o?: PrintOptions): string {
  if (!o) return "";

  const width = Number(w);
  const height = Number(h);

  if (!(width > 0) || !(height > 0)) {
    return "Enter a width and a height";
  }

  const { minSide, maxSide } = o.limits;

  if (
    width < minSide ||
    width > maxSide ||
    height < minSide ||
    height > maxSide
  ) {
    return `Each side must be between ${minSide} and ${maxSide} inches`;
  }

  return "";
}

export default function CustomPrint() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const {
    data: optionsRes,
    isLoading: optionsLoading,
    isError: optionsError,
    refetch,
  } = useGetPrintOptionsQuery();

  const options = optionsRes?.data;

  const [upload, { isLoading: uploading }] = useUploadCustomArtMutation();

  const [addToCart, { isLoading: adding }] = useAddToCartMutation();

  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const [fileError, setFileError] = useState("");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [materialId, setMaterialId] = useState<number | null>(null);
  const [frameId, setFrameId] = useState<number | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [msg, setMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const selectedMaterialId =
    materialId ?? options?.materials[0]?.materialId ?? null;

  const selectedFrameId = frameId ?? options?.frames[0]?.frameId ?? null;

  const selectedWidth =
    width || (options?.sizes[0] ? String(options.sizes[0].width) : "");

  const selectedHeight =
    height || (options?.sizes[0] ? String(options.sizes[0].height) : "");

  // ------------------------------------------------------------
  // Local preview
  // ------------------------------------------------------------

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ------------------------------------------------------------
  // File upload
  // ------------------------------------------------------------

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;

    setUploadedUrl(null);
    setImgSize(null);
    setMsg(null);

    if (!f) {
      setFile(null);
      return;
    }

    const problem = validateImageFile(f);

    if (problem) {
      setFile(null);
      setFileError(problem);
      return;
    }

    setFileError("");
    setFile(f);
  };

  // ------------------------------------------------------------
  // Pricing
  // ------------------------------------------------------------

  const dWidth = useDebounce(selectedWidth, 500);
  const dHeight = useDebounce(selectedHeight, 500);

  const sizeError = checkSize(selectedWidth, selectedHeight, options);

  const settled = selectedWidth === dWidth && selectedHeight === dHeight;

  const canPrice =
    !!options &&
    !checkSize(dWidth, dHeight, options) &&
    selectedMaterialId !== null &&
    selectedFrameId !== null;

  const {
    data: priceRes,
    isFetching: pricing,
    error: priceError,
  } = useCalculatePriceQuery(
    {
      width: Number(dWidth),
      height: Number(dHeight),
      materialId: selectedMaterialId ?? 0,
      frameId: selectedFrameId ?? 0,
      quantity,
    },
    {
      skip: !canPrice,
    },
  );

  const price = canPrice ? priceRes?.data : undefined;

  // ------------------------------------------------------------
  // Preview geometry and quality hints
  // ------------------------------------------------------------

  const w = Number(selectedWidth);
  const h = Number(selectedHeight);

  const validSize = w > 0 && h > 0;

  const box = {
    w: 360,
    h: 440,
  };

  const scale = validSize ? Math.min(box.w / w, box.h / h) : 1;

  const frameName =
    options?.frames.find((f) => f.frameId === selectedFrameId)?.name ??
    "No Frame";

  const quality = useMemo(() => {
    if (!imgSize || !validSize) {
      return null;
    }

    const dpi = Math.floor(Math.min(imgSize.w / w, imgSize.h / h));

    const shapeDiffers = Math.abs(imgSize.w / imgSize.h / (w / h) - 1) > 0.05;

    return {
      dpi,
      shapeDiffers,
    };
  }, [imgSize, w, h, validSize]);

  // ------------------------------------------------------------
  // Add to cart
  // ------------------------------------------------------------

  const onAdd = async () => {
    setMsg(null);

    if (!file) {
      setFileError("Upload your artwork first");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
        },
      });

      return;
    }

    if (sizeError || selectedMaterialId === null || selectedFrameId === null) {
      return;
    }

    try {
      let url = uploadedUrl;

      if (!url) {
        url = (await upload(file).unwrap()).data;

        // Reuse the uploaded image if adding to cart fails
        // and the user retries.
        setUploadedUrl(url);
      }

      await addToCart({
        itemType: "CustomPrint",
        quantity,
        customArtworkUrl: url,
        customWidth: w,
        customHeight: h,
        materialId: selectedMaterialId,
        frameId: selectedFrameId,
      }).unwrap();

      setMsg({
        ok: true,
        text: "Added to your cart.",
      });
    } catch (e) {
      setMsg({
        ok: false,
        text: getErrorMessage(e),
      });
    }
  };

  // ------------------------------------------------------------
  // Loading / error states
  // ------------------------------------------------------------

  if (optionsLoading) {
    return <p className="page">Loading print options…</p>;
  }

  if (optionsError || !options) {
    return (
      <p className="page">
        Could not load print options.{" "}
        <button onClick={refetch}>Try again</button>
      </p>
    );
  }

  // ------------------------------------------------------------
  // Button state
  // ------------------------------------------------------------

  const busy = uploading || adding;

  const ready = !!file && !sizeError && settled && !pricing && !!price && !busy;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <main className="page">
      <h1>Print your own art</h1>

      <p className="muted">
        Upload an image, choose a size, material and frame, and we'll print and
        deliver it.
      </p>

      {!isAuthenticated && (
        <p className="notice">
          You can build and price a print without an account, but you need to{" "}
          <Link to="/login" state={{ from: location }}>
            log in
          </Link>{" "}
          before adding it to your cart.
        </p>
      )}

      <div className="custom-print">
        {/* -------------------------------------------------- */}
        {/* Preview */}
        {/* -------------------------------------------------- */}

        <section className="print-stage" aria-label="Preview">
          <div
            className="print-frame"
            style={{
              width: validSize ? w * scale : 300,

              height: validSize ? h * scale : 400,

              ...FRAME_STYLE[frameName],
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Your artwork preview"
                onLoad={(e) =>
                  setImgSize({
                    w: e.currentTarget.naturalWidth,

                    h: e.currentTarget.naturalHeight,
                  })
                }
              />
            ) : (
              <div className="print-placeholder">
                Your artwork will appear here
              </div>
            )}
          </div>

          {validSize && (
            <p className="muted">
              {w} × {h} in · {frameName}
            </p>
          )}

          {quality && (
            <div
              className={`quality ${
                quality.dpi >= 150 ? "good" : quality.dpi >= 100 ? "ok" : "low"
              }`}
            >
              Your image is {imgSize!.w} × {imgSize!.h} px, about{" "}
              <strong>{quality.dpi} DPI</strong> at this size.{" "}
              {quality.dpi >= 150
                ? "Great quality."
                : quality.dpi >= 100
                  ? "Acceptable, but may look soft up close."
                  : "This is low resolution and the print may look blurry."}
              {quality.shapeDiffers &&
                " The print's shape differs from your image, so the edges may be cropped."}
            </div>
          )}
        </section>

        {/* -------------------------------------------------- */}
        {/* Controls */}
        {/* -------------------------------------------------- */}

        <section className="print-controls">
          {/* Upload */}

          <label className="field">
            <span>1. Upload your artwork (JPG, PNG or WEBP, up to 10 MB)</span>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={onFile}
            />

            {fileError && (
              <small className="error" role="alert">
                {fileError}
              </small>
            )}
          </label>

          {/* Size */}

          <fieldset className="field">
            <legend>2. Size ({options.limits.unit}es)</legend>

            <div className="chips">
              {options.sizes.map((s) => {
                const active =
                  Number(selectedWidth) === s.width &&
                  Number(selectedHeight) === s.height;

                return (
                  <button
                    key={`${s.width}x${s.height}`}
                    type="button"
                    className={active ? "chip active" : "chip"}
                    onClick={() => {
                      setWidth(String(s.width));

                      setHeight(String(s.height));
                    }}
                  >
                    {s.width} × {s.height}
                  </button>
                );
              })}

              <button
                type="button"
                className="chip"
                title="Swap width and height"
                onClick={() => {
                  setWidth(selectedHeight);
                  setHeight(selectedWidth);
                }}
              >
                ⇄ Rotate
              </button>
            </div>

            <div className="dims">
              <label>
                Width
                <input
                  type="number"
                  min={options.limits.minSide}
                  max={options.limits.maxSide}
                  step="0.5"
                  value={selectedWidth}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </label>

              <label>
                Height
                <input
                  type="number"
                  min={options.limits.minSide}
                  max={options.limits.maxSide}
                  step="0.5"
                  value={selectedHeight}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </label>
            </div>

            {sizeError && (
              <small className="error" role="alert">
                {sizeError}
              </small>
            )}
          </fieldset>

          {/* Material */}

          <label className="field">
            <span>3. Material</span>

            <select
              value={selectedMaterialId ?? ""}
              onChange={(e) => setMaterialId(Number(e.target.value))}
            >
              {options.materials.map((m) => (
                <option key={m.materialId} value={m.materialId}>
                  {m.name} (Rs. {m.pricePerSquareUnit}
                  /sq in)
                </option>
              ))}
            </select>
          </label>

          {/* Frame */}

          <label className="field">
            <span>4. Frame</span>

            <select
              value={selectedFrameId ?? ""}
              onChange={(e) => setFrameId(Number(e.target.value))}
            >
              {options.frames.map((f) => (
                <option key={f.frameId} value={f.frameId}>
                  {f.name}

                  {f.additionalPrice > 0 &&
                    ` (+${formatPrice(f.additionalPrice)})`}
                </option>
              ))}
            </select>
          </label>

          {/* Quantity */}

          <div className="field">
            <span>5. Quantity</span>

            <div className="cart__qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= 10}
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Price */}
          {/* ------------------------------------------------ */}

          <div
            className="price-panel"
            aria-live="polite"
            style={{
              opacity: pricing || !settled ? 0.6 : 1,
            }}
          >
            <h3>Estimated price</h3>

            {priceError && canPrice && (
              <p className="error">{getErrorMessage(priceError)}</p>
            )}

            {price ? (
              <table className="price-table">
                <tbody>
                  <tr>
                    <td>Printing ({price.area} sq in)</td>

                    <td>{formatPrice(price.baseCost)}</td>
                  </tr>

                  <tr>
                    <td>Size</td>

                    <td>{formatPrice(price.sizeCost)}</td>
                  </tr>

                  <tr>
                    <td>Material</td>

                    <td>{formatPrice(price.materialCost)}</td>
                  </tr>

                  <tr>
                    <td>Frame</td>

                    <td>{formatPrice(price.frameCost)}</td>
                  </tr>

                  <tr>
                    <td>Per print</td>

                    <td>{formatPrice(price.unitPrice)}</td>
                  </tr>

                  <tr className="total">
                    <td>Total × {price.quantity}</td>

                    <td>{formatPrice(price.total)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              !priceError && (
                <p className="muted">Choose a valid size to see the price.</p>
              )
            )}

            <p className="muted">
              The final price is confirmed by our server when you add to cart
              and at checkout.
            </p>
          </div>

          {/* Message */}

          {msg && (
            <p role="status" className={msg.ok ? "success" : "error"}>
              {msg.text} {msg.ok && <Link to="/cart">View cart</Link>}
            </p>
          )}

          {/* Add to cart */}

          <button onClick={onAdd} disabled={!ready && isAuthenticated}>
            {uploading
              ? "Uploading image…"
              : adding
                ? "Adding…"
                : isAuthenticated
                  ? "Add to cart"
                  : "Log in to add to cart"}
          </button>
        </section>
      </div>
    </main>
  );
}
