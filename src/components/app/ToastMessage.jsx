import { Check } from "lucide-react";

export default function ToastMessage({ toast }) {
  if (!toast) return null;

  return (
    <div role="status" className="toast-message">
      <span><Check size={15} /></span>
      {toast}
    </div>
  );
}