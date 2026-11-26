import "./InfyroIncLogo.css";

/**
 * Pure React/CSS brand mark. The size prop is the height in pixels;
 * width follows the original 537:784 silhouette.
 */
export function InfyroIncLogo({ size = 180, className = "", decorative = false } = {}) {
  return (
    <span
      className={["ifc-inc-logo", className].filter(Boolean).join(" ")}
      style={{ "--ifc-inc-logo-default-scale": size / 784 }}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Infyro Inc. logo"}
      aria-hidden={decorative || undefined}
    >
      <span className="ifc-inc-logo-shape" aria-hidden="true" />
    </span>
  );
}
