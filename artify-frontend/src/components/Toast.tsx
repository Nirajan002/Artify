import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Global toast store — simple event-based system, no Redux needed
type Listener = (toasts: ToastMessage[]) => void;
let _toasts: ToastMessage[] = [];
let _counter = 0;
const _listeners: Listener[] = [];

function notify() {
  _listeners.forEach((l) => l([..._toasts]));
}

export function showToast(message: string, type: ToastType = "success") {
  const id = ++_counter;
  _toasts = [..._toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
  }, 3500);
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  useEffect(() => {
    _listeners.push(setToasts);
    return () => {
      const i = _listeners.indexOf(setToasts);
      if (i !== -1) _listeners.splice(i, 1);
    };
  }, []);
  return toasts;
}

export default function ToastContainer() {
  const toasts = useToasts();
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast__icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="toast__msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
