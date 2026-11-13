import { SkeletonBlock, SkeletonCards } from "./ui/Skeleton";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Coins,
  Flower2,
  Leaf,
  MapPinned,
  Plus,
  Receipt,
  Search,
  Sprout,
  Sun,
  Wheat,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  calendarApi,
  cropActivityApi,
  cropPlantingApi,
  expenseApi,
  farmSummaryApi,
  fieldApi,
} from "../api/client";

function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function isoOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localIsoDate(date);
}

function parseLocalDate(value) {
  if (!value) return null;
  const date = new Date(String(value).length === 10 ? value + "T12:00:00" : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value, options = {}) {
  const date = parseLocalDate(value);
  return date
    ? date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: options.year === false ? undefined : "numeric",
      })
    : "Date not available";
}

function timeLabel(value) {
  const date = parseLocalDate(value);
  return date
    ? date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "Date not available";
}

function currencyLabel(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function numberLabel(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: digits });
}

function humanize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusLabel(value) {
  const key = String(value || "").toUpperCase();
  const labels = {
    ACTIVE: "Growing",
    HARVESTING: "Harvesting",
    PLANNED: "Planned",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    PAUSED: "Paused",
  };
  return labels[key] || humanize(value) || "Status unavailable";
}

function statusClass(value) {
  const key = String(value || "").toUpperCase();
  if (key === "COMPLETED" || key === "ACTIVE") return "is-positive";
  if (key === "HARVESTING") return "is-harvest";
  if (key === "PLANNED" || key === "PAUSED") return "is-pending";
  return "is-neutral";
}

function progressFor(planting) {
  const status = String(planting.status || "").toUpperCase();
  if (status === "COMPLETED") return 100;
  if (status === "PLANNED" || status === "CANCELLED") return null;

  const start = parseLocalDate(planting.plantedOn);
  if (!start) return null;

  let totalDays = Number(planting.maturityTimeInDays);
  if (!Number.isFinite(totalDays) || totalDays <= 0) {
    const expected = parseLocalDate(planting.expectedHarvestOn);
    totalDays = expected ? Math.round((expected.getTime() - start.getTime()) / 86400000) : 0;
  }
  if (totalDays <= 0) return null;

  const elapsedDays = Math.floor((Date.now() - start.getTime()) / 86400000);
  return Math.max(0, Math.min(99, Math.round((elapsedDays / totalDays) * 100)));
}

function eventKind(eventType) {
  return String(eventType || "").toUpperCase().includes("HARVEST") ? "harvest" : "planting";
}

