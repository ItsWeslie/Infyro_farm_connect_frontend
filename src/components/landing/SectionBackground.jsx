// Decorative, non-interactive layers shared by the public landing sections.
import "./LandingTheme.css";

const sequence = {
  commitment: { next: "features", pattern: "soil" },
  features: { next: "about", pattern: "field" },
  about: { next: "approach", pattern: "soil" },
  approach: { next: "workflow", pattern: "growth" },
  workflow: { next: "testimonials", pattern: "field" },
  testimonials: { pattern: "harvest" }, // Retain its existing transition into Contact.
  contact: { next: "cta", pattern: "harvest" },
  cta: { next: "footer", pattern: "field" },
  footer: { pattern: "soil" },
};

function LandscapeArt({ pattern }) {
  return (
    <div className={"ifc-landscape-art ifc-landscape-art-" + pattern} aria-hidden="true">
      <svg viewBox="0 0 1200 600" preserveAspectRatio="none" focusable="false">
        {pattern === "soil" ? (
          <>
            <path className="ifc-landscape-earth-fill" d="M0 445C200 325 380 510 650 420S1020 350 1200 405V600H0Z" />
            <path className="ifc-landscape-earth-fill ifc-landscape-layer-soft" d="M0 515C240 380 470 560 710 475S1040 430 1200 490V600H0Z" />
            <g className="ifc-landscape-earth-lines">
              {[0, 18, 36].map(offset => <path key={offset} transform={"translate(0 " + offset + ")"} d="M-40 390C190 275 370 470 640 385S1030 315 1240 370" />)}
            </g>
          </>
        ) : pattern === "field" ? (
          <g className="ifc-landscape-field-lines">
            {Array.from({ length: 6 }, (_, index) => (
              <g key={index}>
                <path transform={"translate(" + (index * 24) + " 0)"} d="M-120 -25C170 80 -50 195 40 310S130 470 -55 625" />
                <path transform={"translate(" + (-index * 24) + " 0)"} d="M1320 -25C1030 70 1250 215 1160 320S1070 480 1255 625" />
              </g>
            ))}
          </g>
        ) : pattern === "growth" ? (
          <>
            <path className="ifc-landscape-green-fill" d="M0 420C190 305 360 510 630 430S1040 390 1200 450V600H0Z" />
            <g className="ifc-landscape-field-lines">
              {[0, 20, 40].map(offset => <path key={offset} transform={"translate(0 " + offset + ")"} d="M0 395C190 280 360 485 630 405S1040 365 1200 425" />)}
            </g>
          </>
        ) : (
          <>
            <circle className="ifc-landscape-gold-fill" cx="120" cy="560" r="230" />
            <path className="ifc-landscape-gold-fill" d="M0 455C260 345 440 550 710 460S1020 390 1200 430V600H0Z" />
            <g className="ifc-landscape-earth-lines">
              {[0, 22].map(offset => <path key={offset} transform={"translate(0 " + offset + ")"} d="M0 420C260 310 440 515 710 425S1020 355 1200 395" />)}
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

export function SectionBackground({ stage, children }) {
  const { pattern, next } = sequence[stage];
  return (
    <div className={"ifc-landscape-stage ifc-landscape-" + stage}>
      <LandscapeArt pattern={pattern} />
      {children}
      {next && (
        <svg className={"ifc-landscape-transition ifc-landscape-to-" + next} viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path className="ifc-landscape-transition-tint" d="M0 21C240 -12 390 59 630 31S1000 6 1200 17V60H0Z" />
          <path className="ifc-landscape-transition-surface" d="M0 34C250 9 410 68 650 40S1010 16 1200 29V60H0Z" />
        </svg>
      )}
    </div>
  );
}
