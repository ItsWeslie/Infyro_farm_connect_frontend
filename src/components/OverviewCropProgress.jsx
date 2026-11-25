import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleAlert, MapPin, Plus, Sprout, Tractor } from "lucide-react";
import { cropPlantingApi, farmApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";

const DAY_MS = 86400000;
const MAX_VISIBLE_CROPS = 5;

function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

// Compare calendar days rather than elapsed hours, so the estimate does not
// shift at midday or drift by an hour when daylight-saving time changes.
function calendarDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDay = Date.UTC(year, month - 1, day);
  const date = new Date(utcDay);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    return null;
  }
  return utcDay / DAY_MS;
}

function currentCalendarDay() {
  const today = new Date();
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / DAY_MS;
}

// This is an estimated share of the planting-to-harvest period, not measured
// biological growth. The expected harvest date takes priority when available,
// keeping the percentage consistent with the date shown below the bar.
function estimatedProgress(planting) {
  const status = String(planting.status || "").toUpperCase();
  if (status === "COMPLETED") return 100;
  if (status === "PLANNED" || status === "CANCELLED") return null;
  if (status !== "ACTIVE" && status !== "HARVESTING") return null;

  const start = calendarDay(planting.plantedOn);
  if (start == null) return null;

  const expected = calendarDay(planting.expectedHarvestOn);
  let duration = expected != null && expected > start ? expected - start : null;
  if (duration == null) {
    const maturityDays = Number(planting.maturityTimeInDays);
    if (!Number.isFinite(maturityDays) || maturityDays <= 0) return null;
    duration = maturityDays;
  }

  const elapsed = currentCalendarDay() - start;
  return Math.max(0, Math.min(99, Math.round((elapsed / duration) * 100)));
}

function cropMonogram(name) {
  const letters = Array.from(String(name || "").trim().replace(/[^\p{L}\p{N}]/gu, ""));
  return letters.slice(0, 2).join("").toLocaleUpperCase() || "CR";
}

function statusLabel(value) {
  const status = String(value || "").toUpperCase();
  const labels = {
    ACTIVE: "Growing",
    HARVESTING: "Harvesting",
    PLANNED: "Planned",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] || "Status unavailable";
}

function statusTone(value) {
  const status = String(value || "").toUpperCase();
  if (status === "ACTIVE" || status === "COMPLETED") return "is-growing";
  if (status === "HARVESTING") return "is-harvest";
  return "is-neutral";
}

function formatArea(value) {
  if (value == null || !Number.isFinite(Number(value))) return "Area not recorded";
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + " acres";
}

function formatHarvestDate(value) {
  const day = calendarDay(value);
  if (day == null) return "Not scheduled";
  const date = new Date(day * DAY_MS);
  const year = date.getUTCFullYear();
  return date.toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: year === new Date().getFullYear() ? undefined : "numeric",
  });
}

function plantingSortTime(planting) {
  const timestamp = Date.parse(planting.updatedAt || planting.createdAt || "");
  return Number.isFinite(timestamp) ? timestamp : (calendarDay(planting.plantedOn) || 0) * DAY_MS;
}

