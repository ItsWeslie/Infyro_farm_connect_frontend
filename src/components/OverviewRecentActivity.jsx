import { useEffect, useState } from "react";
import { ArrowRight, CircleAlert, Clock3, MapPin, Sprout } from "lucide-react";
import { overviewApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";

const STAGE_LABELS = {
  LAND_PREPARATION: "Land preparation",
  SOWING_OR_TRANSPLANTING: "Sowing or transplanting",
  GERMINATION: "Germination",
  VEGETATIVE_GROWTH: "Vegetative growth",
  FLOWERING: "Flowering",
  FRUITING_OR_GRAIN_FILLING: "Fruiting or grain filling",
  MATURITY: "Maturity",
  HARVEST: "Harvest",
  OTHER: "Other",
};

function stageLabel(stage) {
  return STAGE_LABELS[stage] || "Stage not recorded";
}

function stageTone(stage) {
  if (stage === "FLOWERING" || stage === "MATURITY") return "is-amber";
  if (stage === "HARVEST") return "is-harvest";
  if (stage === "GERMINATION" || stage === "VEGETATIVE_GROWTH" || stage === "FRUITING_OR_GRAIN_FILLING" || stage === "SOWING_OR_TRANSPLANTING") return "is-growing";
  return "is-neutral";
}

function cropMonogram(name) {
  const letters = Array.from(String(name || "").trim().replace(/[^\p{L}\p{N}]/gu, ""));
  return letters.slice(0, 2).join("").toLocaleUpperCase() || "CR";
}

function activityDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  const options = { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true };
  if (date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";
  return date.toLocaleString("en-IN", options);
}

export default function OverviewRecentActivity({ onNavigate }) {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");

    overviewApi.getRecentActivities()
      .then((result) => {
        if (!current) return;
        const records = Array.isArray(result) ? result : [];
        setActivities(records.slice(0, 5));
      })
      .catch((requestError) => {
        if (current) setError(requestError.message || "Recent crop activities could not be loaded.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [retryKey]);

  return (
    <section className="ifc-overview-panel ifc-overview-recent-panel surface-card" aria-labelledby="ifc-overview-recent-title">
      <div className="ifc-overview-panel-heading">
        <div>
          <span className="ifc-overview-kicker">LATEST RECORDS</span>
          <div className="ifc-overview-heading-title">
            <span className="ifc-overview-heading-logo" aria-hidden="true"><Clock3 size={15} /></span>
            <h2 id="ifc-overview-recent-title">Recent activity</h2>
          </div>
          <p>Latest crop updates across all your farms.</p>
        </div>
        <button type="button" className="ifc-overview-text-link" onClick={() => onNavigate("Activities")}>
          Go to activities <ArrowRight size={14} />
        </button>
      </div>

      {error && (
        <div className="ifc-overview-warning ifc-overview-recent-error" role="alert">
          <CircleAlert size={15} />
          <span>{error}</span>
          <button type="button" className="button-secondary" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
        </div>
      )}

      {loading && activities === null ? (
        <div className="ifc-overview-recent-loading" role="status" aria-label="Loading recent crop activities">
          <SkeletonBlock rows={4} />
        </div>
      ) : activities?.length ? (
        <div className="ifc-overview-recent-list" aria-label="Recent crop activity records">
          {activities.map((activity, index) => (
            <article className="ifc-overview-recent-row" key={[activity.createdAt, activity.cropName, activity.cropField, activity.cropStage, index].join("-")}>
              <span className="ifc-overview-recent-monogram" aria-hidden="true">
                {cropMonogram(activity.cropName)}
              </span>
              <div className="ifc-overview-recent-content">
                <div className="ifc-overview-recent-primary">
                  <strong title={activity.cropName || "Crop not recorded"}>{activity.cropName || "Crop not recorded"}</strong>
                  <span className={"ifc-overview-recent-stage " + stageTone(activity.cropStage)} title={stageLabel(activity.cropStage)}>
                    {stageLabel(activity.cropStage)}
                  </span>
                </div>
                <div className="ifc-overview-recent-meta">
                  <span className="ifc-overview-recent-field" title={activity.cropField || "Field not recorded"}>
                    <MapPin size={11} aria-hidden="true" />
                    <span className="ifc-overview-recent-field-label">{activity.cropField || "Field not recorded"}</span>
                  </span>
                  <time className="ifc-overview-recent-date" dateTime={activity.createdAt || undefined}>
                    <Clock3 size={11} aria-hidden="true" />
                    {activityDate(activity.createdAt)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : !error ? (
        <div className="ifc-overview-section-empty compact">
          <Sprout size={21} />
          <strong>No recent crop activities</strong>
          <span>New crop activity logs across your farms will appear here.</span>
        </div>
      ) : null}
    </section>
  );
}
