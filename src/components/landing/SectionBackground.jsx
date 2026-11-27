// Retain the existing section scopes without painting separate backgrounds.
import "./LandingTheme.css";

export function SectionBackground({ stage, children }) {
  return <div className={"ifc-landscape-stage ifc-landscape-" + stage}>{children}</div>;
}
