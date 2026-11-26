import { useEffect, useState } from "react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import chevronDown from "react-useanimations/lib/chevronDown";
import { Sprout, ArrowRight, CirclePlay, ShieldCheck, ChevronDown } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function LandingHero({ openAuth }) {
  const reduced = useReducedMotion();
  return (
    <section className="landing-hero">
      <svg
        className="landing-hero-landscape"
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="ifc-landscape-far" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--hero-hill-far)" stopOpacity=".08" />
            <stop offset="1" stopColor="var(--hero-hill-far)" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="ifc-landscape-near" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--hero-hill-near)" stopOpacity=".24" />
            <stop offset="1" stopColor="var(--hero-hill-near)" stopOpacity=".58" />
          </linearGradient>
          <linearGradient id="ifc-landscape-contour" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="var(--hero-contour)" stopOpacity=".18" />
            <stop offset=".45" stopColor="var(--hero-contour)" stopOpacity=".6" />
            <stop offset="1" stopColor="var(--hero-contour)" stopOpacity=".85" />
          </linearGradient>
          <clipPath id="ifc-landscape-clip">
            <rect width="1440" height="620" />
          </clipPath>
        </defs>
        <g clipPath="url(#ifc-landscape-clip)">
          <path d="M-100 525 C145 385 285 430 460 482 S770 517 970 406 S1280 295 1540 384 V650 H-100 Z" fill="url(#ifc-landscape-far)" />
          <path d="M-100 585 C140 487 280 505 462 553 S788 587 1002 466 S1300 390 1540 448 V650 H-100 Z" fill="url(#ifc-landscape-near)" />
          <g className="landing-hero-field-lines" stroke="url(#ifc-landscape-contour)">
            {Array.from({ length: 17 }, (_, i) => (
              <path key={i} d={`M-160 ${434 + i * 14} C120 ${352 + i * 15} 275 ${377 + i * 14} 468 ${466 + i * 14} S785 ${548 + i * 14} 1000 ${421 + i * 14} S1310 ${310 + i * 14} 1600 ${393 + i * 14}`} />
            ))}
          </g>
        </g>
      </svg>
      <div className="landing-hero-glow" aria-hidden="true" />
      <div className="landing-hero-shade" aria-hidden="true" />
      <div className="landing-hero-inner">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow landing-hero-reveal landing-hero-reveal-1">
            <span className="landing-eyebrow-mark"><Sprout size={14} aria-hidden="true" /></span>
            A better way to grow
          </div>
          <h1 className="landing-hero-reveal landing-hero-reveal-2">
            Grow smarter.
            <br />
            <em>Manage better.</em>
          </h1>
          <p className="landing-hero-description landing-hero-reveal landing-hero-reveal-3">
            Everything your farm needs, in one place. Manage fields, track crops,
            record expenses and plan your harvests with confidence.
          </p>
          <div className="landing-hero-actions landing-hero-reveal landing-hero-reveal-4">
            <button type="button" className="landing-button landing-hero-primary" onClick={() => openAuth("signup")}>
              Get started for free
              <span className="landing-hero-button-icon" aria-hidden="true">
                {reduced ? <ArrowRight size={19} /> : <UseAnimations animation={arrowRight} size={23} strokeColor="currentColor" interaction="hover" />}
              </span>
            </button>
            <a className="landing-secondary-action" href="#features">
              <span aria-hidden="true"><CirclePlay size={18} /></span>
              Explore platform
            </a>
          </div>
          <div className="landing-trust-note landing-hero-reveal landing-hero-reveal-5">
            <ShieldCheck size={15} aria-hidden="true" /> Your farm workspace, made for you.
          </div>
        </div>
        <DashboardPreview />
      </div>
      <a className="landing-scroll-cue" href="#features" aria-label="Explore more features">
        <span>Explore more</span>
        <span className="landing-scroll-cue-icon" aria-hidden="true">
          {reduced ? <ChevronDown size={18} /> : <UseAnimations animation={chevronDown} size={23} strokeColor="currentColor" interaction="hover" />}
        </span>
      </a>
    </section>
  );
}
