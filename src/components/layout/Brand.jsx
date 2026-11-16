export function Brand({ onHome }) {
  return (
    <button
      type="button"
      className="brand brand-logo"
      aria-label="Infyro Farm home"
      onClick={onHome}
    >
      <span className="brand-logo-mark" aria-hidden="true">
        <img src="/infyro-farm-logo.png" alt="" />
      </span>
      <span className="brand-logo-copy">
        <span className="brand-logo-name">
          <span className="brand-logo-infyro">Infyro</span>
          <span className="brand-logo-farm">Farm</span>
        </span>
        <span className="brand-logo-tagline">FARM SMARTER. GROW BETTER.</span>
      </span>
    </button>
  );
}
