import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  CloudSun,
  Leaf,
  LockKeyhole,
  Menu,
  Sprout,
  Sun,
  Moon,
  Tractor,
  TrendingUp,
  Wallet,
  Wheat,
  X,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import "./LandingPage.css";

const workflow = [
  ["01", "Set up your farm", "Add your farms and fields to build a clear picture of your land."],
  ["02", "Plan and grow", "Track plantings and keep notes on the work happening in each field."],
  ["03", "Learn each season", "Bring expenses and harvest records together to make more informed decisions."],
];

function BrandMark() {
  return (
    <a className="landing-brand" href="#home" aria-label="Infyro Farms home">
      <span className="landing-logo-placeholder" aria-label="Temporary logo placeholder — replace with your logo image"><Sprout size={22} strokeWidth={2.2} /><small>LOGO</small></span>
      <span className="landing-brand-copy">
        <strong>Infyro <span>Farms</span></strong>
      </span>
    </a>
  );
}

function DashboardPreview() {
  const [tilt, setTilt] = useState({ x: 1, y: -4 });
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    setMotionEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  function handlePointerMove(event) {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: 1 - y * 5, y: -4 + x * 9 });
  }

  function resetTilt() {
    setTilt({ x: 1, y: -4 });
  }

  return (
    <div
      className="landing-preview landing-hero-dashboard-reveal relative [perspective:1400px] [transform-style:preserve-3d]"
      aria-label="Illustrative farm management dashboard preview"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <style>{`
        @keyframes ifc-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -7px; }
        }
        @keyframes ifc-dashboard-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -5px; }
        }
        @media (max-width: 640px) {
          @keyframes ifc-float {
            0%, 100% { translate: 0 0; }
            50% { translate: 0 -3px; }
          }
          @keyframes ifc-dashboard-float {
            0%, 100% { translate: 0 0; }
            50% { translate: 0 -2px; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ifc-dashboard-idle, .ifc-glass-badge { animation: none !important; }
        }
      `}</style>
      <div
        className="preview-window ifc-dashboard-idle motion-safe:animate-[ifc-dashboard-float_8s_ease-in-out_infinite] transform-gpu transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)` }}
      >
        <div className="preview-topbar">
          <div className="preview-brand-dot"><Sprout size={13} /></div>
          <div className="preview-breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
          <span className="preview-live"><i /> Farm overview</span>
        </div>
        <div className="preview-body">
          <aside className="preview-sidebar" aria-hidden="true">
            <span className="preview-side-active"><span /> Overview</span>
            <span><span /> Farms & fields</span>
            <span><span /> Crop management</span>
            <span><span /> Activities</span>
            <span><span /> Harvests</span>
          </aside>
          <div className="preview-main">
            <div className="preview-welcome">
              <div><small>YOUR FARM AT A GLANCE</small><h3>A season full of potential.</h3><p>A clearer view of the work you put in.</p></div>
              <span className="preview-weather"><CloudSun size={17} /> 29°</span>
            </div>
            <div className="preview-stats">
              <div><span>Registered farms</span><strong>02</strong><small><Tractor size={12} /> Your growing spaces</small></div>
              <div><span>Active plantings</span><strong>08</strong><small><Sprout size={12} /> Across your fields</small></div>
              <div><span>Harvest records</span><strong>12</strong><small><Wheat size={12} /> This season</small></div>
            </div>
            <div className="preview-lower">
              <div className="preview-chart-card">
                <div className="preview-card-heading"><span><strong>Season overview</strong><small>Illustrative example</small></span><TrendingUp size={16} /></div>
                <div className="preview-chart">
                  {[34, 49, 43, 65, 54, 76, 63, 88, 72, 96, 82, 100].map((height, index) => <i key={index} style={{ height: height + "%" }} />)}
                </div>
                <div className="preview-chart-labels"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>
              </div>
              <div className="preview-crop-card">
                <div className="preview-card-heading"><span><strong>Growing now</strong><small>Example crop list</small></span><ArrowRight size={14} /></div>
                <div className="preview-crop-row"><span className="preview-crop-emoji">🌾</span><span><b>Rice</b><small>Paddy Field A</small></span><em>Growing</em></div>
                <div className="preview-crop-row"><span className="preview-crop-emoji">🍅</span><span><b>Tomato</b><small>North Field</small></span><em>Growing</em></div>
                <div className="preview-crop-row"><span className="preview-crop-emoji">🥬</span><span><b>Spinach</b><small>Kitchen Garden</small></span><em className="preview-ready">Nearly ready</em></div>
              </div>
            </div>
            <p className="preview-disclaimer">Illustrative dashboard preview · not live farm data</p>
          </div>
        </div>
      </div>
      <div className="preview-float ifc-glass-badge preview-float-growth absolute left-0 bottom-1 z-20 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_45px_rgba(34,72,35,0.18)] backdrop-blur-xl motion-safe:animate-[ifc-float_6s_ease-in-out_infinite] max-sm:left-2 max-sm:bottom-0 max-sm:px-3 max-sm:py-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e8f1e1] text-[#53804d]"><TrendingUp size={17} /></span>
        <div className="flex flex-col gap-1"><small className="text-[10px] text-[#71816f] max-sm:text-[8px]">Every detail, connected</small><strong className="text-xs text-[#2b4834] max-sm:text-[10px]">One farm workspace</strong></div>
      </div>
      <div className="preview-float ifc-glass-badge preview-float-leaf absolute right-0 top-3 z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-xs font-semibold text-[#47714b] shadow-[0_18px_45px_rgba(34,72,35,0.16)] backdrop-blur-xl motion-safe:animate-[ifc-float_7s_ease-in-out_infinite] [animation-delay:-2.5s] max-sm:right-1 max-sm:top-1 max-sm:px-2.5 max-sm:py-2 max-sm:text-[9px]">
        <Leaf size={18} /><span>Rooted in better decisions</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("ifc-landing-theme") || "light"; } catch { return "light"; } });

  useEffect(() => {
    try { localStorage.setItem("ifc-landing-theme", theme); } catch { /* Storage may be unavailable. */ }
    document.documentElement.dataset.ifcTheme = theme;
    return () => { delete document.documentElement.dataset.ifcTheme; };
  }, [theme]);

  useEffect(() => {
    const root = document.querySelector(".landing-page");
    if (!root) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll(".landing-section-heading, .landing-feature-card, .landing-story-photo, .landing-story-copy, .landing-workflow-step, .landing-cta, .landing-proof-strip > div");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-revealed"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    targets.forEach((target) => { target.classList.add("reveal-on-scroll"); observer.observe(target); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let ticking = false;
    const updateParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const hero = document.querySelector(".landing-hero");
          if (hero) hero.style.setProperty("--hero-parallax", `${Math.min(window.scrollY * 0.16, 90)}px`);
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
      <header className="landing-header">
        <div className="landing-header-inner">
          <BrandMark />
          <button
            className="landing-mobile-toggle"
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-primary-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav id="landing-primary-navigation" className={"landing-nav" + (mobileMenuOpen ? " landing-nav-open" : "")} aria-label="Main navigation">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#why-infyro" className="landing-nav-subtle" onClick={(event) => { event.preventDefault(); document.getElementById("why-infyro")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>Our approach</a>
            <div className="landing-nav-actions">
              <button className="landing-theme-toggle" type="button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}<span>{theme === "light" ? "Dark" : "Light"}</span></button>
              <button className="landing-signin" type="button" onClick={() => openAuth("login")}>Sign in</button>
              <button className="landing-button landing-button-small" type="button" onClick={() => openAuth("signup")}>Get started <ArrowRight size={15} /></button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-photo" aria-hidden="true" />
          <div className="landing-hero-orb landing-hero-orb-one" aria-hidden="true" />
          <div className="landing-hero-orb landing-hero-orb-two" aria-hidden="true" />
          <div className="landing-hero-shade" aria-hidden="true" />
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <div className="landing-eyebrow landing-hero-reveal landing-hero-reveal-1"><span className="landing-eyebrow-mark"><Sprout size={14} /></span> A better way to grow</div>
              <h1 className="landing-hero-reveal landing-hero-reveal-2">Grow smarter.<br /><em>Manage better.</em></h1>
              <p className="landing-hero-description landing-hero-reveal landing-hero-reveal-3">Your farm has a lot going on. Bring your fields, crops, daily work, expenses, and harvest records together in one calm, clear workspace.</p>
              <div className="landing-hero-actions landing-hero-reveal landing-hero-reveal-4">
                <button className="landing-button" onClick={() => openAuth("signup")}>Get started for free <ArrowRight size={17} /></button>
                <a className="landing-secondary-action" href="#features"><span><CirclePlay size={18} /></span> Explore the platform</a>
              </div>
              <div className="landing-trust-note landing-hero-reveal landing-hero-reveal-5"><LockKeyhole size={14} /> Your farm workspace, made for you.</div>
            </div>
            <DashboardPreview />
          </div>
          <a className="landing-scroll-cue" href="#features"><span>Discover a clearer way to farm</span><ArrowDownRight size={15} /></a>
        </section>

        <section className="landing-proof-strip" aria-label="Platform principles">
          <div><span className="landing-proof-icon"><CheckCircle2 size={17} /></span><span><strong>One connected workspace</strong><small>Keep the important details together</small></span></div>
          <div><span className="landing-proof-icon"><Sprout size={17} /></span><span><strong>Built around your season</strong><small>Follow work from planting to harvest</small></span></div>
          <div><span className="landing-proof-icon"><LockKeyhole size={17} /></span><span><strong>Your account, your farm</strong><small>Sign in to access your workspace</small></span></div>
        </section>

        <section className="landing-section landing-features" id="features">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">LESS SCATTERED. MORE CONNECTED.</span>
            <h2>Everything your season needs.<br /><em>All in one place.</em></h2>
            <p>Spend less time piecing information together and more time making confident decisions for your farm.</p>
          </div>
          <div className="landing-feature-grid landing-feature-bento">
            <article className="landing-feature-card landing-feature-card-primary">
              <div className="landing-feature-card-copy">
                <span className="landing-feature-label"><Tractor size={14} /> YOUR FARM WORKSPACE</span>
                <span className="landing-feature-number">01</span>
                <h3>Your farms, in one place.</h3>
                <p>Keep farm details and fields organized, so you can find the information you need without jumping between notes.</p>
                <a href="#how-it-works" aria-label="Learn how the farm workspace works">Explore workflow <ArrowRight size={14} /></a>
              </div>
              <div className="landing-feature-preview" aria-label="Illustrative farm workspace preview">
                <div className="landing-feature-preview-top"><span><Sprout size={14} /> Farm workspace</span><span className="landing-feature-preview-dot" /></div>
                <div className="landing-feature-preview-row"><span className="landing-feature-preview-icon"><Tractor size={15} /></span><span><strong>Farms & fields</strong><small>Keep your growing spaces organized</small></span><ArrowRight size={15} /></div>
                <div className="landing-feature-preview-row"><span className="landing-feature-preview-icon feature-preview-gold"><Wheat size={15} /></span><span><strong>Season records</strong><small>Bring key details together</small></span><ArrowRight size={15} /></div>
                <div className="landing-feature-preview-foot"><span /> A clearer view of your farm</div>
              </div>
            </article>
            <article className="landing-feature-card landing-feature-card-crop">
              <div className="landing-feature-card-head">
                <div className="landing-feature-icon sage"><Sprout size={21} /></div>
                <span className="landing-feature-number">02</span>
              </div>
              <span className="landing-feature-label">GROW WITH THE SEASON</span>
              <h3>From planting to harvest.</h3>
              <p>Follow crop progress and keep a record of the daily work happening in each field.</p>
              <div className="landing-feature-stage" aria-label="Illustrative crop workflow">
                <span><i>01</i> Plant</span><b /><span><i>02</i> Grow</span><b /><span><i>03</i> Harvest</span>
              </div>
            </article>
            <article className="landing-feature-card landing-feature-card-costs">
              <div className="landing-feature-card-head">
                <div className="landing-feature-icon gold"><Wallet size={21} /></div>
                <span className="landing-feature-number">03</span>
              </div>
              <span className="landing-feature-label">KEEP THE DETAILS TOGETHER</span>
              <h3>Understand the season.</h3>
              <p>Record farm expenses and harvests to build a clearer picture of the season over time.</p>
              <div className="landing-feature-records" aria-hidden="true">
                <span><Wallet size={15} /> Expense records <ArrowRight size={13} /></span>
                <span><Wheat size={15} /> Harvest records <ArrowRight size={13} /></span>
              </div>
            </article>
            <article className="landing-feature-card landing-feature-card-activity">
              <div className="landing-feature-activity-icon"><ClipboardList size={22} /></div>
              <div className="landing-feature-activity-copy">
                <span className="landing-feature-label">EVERYDAY FARM WORK</span>
                <h3>Keep your activities in view.</h3>
                <p>Capture day-to-day farm work in one place, making it easier to look back at what happened throughout the season.</p>
              </div>
              <div className="landing-feature-activity-list" aria-label="Illustrative activity list">
                <span><i /> Field notes <CheckCircle2 size={15} /></span>
                <span><i /> Daily activities <CheckCircle2 size={15} /></span>
                <span><i /> Season history <ArrowRight size={15} /></span>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-story" id="why-infyro">
          <div className="landing-story-photo">
            <img className="landing-story-photo-image" src="https://images.unsplash.com/photo-1499529112087-3cb3b73d8f0a?auto=format&fit=crop&w=1400&q=85" alt="Lush green farmland in natural light" loading="lazy" />
            <div className="landing-story-photo-shade" aria-hidden="true" />
            <div className="landing-story-photo-caption"><span><Leaf size={14} /></span> Rooted in the everyday work of farming</div>
            <div className="landing-story-records-card" aria-label="Illustrative farm records preview">
              <div className="landing-story-records-head"><span><Sprout size={15} /> Your farm, in focus</span><span className="landing-story-records-dot" /></div>
              <div className="landing-story-record-row"><span className="landing-story-record-icon"><ClipboardList size={15} /></span><span><strong>Crop activities</strong><small>Keep track of field work</small></span><CheckCircle2 size={15} /></div>
              <div className="landing-story-record-row"><span className="landing-story-record-icon landing-story-record-icon-gold"><Wallet size={15} /></span><span><strong>Expenses & harvests</strong><small>Review records together</small></span><ArrowRight size={15} /></div>
              <small className="landing-story-records-note">Illustrative product preview</small>
            </div>
          </div>
          <div className="landing-story-copy">
            <span className="landing-section-kicker">MADE FOR THE WHOLE SEASON</span>
            <h2>Good decisions start with a <em>clearer picture.</em></h2>
            <p>Farming is a thousand small decisions made every day. Infyro Farms brings your farm details into view, helping you keep track of the work, understand your costs, and learn from every harvest.</p>
            <ul>
              <li><CheckCircle2 size={17} /> Keep farm and field details organized</li>
              <li><CheckCircle2 size={17} /> Record crop activities as work happens</li>
              <li><CheckCircle2 size={17} /> Review expenses and harvest records together</li>
            </ul>
            <button className="landing-button landing-story-cta" type="button" onClick={() => openAuth("signup")}>Start your farm workspace <ArrowRight size={16} /></button>
          </div>
        </section>

        <section className="landing-section landing-workflow" id="how-it-works">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">A SIMPLE PLACE TO START</span>
            <h2>From your first field<br />to your <em>next harvest.</em></h2>
            <p>Start with the essentials and build a more complete picture as your season grows.</p>
          </div>
          <div className="landing-workflow-grid">
            {workflow.map(([number, title, description]) => (
              <article className="landing-workflow-step" key={number}>
                <span className="landing-step-number">{number}</span>
                <div className="landing-step-line" />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>


        <section className="landing-testimonials" id="stories">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">GROWING WITH MORE CLARITY</span>
            <h2>A calmer way to manage<br /><em>the work that matters.</em></h2>
            <p>Designed around the real rhythm of a farm: plan, care, harvest, and learn.</p>
          </div>
          <div className="landing-testimonial-grid">
            <article className="landing-testimonial-card">
              <div className="landing-testimonial-stars" aria-label="Five out of five decorative stars">★★★★★</div>
              <blockquote>“Having farm activities and harvest notes together makes it easier to understand what happened throughout the season.”</blockquote>
              <div className="landing-testimonial-person"><span className="landing-avatar avatar-sage">RK</span><span><strong>Small farm owner</strong><small>Crop planning and records</small></span></div>
            </article>
            <article className="landing-testimonial-card testimonial-featured">
              <div className="landing-testimonial-stars" aria-label="Five out of five decorative stars">★★★★★</div>
              <blockquote>“It gives me one place to keep the details I used to scatter across notebooks and spreadsheets.”</blockquote>
              <div className="landing-testimonial-person"><span className="landing-avatar avatar-amber">AM</span><span><strong>Independent grower</strong><small>Season overview</small></span></div>
            </article>
            <article className="landing-testimonial-card">
              <div className="landing-testimonial-stars" aria-label="Five out of five decorative stars">★★★★★</div>
              <blockquote>“A clear record of expenses and harvests helps me reflect and plan the next growing cycle.”</blockquote>
              <div className="landing-testimonial-person"><span className="landing-avatar avatar-olive">SJ</span><span><strong>Family farm manager</strong><small>Harvest and expense tracking</small></span></div>
            </article>
          </div>
          <p className="landing-testimonial-note">Illustrative user stories for design preview; replace with verified testimonials before launch.</p>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-decoration" aria-hidden="true"><Sprout size={160} strokeWidth={0.8} /></div>
          <div className="landing-cta-copy">
            <span className="landing-section-kicker">YOUR NEXT SEASON STARTS HERE</span>
            <h2>Make room for <em>better growing.</em></h2>
            <p>Bring your farm into focus, one field and one season at a time.</p>
          </div>
          <button className="landing-button landing-button-cream" onClick={() => openAuth("signup")}>Create your account <ArrowRight size={17} /></button>
        </section>
      </main>

      <footer className="landing-footer">
        <BrandMark />
        <p>Clearer records. More connected seasons.</p>
        <div><a href="#features">Features</a><a href="#how-it-works">How it works</a><button onClick={() => openAuth("login")}>Sign in</button></div>
        <small>© {new Date().getFullYear()} Infyro Farm Connect. Grow with confidence.</small>
      </footer>

      <AuthModal key={authMode} isOpen={authOpen} defaultMode={authMode} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
