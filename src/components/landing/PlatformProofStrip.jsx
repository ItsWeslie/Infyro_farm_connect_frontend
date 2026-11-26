import { Lightbulb, Sprout, ShieldCheck } from "lucide-react";

const principles = [
  {
    icon: Lightbulb,
    title: "Purposeful innovation",
    description: "Practical technology by Infyro Inc., designed around everyday agricultural needs.",
  },
  {
    icon: Sprout,
    title: "Connected farm management",
    description: "Bring fields, crops, activities and farm records together throughout the growing season.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible technology",
    description: "A farmer-first approach to managing important information in your own workspace.",
  },
];

export function PlatformProofStrip() {
  return (
    <section className="landing-proof-strip landing-proof-premium" aria-label="The principles behind Infyro Farm">
      <header className="landing-proof-intro">
        <span className="landing-proof-kicker">THE INFYRO COMMITMENT</span>
        <h2>Built with purpose. Made for farmers.</h2>
      </header>
      <ul className="landing-proof-principles">
        {principles.map(({ icon: Icon, title, description }) => (
          <li className="landing-proof-principle" key={title}>
            <span className="landing-proof-icon" aria-hidden="true">
              <Icon size={23} strokeWidth={1.7} />
            </span>
            <div className="landing-proof-copy">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
