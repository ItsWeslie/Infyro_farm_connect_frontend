import { ArrowRight, Menu, Sun, Moon, X } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function LandingHeader({ theme, setTheme, mobileMenuOpen, setMobileMenuOpen, openAuth }) {
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
                  <button
                    className="landing-theme-toggle"
                    type="button"
                    onClick={() =>
                      setTheme((current) =>
                        current === "light" ? "dark" : "light",
                      )
                    }
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                    title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                  >
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                    <span>{theme === "light" ? "Dark" : "Light"}</span>
                  </button>
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
