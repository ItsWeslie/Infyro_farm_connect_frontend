export function Brand({ onHome, href, className = "" }) {
  const Component = href ? "a" : "button";
  return (
    <Component
      {...(href ? { href } : { type: "button" })}
      className={["brand", "brand-logo", className].filter(Boolean).join(" ")}
      aria-label="Infyro Farm home"
      onClick={onHome}
    >
      <span className="brand-logo-mark" aria-hidden="true">
        <img src="/infyro-farm-logo-3.png" alt="" />
      </span>
      <span className="brand-logo-copy">
        <span className="brand-logo-name">
          <span className="brand-logo-infyro">Infyro</span>
          <span className="brand-logo-farm">Farm</span>
        </span>
        <span className="brand-logo-tagline">FARM SMARTER. GROW BETTER.</span>
      </span>
    </Component>
  );
}
