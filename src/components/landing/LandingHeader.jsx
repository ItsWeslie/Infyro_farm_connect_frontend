import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import menu from "react-useanimations/lib/menu";
import { Menu, Moon, Sun, X } from "lucide-react";
import { BrandMark } from "./BrandMark";

function LandingThemeIcon({ theme, setTheme, className = "" }) {
  const dark = theme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button type="button" className={`ifc-capsule-theme-icon ${className}`} aria-label={label} title={label} onClick={() => setTheme(current => current === "light" ? "dark" : "light")}>
      {dark ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}
    </button>
  );
}

const LINKS = [
  ["features", "Features"],
  ["about-infyro", "About Us"],
  ["why-infyro", "Our Approach"],
  ["how-it-works", "How It Works"],
  ["stories", "Testimonials"],
  ["contact", "Contact Us"],
];

export function LandingHeader({ mobileMenuOpen, setMobileMenuOpen, theme, setTheme, openAuth }) {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const header = useRef(null);
  const toggle = useRef(null);
  useEffect(() => {
    const sections = LINKS.map(([id]) => document.getElementById(id)).filter(Boolean);
    let frame = 0;
    function update() {
      frame = 0;
      const marker = Math.max((header.current?.getBoundingClientRect().bottom || 0) + 28, window.innerHeight * .28);
      let current = "", closest = -Infinity;
      sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top <= marker && top > closest) { closest = top; current = section.id; }
      });
      setActive(current);
      setScrolled(window.scrollY > 16);
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    const desktop = window.matchMedia("(min-width: 1051px)");
    const changeDesktop = () => { if (desktop.matches) setMobileMenuOpen(false); };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    desktop.addEventListener("change", changeDesktop);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
      desktop.removeEventListener("change", changeDesktop);
    };
  }, [setMobileMenuOpen]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const key = event => {
      if (event.key === "Escape") { setMobileMenuOpen(false); toggle.current?.focus({ preventScroll: true }); }
    };
    const outside = event => { if (!header.current?.contains(event.target)) setMobileMenuOpen(false); };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);
  return (
    <motion.header ref={header} className={"ifc-capsule-header" + (scrolled ? " is-scrolled" : "")} initial={reduced ? false : { opacity: .25, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { duration: .65, delay: .08, ease: [.2,.7,.2,1] }}>
      <div className="ifc-capsule-inner">
        <div className="ifc-capsule-brand"><BrandMark /></div>
        <div className="ifc-capsule-mobile-controls">
          <LandingThemeIcon theme={theme} setTheme={setTheme} />
          <button ref={toggle} type="button" className="ifc-capsule-menu-toggle" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} aria-controls="landing-primary-navigation" onClick={() => setMobileMenuOpen(open => !open)}>
            <span className="ifc-capsule-menu-icon" aria-hidden="true">{reduced ? (mobileMenuOpen ? <X size={24} /> : <Menu size={24} />) : <UseAnimations animation={menu} size={26} interaction="click-toggle" active={mobileMenuOpen} strokeColor="currentColor" />}</span>
          </button>
        </div>
        <nav id="landing-primary-navigation" className={"ifc-capsule-nav" + (mobileMenuOpen ? " is-open" : "")} aria-label="Main navigation">
          <div className="ifc-capsule-links">
            {LINKS.map(([id, label]) => <a key={id} href={"#" + id} aria-current={active === id ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{label}</a>)}
          </div>
          <div className="ifc-capsule-actions">
            <LandingThemeIcon theme={theme} setTheme={setTheme} className="ifc-capsule-desktop-theme" />
            <button type="button" className="ifc-capsule-signin" onClick={() => openAuth("login")}>Sign in</button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
