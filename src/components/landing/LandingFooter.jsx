import { ArrowUp, ArrowUpRight, BriefcaseBusiness, Clock3, Instagram, LayoutGrid, Linkedin, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BrandMark } from "./BrandMark";
import "./LandingFooter.css";

function FooterHeading({ icon: Icon, children }) {
  return <h3 className="ifc-ft-heading"><span className="ifc-ft-tile"><Icon size={17} strokeWidth={1.7} aria-hidden="true" /></span>{children}</h3>;
}

function FooterWordmark({ entrance }) {
  return (
    <motion.div className="ifc-ft-wordmark" aria-hidden="true" {...entrance(.16)}>
      <svg viewBox="0 0 1000 180" focusable="false" aria-hidden="true">
        <defs>
          <linearGradient id="ifc-ft-word-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" />
            <stop offset="45%" stopColor="white" stopOpacity=".93" />
            <stop offset="100%" stopColor="white" stopOpacity=".06" />
          </linearGradient>
          <mask id="ifc-ft-word-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="180">
            <rect width="1000" height="180" fill="url(#ifc-ft-word-fade)" />
          </mask>
        </defs>
        <text x="6" y="145" fontSize="170" textLength="988" lengthAdjust="spacingAndGlyphs" mask="url(#ifc-ft-word-mask)"><tspan className="ifc-ft-word-infyro">infyro</tspan><tspan className="ifc-ft-word-farm">farm.</tspan></text>
      </svg>
    </motion.div>
  );
}

export function LandingFooter({ openAuth }) {
  const reduced = useReducedMotion();
  const reveal = !reduced && typeof IntersectionObserver !== "undefined";
  const entrance = delay => ({
    initial: reveal ? { opacity: 0, y: 12 } : false,
    whileInView: reveal ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, amount: .15 },
    transition: { duration: reduced ? 0 : .55, delay, ease: [.2,.7,.2,1] },
  });

  return (
    <footer className="ifc-minimal-footer" aria-label="Infyro Farm footer">
      <div className="ifc-ft-inner">
        <div className="ifc-ft-columns">
          <motion.div className="ifc-ft-group ifc-ft-brand" {...entrance(0)}>
            <BrandMark />
            <p className="ifc-ft-description">Bring your fields, crop activities, expenses, and harvest records into one clearer farm workspace.</p>
            <div className="ifc-ft-socials" aria-label="Social links">
              <a href="https://www.linkedin.com/company/infyroinc/posts/" target="_blank" rel="noopener noreferrer" aria-label="Infyro on LinkedIn" title="LinkedIn"><Linkedin size={18} aria-hidden="true" /></a>
              <a href="https://www.instagram.com/infyroinc/" target="_blank" rel="noopener noreferrer" aria-label="Infyro on Instagram" title="Instagram"><Instagram size={18} aria-hidden="true" /></a>
            </div>
          </motion.div>
          <motion.nav className="ifc-ft-group" aria-label="Platform" {...entrance(.04)}>
            <FooterHeading icon={LayoutGrid}>Platform</FooterHeading>
            <div className="ifc-ft-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#why-infyro">Our Approach</a>
              <a href="#stories">Testimonials</a>
            </div>
          </motion.nav>
          <motion.nav className="ifc-ft-group" aria-label="Company" {...entrance(.08)}>
            <FooterHeading icon={BriefcaseBusiness}>Company</FooterHeading>
            <div className="ifc-ft-links">
              <a href="#about-infyro">About Infyro Inc.</a>
              <a href="https://www.infyroinc.com/" target="_blank" rel="noopener noreferrer">Infyro Website <ArrowUpRight size={13} aria-hidden="true" /></a>
              <a href="#contact">Contact Us</a>
            </div>
          </motion.nav>
          <motion.div className="ifc-ft-group" {...entrance(.12)}>
            <FooterHeading icon={UserRound}>Account</FooterHeading>
            <div className="ifc-ft-links">
              <button type="button" onClick={() => openAuth("login")}>Sign In</button>
              <button type="button" onClick={() => openAuth("signup")}>Create Account</button>
            </div>
          </motion.div>
          <motion.div className="ifc-ft-group" {...entrance(.16)}>
            <FooterHeading icon={Mail}>Contact</FooterHeading>
            <div className="ifc-ft-contact">
              <a href="mailto:info@infyroinc.com"><Mail size={16} aria-hidden="true" /><span>info@infyroinc.com</span></a>
              <a href="tel:+918438938918"><Phone size={16} aria-hidden="true" /><span>+91 8438938918</span></a>
              <p><MapPin size={16} aria-hidden="true" /><span>Tiruchirapalli, Tamil Nadu, India</span></p>
              <p className="ifc-ft-hours"><Clock3 size={16} aria-hidden="true" /><span>Mon–Fri 9am–5pm<br />Sat 9am–2pm IST</span></p>
            </div>
          </motion.div>
        </div>
        <motion.div className="ifc-ft-bottom" {...entrance(.08)}>
          <small>© {new Date().getFullYear()} Infyro Farms. All rights reserved.</small>
          <span className="ifc-ft-signoff">Clearer records. More connected seasons.</span>
          <button className="ifc-ft-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })} aria-label="Back to top" title="Back to top"><ArrowUp size={19} aria-hidden="true" /></button>
        </motion.div>
        <FooterWordmark entrance={entrance} />
      </div>
    </footer>
  );
}
