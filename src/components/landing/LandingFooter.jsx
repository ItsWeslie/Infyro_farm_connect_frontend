import { Sprout, Leaf, ArrowRight, Linkedin, Instagram, Mail, Phone, Clock3, MapPin } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function LandingFooter({ openAuth }) {
  return (
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
  );
}
