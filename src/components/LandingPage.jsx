import {
  ArrowUp,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Leaf,
  Sprout,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { WorkflowVine } from "./landing/WorkflowVine";
import { BrandMark } from "./landing/BrandMark";
import { DashboardPreview } from "./landing/DashboardPreview";
import { LandingHeader } from "./landing/LandingHeader";
import { LandingHero } from "./landing/LandingHero";
import { PlatformProofStrip } from "./landing/PlatformProofStrip";
import "./LandingPage.css";

function LandingPage() {
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
      

      <main>
        <PlatformProofStrip />

        <section className="landing-section landing-features" id="features">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">
              LESS SCATTERED. MORE CONNECTED.
            </span>
            <h2>
              Everything your season needs.
              <br />
              <em>All in one place.</em>
            </h2>
            <p>
              Spend less time piecing information together and more time making
              confident decisions for your farm.
            </p>
          </div>
          <div className="landing-feature-grid landing-feature-bento">
            <article className="landing-feature-card landing-feature-card-primary">
              <div className="landing-feature-card-copy">
                <span className="landing-feature-label">
                  <Tractor size={14} /> YOUR FARM WORKSPACE
                </span>
                <span className="landing-feature-number">01</span>
                <h3>Your farms, in one place.</h3>
                <p>
                  Keep farm details and fields organized, so you can find the
                  information you need without jumping between notes.
                </p>
                <a
                  href="#how-it-works"
                  aria-label="Learn how the farm workspace works"
                >
                  Explore workflow <ArrowRight size={14} />
                </a>
              </div>
              <div
                className="landing-feature-preview"
                aria-label="Illustrative farm workspace preview"
              >
                <div className="landing-feature-preview-top">
                  <span>
                    <Sprout size={14} /> Farm workspace
                  </span>
                  <span className="landing-feature-preview-dot" />
                </div>
                <div className="landing-feature-preview-row">
                  <span className="landing-feature-preview-icon">
                    <Tractor size={15} />
                  </span>
                  <span>
                    <strong>Farms & fields</strong>
                    <small>Keep your growing spaces organized</small>
                  </span>
                  <ArrowRight size={15} />
                </div>
                <div className="landing-feature-preview-row">
                  <span className="landing-feature-preview-icon feature-preview-gold">
                    <Wheat size={15} />
                  </span>
                  <span>
                    <strong>Season records</strong>
                    <small>Bring key details together</small>
                  </span>
                  <ArrowRight size={15} />
                </div>
                <div className="landing-feature-preview-foot">
                  <span /> A clearer view of your farm
                </div>
              </div>
            </article>
            <article className="landing-feature-card landing-feature-card-crop">
              <div className="landing-feature-card-head">
                <div className="landing-feature-icon sage">
                  <Sprout size={21} />
                </div>
                <span className="landing-feature-number">02</span>
              </div>
              <span className="landing-feature-label">
                GROW WITH THE SEASON
              </span>
              <h3>From planting to harvest.</h3>
              <p>
                Follow crop progress and keep a record of the daily work
                happening in each field.
              </p>
              <div
                className="landing-feature-stage"
                aria-label="Illustrative crop workflow"
              >
                <span>
                  <i>01</i> Plant
                </span>
                <b />
                <span>
                  <i>02</i> Grow
                </span>
                <b />
                <span>
                  <i>03</i> Harvest
                </span>
              </div>
            </article>
            <article className="landing-feature-card landing-feature-card-costs">
              <div className="landing-feature-card-head">
                <div className="landing-feature-icon gold">
                  <Wallet size={21} />
                </div>
                <span className="landing-feature-number">03</span>
              </div>
              <span className="landing-feature-label">
                KEEP THE DETAILS TOGETHER
              </span>
              <h3>Understand the season.</h3>
              <p>
                Record farm expenses and harvests to build a clearer picture of
                the season over time.
              </p>
              <div className="landing-feature-records" aria-hidden="true">
                <span>
                  <Wallet size={15} /> Expense records <ArrowRight size={13} />
                </span>
                <span>
                  <Wheat size={15} /> Harvest records <ArrowRight size={13} />
                </span>
              </div>
            </article>
            <article className="landing-feature-card landing-feature-card-activity">
              <div className="landing-feature-activity-icon">
                <ClipboardList size={22} />
              </div>
              <div className="landing-feature-activity-copy">
                <span className="landing-feature-label">
                  EVERYDAY FARM WORK
                </span>
                <h3>Keep your activities in view.</h3>
                <p>
                  Capture day-to-day farm work in one place, making it easier to
                  look back at what happened throughout the season.
                </p>
              </div>
              <div
                className="landing-feature-activity-list"
                aria-label="Illustrative activity list"
              >
                <span>
                  <i /> Field notes <CheckCircle2 size={15} />
                </span>
                <span>
                  <i /> Daily activities <CheckCircle2 size={15} />
                </span>
                <span>
                  <i /> Season history <ArrowRight size={15} />
                </span>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-story" id="why-infyro">
          <div className="landing-story-photo">
            <img
              className="landing-story-photo-image"
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=85"
              alt="Lush green farmland in natural light"
              loading="lazy"
            />
            <div className="landing-story-photo-shade" aria-hidden="true" />
            <div className="landing-story-photo-caption">
              <span>
                <Leaf size={14} />
              </span>{" "}
              Rooted in the everyday work of farming
            </div>
            <div
              className="landing-story-records-card"
              aria-label="Illustrative farm records preview"
            >
              <div className="landing-story-records-head">
                <span>
                  <Sprout size={15} /> Your farm, in focus
                </span>
                <span className="landing-story-records-dot" />
              </div>
              <div className="landing-story-record-row">
                <span className="landing-story-record-icon">
                  <ClipboardList size={15} />
                </span>
                <span>
                  <strong>Crop activities</strong>
                  <small>Keep track of field work</small>
                </span>
                <CheckCircle2 size={15} />
              </div>
              <div className="landing-story-record-row">
                <span className="landing-story-record-icon landing-story-record-icon-gold">
                  <Wallet size={15} />
                </span>
                <span>
                  <strong>Expenses & harvests</strong>
                  <small>Review records together</small>
                </span>
                <ArrowRight size={15} />
              </div>
              <small className="landing-story-records-note">
                Illustrative product preview
              </small>
            </div>
          </div>
          <div className="landing-story-copy">
            <span className="landing-section-kicker">
              MADE FOR THE WHOLE SEASON
            </span>
            <h2>
              Good decisions start with a <em>clearer picture.</em>
            </h2>
            <p>
              Farming is a thousand small decisions made every day. Infyro Farms
              brings your farm details into view, helping you keep track of the
              work, understand your costs, and learn from every harvest.
            </p>
            <ul>
              <li>
                <CheckCircle2 size={17} /> Keep farm and field details organized
              </li>
              <li>
                <CheckCircle2 size={17} /> Record crop activities as work
                happens
              </li>
              <li>
                <CheckCircle2 size={17} /> Review expenses and harvest records
                together
              </li>
            </ul>
            <button
              className="landing-button landing-story-cta"
              type="button"
              onClick={() => openAuth("signup")}
            >
              Start your farm workspace <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="landing-section landing-workflow" id="how-it-works">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">
              A SIMPLE PLACE TO START
            </span>
            <h2>
              From your first field
              <br />
              to your <em>next harvest.</em>
            </h2>
            <p>
              Follow the growing vine from your first account to your harvest
              records.
            </p>
          </div>
          <WorkflowVine />
        </section>

        <section className="landing-testimonials" id="stories">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">
              GROWING WITH MORE CLARITY
            </span>
            <h2>
              A calmer way to manage
              <br />
              <em>the work that matters.</em>
            </h2>
            <p>
              Designed around the real rhythm of a farm: plan, care, harvest,
              and learn.
            </p>
          </div>
          <div className="landing-testimonial-grid">
            <article className="landing-testimonial-card">
              <div
                className="landing-testimonial-stars"
                aria-label="Five out of five decorative stars"
              >
                ★★★★★
              </div>
              <blockquote>
                “Having farm activities and harvest notes together makes it
                easier to understand what happened throughout the season.”
              </blockquote>
              <div className="landing-testimonial-person">
                <span className="landing-avatar avatar-sage">RK</span>
                <span>
                  <strong>Small farm owner</strong>
                  <small>Crop planning and records</small>
                </span>
              </div>
            </article>
            <article className="landing-testimonial-card testimonial-featured">
              <div
                className="landing-testimonial-stars"
                aria-label="Five out of five decorative stars"
              >
                ★★★★★
              </div>
              <blockquote>
                “It gives me one place to keep the details I used to scatter
                across notebooks and spreadsheets.”
              </blockquote>
              <div className="landing-testimonial-person">
                <span className="landing-avatar avatar-amber">AM</span>
                <span>
                  <strong>Independent grower</strong>
                  <small>Season overview</small>
                </span>
              </div>
            </article>
            <article className="landing-testimonial-card">
              <div
                className="landing-testimonial-stars"
                aria-label="Five out of five decorative stars"
              >
                ★★★★★
              </div>
              <blockquote>
                “A clear record of expenses and harvests helps me reflect and
                plan the next growing cycle.”
              </blockquote>
              <div className="landing-testimonial-person">
                <span className="landing-avatar avatar-olive">SJ</span>
                <span>
                  <strong>Family farm manager</strong>
                  <small>Harvest and expense tracking</small>
                </span>
              </div>
            </article>
          </div>
          <p className="landing-testimonial-note">
            Illustrative user stories for design preview; replace with verified
            testimonials before launch.
          </p>
        </section>

        <section
          className="landing-contact-section"
          id="contact"
          aria-labelledby="landing-contact-title"
        >
          <div className="landing-contact-heading">
            <span className="landing-section-kicker">GET IN TOUCH</span>
            <h2 id="landing-contact-title">
              Let’s grow <em>together.</em>
            </h2>
            <p>
              Have a question about Infyro Farms? Send us a message — we’d love
              to hear from you.
            </p>
          </div>
          <div className="landing-contact-layout">
            <aside className="landing-contact-info">
              <span className="landing-contact-info-icon">
                <Mail size={22} />
              </span>
              <h3>We’re here to listen.</h3>
              <p>
                Share your question, feedback, or idea with the Infyro team.
              </p>
              <div className="landing-contact-socials">
                <a
                  className="landing-contact-email"
                  href="mailto:info@infyroinc.com"
                  aria-label="Email Infyro"
                >
                  <Mail size={19} />
                </a>
                <a
                  href="https://www.linkedin.com/company/infyroinc/posts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Infyro on LinkedIn"
                >
                  <Linkedin size={17} />
                </a>
                <a
                  href="https://www.instagram.com/infyroinc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Infyro on Instagram"
                >
                  <Instagram size={17} />
                </a>
              </div>
              <Sprout
                className="landing-contact-decoration"
                size={150}
                strokeWidth={0.8}
                aria-hidden="true"
              />
            </aside>
            <form
              className="landing-contact-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                const name = contactForm.name.trim();
                const email = contactForm.email.trim();
                const message = contactForm.message.trim();
                if (!name || !email || !message) {
                  setContactToast({
                    type: "error",
                    message: "Please fill in your name, email, and message.",
                  });
                  return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  setContactToast({
                    type: "error",
                    message: "Please enter a valid email address.",
                  });
                  return;
                }
                const subject = encodeURIComponent("Infyro Farms enquiry");
                const body = encodeURIComponent(
                  "Name: " +
                    name +
                    "\nEmail: " +
                    email +
                    "\n\nMessage:\n" +
                    message,
                );
                setContactToast({
                  type: "success",
                  message:
                    "Your email app should open. Please review and send your message there.",
                });
                window.location.href =
                  "mailto:info@infyroinc.com?subject=" +
                  subject +
                  "&body=" +
                  body;
              }}
            >
              <div className="landing-contact-field">
                <label htmlFor="landing-contact-name">
                  Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="landing-contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="landing-contact-field">
                <label htmlFor="landing-contact-email">
                  Email address <span aria-hidden="true">*</span>
                </label>
                <input
                  id="landing-contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="landing-contact-field">
                <label htmlFor="landing-contact-message">
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="landing-contact-message"
                  name="message"
                  placeholder="How can we help?"
                  rows={5}
                  required
                  value={contactForm.message}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                />
              </div>
              <button
                className="landing-button landing-contact-submit"
                type="submit"
              >
                Send message <ArrowRight size={17} />
              </button>
              <p className="landing-contact-form-note">
                Your email app will open so you can review and send the message.
              </p>
            </form>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-decoration" aria-hidden="true">
            <Sprout size={160} strokeWidth={0.8} />
          </div>
          <div className="landing-cta-copy">
            <span className="landing-section-kicker">
              YOUR NEXT SEASON STARTS HERE
            </span>
            <h2>
              Make room for <em>better growing.</em>
            </h2>
            <p>
              Bring your farm into focus, one field and one season at a time.
            </p>
          </div>
          <button
            className="landing-button landing-button-cream"
            onClick={() => openAuth("signup")}
          >
            Create your account <ArrowRight size={17} />
          </button>
        </section>
      </main>

      <footer className="landing-footer landing-footer-premium">
        <div className="landing-footer-botanical" aria-hidden="true">
          <Sprout size={210} strokeWidth={0.65} />
          <Leaf size={78} strokeWidth={0.75} />
        </div>
        <div className="landing-footer-main">
          <div className="landing-footer-brand-column">
            <BrandMark />
            <p>
              Bring your fields, crop activities, expenses, and harvest records
              into one clearer farm workspace.
            </p>
            <span className="landing-footer-signoff">
              <Sprout size={14} /> Rooted in your everyday work.
            </span>
          </div>
          <div className="landing-footer-link-group">
            <span className="landing-footer-label">EXPLORE</span>
            <a href="#features">Features</a>
            <a href="#why-infyro">Our approach</a>
            <a href="#how-it-works">How it works</a>
            <a
              href="https://www.infyroinc.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Know more about Infyro <ArrowRight size={13} aria-hidden="true" />
            </a>
          </div>
          <div className="landing-footer-link-group">
            <span className="landing-footer-label">YOUR ACCOUNT</span>
            <button type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
            <button type="button" onClick={() => openAuth("signup")}>
              Create account
            </button>
          </div>
          <div className="landing-footer-link-group landing-footer-connect-group">
            <span className="landing-footer-label">CONNECT</span>
            <a
              href="https://www.linkedin.com/company/infyroinc/posts/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Infyro on LinkedIn"
            >
              <Linkedin size={15} aria-hidden="true" /> LinkedIn
            </a>
            <a
              href="https://www.instagram.com/infyroinc/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Infyro on Instagram"
            >
              <Instagram size={15} aria-hidden="true" /> Instagram
            </a>
          </div>
          <div className="landing-footer-link-group landing-footer-contact-details">
            <span className="landing-footer-label">CONTACT US</span>
            <a href="mailto:info@infyroinc.com">
              <Mail size={15} aria-hidden="true" /> info@infyroinc.com
            </a>
            <a href="tel:+918438938918">
              <Phone size={15} aria-hidden="true" /> +91 8438938918
            </a>
            <p>
              <Clock3 size={15} aria-hidden="true" />
              <span>Mon–Fri 9am–5pm · Sat 9am–2pm IST</span>
            </p>
            <p>
              <MapPin size={15} aria-hidden="true" />
              <span>Tiruchirapalli, Tamil Nadu, India</span>
            </p>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <small className="landing-footer-copyright">
            © {new Date().getFullYear()} Infyro Farms. All rights reserved.
          </small>
          <span className="landing-footer-bottom-note">
            Clearer records. More connected seasons.
          </span>
        </div>
      </footer>

      {contactToast && (
        <div
          className={`landing-toast landing-toast-${contactToast.type}`}
          role={contactToast.type === "error" ? "alert" : "status"}
          aria-live={contactToast.type === "error" ? "assertive" : "polite"}
        >
          {contactToast.type === "error" ? (
            <X size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{contactToast.message}</span>
          <button
            type="button"
            onClick={() => setContactToast(null)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <button
        className={`landing-floating-back-to-top${showFloatingTop ? " is-visible" : ""}`}
        type="button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          })
        }
        aria-label="Back to top"
        title="Back to top"
        tabIndex={showFloatingTop ? 0 : -1}
        aria-hidden={!showFloatingTop}
      >
        <ArrowUp size={19} />
        <span>Top</span>
      </button>
      <AuthModal
        key={authMode}
        isOpen={authOpen}
        defaultMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
