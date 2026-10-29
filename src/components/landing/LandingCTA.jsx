import { Sprout, ArrowRight } from "lucide-react";

export function LandingCTA({ openAuth }) {
  return (
    <section className="landing-cta relative flex items-center justify-between gap-[35px] overflow-hidden px-[max(32px,calc((100%-1120px)/2))] py-[70px] max-[760px]:items-start max-[760px]:flex-col max-[760px]:gap-[25px] max-[760px]:px-[22px] max-[760px]:py-[70px] max-[640px]:px-6 max-[640px]:py-[52px]">
              <div className="landing-cta-decoration pointer-events-none absolute right-[29%] bottom-[-63px] rotate-[-18deg] text-white/[0.06] max-[760px]:right-[-25px] max-[760px]:bottom-[-75px]" aria-hidden="true">
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
  );
}
