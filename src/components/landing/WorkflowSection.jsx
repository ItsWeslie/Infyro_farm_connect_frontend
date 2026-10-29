import { WorkflowVine } from "./WorkflowVine";

export function WorkflowSection() {
  return (
    <section className="landing-section landing-workflow" id="how-it-works">
              <div className="landing-section-heading">
                <span className="landing-section-kicker">
                  A SIMPLE PLACE TO START
                </span>
                <h2>
                  From your first field
                  <br />
                  to your <em>next harvest.</em>
                </h2>
                <p>
                  Follow the growing vine from your first account to your harvest
                  records.
                </p>
              </div>
              <WorkflowVine />
            </section>
  );
}
