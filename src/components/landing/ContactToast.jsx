import { X, CheckCircle2 } from "lucide-react";

export function ContactToast({ contactToast, setContactToast }) {
  return (
    {contactToast && (
            <div
              className={`landing-toast landing-toast-${contactToast.type}`}
              role={contactToast.type === "error" ? "alert" : "status"}
              aria-live={contactToast.type === "error" ? "assertive" : "polite"}
            >
              {contactToast.type === "error" ? (
                <X size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{contactToast.message}</span>
              <button
                type="button"
                onClick={() => setContactToast(null)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )}
  );
}
