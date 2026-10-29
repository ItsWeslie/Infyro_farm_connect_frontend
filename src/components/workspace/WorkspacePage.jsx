import { useState } from "react";
import { Activity, ArrowDownRight, ArrowRight, Bell, CalendarDays, Check, ChevronDown, LayoutDashboard, MoreHorizontal, Plus, Search, Sprout, Tractor, MapPinned, ClipboardList, PackageCheck, SlidersHorizontal, Settings, Wallet, Eye } from "lucide-react";

const workspaceData = {
  Farms: {
    eyebrow: "YOUR LAND, AT A GLANCE",
    title: "Your farms",
    description: "Every growing space, gathered in one place.",
    stats: [
      ["Total farms", "02", "registered spaces"],
      ["Total land", "8.4 ac", "across all farms"],
      ["Active fields", "04", "being cultivated"],
      ["This season", "Kharif", "current cycle"],
    ],
    rows: [
      [
        "Green Valley Farm",
        "Tambaram, Tamil Nadu",
        "5.6 acres",
        "4 fields",
        "Active",
      ],
      [
        "Sunrise Plot",
        "Vandalur, Tamil Nadu",
        "2.8 acres",
        "2 fields",
        "Active",
      ],
    ],
  },
  Fields: {
    eyebrow: "EVERY PATCH HAS POTENTIAL",
    title: "Field directory",
    description: "Understand your land and what is growing in it.",
    stats: [
      ["Total fields", "06", "across your farms"],
      ["Cultivated", "4.9 ac", "currently in use"],
      ["Available", "3.5 ac", "ready to plan"],
      ["Soil checks", "02", "recently recorded"],
    ],
    rows: [
      ["North Field", "Green Valley Farm", "1.2 acres", "Tomato", "Growing"],
      ["Paddy Field A", "Green Valley Farm", "2.5 acres", "Rice", "Growing"],
      [
        "Kitchen Garden",
        "Green Valley Farm",
        "0.4 acres",
        "Spinach",
        "Ready soon",
      ],
      ["East Field", "Sunrise Plot", "0.8 acres", "Chilli", "Growing"],
      ["West Patch", "Sunrise Plot", "1.7 acres", "—", "Available"],
    ],
  },
  "Crop management": {
    eyebrow: "FROM SEED TO HARVEST",
    title: "Crop management",
    description: "Keep every planting on track through the growing season.",
    stats: [
      ["Total plantings", "04", "this season"],
      ["Growing", "02", "actively developing"],
      ["Ready soon", "01", "harvest approaching"],
      ["Planned", "01", "awaiting a start"],
    ],
    rows: [
      ["Tomato", "Arka Rakshak", "North Field", "72%", "Growing"],
      ["Rice", "Ponni", "Paddy Field A", "48%", "Growing"],
      ["Spinach", "Palak Green", "Kitchen Garden", "94%", "Ready soon"],
      ["Chilli", "Guntur Sannam", "East Field", "35%", "Growing"],
    ],
  },
  Activities: {
    eyebrow: "THE WORK BEHIND THE GROWTH",
    title: "Farm activities",
    description: "A clear view of the work happening across your fields.",
    stats: [
      ["Logged this week", "12", "farm activities"],
      ["Completed", "09", "tasks checked off"],
      ["Upcoming", "03", "planned tasks"],
      ["On schedule", "92%", "weekly completion"],
    ],
    rows: [
      [
        "Morning irrigation",
        "North Field · Tomato",
        "Today, 8:30 AM",
        "Ravi Kumar",
        "Completed",
      ],
      [
        "Fertilizer application",
        "Paddy Field A · Rice",
        "Yesterday, 4:15 PM",
        "Ravi Kumar",
        "Completed",
      ],
      [
        "Inspect leaf health",
        "East Field · Chilli",
        "Oct 28, 9:00 AM",
        "Ravi Kumar",
        "Upcoming",
      ],
      [
        "Harvest preparation",
        "Kitchen Garden · Spinach",
        "Oct 30, 7:30 AM",
        "Ravi Kumar",
        "Upcoming",
      ],
      [
        "Weed control",
        "North Field · Tomato",
        "Oct 25, 10:00 AM",
        "Ravi Kumar",
        "Completed",
      ],
    ],
  },
  Expenses: {
    eyebrow: "SPEND WITH CLARITY",
    title: "Farm expenses",
    description: "Track the cost of caring for your farm and plan ahead.",
    stats: [
      ["This month", "₹8,450", "total recorded"],
      ["Last month", "₹9,225", "previous total"],
      ["Biggest category", "Fertilizer", "₹2,600 this month"],
      ["Budget used", "56%", "of ₹15,000 plan"],
    ],
    rows: [
      [
        "Organic fertilizer",
        "FERTILIZER",
        "Paddy Field A",
        "₹2,600",
        "Oct 24, 2026",
      ],
      [
        "Seeds & seedlings",
        "SEEDS_AND_SEEDLINGS",
        "North Field",
        "₹1,850",
        "Oct 20, 2026",
      ],
      [
        "Irrigation supplies",
        "IRRIGATION",
        "Green Valley Farm",
        "₹1,500",
        "Oct 17, 2026",
      ],
      ["Farm labour", "LABOUR", "Multiple fields", "₹1,400", "Oct 14, 2026"],
      [
        "Fuel & transport",
        "FUEL_AND_TRANSPORT",
        "Green Valley Farm",
        "₹1,100",
        "Oct 08, 2026",
      ],
    ],
  },
  "Harvest records": {
    eyebrow: "EVERY HARVEST TELLS A STORY",
    title: "Harvest records",
    description: "Capture your yield and learn from every growing cycle.",
    stats: [
      ["Harvest entries", "08", "records this season"],
      ["Total yield", "426 kg", "recorded to date"],
      ["Best yield", "Rice", "210 kg recorded"],
      ["Recent harvest", "24 Oct", "Spinach · 18 kg"],
    ],
    rows: [
      ["Spinach", "Kitchen Garden", "18 kg", "Oct 24, 2026", "Grade A"],
      ["Tomato", "North Field", "42 kg", "Oct 18, 2026", "Grade A"],
      ["Rice", "Paddy Field A", "210 kg", "Oct 12, 2026", "Grade A"],
      ["Chilli", "East Field", "26 kg", "Oct 06, 2026", "Grade B"],
      ["Tomato", "North Field", "38 kg", "Sep 28, 2026", "Grade A"],
    ],
  },
  Calendar: {
    eyebrow: "MAKE ROOM FOR WHAT MATTERS",
    title: "Season calendar",
    description: "Plan field work, milestones, and harvest days at a glance.",
    stats: [
      ["This month", "08", "scheduled events"],
      ["Upcoming", "03", "next seven days"],
      ["Tasks done", "12", "completed this month"],
      ["Next milestone", "Oct 30", "spinach harvest"],
    ],
    rows: [
      [
        "Oct 27 · Today",
        "Check soil moisture",
        "North Field",
        "Ravi Kumar",
        "Today",
      ],
      [
        "Oct 28 · Tomorrow",
        "Inspect chilli plants",
        "East Field",
        "Ravi Kumar",
        "Planned",
      ],
      [
        "Oct 29 · Thu",
        "Prepare harvest crates",
        "Green Valley Farm",
        "Ravi Kumar",
        "Planned",
      ],
      [
        "Oct 30 · Fri",
        "Spinach harvest",
        "Kitchen Garden",
        "Ravi Kumar",
        "Important",
      ],
      [
        "Nov 02 · Mon",
        "Rice field inspection",
        "Paddy Field A",
        "Ravi Kumar",
        "Planned",
      ],
    ],
  },
  Notifications: {
    eyebrow: "A LITTLE NUDGE AT THE RIGHT TIME",
    title: "Notifications",
    description: "Important reminders and updates for your farm.",
    stats: [
      ["Unread", "03", "need a look"],
      ["This week", "08", "total updates"],
      ["Reminders", "04", "scheduled"],
      ["Completed", "05", "marked as read"],
    ],
    rows: [
      [
        "Harvest coming up",
        "Spinach is almost ready in 3 days.",
        "Today, 9:00 AM",
        "Harvest",
        "Unread",
      ],
      [
        "Irrigation reminder",
        "Check soil moisture in North Field.",
        "Today, 7:30 AM",
        "Reminder",
        "Unread",
      ],
      [
        "Weekly expenses ready",
        "Your farm spending overview is updated.",
        "Yesterday, 6:00 PM",
        "Report",
        "Unread",
      ],
      [
        "Activity logged",
        "Fertilizer application was recorded.",
        "Oct 25, 4:15 PM",
        "Activity",
        "Read",
      ],
    ],
  },
  Settings: {
    eyebrow: "YOUR WORKSPACE, YOUR WAY",
    title: "Settings",
    description: "Manage your profile and personalize your farm workspace.",
    stats: [
      ["Profile", "Complete", "personal details"],
      ["Farm units", "Acres", "measurement preference"],
      ["Notifications", "Enabled", "reminders active"],
      ["Appearance", "Earth", "current theme"],
    ],
    rows: [
      [
        "Personal profile",
        "Name, contact details, and preferences",
        "Ravi Kumar",
        "Edit profile",
        "Available",
      ],
      [
        "Farm preferences",
        "Units, location, and default farm",
        "Acres · Tamil Nadu",
        "Edit preferences",
        "Available",
      ],
      [
        "Notifications",
        "Reminders and activity updates",
        "Enabled",
        "Manage alerts",
        "Available",
      ],
      [
        "Appearance",
        "Theme and visual preferences",
        "Earth-inspired",
        "Customize",
        "Available",
      ],
    ],
  },
};
const pageMeta = {
  Farms: {
    icon: Tractor,
    cta: "Add farm",
    columns: ["FARM NAME", "LOCATION", "LAND AREA", "FIELDS", "STATUS"],
    labels: ["Farm name", "Location", "Land area (acres)"],
  },
  Fields: {
    icon: MapPinned,
    cta: "Add field",
    columns: ["FIELD NAME", "FARM", "AREA", "CURRENT CROP", "STATUS"],
    labels: ["Field name", "Farm name", "Area (acres)"],
  },
  "Crop management": {
    icon: Sprout,
    cta: "Add crop",
    columns: ["CROP", "VARIETY", "FIELD", "PROGRESS", "STATUS"],
    labels: ["Crop name", "Variety", "Field"],
  },
  Activities: {
    icon: ClipboardList,
    cta: "Log activity",
    columns: [
      "ACTIVITY",
      "FIELD / CROP",
      "DATE & TIME",
      "ASSIGNED TO",
      "STATUS",
    ],
    labels: ["Activity name", "Field or crop", "Date"],
  },
  Expenses: {
    icon: Wallet,
    cta: "Add expense",
    columns: ["DESCRIPTION", "CATEGORY", "FARM / FIELD", "AMOUNT", "DATE"],
    labels: ["Expense description", "Category", "Amount (₹)"],
    categories: Object.values(ExpenseCategory),
  },
  "Harvest records": {
    icon: PackageCheck,
    cta: "Record harvest",
    columns: ["CROP", "FIELD", "QUANTITY", "UNIT", "HARVEST DATE"],
    labels: ["Crop name", "Field", "Quantity harvested", "Unit"],
    units: Object.values(HarvestUnit),
  },
  Calendar: {
    icon: CalendarDays,
    cta: "Add event",
    columns: ["DATE", "EVENT", "LOCATION", "ASSIGNED TO", "STATUS"],
    labels: ["Event name", "Date", "Location"],
  },
  Notifications: {
    icon: Bell,
    cta: "Mark all read",
    columns: ["NOTIFICATION", "DETAILS", "RECEIVED", "TYPE", "STATUS"],
    labels: [],
  },
  Settings: {
    icon: Settings,
    cta: "Save preferences",
    columns: ["SETTING", "DESCRIPTION", "CURRENT VALUE", "ACTION", "STATUS"],
    labels: [],
  },
};

