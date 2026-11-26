import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import "./LandingCTA.css";

function BannerArt() {
  return (
    <svg className="ifc-final-cta-art" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <path d="M0 352Q160 287 370 355T775 351T1200 324V400H0Z" opacity=".10" />
        <path d="M0 381Q180 342 395 383T825 368T1200 357V400H0Z" opacity=".12" />
        <g opacity=".19">
          <path d="M42 386Q66 290 142 223" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M73 310Q55 250 26 234Q21 289 73 310Z" />
          <path d="M90 285Q101 227 144 208Q148 259 90 285Z" />
          <path d="M59 342Q112 296 154 315Q121 353 59 342Z" />
          <path d="M46 368Q3 342 0 308Q48 314 46 368Z" />
          <path d="M42 385Q96 350 137 378Q92 402 42 385Z" />
        </g>
        <g opacity=".17">
          <path d="M1192 0Q1141 66 1050 121" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M1159 39Q1115 0 1072 15Q1105 53 1159 39Z" />
          <path d="M1145 56Q1185 73 1170 122Q1136 99 1145 56Z" />
          <path d="M1107 86Q1057 50 1016 75Q1062 105 1107 86Z" />
          <path d="M1086 99Q1112 140 1070 162Q1064 126 1086 99Z" />
          <path d="M1054 121Q1008 113 984 151Q1032 155 1054 121Z" />
        </g>
      </g>
    </svg>
  );
}

export function LandingCTA({ openAuth }) {
  const reduced = useReducedMotion();
  const reveal = !reduced && typeof IntersectionObserver !== "undefined";
  const entrance = delay => ({
    initial: reveal ? { opacity: 0, y: 14 } : false,
    whileInView: reveal ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, amount: .2 },
    transition: { duration: reduced ? 0 : .6, delay, ease: [.2,.7,.2,1] },
  });

  return (
    <section className="ifc-final-cta" aria-labelledby="ifc-final-cta-title">
      <BannerArt />
      <div className="ifc-final-cta-content">
        <motion.span className="ifc-final-cta-kicker" {...entrance(0)}>
          YOUR NEXT SEASON STARTS HERE
        </motion.span>
        <motion.h2 id="ifc-final-cta-title" {...entrance(.04)}>
          Grow with confidence. <em>Farm with clarity.</em>
        </motion.h2>
        <motion.p {...entrance(.08)}>
          Bring your farms, fields, crops and everyday activities together in one connected workspace.
        </motion.p>
        <motion.div className="ifc-final-cta-actions" {...entrance(.12)}>
          <button type="button" className="ifc-final-cta-action ifc-final-cta-primary" onClick={() => openAuth("signup")}>
            Get Started Free
            <span className="ifc-final-cta-arrow" aria-hidden="true">
              {reduced ? <ArrowRight size={19} /> : <UseAnimations animation={arrowRight} size={23} strokeColor="currentColor" interaction="hover" />}
            </span>
          </button>
          <button type="button" className="ifc-final-cta-action ifc-final-cta-secondary" onClick={() => openAuth("login")}>
            Sign In
          </button>
        </motion.div>
      </div>
    </section>
  );
}
