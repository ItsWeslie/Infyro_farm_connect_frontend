import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleAlert, Coins, Receipt } from "lucide-react";
import { overviewApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";

const CATEGORY_COLORS = {
  SEEDS_AND_SEEDLINGS: "#478c68",
  FERTILIZER: "#d4a34e",
  PESTICIDES: "#917abd",
  IRRIGATION: "#54a3ad",
  LABOUR: "#346f4e",
  EQUIPMENT: "#6e91c0",
  FUEL_AND_TRANSPORT: "#d88461",
  LAND_PREPARATION: "#83aa65",
  MACHINERY_REPAIR: "#b5877b",
  UTILITIES: "#a091bf",
  OTHER: "#9a9f62",
};

const RADIUS = 66;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function currencyLabel(value, compact = false) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(amount);
}

function categoryLabel(value) {
  return String(value || "OTHER")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function percentageLabel(value) {
  return value > 0 && value < 0.1 ? "<0.1%" : value.toFixed(1) + "%";
}

export default function OverviewExpenseBreakdown({ onNavigate }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");

    overviewApi.getExpenseBreakdown()
      .then((result) => {
        if (current) setResponse(result);
      })
      .catch((requestError) => {
        if (current) setError(requestError.message || "Expense breakdown could not be loaded.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [retryKey]);

  const breakdown = useMemo(() => {
    const rows = (Array.isArray(response?.expenses) ? response.expenses : [])
      .map((entry) => ({
        key: entry.category,
        label: categoryLabel(entry.category),
        amount: Number(entry.expense),
        color: CATEGORY_COLORS[entry.category] || "#859786",
      }))
      .filter((entry) => entry.key && Number.isFinite(entry.amount) && entry.amount > 0)
      .sort((left, right) => right.amount - left.amount || left.key.localeCompare(right.key));

    const categorySum = rows.reduce((sum, entry) => sum + entry.amount, 0);
    const backendTotal = Number(response?.totalExpense);
    const total = Number.isFinite(backendTotal) && backendTotal > 0 ? backendTotal : categorySum;
    const remaining = rows.slice(5);
    const visible = rows.slice(0, 5);
    if (remaining.length) {
      visible.push({
        key: "GROUPED_REMAINDER",
        label: "Other categories",
        amount: remaining.reduce((sum, entry) => sum + entry.amount, 0),
        color: "#9aa5a3",
        categories: remaining.map((entry) => entry.label),
      });
    }

    // Use the category sum for proportions so the chart closes exactly, even with rounding.
    const entries = visible.map((entry) => ({
      ...entry,
      share: categorySum > 0 ? entry.amount / categorySum : 0,
      percentage: categorySum > 0 ? (entry.amount / categorySum) * 100 : 0,
    }));
    let cumulative = 0;
    const segments = entries.map((entry) => {
      const segment = { ...entry, offset: cumulative };
      cumulative += entry.share;
      return segment;
    });

    return { total, entries: segments };
  }, [response]);

  const activeKey = hoveredKey || selectedKey;
  const active = breakdown.entries.find((entry) => entry.key === activeKey);
  const chooseCategory = (key) => setSelectedKey((current) => current === key ? null : key);

  return (
    <section className="ifc-overview-panel ifc-overview-expense-panel surface-card" aria-labelledby="expense-breakdown-title">
      <div className="ifc-overview-panel-heading">
        <div>
          <span className="ifc-overview-kicker">COST CONTROL</span>
          <h2 id="expense-breakdown-title">Expense breakdown</h2>
          <p>This month · Across all your farms</p>
        </div>
        <Coins size={19} />
      </div>

      {error && (
        <div className="ifc-overview-warning ifc-overview-expense-error" role="alert">
          <CircleAlert size={15} />
          <span>{error}</span>
          <button type="button" className="button-secondary" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
        </div>
      )}

      {loading && !response ? (
        <div className="ifc-overview-expense-loading" role="status" aria-label="Loading expense breakdown">
          <SkeletonBlock rows={3} />
        </div>
      ) : response && breakdown.entries.length > 0 ? (
        <div className="ifc-overview-donut-layout">
          <div className="ifc-overview-donut-chart">
            <svg viewBox="0 0 200 200" role="img" aria-label={`Expense breakdown for this month. Total ${currencyLabel(breakdown.total)}.`}>
              <circle cx="100" cy="100" r={RADIUS} className="ifc-overview-donut-track" fill="none" strokeWidth="21" />
              {breakdown.entries.map((entry) => (
                <circle
                  key={entry.key}
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke={entry.color}
                  strokeWidth={activeKey === entry.key ? 25 : 21}
                  strokeDasharray={`${entry.share * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-entry.offset * CIRCUMFERENCE}
                  transform="rotate(-90 100 100)"
                  className={"ifc-overview-donut-segment" + (activeKey && activeKey !== entry.key ? " is-muted" : "")}
                  onMouseEnter={() => setHoveredKey(entry.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => chooseCategory(entry.key)}
                >
                  <title>{`${entry.label}: ${currencyLabel(entry.amount)} (${percentageLabel(entry.percentage)})`}</title>
                </circle>
              ))}
              <text className="ifc-overview-donut-caption" x="100" y="88" textAnchor="middle">
                {active ? active.label : "TOTAL SPENT"}
              </text>
              <text className="ifc-overview-donut-total" x="100" y="111" textAnchor="middle">
                {currencyLabel(active ? active.amount : breakdown.total, true)}
              </text>
              <text className="ifc-overview-donut-caption" x="100" y="127" textAnchor="middle">
                {active ? percentageLabel(active.percentage) : "THIS MONTH"}
              </text>
            </svg>
            <span className="ifc-overview-donut-exact-total">
              Total: {currencyLabel(breakdown.total)}
            </span>
          </div>

          <div className="ifc-overview-donut-legend" aria-label="Expense categories">
            {breakdown.entries.map((entry) => (
              <button
                type="button"
                key={entry.key}
                className={"ifc-overview-donut-legend-item" + (activeKey === entry.key ? " is-active" : "") + (activeKey && activeKey !== entry.key ? " is-muted" : "")}
                onMouseEnter={() => setHoveredKey(entry.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(entry.key)}
                onBlur={() => setHoveredKey(null)}
                onClick={() => chooseCategory(entry.key)}
                aria-pressed={selectedKey === entry.key}
                title={entry.categories ? `Includes: ${entry.categories.join(", ")}` : entry.label}
              >
                <span className="ifc-overview-donut-swatch" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                <span className="ifc-overview-donut-legend-copy">
                  <strong>{entry.label}</strong>
                  <small>{currencyLabel(entry.amount)}</small>
                </span>
                <span className="ifc-overview-donut-legend-percent">{percentageLabel(entry.percentage)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : response ? (
        <div className="ifc-overview-section-empty compact">
          <Receipt size={21} />
          <strong>No expenses recorded this month</strong>
          <span>Category totals from your farms will appear here when expenses are added.</span>
        </div>
      ) : null}

      <button type="button" className="ifc-overview-panel-footer" onClick={() => onNavigate("Expenses")}>
        View all expenses <ArrowRight size={14} />
      </button>
    </section>
  );
}
