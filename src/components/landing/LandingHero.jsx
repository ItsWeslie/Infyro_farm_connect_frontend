import { ArrowDownRight, ArrowRight, CirclePlay, LockKeyhole, Sprout } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

export function LandingHero({ openAuth }) {
  return (
    <section className="landing-hero">
              <div className="landing-hero-photo" aria-hidden="true" />
              <div
                className="landing-hero-orb landing-hero-orb-one"
                aria-hidden="true"
              />
              <div
                className="landing-hero-orb landing-hero-orb-two"
                aria-hidden="true"
              />
              <div className="landing-hero-shade" aria-hidden="true" />
              <div className="landing-hero-inner">
                <div className="landing-hero-copy">
                  <div className="landing-eyebrow landing-hero-reveal landing-hero-reveal-1">
                    <span className="landing-eyebrow-mark">
                      <Sprout size={14} />
                    </span>{" "}
                    A better way to grow
                  </div>
                  <h1 className="landing-hero-reveal landing-hero-reveal-2">
                    Grow smarter.
                    <br />
                    <em>Manage better.</em>
                  </h1>
                  <p className="landing-hero-description landing-hero-reveal landing-hero-reveal-3">
                    Your farm has a lot going on. Bring your fields, crops, daily
                    work, expenses, and harvest records together in one calm, clear
                    workspace.
                  </p>
                  <div className="landing-hero-actions landing-hero-reveal landing-hero-reveal-4">
                    <button
                      className="landing-button"
                      onClick={() => openAuth("signup")}
                    >
                      Get started for free <ArrowRight size={17} />
                    </button>
                    <a className="landing-secondary-action" href="#features">
                      <span>
                        <CirclePlay size={18} />
                      </span>{" "}
                      Explore the platform
                    </a>
                  </div>
                  <div className="landing-trust-note landing-hero-reveal landing-hero-reveal-5">
                    <LockKeyhole size={14} /> Your farm workspace, made for you.
                  </div>
                </div>
                <DashboardPreview />
              </div>
              <a className="landing-scroll-cue" href="#features">
                <span>Discover a clearer way to farm</span>
                <ArrowDownRight size={15} />
              </a>
            </section>
  );
}
