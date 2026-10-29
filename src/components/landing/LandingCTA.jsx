import { ArrowRight, Sprout } from "lucide-react";

export function LandingCTA({ openAuth }) {
  return (
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
  );
}
