import { WorkflowVine } from "./WorkflowVine";

export function WorkflowSection() {
  return (
    <section className="landing-section landing-workflow mx-auto w-[min(1120px,calc(100%-64px))] py-[100px] max-[760px]:w-[calc(100%-38px)] max-[760px]:py-[72px] max-[640px]:w-[calc(100%-36px)] max-[640px]:py-[78px] max-[420px]:w-[calc(100%-30px)]" id="how-it-works">
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
