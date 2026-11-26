import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import { ArrowRight, Sprout, Target, Zap } from "lucide-react";
import "./AboutSection.css";

const values = [
  { title: "Vision", icon: Sprout, description: "A future where digital innovation creates lasting, real-world impact across industries." },
  { title: "Mission", icon: Target, description: "To build purposeful, reliable and user-centric products that solve meaningful challenges." },
  { title: "Innovation", icon: Zap, description: "To continuously explore and apply technology in practical, high-impact ways." },
];

function CorporateMark() {
  return (
    <svg className="ifc-about-mark" viewBox="0 0 180 224" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ifc-corp-left" x1="12" y1="106" x2="94" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#0754f0" /><stop offset="1" stopColor="#12a9f9" /></linearGradient>
        <linearGradient id="ifc-corp-right" x1="90" y1="166" x2="170" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#0752e9" /><stop offset="1" stopColor="#13b5ef" /></linearGradient>
        <linearGradient id="ifc-corp-lower" x1="12" y1="224" x2="49" y2="128" gradientUnits="userSpaceOnUse"><stop stopColor="#0537d7" /><stop offset="1" stopColor="#079bf8" /></linearGradient>
      </defs>
      <path d="M5 51 90 2v51L5 102Z" fill="url(#ifc-corp-left)" strokeLinejoin="round" />
      <path d="m90 2 85 49-44 25-41-23Z" fill="#0640cb" />
      <path d="m65 164 36-21v59l-36 21Z" fill="#063bc8" />
      <path d="m65 114 110-63v51L65 166Z" fill="url(#ifc-corp-right)" />
      <path d="m5 147 36-21v97L5 202Z" fill="url(#ifc-corp-lower)" />
    </svg>
  );
}

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
    <section className="ifc-about" id="about-infyro" aria-labelledby="ifc-about-title">
      <motion.div className="ifc-about-brand-card" {...enter(0, .98)}>
        <div className="ifc-about-rings" aria-hidden="true" />
        <div className="ifc-about-waves" aria-hidden="true">
          <svg viewBox="0 0 600 170" preserveAspectRatio="none" fill="none"><path d="M0 20C180 135 300 178 600 70V170H0Z" fill="currentColor" opacity=".36" /><path d="M0 125C195 182 390 70 600 15V170H0Z" fill="currentColor" opacity=".3" /></svg>
        </div>
        <motion.div className="ifc-about-mark-wrap" {...enter(.12, .92)}><CorporateMark /></motion.div>
        <motion.div className="ifc-about-brand-copy" {...enter(.2)}>
          <strong>Infyro Inc.</strong>
          <p>Purposeful innovation across products.</p>
        </motion.div>
        <motion.span className="ifc-about-parent-label" {...enter(.28)}>Parent company of Infyro Farm</motion.span>
      </motion.div>

      <div className="ifc-about-content">
        <motion.div className="ifc-about-intro" {...enter(.08)}>
          <span className="ifc-about-kicker">ABOUT INFYRO INC.</span>
          <h2 id="ifc-about-title">The company behind <em>Infyro Farm.</em></h2>
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
              <div className="ifc-about-value-head"><span aria-hidden="true"><Icon size={21} strokeWidth={1.8} /></span><h3>{title}</h3></div>
              <p>{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
