import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  CloudSun,
  Leaf,
  LockKeyhole,
  Menu,
  Sprout,
  Tractor,
  TrendingUp,
  Wallet,
  Wheat,
  X,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import "./LandingPage.css";

const features = [
  {
    icon: Tractor,
    title: "Your farms, in one place",
    description: "Keep farm details and fields organized, so you always know what is growing where.",
    tone: "sage",
  },
  {
    icon: Sprout,
    title: "From planting to harvest",
    description: "Follow crop progress, log daily activities, and keep the season moving forward.",
    tone: "gold",
  },
  {
    icon: Wallet,
    title: "Know where costs go",
    description: "Record farm expenses and harvests to understand the bigger picture of your season.",
    tone: "blue",
  },
];

const workflow = [
  ["01", "Set up your farm", "Add your farms and fields to build a clear picture of your land."],
  ["02", "Plan and grow", "Track plantings and keep notes on the work happening in each field."],
  ["03", "Learn each season", "Bring expenses and harvest records together to make more informed decisions."],
];

function BrandMark() {
  return (
    <a className="landing-brand" href="#home" aria-label="Infyro Farm Connect home">
      <span className="landing-brand-icon"><Sprout size={22} strokeWidth={2.2} /></span>
      <span className="landing-brand-copy">
        <strong>infyro<span>farm</span></strong>
        <small>CONNECT</small>
      </span>
    </a>
  );
}

function DashboardPreview() {
  return (
    <div className="landing-preview" aria-label="Illustrative farm management dashboard preview">
      <div className="preview-window">
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
      <div className="preview-float preview-float-growth"><span><TrendingUp size={17} /></span><div><small>Every detail, connected</small><strong>One farm workspace</strong></div></div>
      <div className="preview-float preview-float-leaf"><Leaf size={20} /><span>Rooted in better decisions</span></div>
    </div>
  );
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <button className="landing-mobile-toggle" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={"landing-nav" + (mobileMenuOpen ? " landing-nav-open" : "")} aria-label="Main navigation">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#why-infyro" className="landing-nav-subtle" onClick={(event) => { event.preventDefault(); document.getElementById("why-infyro")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>Our approach</a>
            <div className="landing-nav-actions">
              <button className="landing-signin" onClick={() => openAuth("login")}>Sign in</button>
              <button className="landing-button landing-button-small" onClick={() => openAuth("signup")}>Get started <ArrowRight size={15} /></button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-photo" aria-hidden="true" />
          <div className="landing-hero-shade" aria-hidden="true" />
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <div className="landing-eyebrow"><span className="landing-eyebrow-mark"><Sprout size={14} /></span> A better way to grow</div>
              <h1>Grow smarter.<br /><em>Manage better.</em></h1>
              <p className="landing-hero-description">Your farm has a lot going on. Bring your fields, crops, daily work, expenses, and harvest records together in one calm, clear workspace.</p>
              <div className="landing-hero-actions">
                <button className="landing-button" onClick={() => openAuth("signup")}>Get started for free <ArrowRight size={17} /></button>
                <a className="landing-secondary-action" href="#features"><span><CirclePlay size={18} /></span> Explore the platform</a>
              </div>
              <div className="landing-trust-note"><LockKeyhole size={14} /> Your farm workspace, made for you.</div>
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
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description, tone }, index) => (
              <article className="landing-feature-card" key={title}>
                <div className={"landing-feature-icon " + tone}><Icon size={21} /></div>
                <span className="landing-feature-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#how-it-works" aria-label={"Learn how " + title.toLowerCase() + " works"}>Explore workflow <ArrowRight size={14} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-story" id="why-infyro">
          <div className="landing-story-photo"><div className="landing-story-photo-caption"><span><Leaf size={14} /></span> Rooted in the everyday work of farming</div></div>
          <div className="landing-story-copy">
            <span className="landing-section-kicker">MADE FOR THE WHOLE SEASON</span>
            <h2>Good decisions start with a <em>clearer picture.</em></h2>
            <p>Farming is a thousand small decisions made every day. Infyro Farm Connect brings the details into view, helping you keep track of the work, understand your costs, and learn from every harvest.</p>
            <ul>
              <li><CheckCircle2 size={17} /> Keep farm and field details organized</li>
              <li><CheckCircle2 size={17} /> Record crop activities as work happens</li>
              <li><CheckCircle2 size={17} /> Review expenses and harvest records together</li>
            </ul>
            <button className="landing-text-button" onClick={() => openAuth("signup")}>Start your farm workspace <ArrowRight size={16} /></button>
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
