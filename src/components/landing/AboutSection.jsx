import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import { ArrowRight, Sprout, Target, Zap } from "lucide-react";
import { InfyroIncLogo } from "../ui/InfyroIncLogo";
import "./AboutSection.css";

const values = [
  { title: "Vision", icon: Sprout, description: "A future where digital innovation creates lasting, real-world impact across industries." },
  { title: "Mission", icon: Target, description: "To build purposeful, reliable and user-centric products that solve meaningful challenges." },
  { title: "Innovation", icon: Zap, description: "To continuously explore and apply technology in practical, high-impact ways." },
];

export function AboutSection() {
  const reduced = useReducedMotion();
  const animate = !reduced && typeof IntersectionObserver !== "undefined";
  const enter = (delay = 0, scale = 1) => ({
    initial: animate ? { opacity: 0, y: 18, scale } : false,
    whileInView: animate ? { opacity: 1, y: 0, scale: 1 } : undefined,
    viewport: { once: true, amount: .15 },
    transition: { duration: .65, delay, ease: [.2, .7, .2, 1] },
  });

  return (
    <section className="ifc-about" id="about-infyro" aria-labelledby="ifc-about-purpose-title">
      <motion.header className="ifc-about-purpose" {...enter(0)}>
        <span>THE PURPOSE BEHIND THE PRODUCT</span>
        <h2 id="ifc-about-purpose-title">More than software. <em>A purpose to grow.</em></h2>
        <p>Infyro Farm reflects our belief that meaningful technology should simplify work, empower people and create lasting value.</p>
      </motion.header>
      <motion.div className="ifc-about-brand-card" {...enter(0, .98)}>
        <div className="ifc-about-brand-landscape" aria-hidden="true">
          <span className="ifc-about-brand-hill ifc-about-brand-hill-back" />
          <span className="ifc-about-brand-hill ifc-about-brand-hill-front" />
        </div>
        <motion.div className="ifc-about-mark-wrap" {...enter(.12, .92)}><InfyroIncLogo size={220} className="ifc-about-mark" decorative /></motion.div>
        <motion.div className="ifc-about-brand-copy" {...enter(.2)}>
          <strong>Infyro Inc.</strong>
          <p>Purposeful innovation across products.</p>
        </motion.div>
        <motion.span className="ifc-about-parent-label" {...enter(.28)}>Parent company of Infyro Farm</motion.span>
      </motion.div>

      <div className="ifc-about-content">
        <motion.div className="ifc-about-intro" {...enter(.08)}>
          <span className="ifc-about-kicker">ABOUT INFYRO INC.</span>
          <h3 id="ifc-about-title">The company behind <em>Infyro Farm.</em></h3>
          <p>Infyro Inc. builds purposeful digital products designed to solve real-world challenges.</p>
          <p>Infyro Farm extends that vision into agriculture through a connected platform for modern farm management.</p>
          <div className="ifc-about-actions">
            <a className="ifc-about-visit" href="https://www.infyroinc.com/" target="_blank" rel="noopener noreferrer">Visit Infyro Inc. <span aria-hidden="true">{reduced ? <ArrowRight size={18} /> : <UseAnimations animation={arrowRight} size={22} interaction="hover" strokeColor="currentColor" />}</span></a>
            <a className="ifc-about-vision-link" href="#infyro-values">Learn about our vision</a>
          </div>
        </motion.div>
        <div className="ifc-about-values" id="infyro-values" aria-label="Our vision, mission and innovation">
          {values.map(({ title, icon: Icon, description }, index) => (
            <motion.article key={title} className="ifc-about-value" {...enter(.13 + index * .09)}>
              <div className="ifc-about-value-head"><span aria-hidden="true"><Icon size={21} strokeWidth={1.8} /></span><h4>{title}</h4></div>
              <p>{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
