import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Coins,
  Leaf,
  MapPinned,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Sprout,
  Wheat,
} from "lucide-react";
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

function OverviewPage({ selectedFarm, farmCount = 0, onNavigate, onAdd }) {
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
      setLoading(false);
    });

    return () => {
      current = false;
    };
  }, [farmId, selectedFarm?.name, refreshKey]);

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
      <div className="ifc-overview-heading">
        <div>
          <span className="page-eyebrow"><i className="eyebrow-pip" /> LIVE FARM OVERVIEW</span>
          <h1>Good day on the farm</h1>
          <p>
            {selectedFarm.name} · {farmCount} {farmCount === 1 ? "farm" : "farms"} on your account
            {snapshot?.loadedAt ? " · Updated " + snapshot.loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
          </p>
        </div>
        <div className="ifc-overview-actions">
          <button type="button" className="button-secondary" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
            <RefreshCw size={14} className={loading ? "ifc-overview-spinning" : ""} /> Refresh
          </button>
          <button type="button" className="button-primary" onClick={onAdd}>
            <Plus size={15} /> Add crop
          </button>
        </div>
      </div>

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
        <div className="ifc-overview-loading surface-card" role="status">
          <RefreshCw size={22} className="ifc-overview-spinning" />
          <strong>Loading your farm records…</strong>
          <span>Gathering fields, plantings, expenses, and upcoming milestones.</span>
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
