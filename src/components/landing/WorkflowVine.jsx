import { useEffect, useState } from "react";
import { ClipboardList, GitBranch, LogIn, MapPinned, ArrowRight, Sprout, UserPlus, Tractor, Wallet, Wheat } from "lucide-react";

const workflow = [
  {
    number: "01",
    title: "Create your free account",
    description: "Create your Infyro Farms account to begin your farm journey.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Sign in to your account",
    description: "Sign in securely to open your farm workspace.",
    icon: LogIn,
  },
  {
    number: "03",
    title: "Create your farm",
    description: "Set up your farm and give your growing work a home.",
    icon: Tractor,
  },
  {
    number: "04",
    title: "Create your field",
    description: "Add the fields where you manage your crops.",
    icon: MapPinned,
  },
  {
    number: "05",
    title: "Create your crop",
    description: "Add the crops you plan to grow in your fields.",
    icon: Sprout,
  },
  {
    number: "06",
    title: "Manage the crop life cycle",
    description: "Follow your crop from early growth through the season.",
    icon: GitBranch,
  },
  {
    number: "07",
    title: "Record daily activities",
    description: "Keep a record of the work happening on your farm each day.",
    icon: ClipboardList,
  },
  {
    number: "08",
    title: "Add expenses",
    description: "Record the expenses associated with your farm work.",
    icon: Wallet,
  },
  {
    number: "09",
    title: "Store harvest records",
    description: "Save harvest details to review as your season progresses.",
    icon: Wheat,
  },
];

export function WorkflowVine() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionAllowed(!media.matches);
    updateMotion();
    media.addEventListener?.("change", updateMotion);
    return () => media.removeEventListener?.("change", updateMotion);
  }, []);

  useEffect(() => {
    if (paused || !motionAllowed) return undefined;
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % workflow.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, motionAllowed]);

  return (
    <div
      className="landing-vine-experience"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
    >
      <div
        className="landing-vine-scroll"
        aria-label="Nine steps in the Infyro Farms journey"
      >
        <div className="landing-vine-track">
          <svg
            className="landing-vine-art"
            viewBox="0 0 1080 116"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="ifc-vine-gradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#67992D" />
                <stop offset="55%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#67992D" />
              </linearGradient>
            </defs>
            <path
              className="landing-vine-stem"
              d="M60 52 C100 52 140 52 180 52 S260 52 300 52 S380 52 420 52 S500 52 540 52 S620 52 660 52 S740 52 780 52 S860 52 900 52 S980 52 1020 52"
            />
          </svg>
          <div className="landing-vine-nodes">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  className={`landing-vine-node${index === activeStep ? " is-active" : ""}`}
                  type="button"
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  aria-pressed={index === activeStep}
                  aria-label={`Step ${step.number}: ${step.title}`}
                >
                  <span className="landing-vine-node-circle">
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                  <span className="landing-vine-node-number">
                    {step.number}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className="landing-vine-active-card"
        aria-live="polite"
        aria-atomic="true"
        key={workflow[activeStep].number}
      >
        <span className="landing-vine-active-icon">
          {(() => {
            const ActiveIcon = workflow[activeStep].icon;
            return <ActiveIcon size={22} strokeWidth={1.8} />;
          })()}
        </span>
        <div className="landing-vine-active-copy">
          <span className="landing-vine-active-eyebrow">
            STEP {workflow[activeStep].number} OF 09
          </span>
          <h3>{workflow[activeStep].title}</h3>
          <p>{workflow[activeStep].description}</p>
        </div>
        <span className="landing-vine-progress-label">
          {String(activeStep + 1).padStart(2, "0")} <i>/ 09</i>
        </span>
      </div>
      <div className="landing-vine-controls" aria-label="Workflow navigation">
        <button
          type="button"
          onClick={() =>
            setActiveStep((activeStep + workflow.length - 1) % workflow.length)
          }
          aria-label="Previous workflow step"
        >
          Previous
        </button>
        <div className="landing-vine-dots">
          {workflow.map((step, index) => (
            <button
              key={step.number}
              type="button"
              className={index === activeStep ? "is-active" : ""}
              onClick={() => setActiveStep(index)}
              aria-label={`Show step ${step.number}: ${step.title}`}
              aria-pressed={index === activeStep}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setActiveStep((activeStep + 1) % workflow.length)}
          aria-label="Next workflow step"
        >
          Next <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
