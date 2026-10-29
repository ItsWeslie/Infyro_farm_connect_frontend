import { useEffect, useState } from "react";
import { AuthModal } from "./AuthModal";
import { LandingHeader } from "./landing/LandingHeader";
import { LandingHero } from "./landing/LandingHero";
import { PlatformProofStrip } from "./landing/PlatformProofStrip";
import { FeaturesSection } from "./landing/FeaturesSection";
import { StorySection } from "./landing/StorySection";
import { WorkflowSection } from "./landing/WorkflowSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { ContactSection } from "./landing/ContactSection";
import { LandingCTA } from "./landing/LandingCTA";
import { LandingFooter } from "./landing/LandingFooter";
import { ContactToast } from "./landing/ContactToast";
import { BackToTop } from "./landing/BackToTop";
import "./LandingPage.css";

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFloatingTop, setShowFloatingTop] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactToast, setContactToast] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("ifc-landing-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ifc-landing-theme", theme);
    } catch {
      /* Storage may be unavailable. */
    }
    document.documentElement.dataset.ifcTheme = theme;
    return () => {
      delete document.documentElement.dataset.ifcTheme;
    };
  }, [theme]);

  useEffect(() => {
    if (!contactToast) return undefined;
    const timer = window.setTimeout(() => setContactToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [contactToast]);

  useEffect(() => {
    const updateVisibility = () => setShowFloatingTop(window.scrollY > 420);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  useEffect(() => {
    const root = document.querySelector(".landing-page");
    if (!root) return undefined;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = root.querySelectorAll(
      ".landing-header, .landing-scroll-cue, .landing-section-heading, .landing-feature-card, .landing-story-photo, .landing-story-copy, .landing-story-records-card, .landing-workflow-step, .landing-vine-nodes, .landing-vine-active-card, .landing-vine-controls, .landing-testimonial-card, .landing-cta, .landing-proof-strip > div, .landing-contact-heading, .landing-contact-info, .landing-contact-form, .landing-footer-brand-column, .landing-footer-link-group, .landing-footer-contact-details > a, .landing-footer-contact-details > p, .landing-footer-bottom > *",
    );
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-revealed"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );
    targets.forEach((target) => {
      target.classList.add("reveal-on-scroll");
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    let ticking = false;
    const updateParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const hero = document.querySelector(".landing-hero");
          if (hero)
            hero.style.setProperty(
              "--hero-parallax",
              `${Math.min(window.scrollY * 0.16, 90)}px`,
            );
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", updateParallax, { passive: true });
    updateParallax();
    return () => window.removeEventListener("scroll", updateParallax);
  }, []);

  function openAuth(mode) {
    setAuthMode(mode);
    setAuthOpen(true);
    setMobileMenuOpen(false);
  }

  return (
    <div className="landing-page" id="home">
            <LandingHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} theme={theme} setTheme={setTheme} openAuth={openAuth} />

      <main>
                <LandingHero openAuth={openAuth} />        <PlatformProofStrip />        <FeaturesSection />        <StorySection openAuth={openAuth} />        <WorkflowSection />        <TestimonialsSection />        <ContactSection contactForm={contactForm} setContactForm={setContactForm} setContactToast={setContactToast} />        <LandingCTA openAuth={openAuth} /></main>

            <LandingFooter openAuth={openAuth} />

      <ContactToast contactToast={contactToast} setContactToast={setContactToast} />      <BackToTop showFloatingTop={showFloatingTop} />undefined