export default function OverviewCropProgress({ onNavigate, onAdd }) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setRecords(null);
    setError("");

    Promise.all([cropPlantingApi.getAll(), farmApi.getOwnedFarms()])
      .then(([plantingsResponse, farmsResponse]) => {
        if (!current) return;
        const fields = new Map();
        toList(farmsResponse).forEach((farm) => {
          toList(farm.fields).forEach((field) => {
            fields.set(String(field.id), { fieldName: field.fieldName, farmName: farm.name });
          });
        });

        const items = toList(plantingsResponse)
          .map((planting) => ({
            ...planting,
            fieldName: fields.get(String(planting.fieldId))?.fieldName || "",
            farmName: fields.get(String(planting.fieldId))?.farmName || "",
          }))
          .sort((left, right) => plantingSortTime(right) - plantingSortTime(left) || Number(right.id || 0) - Number(left.id || 0));
        setRecords(items);
      })
      .catch((requestError) => {
        if (current) setError(requestError.message || "Crop progress could not be loaded.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [retryKey]);

  const visible = (records || []).slice(0, MAX_VISIBLE_CROPS);

  return (
    <section className="ifc-overview-panel ifc-overview-crop-progress-panel surface-card" aria-labelledby="ifc-overview-crop-progress-title">
      <div className="ifc-overview-panel-heading">
        <div>
          <span className="ifc-overview-kicker">GROWING NOW</span>
          <div className="ifc-overview-heading-title">
            <span className="ifc-overview-heading-logo" aria-hidden="true"><Sprout size={15} /></span>
            <h2 id="ifc-overview-crop-progress-title">Crop progress</h2>
          </div>
          <p>Latest crop plantings across all your farms.</p>
        </div>
        <button type="button" className="ifc-overview-text-link" onClick={() => onNavigate("Crop management")}>
          Manage crops <ArrowRight size={14} />
        </button>
      </div>

      {error && (
        <div className="ifc-overview-warning ifc-overview-crop-progress-error" role="alert">
          <CircleAlert size={15} />
          <span>{error}</span>
          <button type="button" className="button-secondary" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
        </div>
      )}

      {loading && records === null ? (
        <div className="ifc-overview-crop-progress-loading" role="status" aria-label="Loading crop progress">
          <SkeletonBlock rows={5} />
        </div>
      ) : visible.length ? (
        <div className="ifc-overview-crop-progress-list">
          {visible.map((planting, index) => {
            const progress = estimatedProgress(planting);
            const status = statusLabel(planting.status);
            return (
              <article className="ifc-overview-crop-progress-item" key={planting.id ?? index}>
                <span className="ifc-overview-crop-progress-monogram" aria-hidden="true">
                  {cropMonogram(planting.cropTypeName)}
                </span>
                <div className="ifc-overview-crop-progress-content">
                  <div className="ifc-overview-crop-progress-title">
                    <strong data-tooltip={planting.cropTypeName || "Crop planting"}>{planting.cropTypeName || "Crop planting"}</strong>
                    <span className={"ifc-overview-crop-progress-status " + statusTone(planting.status)}>{status}</span>
                  </div>
                  <div className="ifc-overview-crop-progress-meta">
                    <span className="ifc-overview-crop-progress-farm" data-tooltip={planting.farmName || "Farm unavailable"}>
                      <Tractor size={10} aria-hidden="true" />
                      <span>{planting.farmName || "Farm unavailable"}</span>
                    </span>
                    <span className="ifc-overview-crop-progress-field" data-tooltip={planting.fieldName || "Field unavailable"}>
                      <MapPin size={10} aria-hidden="true" />
                      <span>{planting.fieldName || "Field unavailable"}</span>
                    </span>
                    <span className="ifc-overview-crop-progress-area">{formatArea(planting.cropArea)}</span>
                    <span className="ifc-overview-crop-progress-harvest" data-tooltip="Expected harvest date">
                      <CalendarDays size={10} aria-hidden="true" />
                      <time dateTime={planting.expectedHarvestOn || undefined}>{formatHarvestDate(planting.expectedHarvestOn)}</time>
                    </span>
                  </div>
                  <div className="ifc-overview-crop-progress-line">
                    <span className="ifc-overview-crop-progress-label">Estimated progress</span>
                    <div
                      className={"ifc-overview-crop-progress-track" + (progress == null ? " is-unavailable" : "")}
                      role={progress == null ? undefined : "progressbar"}
                      aria-label={progress == null ? undefined : (planting.cropTypeName || "Crop") + " estimated progress"}
                      data-tooltip={progress == null ? "Estimated progress is unavailable." : "Estimated progress: " + progress + "% based on the planting and expected harvest dates."}
                      aria-valuemin={progress == null ? undefined : 0}
                      aria-valuemax={progress == null ? undefined : 100}
                      aria-valuenow={progress == null ? undefined : progress}
                    >
                      <span style={{ width: (progress ?? 0) + "%" }} />
                    </div>
                    <strong className="ifc-overview-crop-progress-value">
                      {progress == null ? "N/A" : progress + "%"}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : !error ? (
        <div className="ifc-overview-section-empty">
          <Sprout size={22} />
          <strong>No crop plantings yet</strong>
          <span>Add a crop to a field to start tracking its progress.</span>
          <button type="button" className="button-secondary" onClick={onAdd}><Plus size={14} /> Add crop</button>
        </div>
      ) : null}
    </section>
  );
}
