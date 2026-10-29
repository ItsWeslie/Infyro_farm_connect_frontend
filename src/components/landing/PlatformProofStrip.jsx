import { CheckCircle2, LockKeyhole, Sprout } from "lucide-react";

export function PlatformProofStrip() {
  return (
    <section
              className="landing-proof-strip"
              aria-label="Platform principles"
            >
              <div>
                <span className="landing-proof-icon">
                  <CheckCircle2 size={17} />
                </span>
                <span>
                  <strong>One connected workspace</strong>
                  <small>Keep the important details together</small>
                </span>
              </div>
              <div>
                <span className="landing-proof-icon">
                  <Sprout size={17} />
                </span>
                <span>
                  <strong>Built around your season</strong>
                  <small>Follow work from planting to harvest</small>
                </span>
              </div>
              <div>
                <span className="landing-proof-icon">
                  <LockKeyhole size={17} />
                </span>
                <span>
                  <strong>Your account, your farm</strong>
                  <small>Sign in to access your workspace</small>
                </span>
              </div>
            </section>
  );
}
