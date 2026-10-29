import { Sprout } from "lucide-react";

export function BrandMark() {
  return (
    <a className="landing-brand" href="#home" aria-label="Infyro Farms home">
      <span
        className="landing-logo-placeholder"
        aria-label="Temporary logo placeholder — replace with your logo image"
      >
        <Sprout size={22} strokeWidth={2.2} />
        <small>LOGO</small>
      </span>
      <span className="landing-brand-copy">
        <strong>
          Infyro <span>Farms</span>
        </strong>
      </span>
    </a>
  );
}
