import { ArrowUp } from "lucide-react";

export function BackToTop({ showFloatingTop }) {
  return (
    <button
            className={`landing-floating-back-to-top${showFloatingTop ? " is-visible" : ""}`}
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
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