function OverviewPage({ selectedFarm, farmCount = 0, onNavigate, onAdd, notify }) {
  const { user } = useAuth();
  const userName = user?.name?.trim()?.split(/\s+/)[0] || user?.username?.split("@")[0] || "there";
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cropSearch, setCropSearch] = useState("");

  const farmId = selectedFarm?.id;

  useEffect(() => {
    let current = true;

    async function loadOverview() {
      if (!farmId) {
        setSnapshot(null);
        setWarnings([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const today = isoOffset(0);
      const monthStart = today.slice(0, 8) + "01";
      const nextMonthWindow = isoOffset(30);

      const results = await Promise.allSettled([
        fieldApi.getByFarm(farmId),
        cropPlantingApi.getAll(),
        farmSummaryApi.getSummary(farmId),
        farmSummaryApi.getExpensesSummary(farmId, monthStart, today),
        farmSummaryApi.getHarvestsSummary(farmId, monthStart, today),
        expenseApi.getByFarm(farmId),
        calendarApi.getEvents(today, nextMonthWindow),
      ]);

      if (!current) return;

      const [fieldsResult, plantingsResult, summaryResult, monthExpensesResult, monthHarvestsResult, expensesResult, calendarResult] = results;

      if (fieldsResult.status !== "fulfilled" || plantingsResult.status !== "fulfilled") {
        const failed = fieldsResult.status !== "fulfilled" ? fieldsResult.reason : plantingsResult.reason;
        setError(failed?.message || "Farm overview data could not be loaded.");
        setSnapshot(null);
        setWarnings([]);
        setLoading(false);
        return;
      }

      const fields = toList(fieldsResult.value);
      const fieldIds = new Set(fields.map((field) => String(field.id)));
      const fieldById = new Map(fields.map((field) => [String(field.id), field]));
      const plantings = toList(plantingsResult.value)
        .filter((planting) => fieldIds.has(String(planting.fieldId)))
        .sort((left, right) => {
          const leftDate = parseLocalDate(left.updatedAt || left.createdAt || left.plantedOn)?.getTime() || 0;
          const rightDate = parseLocalDate(right.updatedAt || right.createdAt || right.plantedOn)?.getTime() || 0;
          return rightDate - leftDate;
        });

      const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
      const monthExpenses = monthExpensesResult.status === "fulfilled" ? monthExpensesResult.value : null;
      const monthHarvests = monthHarvestsResult.status === "fulfilled" ? monthHarvestsResult.value : null;
      const expenses = expensesResult.status === "fulfilled"
        ? toList(expensesResult.value).filter((expense) => !expense.voided)
        : [];
      const events = calendarResult.status === "fulfilled"
        ? toList(calendarResult.value).filter((event) => {
            if (!event.eventDate || event.eventDate < today || event.eventDate > nextMonthWindow) return false;
            return !event.farmName || !selectedFarm?.name ||
              String(event.farmName).trim().toLowerCase() === String(selectedFarm.name).trim().toLowerCase();
          }).sort((left, right) => String(left.eventDate).localeCompare(String(right.eventDate)))
        : [];

      const activityTargets = plantings.slice(0, 12);
      const activityResults = await Promise.allSettled(
        activityTargets.map((planting) => cropActivityApi.getByPlanting(planting.id))
      );

      if (!current) return;

      const recentActivities = [];
      activityResults.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const planting = activityTargets[index];
        const field = fieldById.get(String(planting.fieldId));
        toList(result.value).forEach((activity) => {
          recentActivities.push({
            id: "activity-" + activity.id,
            kind: "activity",
            title: activity.dailyActivity || humanize(activity.cropStage) || "Crop activity recorded",
            detail: [planting.cropTypeName, field?.fieldName].filter(Boolean).join(" · "),
            date: activity.createdAt || activity.updatedAt,
            status: activity.status,
          });
        });
      });

      expenses.forEach((expense) => {
        recentActivities.push({
          id: "expense-" + expense.id,
          kind: "expense",
          title: expense.description || humanize(expense.category) || "Farm expense recorded",
          detail: humanize(expense.category) + " · " + currencyLabel(expense.amount),
          date: expense.expenseDate,
          status: expense.statusLabel,
        });
      });

      recentActivities.sort((left, right) => {
        return (parseLocalDate(right.date)?.getTime() || 0) - (parseLocalDate(left.date)?.getTime() || 0);
      });

      const totalArea = fields.reduce((sum, field) => sum + (Number(field.totalArea) || 0), 0);
      const availableArea = fields.reduce((sum, field) => sum + (Number(field.availableArea) || 0), 0);
      const activeCount = plantings.filter((planting) => {
        return ["ACTIVE", "HARVESTING"].includes(String(planting.status || "").toUpperCase());
      }).length;

      const nextWarnings = [];
      if (summaryResult.status !== "fulfilled") nextWarnings.push("Farm totals are unavailable.");
      if (monthExpensesResult.status !== "fulfilled") nextWarnings.push("This-month expense summary is unavailable.");
      if (monthHarvestsResult.status !== "fulfilled") nextWarnings.push("This-month harvest summary is unavailable.");
      if (expensesResult.status !== "fulfilled") nextWarnings.push("Recent expense entries are unavailable.");
      if (calendarResult.status !== "fulfilled") nextWarnings.push("Upcoming milestones are unavailable.");
      if (activityResults.some((result) => result.status !== "fulfilled")) nextWarnings.push("Some crop activity logs could not be loaded.");

      setWarnings(nextWarnings);
      setSnapshot({
        fields,
        plantings,
        summary,
        monthExpenses,
        monthHarvests,
        expenses,
        events,
        recentActivities: recentActivities.slice(0, 8),
        totalArea,
        cultivatedArea: Math.max(0, totalArea - availableArea),
        activeCount,
        loadedAt: new Date(),
      });
      setLoading(false);
    }

    loadOverview().catch((requestError) => {
      if (!current) return;
      setError(requestError.message || "Farm overview data could not be loaded.");
      if (notify) notify(requestError.message || "Farm overview data could not be loaded.", "error");
      setLoading(false);
    });

    return () => {
      current = false;
    };
  }, [farmId, selectedFarm?.name, refreshKey, notify]);

  const filteredPlantings = useMemo(() => {
    const query = cropSearch.trim().toLowerCase();
    if (!query) return snapshot?.plantings || [];
    return (snapshot?.plantings || []).filter((planting) => {
      const field = snapshot.fields.find((item) => String(item.id) === String(planting.fieldId));
      return [planting.cropTypeName, field?.fieldName, statusLabel(planting.status)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [cropSearch, snapshot]);

  const expenseCategories = useMemo(() => {
    const raw = snapshot?.summary?.expensesByCategory || {};
    const rows = Object.entries(raw).map(([category, amount]) => ({
      category,
      amount: Number(amount) || 0,
    })).filter((row) => row.amount > 0).sort((left, right) => right.amount - left.amount);
    const maximum = rows[0]?.amount || 0;
    return rows.slice(0, 5).map((row) => ({
      ...row,
      percent: maximum ? Math.max(5, Math.round((row.amount / maximum) * 100)) : 0,
    }));
  }, [snapshot]);

  const totalExpenses = snapshot?.summary?.totalExpenses;
  const totalHarvestRecords = snapshot?.summary?.harvestRecordCount;
  const monthlyExpenseCount = snapshot?.monthExpenses?.recordCount;
  const monthlyHarvestCount = snapshot?.monthHarvests?.recordCount;

  if (!selectedFarm) {
    return (
      <section className="ifc-overview">
        <div className="ifc-overview-empty surface-card">
          <span className="ifc-overview-empty-icon"><Sprout size={25} /></span>
          <h1>Start with your first farm</h1>
          <p>Your overview will show field, crop, expense, and harvest information as soon as a farm is added.</p>
          <button type="button" className="button-primary" onClick={() => onNavigate("Farms")}>
            <Plus size={15} /> Add a farm
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="ifc-overview">
      <section className="welcome-row ifc-overview-welcome">
        <div>
          <div className="page-eyebrow">
            <span className="eyebrow-pip" />
            TODAY · {selectedFarm.name.toUpperCase()}
          </div>
          <h1>
            Good day, {userName} <span className="wave">✳</span>
          </h1>
          <p>
            Here’s what’s happening on your farm today.
            {snapshot?.loadedAt ? " Updated " + snapshot.loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + "." : ""}
          </p>
        </div>
        <div className="ifc-overview-actions">
          <button type="button" className="button-primary" onClick={onAdd}>
            <Plus size={15} /> Add new crop
          </button>
        </div>
      </section>

      <section className="hero-banner ifc-overview-hero">
        <div className="hero-copy">
          <div className="hero-tag">
            <Flower2 size={14} /> YOUR FARM, IN RHYTHM
          </div>
          <h2>
            Every season is a<br />
            <em>fresh beginning.</em>
          </h2>
          <p>
            Healthy soil. Thoughtful care. A little patience.
            <br />
            You’re growing something wonderful.
          </p>
          <button
            type="button"
            className="hero-button"
            onClick={() => onNavigate("Crop management")}
          >
            Explore your crops <ArrowRight size={15} />
          </button>
          <div className="hero-note">
            <span><Sun size={14} /></span>
            A beautiful day to grow something good
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of a warm sun over growing fields">
          <svg
            className="hero-art-vector"
            viewBox="0 0 520 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="Sun shining over rolling green fields and young crops"
          >
            <defs>
              <linearGradient id="overviewSunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="overviewHillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbe8ca" />
                <stop offset="100%" stopColor="#c2d8a5" />
              </linearGradient>
              <linearGradient id="overviewHillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ec08d" />
                <stop offset="100%" stopColor="#7ba569" />
              </linearGradient>
            </defs>

            <circle cx="370" cy="56" r="44" fill="url(#overviewSunGlow)" />
            <circle cx="370" cy="56" r="54" fill="#fef3c7" opacity="0.35" />

            <g opacity="0.8" fill="#ffffff">
              <path d="M210 50 a12 12 0 0 1 20 -4 a16 16 0 0 1 28 2 a10 10 0 0 1 12 10 l-60 0 a8 8 0 0 1 0 -8 z" />
              <path d="M430 78 a9 9 0 0 1 15 -3 a12 12 0 0 1 21 2 a8 8 0 0 1 9 8 l-45 0 a6 6 0 0 1 0 -7 z" opacity="0.65" />
            </g>

            <path d="M120 230 C200 130 340 105 520 160 L520 230 Z" fill="url(#overviewHillBackGrad)" />
            <path d="M170 230 C290 145 420 155 520 185 L520 230 Z" fill="url(#overviewHillFrontGrad)" />

            <g transform="translate(265, 125)">
              <path d="M12 90 Q10 40 4 0" stroke="#3d6339" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 55 C-8 45 -12 25 2 20 C10 32 8 48 6 55 Z" fill="#58854d" />
              <path d="M8 35 C20 26 25 8 12 5 C4 18 6 30 8 35 Z" fill="#6c9b5f" />
              <path d="M4 12 C-4 2 -2 -10 6 -8 C10 -2 7 8 4 12 Z" fill="#7eae6f" />
            </g>
            <g transform="translate(325, 140)">
              <path d="M10 80 Q14 35 18 0" stroke="#365832" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M13 50 C28 42 32 24 20 18 C12 28 12 44 13 50 Z" fill="#507c46" />
              <path d="M11 32 C-2 25 -6 9 6 6 C13 16 12 28 11 32 Z" fill="#66945a" />
              <path d="M17 12 C28 2 28 -12 18 -10 C12 -2 15 8 17 12 Z" fill="#79a86b" />
            </g>
            <g transform="translate(385, 155)">
              <path d="M8 70 Q5 35 0 5" stroke="#3d6339" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M5 45 C-6 38 -9 22 2 18 C8 26 6 39 5 45 Z" fill="#58854d" />
              <path d="M4 25 C14 18 17 4 7 2 C1 11 3 20 4 25 Z" fill="#6ca061" />
            </g>
            <g transform="translate(445, 142)">
              <path d="M6 75 Q4 45 6 18" stroke="#4b7042" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="6" cy="14" r="5" fill="#f59e0b" />
              <circle cx="6" cy="6" r="4.5" fill="#fef3c7" />
              <circle cx="14" cy="14" r="4.5" fill="#fef3c7" />
              <circle cx="6" cy="22" r="4.5" fill="#fef3c7" />
              <circle cx="-2" cy="14" r="4.5" fill="#fef3c7" />
            </g>
          </svg>
          <span className="art-caption">
            GROW WITH CARE <Flower2 size={12} />
          </span>
        </div>
      </section>

      {error && (
        <div className="ifc-overview-error" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
          <button type="button" className="button-secondary" onClick={() => setRefreshKey((value) => value + 1)}>Retry</button>
        </div>
      )}
      {warnings.length > 0 && !error && (
        <div className="ifc-overview-warning" role="status">
          <CircleAlert size={15} />
          <span>{warnings.join(" ")}</span>
        </div>
      )}

      {loading && !snapshot ? (
        <div className="surface-card" role="status" aria-label="Loading overview">
          <SkeletonCards count={4} />
          <SkeletonBlock rows={5} />
        </div>
      ) : snapshot ? (
        <>
          <div className="ifc-overview-stats">
            <article className="ifc-overview-stat surface-card">
              <div><span>Fields</span><i><MapPinned size={17} /></i></div>
              <strong>{snapshot.summary?.totalFields ?? snapshot.fields.length}</strong>
              <small>{numberLabel(snapshot.totalArea)} acres total area</small>
            </article>
            <article className="ifc-overview-stat surface-card">
              <div><span>Active plantings</span><i><Sprout size={17} /></i></div>
              <strong>{snapshot.activeCount}</strong>
              <small>{snapshot.plantings.length} total plantings in this farm</small>
            </article>
            <article className="ifc-overview-stat surface-card">
              <div><span>Total expenses</span><i><Coins size={17} /></i></div>
              <strong>{currencyLabel(totalExpenses)}</strong>
              <small>
                {monthlyExpenseCount == null
                  ? "Lifetime total from farm summary"
                  : numberLabel(monthlyExpenseCount, 0) + " records this month · " + currencyLabel(snapshot.monthExpenses?.totalAmount)}
              </small>
            </article>
            <article className="ifc-overview-stat surface-card">
              <div><span>Harvest records</span><i><Wheat size={17} /></i></div>
              <strong>{totalHarvestRecords == null ? "—" : totalHarvestRecords}</strong>
              <small>
                {monthlyHarvestCount == null
                  ? "Lifetime recorded harvests"
                  : numberLabel(monthlyHarvestCount, 0) + " recorded this month"}
              </small>
            </article>
          </div>

          <div className="ifc-overview-main-grid">
            <section className="ifc-overview-panel surface-card">
              <div className="ifc-overview-panel-heading">
                <div>
                  <span className="ifc-overview-kicker">GROWING NOW</span>
                  <h2>Crop progress</h2>
                  <p>Plantings and field allocation from your farm records.</p>
                </div>
                <button type="button" className="ifc-overview-text-link" onClick={() => onNavigate("Crop management")}>
                  Manage crops <ArrowRight size={14} />
                </button>
              </div>
              <label className="ifc-overview-search">
                <Search size={15} />
                <input value={cropSearch} onChange={(event) => setCropSearch(event.target.value)} placeholder="Search crop or field…" />
              </label>
              {filteredPlantings.length ? (
                <div className="ifc-overview-crop-list">
                  {filteredPlantings.slice(0, 7).map((planting) => {
                    const field = snapshot.fields.find((item) => String(item.id) === String(planting.fieldId));
                    const progress = progressFor(planting);
                    return (
                      <article className="ifc-overview-crop-row" key={planting.id}>
                        <span className="ifc-overview-crop-icon"><Leaf size={17} /></span>
                        <div className="ifc-overview-crop-copy">
                          <div className="ifc-overview-crop-title">
                            <strong>{planting.cropTypeName || "Crop planting"}</strong>
                            <span className={"ifc-overview-status " + statusClass(planting.status)}>{statusLabel(planting.status)}</span>
                          </div>
                          <p>{field?.fieldName || "Field not available"} · {planting.cropArea == null ? "Area not recorded" : numberLabel(planting.cropArea) + " acres"}</p>
                          <div className="ifc-overview-progress">
                            <span><i style={{ width: progress == null ? "0%" : progress + "%" }} /></span>
                            <small>{progress == null ? "Progress not available" : progress + "%"}</small>
                          </div>
                          <small className="ifc-overview-harvest-date">
                            {planting.expectedHarvestOn ? "Expected harvest " + dateLabel(planting.expectedHarvestOn, { year: false }) : "No expected harvest date"}
                          </small>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="ifc-overview-section-empty">
                  <Sprout size={22} />
                  <strong>{cropSearch ? "No matching plantings" : "No crop plantings yet"}</strong>
                  <span>{cropSearch ? "Try another crop or field name." : "Add a crop to a field to start tracking its progress."}</span>
                  {!cropSearch && <button type="button" className="button-secondary" onClick={onAdd}><Plus size={14} /> Add crop</button>}
                </div>
              )}
            </section>

            <section className="ifc-overview-panel ifc-overview-side-panel surface-card">
              <div className="ifc-overview-panel-heading">
                <div>
                  <span className="ifc-overview-kicker">NEXT 30 DAYS</span>
                  <h2>Upcoming milestones</h2>
                  <p>Planting and expected-harvest dates.</p>
                </div>
                <CalendarDays size={19} />
              </div>
              {snapshot.events.length ? (
                <div className="ifc-overview-milestone-list">
                  {snapshot.events.slice(0, 6).map((event) => {
                    const kind = eventKind(event.eventType);
                    return (
                      <article className="ifc-overview-milestone" key={event.eventKey || String(event.sourceId) + event.eventDate}>
                        <span className={"ifc-overview-milestone-icon " + kind}>{kind === "harvest" ? <Wheat size={15} /> : <Sprout size={15} />}</span>
                        <div>
                          <strong>{event.title || (kind === "harvest" ? "Expected harvest" : "Planting milestone")}</strong>
                          <small>{[event.fieldName, event.farmName].filter(Boolean).join(" · ")}</small>
                        </div>
                        <time>{dateLabel(event.eventDate, { year: false })}</time>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="ifc-overview-section-empty compact">
                  <CalendarDays size={21} />
                  <strong>No upcoming milestones</strong>
                  <span>There are no planting or expected-harvest dates in the next 30 days.</span>
                </div>
              )}
              <button type="button" className="ifc-overview-panel-footer" onClick={() => onNavigate("Calendar")}>
                Open farm calendar <ArrowRight size={14} />
              </button>
            </section>
          </div>

          <div className="ifc-overview-bottom-grid">
            <section className="ifc-overview-panel surface-card">
              <div className="ifc-overview-panel-heading">
                <div>
                  <span className="ifc-overview-kicker">LATEST RECORDS</span>
                  <h2>Recent activity</h2>
                  <p>Crop activities and expense entries recorded for this farm.</p>
                </div>
                <button type="button" className="ifc-overview-text-link" onClick={() => onNavigate("Activities")}>
                  Activity log <ArrowRight size={14} />
                </button>
              </div>
              {snapshot.recentActivities.length ? (
                <div className="ifc-overview-activity-list">
                  {snapshot.recentActivities.slice(0, 6).map((item) => (
                    <article className="ifc-overview-activity" key={item.id}>
                      <span className={"ifc-overview-activity-icon " + item.kind}>
                        {item.kind === "expense" ? <Receipt size={16} /> : <Activity size={16} />}
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.detail || "Farm record"}</small>
                      </div>
                      <time>{timeLabel(item.date)}</time>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ifc-overview-section-empty compact">
                  <Activity size={21} />
                  <strong>No recent activity yet</strong>
                  <span>Crop logs and expense entries will appear here after they are recorded.</span>
                </div>
              )}
            </section>

            <section className="ifc-overview-panel surface-card">
              <div className="ifc-overview-panel-heading">
                <div>
                  <span className="ifc-overview-kicker">COST CONTROL</span>
                  <h2>Expense breakdown</h2>
                  <p>Recorded totals by category, across this farm.</p>
                </div>
                <Coins size={19} />
              </div>
              {expenseCategories.length ? (
                <div className="ifc-overview-expense-list">
                  {expenseCategories.map((item) => (
                    <div className="ifc-overview-expense" key={item.category}>
                      <div><span>{humanize(item.category)}</span><strong>{currencyLabel(item.amount)}</strong></div>
                      <span className="ifc-overview-expense-track"><i style={{ width: item.percent + "%" }} /></span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ifc-overview-section-empty compact">
                  <Receipt size={21} />
                  <strong>No expense totals available</strong>
                  <span>Category totals will appear after expenses are recorded.</span>
                </div>
              )}
              <div className="ifc-overview-cost-summary">
                <span>This month</span>
                <strong>{currencyLabel(snapshot.monthExpenses?.totalAmount)}</strong>
                <small>{snapshot.monthExpenses?.recordCount == null ? "Monthly summary unavailable" : numberLabel(snapshot.monthExpenses.recordCount, 0) + " expense records"}</small>
              </div>
              <button type="button" className="ifc-overview-panel-footer" onClick={() => onNavigate("Expenses")}>
                View all expenses <ArrowRight size={14} />
              </button>
            </section>
          </div>

          <div className="ifc-overview-footnote">
            <CheckCircle2 size={14} />
            <span>Overview values are read from your farm records. Income and profit are not shown because the backend does not yet provide sales or revenue records.</span>
            {snapshot.cultivatedArea > 0 && <small>{numberLabel(snapshot.cultivatedArea)} acres in use</small>}
          </div>
        </>
      ) : (
        <div className="ifc-overview-loading surface-card">
          <CircleAlert size={22} />
          <strong>Overview data is unavailable</strong>
          <span>Retry the request or check that the backend is running.</span>
          <button type="button" className="button-secondary" onClick={() => setRefreshKey((value) => value + 1)}>Retry</button>
        </div>
      )}
    </section>
  );
}

export default OverviewPage;
