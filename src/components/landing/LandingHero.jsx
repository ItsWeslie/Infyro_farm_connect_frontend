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
      <div className="landing-hero-photo" aria-hidden="true" />
      <div className="landing-hero-shade" aria-hidden="true" />
      <div className="landing-hero-glow" aria-hidden="true" />
      <svg className="landing-hero-contours" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true" focusable="false">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M-80 ${110 + i * 18} C100 ${40 + i * 18} 290 ${55 + i * 18} 480 ${155 + i * 18} S790 ${235 + i * 18} 1010 ${130 + i * 18} S1300 ${25 + i * 18} 1520 ${92 + i * 18}`} />
        ))}
      </svg>
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
