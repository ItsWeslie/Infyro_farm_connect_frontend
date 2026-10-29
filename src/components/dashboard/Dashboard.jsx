import { useAuth } from "../../context/AuthContext";
import { Plus, Flower2, ArrowRight, Sun, Sprout, MapPinned, Wheat, Wallet, TrendingUp, Search, X, SlidersHorizontal, MoreHorizontal, Clock3, ArrowUpRight, Droplets, CheckCheck } from "lucide-react";

const activities = [
  {
    icon: Droplets,
    tone: "blue",
    title: "Morning irrigation completed",
    detail: "North Field · Tomato",
    time: "Today, 8:30 AM",
  },
  {
    icon: Sprout,
    tone: "green",
    title: "Fertilizer applied",
    detail: "Paddy Field A · Rice",
    time: "Yesterday, 4:15 PM",
  },
  {
    icon: CheckCheck,
    tone: "gold",
    title: "Harvest record added",
    detail: "Kitchen Garden · Spinach",
    time: "Oct 24, 11:20 AM",
  },
];
export function Dashboard({
  filteredCrops,
  cropCount,
  search,
  setSearch,
  onAdd,
  onNavigate,
  notify,
  summary,
  selectedFarm,
}) {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(" ")[0] : "Ravi";

  // If summary from backend is available, use live values
  const totalPlantingsVal = summary?.totalPlantings != null ? String(summary.totalPlantings).padStart(2, "0") : String(cropCount).padStart(2, "0");
  const totalFieldsVal = summary?.totalFields != null ? String(summary.totalFields).padStart(2, "0") : "04";
  const harvestRecordsVal = summary?.harvestRecordCount != null ? String(summary.harvestRecordCount).padStart(2, "0") : "03";
  const totalExpensesVal = summary?.totalExpenses != null ? `₹${summary.totalExpenses.toLocaleString()}` : "₹8,450";

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="page-eyebrow">
            <span className="eyebrow-pip" />
            TODAY · {selectedFarm?.name ? selectedFarm.name.toUpperCase() : "GREEN VALLEY FARM"}
          </div>
          <h1>
            Good day, {userName} <span className="wave">✳</span>
          </h1>
          <p>Here’s what’s happening on your farm today.</p>
        </div>
        <button className="button-primary" onClick={onAdd}>
          <Plus size={17} /> Add new crop
        </button>
      </section>
      <section className="hero-banner">
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
            className="hero-button"
            onClick={() => onNavigate("Crop management")}
          >
            Explore your crops <ArrowRight size={15} />
          </button>
          <div className="hero-note">
            <span>
              <Sun size={14} />
            </span>{" "}
            A beautiful day to grow something good
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of growing plants">
          <svg
            className="hero-art-vector"
            viewBox="0 0 520 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="hillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbe8ca" />
                <stop offset="100%" stopColor="#c2d8a5" />
              </linearGradient>
              <linearGradient id="hillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ec08d" />
                <stop offset="100%" stopColor="#7ba569" />
              </linearGradient>
            </defs>

            {/* Sun with warm glow */}
            <circle cx="370" cy="56" r="44" fill="url(#sunGlow)" />
            <circle cx="370" cy="56" r="54" fill="#fef3c7" opacity="0.35" />

            {/* Clouds */}
            <g opacity="0.8" fill="#ffffff">
              <path d="M210 50 a12 12 0 0 1 20 -4 a16 16 0 0 1 28 2 a10 10 0 0 1 12 10 l-60 0 a8 8 0 0 1 0 -8 z" />
              <path d="M430 78 a9 9 0 0 1 15 -3 a12 12 0 0 1 21 2 a8 8 0 0 1 9 8 l-45 0 a6 6 0 0 1 0 -7 z" opacity="0.65" />
            </g>

            {/* Rolling background hill */}
            <path
              d="M120 230 C200 130 340 105 520 160 L520 230 Z"
              fill="url(#hillBackGrad)"
            />

            {/* Rolling foreground hill */}
            <path
              d="M170 230 C290 145 420 155 520 185 L520 230 Z"
              fill="url(#hillFrontGrad)"
            />

            {/* Crops / Sprouting Plants Vector Art */}
            {/* Plant 1 (Left tall sprout) */}
            <g transform="translate(265, 125)">
              <path d="M12 90 Q10 40 4 0" stroke="#3d6339" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 55 C-8 45 -12 25 2 20 C10 32 8 48 6 55 Z" fill="#58854d" />
              <path d="M8 35 C20 26 25 8 12 5 C4 18 6 30 8 35 Z" fill="#6c9b5f" />
              <path d="M4 12 C-4 2 -2 -10 6 -8 C10 -2 7 8 4 12 Z" fill="#7eae6f" />
            </g>

            {/* Plant 2 (Middle flourishing sprout) */}
            <g transform="translate(325, 140)">
              <path d="M10 80 Q14 35 18 0" stroke="#365832" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M13 50 C28 42 32 24 20 18 C12 28 12 44 13 50 Z" fill="#507c46" />
              <path d="M11 32 C-2 25 -6 9 6 6 C13 16 12 28 11 32 Z" fill="#66945a" />
              <path d="M17 12 C28 2 28 -12 18 -10 C12 -2 15 8 17 12 Z" fill="#79a86b" />
            </g>

            {/* Plant 3 (Right young sprout) */}
            <g transform="translate(385, 155)">
              <path d="M8 70 Q5 35 0 5" stroke="#3d6339" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M5 45 C-6 38 -9 22 2 18 C8 26 6 39 5 45 Z" fill="#58854d" />
              <path d="M4 25 C14 18 17 4 7 2 C1 11 3 20 4 25 Z" fill="#6ca061" />
            </g>

            {/* Blooming Flower on the hill */}
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
      <section className="stats-grid">
        <StatCard
          label="Total crops"
          value={totalPlantingsVal}
          suffix="plantings"
          icon={Sprout}
          tone="sage"
          trend="+2 new"
          foot="this season"
          visual="bars"
        />
        <StatCard
          label="Active fields"
          value={totalFieldsVal}
          suffix="fields"
          icon={MapPinned}
          tone="blue"
          trend={summary?.totalFields ? `${summary.totalFields} registered` : "4.9 acres"}
          foot="under cultivation"
          visual="fields"
        />
        <StatCard
          label="Harvest records"
          value={harvestRecordsVal}
          suffix="records"
          icon={Wheat}
          tone="amber"
          trend="Yield logged"
          foot="across plots"
          visual="calendar"
        />
        <StatCard
          label="Total expenses"
          value={totalExpensesVal}
          suffix=""
          icon={Wallet}
          tone="lilac"
          trend="Farm ledger"
          foot="current total"
          visual="line"
        />
      </section>
      <section className="insights-strip surface-card">
        <div className="insights-copy">
          <span className="section-kicker">
            <TrendingUp size={13} /> SEASON INSIGHTS
          </span>
          <h2>Steady growth, thoughtful planning.</h2>
          <p>
            A quick look at your farm’s sample activity and spending patterns.
          </p>
          <button
            className="button-link"
            onClick={() => onNavigate("Expenses")}
          >
            Explore farm expenses <ArrowRight size={14} />
          </button>
        </div>
        <div className="insight-chart">
          <div className="chart-legend">
            <span>
              <i className="legend-green" />
              Income
            </span>
            <span>
              <i className="legend-gold" />
              Expenses
            </span>
            <small>Last 6 months</small>
          </div>
          <div
            className="chart-bars"
            aria-label="Illustrative six-month income and expenses comparison"
          >
            {[
              ["May", 58, 34],
              ["Jun", 72, 42],
              ["Jul", 64, 49],
              ["Aug", 86, 54],
              ["Sep", 77, 47],
              ["Oct", 94, 56],
            ].map(([month, income, expense]) => (
              <div className="chart-month" key={month}>
                <div className="chart-bar-pair">
                  <span
                    className="chart-bar income-bar"
                    style={{ height: income + "%" }}
                  />
                  <span
                    className="chart-bar expense-bar"
                    style={{ height: expense + "%" }}
                  />
                </div>
                <small>{month}</small>
              </div>
            ))}
          </div>
          <p className="chart-disclaimer">
            Illustrative demo values · not financial records
          </p>
        </div>
      </section>
      <section className="dashboard-grid">
        <div className="surface-card crop-card">
          <div className="section-heading">
            <div>
              <h2>Your growing crops</h2>
              <p>A little progress goes a long way.</p>
            </div>
            <button
              className="button-link"
              onClick={() => onNavigate("Crop management")}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-tools">
            <label className="table-search">
              <Search size={15} />
              <input
                placeholder="Search crops or fields..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button aria-label="Clear search" onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <button
              className="filter-button"
              onClick={() => notify("All crop statuses are currently shown")}
            >
              <SlidersHorizontal size={15} />
              Filter
            </button>
          </div>
          <div className="crop-table-wrap">
            <table className="crop-table">
              <thead>
                <tr>
                  <th>CROP</th>
                  <th>FIELD</th>
                  <th>PROGRESS</th>
                  <th>STATUS</th>
                  <th>HARVEST</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.slice(0, 4).map((c) => (
                  <tr key={c.name}>
                    <td>
                      <div className="crop-identity">
                        <span className={"crop-emoji " + c.tone}>{c.icon}</span>
                        <span>
                          <strong>{c.name}</strong>
                          <small>{c.variety}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong className="field-name">{c.field}</strong>
                      <small className="field-area">{c.area}</small>
                    </td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-track">
                          <span style={{ width: c.progress + "%" }} />
                        </div>
                        <small>{c.progress}%</small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          "status-pill " +
                          (c.status === "Ready soon"
                            ? "status-ready"
                            : c.status === "Planned"
                              ? "status-planned"
                              : "status-growing")
                        }
                      >
                        <i />
                        {c.status}
                      </span>
                    </td>
                    <td className="harvest-date">{c.harvest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCrops.length === 0 && (
              <div className="empty-state">
                <Sprout size={22} />
                <strong>No crops found</strong>
                <span>Try another crop or field name.</span>
              </div>
            )}
          </div>
          <div className="table-footer">
            <span>
              Showing <strong>{Math.min(filteredCrops.length, 4)}</strong> of{" "}
              <strong>{filteredCrops.length}</strong> crops
            </span>
            <button onClick={() => onNavigate("Crop management")}>
              Open crop directory <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="right-column">
          <div className="surface-card activity-card">
            <div className="section-heading">
              <div>
                <h2>Recent activity</h2>
                <p>The latest from your fields.</p>
              </div>
              <button
                className="icon-button subtle-icon"
                aria-label="Activity options"
                onClick={() => notify("Activity options are coming soon")}
              >
                <MoreHorizontal size={19} />
              </button>
            </div>
            <div className="activity-list">
              {activities.map((a) => {
                const Icon = a.icon;
                return (
                  <div className="activity-item" key={a.title}>
                    <span className={"activity-icon " + a.tone}>
                      <Icon size={16} />
                    </span>
                    <div className="activity-copy">
                      <strong>{a.title}</strong>
                      <p>{a.detail}</p>
                      <small>
                        <Clock3 size={11} />
                        {a.time}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="activity-link"
              onClick={() => onNavigate("Activities")}
            >
              View activity log <ArrowRight size={14} />
            </button>
          </div>
          <div className="field-note">
            <div className="field-note-top">
              <span>
                <Flower2 size={13} /> FIELD NOTE
              </span>
              <span>NO. 024</span>
            </div>
            <div className="field-note-illustration" aria-hidden="true">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Soil/drop badge */}
                <path
                  d="M24 8 C24 8 12 24 12 32 C12 38.6 17.4 44 24 44 C30.6 44 36 38.6 36 32 C36 24 24 8 24 8 Z"
                  fill="#7ea16b"
                  opacity="0.35"
                />
                <path
                  d="M24 13 C24 13 15 26 15 32 C15 37 19 41 24 41 C29 41 33 37 33 32 C33 26 24 13 24 13 Z"
                  fill="#5d8851"
                  opacity="0.6"
                />
                {/* Sprouting leaf with clean veins */}
                <path
                  d="M24 38 C28 28 39 16 54 14 C52 28 42 41 26 42"
                  fill="#477340"
                  opacity="0.8"
                />
                <path
                  d="M24 38 Q36 27 54 14"
                  stroke="#c5dfb5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M34 29 Q39 24 42 21"
                  stroke="#c5dfb5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M30 33 Q34 33 38 30"
                  stroke="#c5dfb5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Morning dew drop */}
                <circle cx="46" cy="18" r="2.5" fill="#fef3c7" opacity="0.9" />
              </svg>
            </div>
            <h3>
              A little care goes
              <br />a long way.
            </h3>
            <p>
              Check soil moisture before watering. Your crops — and your water
              bill — will thank you.
            </p>
            <button onClick={() => notify("Tip saved to your field notes")}>
              Save this tip <ArrowUpRight size={14} />
            </button>
            <Flower2 className="note-decoration" size={64} />
          </div>
        </div>
      </section>
    </>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
  trend,
  foot,
  visual,
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={"stat-icon " + tone}>
          <Icon size={17} />
        </span>
      </div>
      <div className="stat-value">
        {value}
        <small>{suffix}</small>
      </div>
      <div className="stat-foot">
        <span className={visual === "line" ? "positive-trend" : "trend-tag"}>
          {trend}
        </span>
        <span>{foot}</span>
      </div>
      <div className={"stat-visual " + visual}>
        {visual === "bars" ? (
          Array.from({ length: 12 }, (_, i) => <i key={i} />)
        ) : visual === "fields" ? (
          Array.from({ length: 4 }, (_, i) => <i key={i} />)
        ) : visual === "calendar" ? (
          <>
            <b>
              30<small>OCT</small>
            </b>
            <b>
              02<small>NOV</small>
            </b>
            <b>
              04<small>NOV</small>
            </b>
          </>
        ) : (
          <svg viewBox="0 0 120 32" preserveAspectRatio="none">
            <path
              d="M1 25 C14 24 15 10 28 16 S45 27 58 17 S73 19 83 9 S102 17 119 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </article>
  );
}
