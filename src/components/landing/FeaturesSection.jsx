import { Tractor, ArrowRight, Sprout, Wheat, Wallet, ClipboardList, CheckCircle2 } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="landing-section landing-features mx-auto w-[min(1120px,calc(100%-64px))] py-[100px] max-[760px]:w-[calc(100%-38px)] max-[760px]:py-[72px] max-[640px]:w-[calc(100%-36px)] max-[640px]:py-[78px]" id="features">
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
  );
}
