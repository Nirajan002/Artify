export function StarDisplay({ value }: { value: number }) {
  return (
    <span aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {"★".repeat(Math.round(value))}{"☆".repeat(5 - Math.round(value))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n}
          onClick={() => onChange(n)} className={n <= value ? "filled" : ""}>★</button>
      ))}
    </div>
  );
}