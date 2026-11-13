import { useEffect, useRef } from "react";
import { AlertTriangle, Ban, ShieldAlert, Trash2 } from "lucide-react";

const TONE_ICONS = {
  danger: Trash2,
  warning: AlertTriangle,
  neutral: ShieldAlert,
};

export default function ConfirmDialog({ dialog, onResolve }) {
  const cancelButtonRef = useRef(null);
  const titleId = "ifc-confirm-dialog-title";
  const descriptionId = "ifc-confirm-dialog-description";

  useEffect(() => {
    if (!dialog) return undefined;
    cancelButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onResolve(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, onResolve]);

  if (!dialog) return null;
  const Icon = TONE_ICONS[dialog.tone] || TONE_ICONS.danger;

  return (
    <div
      className="ifc-confirm-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onResolve(false);
      }}
    >
      <section
        className="ifc-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className={`ifc-confirm-icon ifc-confirm-icon-${dialog.tone || "danger"}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
        <div className="ifc-confirm-copy">
          <h2 id={titleId}>{dialog.title || "Are you sure?"}</h2>
          <p id={descriptionId}>{dialog.message}</p>
          {dialog.details && <p className="ifc-confirm-details">{dialog.details}</p>}
        </div>
        <div className="ifc-confirm-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="button-secondary"
            onClick={() => onResolve(false)}
          >
            {dialog.cancelLabel || "Cancel"}
          </button>
          <button
            type="button"
            className={`ifc-confirm-submit ifc-confirm-submit-${dialog.tone || "danger"}`}
            onClick={() => onResolve(true)}
          >
            {dialog.confirmLabel || "Confirm"}
          </button>
        </div>
      </section>
    </div>
  );
}
