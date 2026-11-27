import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import "./LandingCTA.css";

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
