interface Props { kind: "loading" | "error" | "empty"; text: string; onRetry?: () => void }

export default function StateMessage({ kind, text, onRetry }: Props) {
  return (
    <div className={`state-message state-message--${kind}`} role={kind === "error" ? "alert" : "status"}>
      <p>{text}</p>
      {kind === "error" && onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}