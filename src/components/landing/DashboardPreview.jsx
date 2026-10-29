import { useEffect, useState } from "react";
import { ArrowRight, CloudSun, Leaf, Sprout, Tractor, TrendingUp, Wheat } from "lucide-react";

export function DashboardPreview() {
  const [tilt, setTilt] = useState({ x: 1, y: -4 });
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    setMotionEnabled(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  function handlePointerMove(event) {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: 1 - y * 5, y: -4 + x * 9 });
  }

  function resetTilt() {
    setTilt({ x: 1, y: -4 });
  }

  return (
    <div
      className="landing-preview landing-hero-dashboard-reveal relative [perspective:1400px] [transform-style:preserve-3d]"
      aria-label="Illustrative farm management dashboard preview"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <style>{`
        @keyframes ifc-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -7px; }
        }
        @keyframes ifc-dashboard-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -5px; }
        }
        @media (max-width: 640px) {
          @keyframes ifc-float {
            0%, 100% { translate: 0 0; }
            50% { translate: 0 -3px; }
          }
          @keyframes ifc-dashboard-float {
            0%, 100% { translate: 0 0; }
            50% { translate: 0 -2px; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ifc-dashboard-idle, .ifc-glass-badge { animation: none !important; }
        }
      `}</style>
      <div
        className="preview-window ifc-dashboard-idle motion-safe:animate-[ifc-dashboard-float_8s_ease-in-out_infinite] transform-gpu transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{
          transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
        }}
      >
        <div className="preview-topbar">
          <div className="preview-brand-dot">
            <Sprout size={13} />
          </div>
          <div className="preview-breadcrumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>Overview</strong>
          </div>
          <span className="preview-live">
            <i /> Farm overview
          </span>
        </div>
        <div className="preview-body">
          <aside className="preview-sidebar" aria-hidden="true">
            <span className="preview-side-active">
              <span /> Overview
            </span>
            <span>
              <span /> Farms & fields
            </span>
            <span>
              <span /> Crop management
            </span>
            <span>
              <span /> Activities
            </span>
            <span>
              <span /> Harvests
            </span>
          </aside>
          <div className="preview-main">
            <div className="preview-welcome">
              <div>
                <small>YOUR FARM AT A GLANCE</small>
                <h3>A season full of potential.</h3>
                <p>A clearer view of the work you put in.</p>
              </div>
              <span className="preview-weather">
                <CloudSun size={17} /> 29°
              </span>
            </div>
            <div className="preview-stats">
              <div>
                <span>Registered farms</span>
                <strong>02</strong>
                <small>
                  <Tractor size={12} /> Your growing spaces
                </small>
              </div>
              <div>
                <span>Active plantings</span>
                <strong>08</strong>
                <small>
                  <Sprout size={12} /> Across your fields
                </small>
              </div>
              <div>
                <span>Harvest records</span>
                <strong>12</strong>
                <small>
                  <Wheat size={12} /> This season
                </small>
              </div>
            </div>
            <div className="preview-lower">
              <div className="preview-chart-card">
                <div className="preview-card-heading">
                  <span>
                    <strong>Season overview</strong>
                    <small>Illustrative example</small>
                  </span>
                  <TrendingUp size={16} />
                </div>
                <div className="preview-chart">
                  {[34, 49, 43, 65, 54, 76, 63, 88, 72, 96, 82, 100].map(
                    (height, index) => (
                      <i key={index} style={{ height: height + "%" }} />
                    ),
                  )}
                </div>
                <div className="preview-chart-labels">
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                </div>
              </div>
              <div className="preview-crop-card">
                <div className="preview-card-heading">
                  <span>
                    <strong>Growing now</strong>
                    <small>Example crop list</small>
                  </span>
                  <ArrowRight size={14} />
                </div>
                <div className="preview-crop-row">
                  <span className="preview-crop-emoji">🌾</span>
                  <span>
                    <b>Rice</b>
                    <small>Paddy Field A</small>
                  </span>
                  <em>Growing</em>
                </div>
                <div className="preview-crop-row">
                  <span className="preview-crop-emoji">🍅</span>
                  <span>
                    <b>Tomato</b>
                    <small>North Field</small>
                  </span>
                  <em>Growing</em>
                </div>
                <div className="preview-crop-row">
                  <span className="preview-crop-emoji">🥬</span>
                  <span>
                    <b>Spinach</b>
                    <small>Kitchen Garden</small>
                  </span>
                  <em className="preview-ready">Nearly ready</em>
                </div>
              </div>
            </div>
            <p className="preview-disclaimer">
              Illustrative dashboard preview · not live farm data
            </p>
          </div>
        </div>
      </div>
      <div className="preview-float ifc-glass-badge preview-float-growth absolute left-0 bottom-1 z-20 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_45px_rgba(34,72,35,0.18)] backdrop-blur-xl motion-safe:animate-[ifc-float_6s_ease-in-out_infinite] max-sm:left-2 max-sm:bottom-0 max-sm:px-3 max-sm:py-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e8f1e1] text-[#53804d]">
          <TrendingUp size={17} />
        </span>
        <div className="flex flex-col gap-1">
          <small className="text-[10px] text-[#71816f] max-sm:text-[8px]">
            Every detail, connected
          </small>
          <strong className="text-xs text-[#2b4834] max-sm:text-[10px]">
            One farm workspace
          </strong>
        </div>
      </div>
      <div className="preview-float ifc-glass-badge preview-float-leaf absolute right-0 top-3 z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-xs font-semibold text-[#47714b] shadow-[0_18px_45px_rgba(34,72,35,0.16)] backdrop-blur-xl motion-safe:animate-[ifc-float_7s_ease-in-out_infinite] [animation-delay:-2.5s] max-sm:right-1 max-sm:top-1 max-sm:px-2.5 max-sm:py-2 max-sm:text-[9px]">
        <Leaf size={18} />
        <span>Rooted in better decisions</span>
      </div>
    </div>
  );
}

export default
