import { ArrowUp } from "lucide-react";

export function BackToTop({ showFloatingTop }) {
  return (
    <button
      className={`fixed right-[clamp(16px,2.4vw,30px)] bottom-[clamp(18px,3vh,30px)] z-[100] inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-full border border-white/[0.28] bg-[linear-gradient(145deg,#2f7136,#224823)] px-[14px] text-[11px] font-[750] text-[#f8fbf3] shadow-[0_10px_28px_rgba(20,54,26,0.28),inset_0_1px_0_rgba(255,255,255,0.16)] transition-[opacity,transform,visibility,box-shadow] duration-[220ms] ease-[ease] cursor-pointer hover:shadow-[0_14px_34px_rgba(20,54,26,0.36),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-[3px] hover:scale-[1.02] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#f2b831] focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:transform-none max-[640px]:right-[14px] max-[640px]:bottom-4 max-[640px]:min-h-11 max-[640px]:min-w-11 max-[640px]:px-3 ${showFloatingTop ? "visible translate-y-0 scale-100 opacity-100 pointer-events-auto" : "invisible translate-y-3 scale-[0.96] opacity-0 pointer-events-none"}`}
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="Back to top"
      title="Back to top"
      tabIndex={showFloatingTop ? 0 : -1}
      aria-hidden={!showFloatingTop}
    >
      <ArrowUp size={19} />
      <span>Top</span>
    </button>
  );
}
