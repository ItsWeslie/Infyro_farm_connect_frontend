import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Coins,
  Leaf,
  Plus,
  RefreshCw,
  Search,
  Sprout,
  Ban,
  X,
} from "lucide-react";
import {
  cropPlantingApi,
  expenseApi,
  fieldApi,
  harvestApi,
} from "../api/client";
import { ExpenseCategory, HarvestUnit } from "../types/enums";

const CATEGORIES = Object.values(ExpenseCategory);
const UNITS = Object.values(HarvestUnit);

const EMPTY_EXPENSE = {
  amount: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  category: ExpenseCategory.OTHER,
  description: "",
  cropPlantingId: "",
};

const EMPTY_HARVEST = {
  harvestDate: new Date().toISOString().slice(0, 10),
  quantity: "",
  unit: HarvestUnit.KILOGRAM,
  notes: "",
};

function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function humanize(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function hasTooManyFractionDigits(value, maximum) {
  const fraction = String(value ?? "").trim().split(".")[1] || "";
  return fraction.length > maximum;
}

function amountLabel(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function quantityLabel(value) {
  const quantity = Number(value);
  return Number.isFinite(quantity)
    ? quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : "—";
}

function Stat({ label, value, detail, icon: Icon }) {
  return (
    <article className="workspace-stat surface-card">
      <div className="workspace-stat-label">
        {label}
        <span className="workspace-stat-icon"><Icon size={15} /></span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
      <span className="workspace-stat-accent" />
    </article>
  );
}

function RecordStatus({ voided }) {
  return (
    <span className={"status-pill " + (voided ? "status-planned" : "status-growing")}>
      <i />{voided ? "Voided" : "Active"}
    </span>
  );
}

function plantingLabel(planting, fieldById) {
  const field = fieldById.get(String(planting.fieldId));
  return [
    planting.cropTypeName || "Crop",
    field?.fieldName || "Field",
    planting.plantedOn ? dateLabel(planting.plantedOn) : "",
  ].filter(Boolean).join(" · ");
}

function ExpensePage({
  farmId,
  farmName,
  farms,
  selectedFarm,
  setSelectedFarm,
  notify,
}) {
  const [fields, setFields] = useState([]);
  const [plantings, setPlantings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_EXPENSE);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [voidingId, setVoidingId] = useState(null);

  useEffect(() => {
    let current = true;
    if (!farmId) {
      setFields([]);
      setPlantings([]);
      setExpenses([]);
      setLoading(false);
      setPageError("");
      return undefined;
    }

    setLoading(true);
    setPageError("");
    Promise.all([
      fieldApi.getByFarm(farmId),
      cropPlantingApi.getAll(),
      expenseApi.getByFarm(farmId),
    ])
      .then(([fieldResponse, plantingResponse, expenseResponse]) => {
        if (!current) return;
        setFields(toList(fieldResponse));
        setPlantings(toList(plantingResponse));
        setExpenses(toList(expenseResponse));
      })
      .catch((error) => {
        if (!current) return;
        setFields([]);
        setPlantings([]);
        setExpenses([]);
        setPageError(error.message || "Unable to load expense records.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => { current = false; };
  }, [farmId, reloadKey]);

  const fieldById = useMemo(
    () => new Map(fields.map((field) => [String(field.id), field])),
    [fields],
  );
  const farmPlantings = useMemo(
    () => plantings.filter((planting) => fieldById.has(String(planting.fieldId))),
    [plantings, fieldById],
  );
  const plantingById = useMemo(
    () => new Map(farmPlantings.map((planting) => [String(planting.id), planting])),
    [farmPlantings],
  );

  const activeExpenses = expenses.filter((expense) => !expense.voided);
  const totalActive = activeExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const filteredExpenses = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const planting = plantingById.get(String(expense.cropPlantingId));
      const matchesSearch = [
        expense.description,
        expense.category,
        planting?.cropTypeName,
        fieldById.get(String(planting?.fieldId))?.fieldName,
        expense.amount,
        expense.expenseDate,
      ].join(" ").toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "ACTIVE" && !expense.voided)
        || (statusFilter === "VOIDED" && expense.voided);
      const matchesCategory = categoryFilter === "ALL" || expense.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, plantingById, fieldById, search, statusFilter, categoryFilter]);

  function refresh() {
    setReloadKey((value) => value + 1);
  }

  function openCreate() {
    setForm({
      ...EMPTY_EXPENSE,
      expenseDate: todayIso(),
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setFormError("");
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 0.01 || amount >= 1_000_000_000_000) {
      setFormError("Enter an amount of at least 0.01 with no more than 12 integer digits.");
      return;
    }
    if (hasTooManyFractionDigits(form.amount, 2)) {
      setFormError("Amount can have at most two decimal places.");
      return;
    }
    if (!form.expenseDate || form.expenseDate > todayIso()) {
      setFormError("Expense date cannot be in the future.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Enter a description for this expense.");
      return;
    }
    const cropPlantingId = form.cropPlantingId ? Number(form.cropPlantingId) : null;
    if (cropPlantingId && !plantingById.has(String(cropPlantingId))) {
      setFormError("Choose a planting that belongs to the selected farm.");
      return;
    }

    setSaving(true);
    try {
      await expenseApi.create(farmId, {
        cropPlantingId,
        amount,
        expenseDate: form.expenseDate,
        category: form.category,
        description: form.description.trim(),
      });
      setDialogOpen(false);
      setForm(EMPTY_EXPENSE);
      refresh();
      notify("Expense saved to " + farmName);
    } catch (error) {
      setFormError(error.message || "Unable to save this expense.");
    } finally {
      setSaving(false);
    }
  }

  async function voidExpense(expense) {
    if (expense.voided) return;
    if (!window.confirm("Void this expense? It will remain in the audit history and will no longer count toward active totals.")) return;
    setVoidingId(expense.id);
    setPageError("");
    try {
      await expenseApi.void(farmId, expense.id);
      refresh();
      notify("Expense voided; the audit record was retained.");
    } catch (error) {
      setPageError(error.message || "Unable to void this expense.");
    } finally {
      setVoidingId(null);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> FARM FINANCES</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon"><Coins size={23} /></div>
        <div className="workspace-title-copy">
          <h1>Farm expenses</h1>
          <p>Record farm spending and keep a traceable history of every entry.</p>
        </div>
        <div className="workspace-title-actions expense4-actions">
          {farms.length > 1 && (
            <label className="ff-farm-select">
              <span>Farm</span>
              <select value={selectedFarm.id} onChange={(event) => {
                const next = farms.find((farm) => String(farm.id) === event.target.value);
                if (next) setSelectedFarm(next);
              }}>
                {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
          )}
          <button className="button-secondary expense4-refresh" type="button" onClick={refresh} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="button-primary" type="button" onClick={openCreate}>
            <Plus size={15} /> Add expense
          </button>
        </div>
      </div>

      <div className="workspace-stats">
        <Stat label="Active expenses" value={activeExpenses.length} detail="not voided" icon={ClipboardList} />
        <Stat label="Active spend" value={amountLabel(totalActive)} detail="excludes voided entries" icon={Coins} />
        <Stat label="Voided entries" value={expenses.filter((item) => item.voided).length} detail="retained for audit" icon={CheckCircle2} />
        <Stat label="Crop-linked" value={expenses.filter((item) => !item.voided && item.cropPlantingId).length} detail="active expenses linked to plantings" icon={Leaf} />
      </div>

      <div className="workspace-data-card surface-card expense4-data-card">
        <div className="workspace-data-heading">
          <div>
            <h2>Expense ledger · {farmName}</h2>
            <p>Only expense records returned for this farm are shown.</p>
          </div>
        </div>
        <div className="workspace-toolbar expense4-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses..." />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
          </label>
          <label className="workspace-filter">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ACTIVE">Active entries</option>
              <option value="VOIDED">Voided entries</option>
              <option value="ALL">All entries</option>
            </select>
          </label>
          <label className="workspace-filter">
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="ALL">All categories</option>
              {CATEGORIES.map((category) => <option key={category} value={category}>{humanize(category)}</option>)}
            </select>
          </label>
          <span className="result-count">{filteredExpenses.length} records</span>
        </div>

        {pageError && <div className="ff-error" role="alert">{pageError}</div>}
        {loading ? (
          <div className="empty-state"><RefreshCw size={20} /><strong>Loading expense ledger…</strong></div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <Coins size={23} />
            <strong>{expenses.length === 0 ? "No expenses recorded" : "No matching expenses"}</strong>
            <span>{expenses.length === 0 ? "Add your first farm expense to start tracking costs." : "Try another search or filter."}</span>
            {expenses.length === 0 && <button type="button" className="button-primary" onClick={openCreate}><Plus size={14} /> Add expense</button>}
          </div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table expense4-table">
              <thead><tr><th>DATE</th><th>DESCRIPTION</th><th>CATEGORY</th><th>PLANTING</th><th>AMOUNT</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const planting = plantingById.get(String(expense.cropPlantingId));
                  const field = fieldById.get(String(planting?.fieldId));
                  return (
                    <tr key={expense.id} className={expense.voided ? "expense4-voided" : ""}>
                      <td>{dateLabel(expense.expenseDate)}</td>
                      <td><strong className="workspace-cell-title">{expense.description}</strong>{expense.voided && <small className="expense4-subtext">{expense.voidReason || "Voided entry"}</small>}</td>
                      <td>{humanize(expense.category)}</td>
                      <td>{planting ? <>{planting.cropTypeName}<small className="expense4-subtext">{field?.fieldName || "Field"}</small></> : "Farm-wide"}</td>
                      <td className="expense4-amount">{amountLabel(expense.amount)}</td>
                      <td><RecordStatus voided={expense.voided} /></td>
                      <td>
                        <button type="button" className="ff-icon-button ff-danger" aria-label={"Void expense " + expense.id} disabled={expense.voided || voidingId === expense.id} onClick={() => voidExpense(expense)}>
                          <Ban size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="workspace-data-footer">
          <span>Showing <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> records</span>
          <span>{farmName} · backend expense ledger</span>
        </div>
      </div>

      {dialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialogOpen(false);
        }}>
          <form className="dialog-card expense4-dialog" onSubmit={submit}>
            <div className="dialog-heading">
              <div><span className="section-kicker">EXPENSE ENTRY</span><h2>Add an expense</h2><p>Record a cost against {farmName}.</p></div>
              <button type="button" className="icon-button" aria-label="Close dialog" disabled={saving} onClick={() => setDialogOpen(false)}><X size={19} /></button>
            </div>
            {formError && <div className="ff-error" role="alert">{formError}</div>}
            <label className="form-label">Description<input required maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="e.g. Organic fertilizer purchase" /></label>
            <div className="expense4-form-grid">
              <label className="form-label">Amount (₹)<input type="number" required min="0.01" max="999999999999.99" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="e.g. 1850.00" /></label>
              <label className="form-label">Expense date<input type="date" required max={todayIso()} value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} /></label>
            </div>
            <label className="form-label">Category<select className="form-select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{CATEGORIES.map((category) => <option key={category} value={category}>{humanize(category)}</option>)}</select></label>
            <label className="form-label">Related planting (optional)<select className="form-select" value={form.cropPlantingId} onChange={(event) => setForm({ ...form, cropPlantingId: event.target.value })}><option value="">Farm-wide expense</option>{farmPlantings.map((planting) => <option key={planting.id} value={planting.id}>{plantingLabel(planting, fieldById)}</option>)}</select></label>
            <div className="dialog-note"><Leaf size={16} /><span>Linking a planting is optional. The backend keeps this expense attached to the selected farm either way.</span></div>
            <div className="dialog-note"><CheckCircle2 size={16} /><span>The backend does not support editing expense entries. Void an incorrect entry and create a replacement; the audit record is retained.</span></div>
            <div className="dialog-actions">
              <button type="button" className="button-secondary" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</button>
              <button type="submit" className="button-primary" disabled={saving}><Plus size={15} /> {saving ? "Saving…" : "Save expense"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function HarvestPage({
  farmId,
  farmName,
  farms,
  selectedFarm,
  setSelectedFarm,
  onNavigate,
  notify,
}) {
  const [fields, setFields] = useState([]);
  const [plantings, setPlantings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedPlantingId, setSelectedPlantingId] = useState("");
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_HARVEST);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [voidingId, setVoidingId] = useState(null);

  useEffect(() => {
    let current = true;
    if (!farmId) {
      setFields([]);
      setPlantings([]);
      setLoading(false);
      setPageError("");
      return undefined;
    }

    setLoading(true);
    setPageError("");
    Promise.all([
      fieldApi.getByFarm(farmId),
      cropPlantingApi.getAll(),
    ])
      .then(([fieldResponse, plantingResponse]) => {
        if (!current) return;
        setFields(toList(fieldResponse));
        setPlantings(toList(plantingResponse));
      })
      .catch((error) => {
        if (!current) return;
        setFields([]);
        setPlantings([]);
        setPageError(error.message || "Unable to load plantings for harvest.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => { current = false; };
  }, [farmId, reloadKey]);

  const fieldById = useMemo(
    () => new Map(fields.map((field) => [String(field.id), field])),
    [fields],
  );
  const farmPlantings = useMemo(
    () => plantings.filter((planting) => fieldById.has(String(planting.fieldId))),
    [plantings, fieldById],
  );
  const selectedPlanting = farmPlantings.find((planting) => String(planting.id) === String(selectedPlantingId)) || null;
  const canRecordHarvest = selectedPlanting && ["ACTIVE", "HARVESTING"].includes(selectedPlanting.status);
  const activeRecords = records.filter((record) => !record.voided);
  const quantityByUnit = useMemo(() => {
    const totals = new Map();
    activeRecords.forEach((record) => {
      totals.set(record.unit, (totals.get(record.unit) || 0) + Number(record.quantity || 0));
    });
    return Array.from(totals.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [activeRecords]);

  useEffect(() => {
    setSelectedPlantingId((current) => (
      farmPlantings.some((planting) => String(planting.id) === String(current))
        ? current
        : String(farmPlantings[0]?.id || "")
    ));
  }, [farmPlantings]);

  useEffect(() => {
    let current = true;
    if (!selectedPlanting) {
      setRecords([]);
      setRecordsLoading(false);
      setRecordsError("");
      return undefined;
    }
    setRecordsLoading(true);
    setRecordsError("");
    harvestApi.getByPlanting(selectedPlanting.id)
      .then((response) => {
        if (current) setRecords(toList(response));
      })
      .catch((error) => {
        if (!current) return;
        setRecords([]);
        setRecordsError(error.message || "Unable to load harvest records.");
      })
      .finally(() => {
        if (current) setRecordsLoading(false);
      });
    return () => { current = false; };
  }, [selectedPlanting?.id, reloadKey]);

  const filteredRecords = records.filter((record) => {
    const normalized = search.toLowerCase();
    const matchesSearch = [
      record.notes,
      record.quantity,
      record.unit,
      record.harvestDate,
      record.statusLabel,
    ].join(" ").toLowerCase().includes(normalized);
    const matchesStatus = statusFilter === "ALL"
      || (statusFilter === "ACTIVE" && !record.voided)
      || (statusFilter === "VOIDED" && record.voided);
    return matchesSearch && matchesStatus;
  });

  function refresh() {
    setReloadKey((value) => value + 1);
  }

  function openCreate() {
    setForm({ ...EMPTY_HARVEST, harvestDate: todayIso() });
    setFormError("");
    setDialogOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setFormError("");
    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity < 0.001 || quantity >= 100_000_000_000) {
      setFormError("Enter a quantity of at least 0.001 with no more than 11 integer digits.");
      return;
    }
    if (hasTooManyFractionDigits(form.quantity, 3)) {
      setFormError("Quantity can have at most three decimal places.");
      return;
    }
    if (!form.harvestDate || form.harvestDate > todayIso()) {
      setFormError("Harvest date cannot be in the future.");
      return;
    }
    if (selectedPlanting?.plantedOn && form.harvestDate < selectedPlanting.plantedOn) {
      setFormError("Harvest date cannot be before the planting date.");
      return;
    }
    if (!canRecordHarvest) {
      setFormError("Harvest records can only be added to active or harvesting plantings.");
      return;
    }

    setSaving(true);
    try {
      await harvestApi.create(selectedPlanting.id, {
        harvestDate: form.harvestDate,
        quantity,
        unit: form.unit,
        notes: form.notes.trim() || null,
      });
      setDialogOpen(false);
      setForm(EMPTY_HARVEST);
      refresh();
      notify("Harvest record saved");
    } catch (error) {
      setFormError(error.message || "Unable to save this harvest record.");
    } finally {
      setSaving(false);
    }
  }

  async function voidRecord(record) {
    if (record.voided) return;
    if (!window.confirm("Void this harvest record? It will remain in the history and no longer count as an active harvest.")) return;
    setVoidingId(record.id);
    setRecordsError("");
    try {
      await harvestApi.void(selectedPlanting.id, record.id);
      refresh();
      notify("Harvest record voided; the audit record was retained.");
    } catch (error) {
      setRecordsError(error.message || "Unable to void this harvest record.");
    } finally {
      setVoidingId(null);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> FROM FIELD TO STORE</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon"><Sprout size={23} /></div>
        <div className="workspace-title-copy">
          <h1>Harvest records</h1>
          <p>Capture yield by planting while preserving a traceable harvest history.</p>
        </div>
        <div className="workspace-title-actions expense4-actions">
          {farms.length > 1 && (
            <label className="ff-farm-select">
              <span>Farm</span>
              <select value={selectedFarm.id} onChange={(event) => {
                const next = farms.find((farm) => String(farm.id) === event.target.value);
                if (next) setSelectedFarm(next);
              }}>
                {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
          )}
          <button className="button-secondary expense4-refresh" type="button" onClick={refresh} disabled={loading || recordsLoading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="button-primary" type="button" onClick={openCreate} disabled={!canRecordHarvest}>
            <Plus size={15} /> Add harvest
          </button>
        </div>
      </div>

      <div className="workspace-data-card surface-card expense4-data-card">
        <div className="workspace-data-heading">
          <div>
            <h2>{selectedPlanting ? plantingLabel(selectedPlanting, fieldById) : "Choose a planting"}</h2>
            <p>Harvest records are grouped by crop planting in the backend.</p>
          </div>
          <label className="expense4-planting-select">
            <span>Planting</span>
            <select value={selectedPlantingId} onChange={(event) => setSelectedPlantingId(event.target.value)} disabled={loading || farmPlantings.length === 0}>
              <option value="">Choose a planting</option>
              {farmPlantings.map((planting) => (
                <option key={planting.id} value={planting.id}>
                  {plantingLabel(planting, fieldById)} · {humanize(planting.status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedPlanting && !canRecordHarvest && (
          <div className="expense4-info" role="status">
            Harvest entries can only be added while this planting is Active or Harvesting. Current status: <strong>{humanize(selectedPlanting.status)}</strong>.
          </div>
        )}

        {pageError && <div className="ff-error" role="alert">{pageError}</div>}
        {recordsError && <div className="ff-error" role="alert">{recordsError}</div>}

        {loading ? (
          <div className="empty-state"><RefreshCw size={20} /><strong>Loading harvest plantings…</strong></div>
        ) : farmPlantings.length === 0 ? (
          <div className="empty-state"><Sprout size={23} /><strong>No crop plantings in this farm</strong><span>Create a crop planting before recording a harvest.</span><button className="button-primary" type="button" onClick={() => onNavigate("Crop management")}><Plus size={14} /> Manage crops</button></div>
        ) : !selectedPlanting ? (
          <div className="empty-state"><Sprout size={23} /><strong>Select a planting</strong><span>Choose a crop above to view its harvest history.</span></div>
        ) : recordsLoading ? (
          <div className="empty-state"><RefreshCw size={20} /><strong>Loading harvest records…</strong></div>
        ) : records.length === 0 ? (
          <div className="empty-state"><ClipboardList size={23} /><strong>No harvest records yet</strong><span>Record the first yield for this planting when it is ready.</span>{canRecordHarvest && <button className="button-primary" type="button" onClick={openCreate}><Plus size={14} /> Add harvest</button>}</div>
        ) : (
          <>
            <div className="workspace-stats expense4-harvest-stats">
              <Stat label="Active harvests" value={activeRecords.length} detail="records not voided" icon={ClipboardList} />
              <Stat label="Voided records" value={records.filter((record) => record.voided).length} detail="retained for audit" icon={CheckCircle2} />
              <Stat label="Harvest dates" value={new Set(activeRecords.map((record) => record.harvestDate)).size} detail="distinct dates with active yield" icon={CalendarDays} />
              <Stat label="Yield units" value={quantityByUnit.length} detail="kept separate by unit" icon={Leaf} />
            </div>
            <div className="expense4-yield-summary">
              <strong>Active yield by unit</strong>
              <div>{quantityByUnit.length ? quantityByUnit.map(([unit, total]) => <span key={unit}>{quantityLabel(total)} {humanize(unit)}</span>) : <span>No active yield</span>}</div>
            </div>
          </>
        )}

        {selectedPlanting && !loading && !recordsLoading && records.length > 0 && (
          <>
            <div className="workspace-toolbar expense4-toolbar">
              <label className="table-search">
                <Search size={15} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search harvest records..." />
                {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
              </label>
              <label className="workspace-filter">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="ACTIVE">Active records</option>
                  <option value="VOIDED">Voided records</option>
                  <option value="ALL">All records</option>
                </select>
              </label>
              <span className="result-count">{filteredRecords.length} records</span>
            </div>
            {filteredRecords.length === 0 ? (
              <div className="empty-state"><Search size={22} /><strong>No matching harvest records</strong><span>Try another search or status filter.</span></div>
            ) : (
            <div className="workspace-table-wrap">
              <table className="workspace-table expense4-table">
                <thead><tr><th>HARVEST DATE</th><th>QUANTITY</th><th>UNIT</th><th>NOTES</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className={record.voided ? "expense4-voided" : ""}>
                      <td>{dateLabel(record.harvestDate)}</td>
                      <td className="expense4-amount">{quantityLabel(record.quantity)}</td>
                      <td>{humanize(record.unit)}</td>
                      <td><span className="expense4-notes">{record.notes || "—"}</span>{record.voided && <small className="expense4-subtext">{record.voidReason || "Voided record"}</small>}</td>
                      <td><RecordStatus voided={record.voided} /></td>
                      <td>
                        <button type="button" className="ff-icon-button ff-danger" aria-label={"Void harvest record " + record.id} disabled={record.voided || voidingId === record.id} onClick={() => voidRecord(record)}>
                          <Ban size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </>
        )}
        <div className="workspace-data-footer">
          <span>Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records</span>
          <span>{selectedPlanting ? selectedPlanting.cropTypeName + " · backend harvest ledger" : farmName}</span>
        </div>
      </div>

      {dialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialogOpen(false);
        }}>
          <form className="dialog-card expense4-dialog" onSubmit={submit}>
            <div className="dialog-heading">
              <div><span className="section-kicker">HARVEST ENTRY</span><h2>Add harvest record</h2><p>{selectedPlanting?.cropTypeName} · {fieldById.get(String(selectedPlanting?.fieldId))?.fieldName || "Field"}</p></div>
              <button type="button" className="icon-button" aria-label="Close dialog" disabled={saving} onClick={() => setDialogOpen(false)}><X size={19} /></button>
            </div>
            {formError && <div className="ff-error" role="alert">{formError}</div>}
            <label className="form-label">Harvest date<input type="date" required min={selectedPlanting?.plantedOn || undefined} max={todayIso()} value={form.harvestDate} onChange={(event) => setForm({ ...form, harvestDate: event.target.value })} /></label>
            <div className="expense4-form-grid">
              <label className="form-label">Quantity<input type="number" required min="0.001" step="0.001" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="e.g. 42.500" /></label>
              <label className="form-label">Unit<select className="form-select" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>{UNITS.map((unit) => <option key={unit} value={unit}>{humanize(unit)}</option>)}</select></label>
            </div>
            <label className="form-label">Notes<textarea rows={3} maxLength={2000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Quality, grade, storage, or other observations" /></label>
            <div className="dialog-note"><CalendarDays size={16} /><span>Harvest date must be on or after the planting date and cannot be in the future. Only Active or Harvesting plantings can receive records.</span></div>
            <div className="dialog-note"><CheckCircle2 size={16} /><span>Harvest records cannot be edited. Void an incorrect record and create a replacement; the original stays in the audit history.</span></div>
            <div className="dialog-actions">
              <button type="button" className="button-secondary" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</button>
              <button type="submit" className="button-primary" disabled={saving || !canRecordHarvest}><Plus size={15} /> {saving ? "Saving…" : "Save harvest"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default function ExpenseHarvestPage({
  active,
  farms,
  selectedFarm,
  setSelectedFarm,
  onNavigate,
  notify,
}) {
  if (!selectedFarm?.id) {
    return (
      <section className="workspace-page">
        <div className="page-eyebrow"><span className="eyebrow-pip" /> FARM RECORDS</div>
        <div className="empty-state surface-card expense4-no-farm">
          <Leaf size={28} />
          <strong>No farm selected</strong>
          <span>Create or select a farm before managing expenses and harvest records.</span>
          <button className="button-primary" type="button" onClick={() => onNavigate("Farms")}>Go to farms</button>
        </div>
      </section>
    );
  }

  const pageProps = {
    farmId: selectedFarm.id,
    farmName: selectedFarm.name,
    farms,
    selectedFarm,
    setSelectedFarm,
    onNavigate,
    notify,
  };
  return active === "Expenses" ? <ExpensePage {...pageProps} /> : <HarvestPage {...pageProps} />;
}
