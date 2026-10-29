import { X, Menu, Moon, Sun, ArrowRight } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function LandingHeader({ mobileMenuOpen, setMobileMenuOpen, theme, setTheme, openAuth }) {
  return (
    <header className="landing-header">
            <div className="landing-header-inner mx-auto flex w-[min(1280px,calc(100%-72px))] min-h-[78px] h-[78px] items-center justify-between gap-7 max-[900px]:w-[calc(100%-40px)] max-[900px]:gap-[18px] max-[760px]:w-[calc(100%-32px)] max-[760px]:h-[70px] max-[760px]:min-h-[70px] max-[760px]:gap-3 max-[380px]:w-[calc(100%-24px)]">
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
