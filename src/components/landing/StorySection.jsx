import { Leaf, Sprout, ClipboardList, CheckCircle2, Wallet, ArrowRight } from "lucide-react";

export function StorySection({ openAuth }) {
  return (
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
  );
}
