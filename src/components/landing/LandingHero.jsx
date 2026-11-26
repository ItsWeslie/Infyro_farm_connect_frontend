import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import chevronDown from "react-useanimations/lib/chevronDown";
import { Sprout, ArrowRight, CirclePlay, ShieldCheck, ChevronDown } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

export function LandingHero({ openAuth }) {
  const reduced = useReducedMotion();
  const enter = delay => ({ initial: reduced ? false : { opacity: 0, y: 22, filter: "blur(5px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: reduced ? { duration: 0 } : { duration: .85, delay, ease: [.2,.7,.2,1] } });
  return (
    <section className="landing-hero">
      <motion.svg
        initial={reduced ? false : { opacity: .25 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .85, ease: "easeOut" }}
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
      </motion.svg>
      <div className="landing-hero-glow" aria-hidden="true" />
      <div className="landing-hero-shade" aria-hidden="true" />
      <div className="landing-hero-inner">
        <div className="landing-hero-copy">
          <motion.div className="landing-eyebrow" {...enter(0.1)}>
            <span className="landing-eyebrow-mark"><Sprout size={14} aria-hidden="true" /></span>
            A product by Infyro Inc.
          </motion.div>
          <motion.h1 {...enter(0.22)}>
            Grow smarter.
            <br />
            <em>Manage better.</em>
          </motion.h1>
          <motion.p className="landing-hero-description" {...enter(0.36)}>
            A connected farm management platform built by Infyro Inc. Manage fields,
            track crops, record expenses and plan your harvests — all in one place.
          </motion.p>
          <motion.div className="landing-hero-actions" {...enter(0.5)}>
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
          </motion.div>
          <motion.div className="landing-trust-note" {...enter(0.62)}>
            <ShieldCheck size={15} aria-hidden="true" /> Your farm workspace, made for you.
          </motion.div>
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
