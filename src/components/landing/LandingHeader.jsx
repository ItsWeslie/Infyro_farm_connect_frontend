import { X, Menu, ArrowRight } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { BrandMark } from "./BrandMark";

export function LandingHeader({ mobileMenuOpen, setMobileMenuOpen, theme, setTheme, openAuth }) {
  return (
    <header className="landing-header">
            <div className="landing-header-inner">
              <BrandMark />
              <button
                className="landing-mobile-toggle"
                type="button"
                aria-label={
                  mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="landing-primary-navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
              <nav
                id="landing-primary-navigation"
                className={
                  "landing-nav" + (mobileMenuOpen ? " landing-nav-open" : "")
                }
                aria-label="Main navigation"
              >
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                  How it works
                </a>
                <a
                  href="#why-infyro"
                  className="landing-nav-subtle"
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById("why-infyro")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                >
                  Our approach
                </a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </a>
                <div className="landing-nav-actions">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                  <button
                    className="landing-signin"
                    type="button"
                    onClick={() => openAuth("login")}
                  >
                    Sign in
                  </button>
                  <button
                    className="landing-button landing-button-small"
                    type="button"
                    onClick={() => openAuth("signup")}
                  >
                    Get started <ArrowRight size={15} />
                  </button>
                </div>
              </nav>
            </div>
          </header>
  );
}
