import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

export default function ToastViewport({ toast, onDismiss }) {
  if (!toast) return null;
  const Icon = ICONS[toast.type] || ICONS.info;
  return (
    <div className={`ifc-toast ifc-toast-${toast.type || "info"}`} role={toast.type === "error" ? "alert" : "status"} aria-live={toast.type === "error" ? "assertive" : "polite"}>
      <Icon size={19} aria-hidden="true" />
      <span>{toast.message}</span>
      {toast.action && (
        <button type="button" className="ifc-toast-action" onClick={toast.action.onClick}>{toast.action.label}</button>
      )}
      <button type="button" className="ifc-toast-dismiss" aria-label="Dismiss notification" onClick={onDismiss}><X size={16} /></button>
    </div>
  );
}
