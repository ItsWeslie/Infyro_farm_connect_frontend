import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const notify = useCallback((message, type = "success", options = {}) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message, type, action: options.action || null });
    const duration = options.duration ?? (type === "error" ? 6500 : 3200);
    if (duration > 0) timerRef.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return { toast, notify, dismissToast };
}