export function WorkspacePage({ active, onNavigate, notify, onAdd }) {
  const data = workspaceData[active] || workspaceData.Farms;
  const meta = pageMeta[active] || pageMeta.Farms;
  const Icon = meta.icon;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [layout, setLayout] = useState("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [formValues, setFormValues] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [items, setItems] = useState(data.rows);
  const [readAll, setReadAll] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const filtered = items.filter(
    (row) =>
      row.join(" ").toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" ||
        row[row.length - 1] === filter ||
        row.some((cell) => cell.toLowerCase() === filter.toLowerCase())),
  );
  function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const row =
      active === "Farms"
        ? [
            draft.trim(),
            formValues[1] || "Tambaram, Tamil Nadu",
            formValues[2] || "—",
            formValues[3] || "0",
            formValues[4] || "New",
          ]
        : active === "Fields"
          ? [
              draft.trim(),
              formValues[1] || "Green Valley Farm",
              formValues[2] || "—",
              formValues[3] || "—",
              formValues[4] || "Available",
            ]
          : active === "Crop management"
            ? [
                draft.trim(),
                formValues[1] || "Local variety",
                formValues[2] || "Unassigned field",
                formValues[3] || "0%",
                formValues[4] || "Planned",
              ]
            : active === "Activities"
              ? [
                  draft.trim(),
                  formValues[1] || "Unassigned field",
                  formValues[2] || "Today",
                  formValues[3] || "Ravi Kumar",
                  formValues[4] || "Planned",
                ]
              : active === "Expenses"
                ? [
                    draft.trim(),
                    formValues[1] || "OTHER",
                    formValues[2] || "Green Valley Farm",
                    formValues[3] || "₹0",
                    formValues[4] || "Today",
                  ]
                : active === "Harvest records"
                  ? [
                      draft.trim(),
                      formValues[1] || "Unassigned field",
                      formValues[2] || "0 kg",
                      formValues[3] || "Today",
                      formValues[4] || "Pending",
                    ]
                  : [
                      draft.trim(),
                      formValues[1] || "Today",
                      formValues[2] || "Green Valley Farm",
                      formValues[3] || "Ravi Kumar",
                      formValues[4] || "Planned",
                    ];
    if (editingRow) {
      setItems(items.map((item) => (item === editingRow ? row : item)));
      notify("Demo record updated");
    } else {
      setItems([row, ...items]);
      notify("Added to your demo workspace");
    }
    setDraft("");
    setFormValues({});
    setEditingRow(null);
    setDialogOpen(false);
  }
  function primaryAction() {
    if (active === "Notifications") {
      setReadAll(true);
      notify("All notifications marked as read");
      return;
    }
    if (active === "Settings") {
      notify("Your demo preferences are saved");
      return;
    }
    setDraft("");
    setFormValues({});
    setEditingRow(null);
    setDialogOpen(true);
  }
  const statusOptions = [
    ...new Set(data.rows.map((row) => row[row.length - 1])),
  ].filter((v) =>
    [
      "Growing",
      "Ready soon",
      "Planned",
      "Completed",
      "Upcoming",
      "Unread",
      "Read",
      "Active",
      "Available",
      "Grade A",
      "Grade B",
      "Important",
    ].includes(v),
  );
  return (
    <section className="workspace-page">
      <div className="page-eyebrow">
        <span className="eyebrow-pip" />
        {data.eyebrow}
      </div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon">
          <Icon size={23} />
        </div>
        <div className="workspace-title-copy">
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
        <div className="workspace-title-actions">
          <button
            className="button-secondary desktop-secondary"
            onClick={() => notify("Your demo report is ready to explore")}
          >
            <ArrowDownRight size={15} /> Export report
          </button>
          <button className="button-primary" onClick={primaryAction}>
            {active === "Notifications" ? (
              <Check size={16} />
            ) : active === "Settings" ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}{" "}
            {meta.cta}
          </button>
        </div>
      </div>
      <div className="workspace-stats">
        {data.stats.map((stat, i) => (
          <article className="workspace-stat surface-card" key={stat[0]}>
            <div className="workspace-stat-label">
              {stat[0]}
              <span className={"workspace-stat-icon ws-tone-" + i}>
                <Icon size={15} />
              </span>
            </div>
            <strong>{stat[1]}</strong>
            <small>{stat[2]}</small>
            <span className="workspace-stat-accent" />
          </article>
        ))}
      </div>
      {active === "Calendar" && <CalendarPanel notify={notify} />}
      {active === "Settings" ? (
        <SettingsPanel notify={notify} />
      ) : (
        <div className="workspace-data-card surface-card">
          <div className="workspace-data-heading">
            <div>
              <h2>
                {active === "Notifications"
                  ? "All updates"
                  : active === "Activities"
                    ? "Activity log"
                    : active === "Expenses"
                      ? "Expense ledger"
                      : active === "Harvest records"
                        ? "Harvest history"
                        : active === "Calendar"
                          ? "Upcoming events"
                          : "All " + active.toLowerCase()}
              </h2>
              <p>Explore, search, and manage your farm information.</p>
            </div>
            <div className="view-toggle">
              <button
                className={layout === "table" ? "selected" : ""}
                onClick={() => setLayout("table")}
                aria-label="Table view"
              >
                <ClipboardList size={15} />
              </button>
              <button
                className={layout === "cards" ? "selected" : ""}
                onClick={() => setLayout("cards")}
                aria-label="Card view"
              >
                <LayoutDashboard size={15} />
              </button>
            </div>
          </div>
          <div className="workspace-toolbar">
            <label className="table-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={"Search " + active.toLowerCase() + "..."}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <label className="workspace-filter">
              <SlidersHorizontal size={15} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <span className="result-count">{filtered.length} records</span>
          </div>
          {layout === "table" ? (
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead>
                  <tr>
                    {meta.columns.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={row[0] + i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          {j === row.length - 1 ? (
                            <span className={"status-pill " + statusTone(cell)}>
                              <i />
                              {active === "Notifications" && readAll
                                ? "Read"
                                : cell}
                            </span>
                          ) : j === 0 ? (
                            <strong className="workspace-cell-title">
                              {cell}
                            </strong>
                          ) : (
                            <span
                              className={
                                cell.startsWith("₹") ? "money-cell" : ""
                              }
                            >
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                      <td>
                        <button
                          className="row-action"
                          aria-label={"More actions for " + row[0]}
                          onClick={() => setSelectedRecord(row)}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-state">
                  <Search size={23} />
                  <strong>No matching records</strong>
                  <span>Try changing your search or status filter.</span>
                  <button
                    className="button-secondary"
                    onClick={() => {
                      setQuery("");
                      setFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="workspace-record-grid">
              {filtered.map((row, i) => (
                <article className="workspace-record-card" key={row[0] + i}>
                  <div className="record-card-icon">
                    <Icon size={19} />
                  </div>
                  <span className="record-card-kicker">
                    {active === "Expenses"
                      ? "EXPENSE ENTRY"
                      : active === "Harvest records"
                        ? "HARVEST RECORD"
                        : active === "Notifications"
                          ? "FARM UPDATE"
                          : active === "Calendar"
                            ? "SCHEDULED EVENT"
                            : "FARM RECORD"}
                  </span>
                  <h3>{row[0]}</h3>
                  <p>{row.slice(1, 3).join(" · ")}</p>
                  <div className="record-card-bottom">
                    <span
                      className={
                        "status-pill " + statusTone(row[row.length - 1])
                      }
                    >
                      <i />
                      {row[row.length - 1]}
                    </span>
                    <button
                      className="row-action"
                      onClick={() => setSelectedRecord(row)}
                      aria-label="Open record details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="workspace-data-footer">
            <span>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{items.length}</strong> records
            </span>
            <span>Demo workspace · Sample data</span>
          </div>
        </div>
      )}
      {selectedRecord && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
        >
          <section
            className="dialog-card record-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-detail-title"
          >
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">
                  {active.toUpperCase()} · RECORD DETAIL
                </span>
                <h2 id="record-detail-title">{selectedRecord[0]}</h2>
                <p>
                  Review the information currently available in this demo
                  workspace.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close details"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={19} />
              </button>
            </div>
            <div className="record-detail-grid">
              {meta.columns.map((label, index) => (
                <div className="record-detail-field" key={label}>
                  <span>{label}</span>
                  <strong>
                    {active === "Notifications" && index === 4 && readAll
                      ? "Read"
                      : selectedRecord[index] || "—"}
                  </strong>
                </div>
              ))}
            </div>
            <div className="dialog-note">
              <Sprout size={17} />
              <span>Sample data only — changes are not sent to a backend.</span>
            </div>
            <div className="dialog-actions">
              <button
                className="button-secondary"
                onClick={() => setSelectedRecord(null)}
              >
                Close details
              </button>
              <button
                className="button-primary"
                onClick={() => {
                  setEditingRow(selectedRecord);
                  setFormValues(
                    Object.fromEntries(
                      selectedRecord
                        .slice(1)
                        .map((value, index) => [index + 1, value]),
                    ),
                  );
                  setDraft(selectedRecord[0]);
                  setSelectedRecord(null);
                  setDialogOpen(true);
                }}
              >
                Edit record <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
      {dialogOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDialogOpen(false);
          }}
        >
          <form className="dialog-card" onSubmit={submit}>
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">FARM WORKSPACE</span>
                <h2>{editingRow ? "Edit record" : meta.cta}</h2>
                <p>
                  {editingRow
                    ? "Update the details for this demo record."
                    : "Add a new entry to this demo screen."}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setDialogOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
            <label className="form-label">
              {meta.labels[0] || "Name"}
              <input
                autoFocus
                required
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  "Enter " + (meta.labels[0] || "name").toLowerCase()
                }
              />
            </label>
            {meta.labels.slice(1).map((label, index) => (
              <label className="form-label" key={label}>
                {label}
                {label === "Category" && meta.categories ? (
                  <select
                    className="form-select"
                    value={formValues[index + 1] ?? meta.categories[0]}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [index + 1]: e.target.value,
                      })
                    }
                  >
                    {meta.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                ) : label === "Unit" && meta.units ? (
                  <select
                    className="form-select"
                    value={formValues[index + 1] ?? meta.units[0]}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [index + 1]: e.target.value,
                      })
                    }
                  >
                    {meta.units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={formValues[index + 1] ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [index + 1]: e.target.value,
                      })
                    }
                    placeholder={"Enter " + label.toLowerCase()}
                  />
                )}
              </label>
            ))}
            <div className="dialog-note">
              <Sprout size={17} />
              <span>
                This entry is stored only in the current browser session.
              </span>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary">
                <Plus size={16} />
                Create entry
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function statusTone(status) {
  const s = status.toLowerCase();
  if (["active", "growing", "completed", "read", "grade a"].includes(s))
    return "status-growing";
  if (["ready soon", "important", "unread", "upcoming"].includes(s))
    return "status-ready";
  if (["planned", "available", "pending", "new"].includes(s))
    return "status-planned";
  return "status-planned";
}
