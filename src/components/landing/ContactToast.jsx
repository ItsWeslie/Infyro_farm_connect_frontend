import { X, CheckCircle2 } from "lucide-react";

export function ContactToast({ contactToast, setContactToast }) {
  if (!contactToast) return null;

  return (
    <div
      className={`fixed right-[22px] top-[22px] z-[200] flex w-[min(420px,calc(100vw-32px))] items-center gap-[11px] rounded-[14px] border border-white/[0.18] px-[14px] py-[15px] text-[13px] leading-[1.55] text-white shadow-[0_18px_48px_rgba(18,40,22,0.22)] animate-[landing-toast-in_0.24s_ease-out_both] ${contactToast.type === "error" ? "bg-[#8d352b]" : "bg-[#224823]"} [&>svg]:shrink-0 [&>span]:flex-1 [&>button]:grid [&>button]:h-[30px] [&>button]:w-[30px] [&>button]:shrink-0 [&>button]:place-items-center [&>button]:rounded-[8px] [&>button]:border-0 [&>button]:bg-transparent [&>button]:p-0 [&>button]:text-inherit [&>button]:cursor-pointer [&>button:hover]:bg-white/[0.14] [&>button:focus-visible]:outline [&>button:focus-visible]:outline-[3px] [&>button:focus-visible]:outline-[#f2b831] [&>button:focus-visible]:outline-offset-[3px] max-[480px]:right-4 max-[480px]:top-4 max-[480px]:w-[calc(100vw-32px)]`}
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
  );
}
