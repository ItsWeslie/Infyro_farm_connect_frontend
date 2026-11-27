import { motion, useReducedMotion } from "motion/react";
import { Lightbulb, Sprout } from "lucide-react";

function AnimatedShield({ size = 23, strokeWidth = 1.7 }) {
  return (
    <svg className="ifc-proof-shield" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ifc-proof-shield-outline" pathLength="1" d="M12 2 3.5 5.5v5.4c0 5.1 3.7 8.7 8.5 11.1 4.8-2.4 8.5-6 8.5-11.1V5.5L12 2Z" />
      <path className="ifc-proof-shield-check" pathLength="1" d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

const principles = [
  {
    id: "innovation",
    icon: Lightbulb,
    title: "Purposeful innovation",
    description: "Practical technology by Infyro Inc., designed around everyday agricultural needs.",
  },
  {
    id: "connected",
    icon: Sprout,
    title: "Connected farm management",
    description: "Bring fields, crops, activities and farm records together throughout the growing season.",
  },
  {
    id: "responsible",
    icon: AnimatedShield,
    title: "Responsible technology",
    description: "A farmer-first approach to managing important information in your own workspace.",
  },
];

export function PlatformProofStrip() {
  const reduced = useReducedMotion();
  const animateOnScroll = !reduced && typeof IntersectionObserver !== "undefined";
  return (
    <section className="landing-proof-strip landing-proof-premium" aria-label="The principles behind Infyro Farm">
      <header className="landing-proof-intro">
        <span className="landing-proof-kicker">THE INFYRO COMMITMENT</span>
        <h2>Built with purpose. <em>Made for farmers.</em></h2>
      </header>
      <ul className="landing-proof-principles">
        {principles.map(({ id, icon: Icon, title, description }, index) => (
          <li className={"landing-proof-principle ifc-proof-" + id} key={id} style={{ "--proof-order": index }}>
            <span className="landing-proof-icon" aria-hidden="true">
              <Icon size={23} strokeWidth={1.7} />
            </span>
            <motion.div className="landing-proof-copy" initial={false} whileInView={animateOnScroll ? { y: [0, 4, 0] } : undefined} viewport={{ once: true, amount: .12 }} transition={{ duration: .55, delay: index * .12, ease: "easeOut" }}>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.div>
          </li>
        ))}
      </ul>
    </section>
  );
}
