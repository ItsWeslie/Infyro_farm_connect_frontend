import { TooltipTarget } from "./ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import UseAnimations from "react-useanimations";
import alertCircle from "react-useanimations/lib/alertCircle";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleX,
  ClipboardList,
  Coins,
  Plus,
  PackageCheck,
  Receipt,
  Search,
  Sprout,
  Tractor,
  Wallet,
  Wheat,
  X,
} from "lucide-react";
import {
  cropPlantingApi,
  expenseApi,
  fieldApi,
  harvestApi,
} from "../api/client";
import { ExpenseCategory, HarvestUnit } from "../types/enums";
import { SkeletonBlock } from "./ui/Skeleton";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { DatePicker } from "./ui/calendar";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import ActivityPlantingSelector from "./ActivityPlantingSelector";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "./ui/pagination";
import { useConfirmDialog } from "../context/ConfirmDialogContext";

const CATEGORIES = Object.values(ExpenseCategory);
const UNITS = Object.values(HarvestUnit);
const EXPENSES_PER_PAGE = 5;

function expensePageItems(page, totalPages) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((value, index) =>
    index > 0 && value - pages[index - 1] > 1 ? [`gap-${value}`, value] : [value]
  );
}

const EMPTY_EXPENSE = {
  scope: "farm",
  farmId: "",
  amount: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  category: ExpenseCategory.OTHER,
  description: "",
  cropPlantingId: "",
};

const EMPTY_HARVEST = {
  plantingId: "",
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

function RecordStatus({ voided, inactiveLabel = "Voided" }) {
  return (
    <span className={"status-pill " + (voided ? "status-planned" : "status-growing")}>
      <i />{voided ? inactiveLabel : "Active"}
    </span>
  );
}

function ExpensePage({ farms, onNavigate, notify }) {
  const confirmDialog = useConfirmDialog();
  const [ledger, setLedger] = useState({ key: null, records: [], failedFarms: [] });
  const [expensePlantingData, setExpensePlantingData] = useState({ key: null, entries: [], error: "" });
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [farmFilter, setFarmFilter] = useState("ALL");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_EXPENSE);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [voidingId, setVoidingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const ownedFarmsKey = JSON.stringify([...new Set(farms.filter((farm) => farm.id != null).map((farm) => String(farm.id)))].sort());
  const requestKey = JSON.stringify([ownedFarmsKey, reloadKey]);
  const farmNames = useMemo(() => new Map(farms.map((farm) => [String(farm.id), farm.name || "Unnamed farm"])), [farms]);
  const currentFarmFilter = farmFilter === "ALL" || farmNames.has(farmFilter) ? farmFilter : "ALL";
  const loading = ledger.key !== requestKey;
  const expenses = useMemo(() => ledger.key === requestKey ? ledger.records : [], [ledger, requestKey]);
  const failedFarms = ledger.key === requestKey ? ledger.failedFarms : [];
  const cropOptionsPending = expensePlantingData.key !== requestKey;

  // Every farm is queried independently so a failed request cannot hide another farm's records.
  useEffect(() => {
    let current = true;
    const ids = JSON.parse(ownedFarmsKey);
    setPageError("");
    Promise.allSettled(ids.map((id) => expenseApi.getByFarm(id))).then((results) => {
      if (!current) return;
      const records = [];
      const failedFarms = [];
      results.forEach((result, index) => {
        const ownerFarmId = ids[index];
        if (result.status === "fulfilled") {
          toList(result.value).forEach((expense) => {
            if (expense.id != null) records.push({ ...expense, farmId: ownerFarmId });
          });
        } else {
          failedFarms.push(ownerFarmId);
        }
      });
      setLedger({ key: requestKey, records, failedFarms });
    });
    return () => { current = false; };
  }, [ownedFarmsKey, requestKey]);

  // Share the cross-farm planting contexts between the ledger and the add expense dialog.
  useEffect(() => {
    let current = true;
    const ids = JSON.parse(ownedFarmsKey);
    if (!ids.length) {
      setExpensePlantingData({ key: requestKey, entries: [], error: "" });
      return undefined;
    }
    Promise.all([
      cropPlantingApi.getAll(),
      Promise.allSettled(ids.map((id) => fieldApi.getByFarm(id))),
    ]).then(([plantingResponse, fieldResults]) => {
      if (!current) return;
      const contexts = new Map();
      fieldResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          toList(result.value).forEach((field) => contexts.set(String(field.id), { farmId: ids[index], field }));
        }
      });
      const entries = toList(plantingResponse).flatMap((planting) => {
        const context = contexts.get(String(planting.fieldId));
        return planting.id != null && context ? [{ planting, ...context }] : [];
      });
      const error = fieldResults.some((result) => result.status === "rejected") ? "Some farms' plantings could not be loaded. Only available plantings are shown." : "";
      setExpensePlantingData({ key: requestKey, entries, error });
    }).catch((error) => {
      if (current) setExpensePlantingData({ key: requestKey, entries: [], error: error.message || "Unable to load crop plantings." });
    });
    return () => { current = false; };
  }, [ownedFarmsKey, requestKey]);

  const expensePlantingOptions = useMemo(() => {
    if (expensePlantingData.key !== requestKey) return [];
    return expensePlantingData.entries.map(({ planting, farmId: ownerFarmId, field }) => ({
      id: String(planting.id),
      farmId: ownerFarmId,
      farmName: farmNames.get(ownerFarmId) || "Unnamed farm",
      fieldName: field.fieldName || "Field",
      cropName: planting.cropTypeName || "Crop",
      plantedOn: dateLabel(planting.plantedOn),
      status: humanize(planting.status),
    })).sort((a, b) => a.farmName.localeCompare(b.farmName) || a.cropName.localeCompare(b.cropName) || a.fieldName.localeCompare(b.fieldName) || a.id.localeCompare(b.id));
  }, [expensePlantingData, requestKey, farmNames]);
  const plantingById = useMemo(() => new Map(expensePlantingOptions.map((option) => [option.id, option])), [expensePlantingOptions]);
  const expensePlanting = plantingById.get(form.cropPlantingId);
  const expenseFarm = farms.find((farm) => String(farm.id) === (form.scope === "crop" ? expensePlanting?.farmId : form.farmId));

  const activeExpenses = expenses.filter((expense) => !expense.voided);
  const totalActive = activeExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const cropSpend = activeExpenses.filter((expense) => expense.cropPlantingId != null).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const farmSpend = activeExpenses.filter((expense) => expense.cropPlantingId == null).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const statDetail = (detail) => failedFarms.length ? "Partial data · " + detail : detail;
  const filteredExpenses = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const planting = plantingById.get(String(expense.cropPlantingId));
      const cropLinked = expense.cropPlantingId != null;
      const matchesSearch = [
        expense.description, expense.category, humanize(expense.category),
        farmNames.get(String(expense.farmId)), planting?.cropName, planting?.fieldName,
        cropLinked ? "crop-specific" : "farm-wide", expense.amount, expense.expenseDate,
      ].join(" ").toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "ACTIVE" && !expense.voided)
        || (statusFilter === "VOIDED" && expense.voided);
      const matchesCategory = categoryFilter === "ALL" || expense.category === categoryFilter;
      const matchesFarm = currentFarmFilter === "ALL" || String(expense.farmId) === currentFarmFilter;
      const matchesScope = scopeFilter === "ALL" || (scopeFilter === "CROP" ? cropLinked : !cropLinked);
      return matchesSearch && matchesStatus && matchesCategory && matchesFarm && matchesScope;
    }).sort((a, b) => String(b.expenseDate || "").localeCompare(String(a.expenseDate || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")) || String(b.id).localeCompare(String(a.id)));
  }, [expenses, plantingById, farmNames, search, statusFilter, categoryFilter, currentFarmFilter, scopeFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredExpenses.length / EXPENSES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * EXPENSES_PER_PAGE;
  const paginatedExpenses = filteredExpenses.slice(pageStart, pageStart + EXPENSES_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter, currentFarmFilter, scopeFilter]);
  useEffect(() => { if (!loading) setPage((previous) => Math.min(previous, pageCount)); }, [loading, pageCount]);

  function openCreate() {
    setForm({
      ...EMPTY_EXPENSE,
      farmId: currentFarmFilter !== "ALL" ? currentFarmFilter : farms.length === 1 ? String(farms[0].id) : "",
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
    if (form.scope === "crop" && (cropOptionsPending || !expensePlanting)) {
      setFormError("Choose a crop planting for this expense.");
      return;
    }
    if (!expenseFarm) {
      setFormError("Choose a farm for this expense.");
      return;
    }
    const targetFarmId = expenseFarm.id;
    const cropPlantingId = form.scope === "crop" ? Number(expensePlanting.id) : null;
    if (form.scope === "crop" && (!Number.isSafeInteger(cropPlantingId) || cropPlantingId <= 0)) {
      setFormError("The selected planting is invalid.");
      return;
    }

    setSaving(true);
    try {
      await expenseApi.create(targetFarmId, {
        cropPlantingId,
        amount,
        expenseDate: form.expenseDate,
        category: form.category,
        description: form.description.trim(),
      });
      setReloadKey((key) => key + 1);
      setPage(1);
      setDialogOpen(false);
      setForm(EMPTY_EXPENSE);
      notify("Expense saved to " + expenseFarm.name);
    } catch (error) {
      notify(error.message || "Unable to save this expense.", "error");
      setFormError(error.message || "Unable to save this expense.");
    } finally {
      setSaving(false);
    }
  }

  async function voidExpense(expense) {
    if (expense.voided) return;
    const confirmed = await confirmDialog({ title: "Cancel this expense?", message: "This expense will be marked as cancelled.", details: "It will remain in audit history and will no longer count toward active expense totals.", confirmLabel: "Cancel expense", tone: "warning" });
    if (!confirmed) return;
    setVoidingId(String(expense.farmId) + ":" + expense.id);
    setPageError("");
    try {
      await expenseApi.void(expense.farmId, expense.id);
      setReloadKey((key) => key + 1);
      notify("Expense cancelled; the audit record was retained.");
    } catch (error) {
      notify(error.message || "Unable to cancel this expense.", "error");
      setPageError(error.message || "Unable to cancel this expense.");
    } finally {
      setVoidingId(null);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> FARM FINANCES</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon"><Wallet size={23} /></div>
        <div className="workspace-title-copy">
          <h1>Farm expenses</h1>
          <p>Manage and track expenses across your farms.</p>
        </div>
        <div className="workspace-title-actions expense4-actions">
          <button className="button-primary" type="button" onClick={openCreate} disabled={!farms.length}>
            <Plus size={15} /> Add expense
          </button>
        </div>
      </div>

      <div className="workspace-stats">
        <Stat label="Total spend" value={loading ? "…" : amountLabel(totalActive)} detail={statDetail("excludes cancelled entries")} icon={Coins} />
        <Stat label="Farm-wide spend" value={loading ? "…" : amountLabel(farmSpend)} detail={statDetail("general farm expenses")} icon={Tractor} />
        <Stat label="Crop-specific spend" value={loading ? "…" : amountLabel(cropSpend)} detail={statDetail("linked to crop plantings")} icon={Sprout} />
        <Stat label="Active expenses" value={loading ? "…" : activeExpenses.length} detail={statDetail("across all farms")} icon={ClipboardList} />
      </div>

      <div className="workspace-data-card surface-card expense4-data-card expense4-ledger">
        <div className="workspace-data-heading">
          <div>
            <h2 className="expense4-ledger-title"><Receipt size={14} aria-hidden="true" /> Expense ledger</h2>
            <p>View and manage spending across all your farms.</p>
          </div>
        </div>
        <div className="workspace-toolbar expense4-toolbar expense4-ledger-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses..." />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
          </label>
          <Select value={currentFarmFilter} onValueChange={setFarmFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by farm"><SelectValue /></SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">All farms</SelectItem>
              {farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by expense type"><SelectValue /></SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">All expense types</SelectItem>
              <SelectItem value="FARM">Farm-wide</SelectItem>
              <SelectItem value="CROP">Crop-specific</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by category"><SelectValue /></SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">All categories</SelectItem>
              {CATEGORIES.map((category) => <SelectItem key={category} value={category}>{humanize(category)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ACTIVE">Active entries</SelectItem>
              <SelectItem value="VOIDED">Cancelled entries</SelectItem>
              <SelectItem value="ALL">All entries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {pageError && <div className="ff-error" role="alert">{pageError}</div>}
        {!loading && failedFarms.length > 0 && (
          <div className="expense4-ledger-load-warning" role="status">
            <span>Could not load expenses for {failedFarms.map((id) => farmNames.get(id) || "Farm").join(", ")}. Totals and records may be incomplete.</span>
            <button type="button" className="button-secondary" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
          </div>
        )}
        {!cropOptionsPending && expensePlantingData.error && <div className="expense4-ledger-load-warning" role="status"><span>Some linked planting details are unavailable.</span><button type="button" className="button-secondary" onClick={() => setReloadKey((key) => key + 1)}>Retry</button></div>}
        {loading ? (
          <SkeletonBlock rows={5} />
        ) : !farms.length ? (
          <div className="empty-state"><Coins size={23} /><strong>No farms available</strong><span>Create a farm before recording expenses.</span><button type="button" className="button-primary" onClick={() => onNavigate("Farms")}>Go to farms</button></div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <Coins size={23} />
            <strong>{failedFarms.length ? "No available matching expenses" : expenses.length === 0 ? "No expenses recorded" : "No matching expenses"}</strong>
            <span>{failedFarms.length ? "Retry the unavailable farms or adjust your filters." : expenses.length === 0 ? "Add your first farm expense to start tracking costs." : "Try another search or filter."}</span>
            {expenses.length === 0 && !failedFarms.length && <button type="button" className="button-primary" onClick={openCreate}><Plus size={14} /> Add expense</button>}
          </div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table expense4-table expense4-ledger-table">
              <thead><tr><th>DATE</th><th>DESCRIPTION</th><th>FARM</th><th>CATEGORY</th><th>LINKED PLANTING</th><th>AMOUNT</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {paginatedExpenses.map((expense) => {
                  const planting = plantingById.get(String(expense.cropPlantingId));
                  const recordKey = String(expense.farmId) + ":" + expense.id;
                  return (
                    <tr key={recordKey} className={expense.voided ? "expense4-voided" : ""}>
                      <td>{dateLabel(expense.expenseDate)}</td>
                      <td><strong className="workspace-cell-title">{expense.description}</strong>{expense.voided && <small className="expense4-subtext">{expense.voidReason || "Cancelled entry"}</small>}</td>
                      <td>{farmNames.get(String(expense.farmId)) || "Unnamed farm"}</td>
                      <td>{humanize(expense.category)}</td>
                      <td>{expense.cropPlantingId == null ? "Farm-wide" : planting && planting.farmId === String(expense.farmId) ? <>{planting.cropName}<small className="expense4-subtext">{planting.fieldName}</small></> : <>{cropOptionsPending ? "Loading planting…" : "Crop-specific"}<small className="expense4-subtext">Planting #{expense.cropPlantingId}</small></>}</td>
                      <td className="expense4-amount">{amountLabel(expense.amount)}</td>
                      <td><RecordStatus voided={expense.voided} inactiveLabel="Cancelled" /></td>
                      <td>
                        <TooltipTarget text="Cancel expense" disabledReason={expense.voided ? "This expense is already cancelled." : "Another cancellation is in progress."}><button type="button" className="ff-action-button expense4-cancel-button" aria-label={"Cancel expense " + expense.id} disabled={expense.voided || voidingId !== null} onClick={() => voidExpense(expense)}>
                          Cancel
                        </button></TooltipTarget>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="workspace-data-footer ff-fields-footer">
          <span>Showing <strong>{loading ? "…" : filteredExpenses.length ? `${pageStart + 1}–${Math.min(pageStart + EXPENSES_PER_PAGE, filteredExpenses.length)} of ${filteredExpenses.length}` : "0"}</strong> expenses</span>
          {!loading && filteredExpenses.length > 0 && (
            <Pagination className="ff-farm-pagination ff-field-pagination" aria-label="Expense ledger pagination">
              <PaginationContent>
                <PaginationItem><PaginationPrevious disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} /></PaginationItem>
                {expensePageItems(currentPage, pageCount).map((item) => (
                  <PaginationItem key={item}>
                    {typeof item === "number" ? <PaginationLink isActive={currentPage === item} aria-label={`Page ${item}`} onClick={() => setPage(item)}>{item}</PaginationLink> : <PaginationEllipsis />}
                  </PaginationItem>
                ))}
                <PaginationItem><PaginationNext disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} /></PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          <span>{currentFarmFilter === "ALL" ? "All farms" : farmNames.get(currentFarmFilter)}</span>
        </div>
      </div>

      {dialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialogOpen(false);
        }}>
          <form className="dialog-card expense4-dialog expense4-create-dialog" onSubmit={submit}>
            <div className="dialog-heading">
              <div><span className="section-kicker">EXPENSE ENTRY</span><h2>Add an expense</h2><p>Record spending for a farm or a crop planting.</p></div>
              <button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" disabled={saving} onClick={() => setDialogOpen(false)}><X size={19} /></button>
            </div>
            {formError && <div className="ff-error" role="alert">{formError}</div>}
            <fieldset className="expense4-scope-fieldset">
              <legend>Expense type</legend>
              <div className="expense4-scope-grid">
                {[
                  { id: "farm", label: "Farm-wide", detail: "General farm expenses", Icon: Tractor },
                  { id: "crop", label: "Crop-specific", detail: "Linked to a crop planting", Icon: Sprout },
                ].map(({ id, label, detail, Icon }) => (
                  <label key={id} className="expense4-scope-option" data-selected={form.scope === id}>
                    <input type="radio" name="expense-scope" value={id} checked={form.scope === id} disabled={saving} onChange={() => {
                      setForm((current) => ({ ...current, scope: id, cropPlantingId: "" }));
                      setFormError("");
                    }} />
                    <span className="expense4-scope-option-top"><Icon size={17} aria-hidden="true" />{form.scope === id ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}</span>
                    <strong>{label}</strong><small>{detail}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            {form.scope === "farm" ? (
              <div className="form-label">
                <label htmlFor="expense-farm">Select farm</label>
                <Select value={expenseFarm ? form.farmId : ""} required disabled={saving || !farms.length} onValueChange={(value) => setForm((current) => ({ ...current, farmId: value, cropPlantingId: "" }))}>
                  <SelectTrigger id="expense-farm" className="ifc-form-select"><SelectValue placeholder="Choose a farm" /></SelectTrigger>
                  <SelectContent align="start">
                    {farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="form-label">
                <span>Crop planting</span>
                <ActivityPlantingSelector options={expensePlantingOptions} selected={expensePlanting} loading={cropOptionsPending} disabled={saving} onSelect={(id) => {
                  setForm((current) => ({ ...current, cropPlantingId: id }));
                  setFormError("");
                }} />
                {!cropOptionsPending && expensePlantingData.error && <small className="expense4-selection-error" role="status">{expensePlantingData.error}</small>}
                {!cropOptionsPending && !expensePlantingOptions.length && !expensePlantingData.error && <small className="expense4-selection-hint">No crop plantings available. Create a planting first.</small>}
                {expensePlanting && <small className="expense4-selection-hint"><Tractor size={13} aria-hidden="true" /> {expensePlanting.farmName} will be linked automatically.</small>}
              </div>
            )}
            <label className="form-label">Description<Input required disabled={saving} maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="e.g. Organic fertilizer purchase" /></label>
            <div className="expense4-form-grid">
              <label className="form-label">Amount (₹)<Input type="number" required disabled={saving} min="0.01" max="999999999999.99" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="e.g. 1850.00" /></label>
              <div className="form-label">
                <label htmlFor="expense-date">Expense date</label>
                <DatePicker id="expense-date" required disabled={saving} max={todayIso()} value={form.expenseDate} onChange={(value) => setForm((current) => ({ ...current, expenseDate: value }))} />
              </div>
            </div>
            <div className="form-label">
              <label htmlFor="expense-category">Category</label>
              <Select value={form.category} disabled={saving} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger id="expense-category" className="ifc-form-select"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                <SelectContent align="start">{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{humanize(category)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Alert className="expense4-audit-note" role="note">
              <span className="ff-field-area-warning-icon" aria-hidden="true"><UseAnimations animation={alertCircle} size={22} strokeColor="#806522" interaction="loop" render={(eventProps, animationProps) => <span {...eventProps} {...animationProps} />} /></span>
              <AlertDescription>Expenses cannot be edited after saving. Cancel an incorrect entry and create a replacement to retain its audit history.</AlertDescription>
            </Alert>
            <div className="dialog-actions">
              <button type="button" className="button-secondary" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</button>
              <button type="submit" className="button-primary" disabled={saving || !expenseFarm || (form.scope === "crop" && (cropOptionsPending || !expensePlanting))}><Plus size={15} /> {saving ? "Saving…" : "Save expense"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function HarvestPage({ farms, onNavigate, notify }) {
  const confirmDialog = useConfirmDialog();
  const [data, setData] = useState({ key: null, options: [], records: [], warnings: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("ALL");
  const [plantingFilter, setPlantingFilter] = useState("ALL");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_HARVEST);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const ownedFarmsKey = JSON.stringify([...new Set(farms.filter((farm) => farm.id != null).map((farm) => String(farm.id)))].sort());
  const requestKey = JSON.stringify([ownedFarmsKey, reloadKey]);
  const loading = data.key !== requestKey;
  const farmNames = useMemo(() => new Map(farms.map((farm) => [String(farm.id), farm.name || "Unnamed farm"])), [farms]);
  const options = useMemo(() => loading ? [] : data.options.map((option) => ({ ...option, farmName: farmNames.get(option.farmId) || "Unnamed farm" }))
    .sort((a, b) => a.farmName.localeCompare(b.farmName) || a.cropName.localeCompare(b.cropName) || a.fieldName.localeCompare(b.fieldName) || a.id.localeCompare(b.id)), [loading, data.options, farmNames]);
  const records = useMemo(() => loading ? [] : data.records, [loading, data.records]);
  const warnings = loading ? [] : data.warnings;

  // Fetch planting context for all owned farms, then harvest history for every
  // planting (including completed and cancelled ones). Bound request fan-out.
  useEffect(() => {
    let current = true;
    const ids = JSON.parse(ownedFarmsKey);
    setPageError("");
    async function load() {
      if (!ids.length) {
        if (current) setData({ key: requestKey, options: [], records: [], warnings: [] });
        return;
      }
      const [plantingResult, fieldsResult] = await Promise.all([
        Promise.allSettled([cropPlantingApi.getAll()]),
        Promise.allSettled(ids.map((id) => fieldApi.getByFarm(id))),
      ]);
      if (!current) return;
      const warnings = [];
      const contexts = new Map();
      fieldsResult.forEach((result, index) => {
        if (result.status === "fulfilled") {
          toList(result.value).forEach((field) => contexts.set(String(field.id), { farmId: ids[index], fieldName: field.fieldName || "Field" }));
        } else {
          warnings.push({ type: "farm", id: ids[index] });
        }
      });
      const plantings = plantingResult[0];
      if (plantings.status === "rejected") warnings.push({ type: "plantings" });
      const options = plantings.status === "fulfilled" ? toList(plantings.value).flatMap((planting) => {
        const context = contexts.get(String(planting.fieldId));
        return planting.id != null && context ? [{
          ...context,
          id: String(planting.id),
          cropName: planting.cropTypeName || "Crop",
          plantedOn: dateLabel(planting.plantedOn),
          plantingDate: planting.plantedOn,
          status: humanize(planting.status),
          rawStatus: planting.status,
        }] : [];
      }) : [];
      const records = [];
      for (let offset = 0; offset < options.length; offset += 8) {
        if (!current) return;
        const batch = options.slice(offset, offset + 8);
        const results = await Promise.allSettled(batch.map((option) => harvestApi.getByPlanting(option.id)));
        if (!current) return;
        results.forEach((result, index) => {
          const option = batch[index];
          if (result.status === "fulfilled") {
            toList(result.value).forEach((record) => {
              if (record.id != null) records.push({ ...record, cropPlantingId: option.id, farmId: option.farmId });
            });
          } else {
            warnings.push({ type: "harvest", id: option.id });
          }
        });
      }
      if (current) setData({ key: requestKey, options, records, warnings });
    }
    load().catch(() => {
      if (current) setData({ key: requestKey, options: [], records: [], warnings: [{ type: "plantings" }] });
    });
    return () => { current = false; };
  }, [ownedFarmsKey, requestKey]);

  const plantingById = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);
  const currentFarmFilter = farmFilter === "ALL" || farmNames.has(farmFilter) ? farmFilter : "ALL";
  const filterPlantings = options.filter((option) => currentFarmFilter === "ALL" || option.farmId === currentFarmFilter);
  const currentPlantingFilter = plantingFilter === "ALL" || loading || filterPlantings.some((option) => option.id === plantingFilter) ? plantingFilter : "ALL";
  const eligiblePlantings = options.filter((option) => ["ACTIVE", "HARVESTING"].includes(option.rawStatus) && option.plantingDate && option.plantingDate <= todayIso());
  const selectedPlanting = eligiblePlantings.find((option) => option.id === form.plantingId);
  const activeRecords = records.filter((record) => !record.voided);
  const quantityByUnit = new Map();
  activeRecords.forEach((record) => quantityByUnit.set(record.unit, (quantityByUnit.get(record.unit) || 0) + Number(record.quantity || 0)));
  const statDetail = (detail) => warnings.length ? "Partial data · " + detail : detail;
  const filteredRecords = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return records.filter((record) => {
      const planting = plantingById.get(String(record.cropPlantingId));
      const matchesSearch = [record.notes, record.quantity, record.unit, humanize(record.unit), record.harvestDate,
        record.voided ? "Cancelled" : "Active", farmNames.get(String(record.farmId)), planting?.cropName, planting?.fieldName, planting?.plantedOn]
        .join(" ").toLowerCase().includes(normalized);
      return matchesSearch
        && (statusFilter === "ALL" || (statusFilter === "ACTIVE" ? !record.voided : record.voided))
        && (currentFarmFilter === "ALL" || record.farmId === currentFarmFilter)
        && (currentPlantingFilter === "ALL" || record.cropPlantingId === currentPlantingFilter)
        && (unitFilter === "ALL" || record.unit === unitFilter);
    }).sort((a, b) => String(b.harvestDate || "").localeCompare(String(a.harvestDate || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")) || String(b.id).localeCompare(String(a.id)));
  }, [records, plantingById, farmNames, search, statusFilter, currentFarmFilter, currentPlantingFilter, unitFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / EXPENSES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * EXPENSES_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(pageStart, pageStart + EXPENSES_PER_PAGE);
  useEffect(() => { setPage(1); }, [search, statusFilter, farmFilter, plantingFilter, unitFilter]);
  useEffect(() => { if (!loading) setPage((previous) => Math.min(previous, pageCount)); }, [loading, pageCount]);

  function openCreate() {
    const initial = eligiblePlantings.find((option) => option.id === currentPlantingFilter);
    setForm({ ...EMPTY_HARVEST, plantingId: initial?.id || "", harvestDate: todayIso() });
    setFormError("");
    setDialogOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setFormError("");
    if (!selectedPlanting || loading) {
      setFormError("Choose an active or harvesting crop planting.");
      return;
    }
    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity < 0.001 || quantity >= 100_000_000_000) {
      setFormError("Enter a quantity of at least 0.001 with no more than 11 integer digits.");
      return;
    }
    if (hasTooManyFractionDigits(form.quantity, 3)) {
      setFormError("Quantity can have at most three decimal places.");
      return;
    }
    if (!form.harvestDate || form.harvestDate > todayIso() || form.harvestDate < selectedPlanting.plantingDate) {
      setFormError("Harvest date must be on or after the planting date and cannot be in the future.");
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
      setReloadKey((key) => key + 1);
      setPage(1);
      setDialogOpen(false);
      setForm(EMPTY_HARVEST);
      notify("Harvest record saved for " + selectedPlanting.cropName + " · " + selectedPlanting.farmName);
    } catch (error) {
      notify(error.message || "Unable to save this harvest record.", "error");
      setFormError(error.message || "Unable to save this harvest record.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelRecord(record) {
    if (record.voided || cancelling) return;
    const confirmed = await confirmDialog({ title: "Cancel this harvest record?", message: "This harvest entry will be marked as cancelled.", details: "It will remain in the harvest history but will no longer count toward active yield totals.", confirmLabel: "Cancel record", tone: "warning" });
    if (!confirmed) return;
    setCancelling(true);
    setPageError("");
    try {
      await harvestApi.void(record.cropPlantingId, record.id);
      setReloadKey((key) => key + 1);
      notify("Harvest record cancelled; the audit record was retained.");
    } catch (error) {
      notify(error.message || "Unable to cancel this harvest record.", "error");
      setPageError(error.message || "Unable to cancel this harvest record.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> FROM FIELD TO STORE</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon"><PackageCheck size={23} /></div>
        <div className="workspace-title-copy">
          <h1>Harvest records</h1>
          <p>Track and manage crop yields across your farms.</p>
        </div>
        <div className="workspace-title-actions expense4-actions">
          <button className="button-primary" type="button" onClick={openCreate} disabled={loading || !eligiblePlantings.length}><Plus size={15} /> Add harvest</button>
        </div>
      </div>

      <div className="workspace-stats">
        <Stat label="Active harvests" value={loading ? "…" : activeRecords.length} detail={statDetail("across all farms")} icon={ClipboardList} />
        <Stat label="Harvested plantings" value={loading ? "…" : new Set(activeRecords.map((record) => record.cropPlantingId)).size} detail={statDetail("with active records")} icon={Sprout} />
        <Stat label="Harvest dates" value={loading ? "…" : new Set(activeRecords.map((record) => record.harvestDate)).size} detail={statDetail("distinct harvest dates")} icon={CalendarDays} />
        <Stat label="Cancelled records" value={loading ? "…" : records.filter((record) => record.voided).length} detail={statDetail("retained for audit")} icon={CircleX} />
      </div>
      <div className="expense4-yield-summary harvest4-yield-summary">
        <strong><Wheat size={15} aria-hidden="true" /> Total harvest yield{warnings.length ? " (partial)" : ""}</strong>
        <div>{loading ? <span>Loading…</span> : quantityByUnit.size ? [...quantityByUnit.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([unit, total]) => <span key={unit}>{quantityLabel(total)} {humanize(unit)}</span>) : <span>No active yield</span>}</div>
      </div>

      <div className="workspace-data-card surface-card expense4-data-card expense4-ledger harvest4-ledger">
        <div className="workspace-data-heading">
          <div><h2 className="expense4-ledger-title"><ClipboardList size={14} aria-hidden="true" /> Harvest ledger</h2><p>View and manage harvest records across all your farms.</p></div>
        </div>
        <div className="workspace-toolbar expense4-toolbar expense4-ledger-toolbar">
          <label className="table-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search harvest records..." aria-label="Search harvest records" />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}</label>
          <Select value={currentFarmFilter} onValueChange={(value) => { setFarmFilter(value); setPlantingFilter("ALL"); }}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by farm"><SelectValue /></SelectTrigger>
            <SelectContent align="start"><SelectItem value="ALL">All farms</SelectItem>{farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={currentPlantingFilter} disabled={loading} onValueChange={setPlantingFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by planting"><SelectValue /></SelectTrigger>
            <SelectContent align="start" className="harvest4-planting-menu"><SelectItem value="ALL">All plantings</SelectItem>{filterPlantings.map((option) => <SelectItem key={option.id} value={option.id}>{option.cropName} · {option.farmName} · {option.fieldName} · {option.plantedOn}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by unit"><SelectValue /></SelectTrigger>
            <SelectContent align="start"><SelectItem value="ALL">All units</SelectItem>{UNITS.map((unit) => <SelectItem key={unit} value={unit}>{humanize(unit)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="expense4-ledger-filter" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent align="end"><SelectItem value="ACTIVE">Active records</SelectItem><SelectItem value="VOIDED">Cancelled records</SelectItem><SelectItem value="ALL">All records</SelectItem></SelectContent>
          </Select>
        </div>
        {pageError && <div className="ff-error" role="alert">{pageError}</div>}
        {!loading && warnings.length > 0 && <div className="expense4-ledger-load-warning" role="status"><span>Some farm, planting or harvest records could not be loaded. Totals and records may be incomplete.</span><button type="button" className="button-secondary" onClick={() => setReloadKey((key) => key + 1)}>Retry</button></div>}
        {!loading && options.length > 0 && !eligiblePlantings.length && <div className="expense4-ledger-load-warning" role="note"><span>New harvest records require an Active or Harvesting planting with a valid planting date.</span></div>}
        {loading ? <SkeletonBlock rows={5} /> : !farms.length ? (
          <div className="empty-state"><PackageCheck size={23} /><strong>No farms available</strong><span>Create a farm before recording harvests.</span><button type="button" className="button-primary" onClick={() => onNavigate("Farms")}>Go to farms</button></div>
        ) : !options.length && !warnings.length ? (
          <div className="empty-state"><Sprout size={23} /><strong>No crop plantings available</strong><span>Create a crop planting before recording a harvest.</span><button type="button" className="button-primary" onClick={() => onNavigate("Crop management")}>Manage crops</button></div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state"><ClipboardList size={23} /><strong>{warnings.length ? "No available matching harvest records" : records.length ? "No matching harvest records" : "No harvest records yet"}</strong><span>{warnings.length ? "Retry unavailable records or adjust the filters." : records.length ? "Try another search or filter." : "Record the first yield when a planting is ready."}</span>{!records.length && eligiblePlantings.length > 0 && <button type="button" className="button-primary" onClick={openCreate}><Plus size={14} /> Add harvest</button>}</div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table expense4-table expense4-ledger-table harvest4-ledger-table">
              <thead><tr><th>HARVEST DATE</th><th>FARM</th><th>PLANTING</th><th>QUANTITY</th><th>UNIT</th><th>NOTES</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody>{paginatedRecords.map((record) => {
                const planting = plantingById.get(record.cropPlantingId);
                return (
                  <tr key={record.cropPlantingId + ":" + record.id} className={record.voided ? "expense4-voided" : ""}>
                    <td>{dateLabel(record.harvestDate)}</td>
                    <td>{farmNames.get(record.farmId) || "Unnamed farm"}</td>
                    <td><strong className="workspace-cell-title">{planting?.cropName || "Crop planting"}</strong><small className="expense4-subtext">{planting?.fieldName || "Field"}</small></td>
                    <td className="expense4-amount">{quantityLabel(record.quantity)}</td>
                    <td>{humanize(record.unit)}</td>
                    <td><span className="expense4-notes">{record.notes || "—"}</span>{record.voided && <small className="expense4-subtext">{record.voidReason || "Cancelled record"}</small>}</td>
                    <td><RecordStatus voided={record.voided} inactiveLabel="Cancelled" /></td>
                    <td><TooltipTarget text="Cancel harvest record" disabledReason={record.voided ? "This harvest record is already cancelled." : "Another cancellation is in progress."}><button type="button" className="ff-action-button expense4-cancel-button" aria-label={"Cancel harvest record " + record.id} disabled={record.voided || cancelling} onClick={() => cancelRecord(record)}>Cancel</button></TooltipTarget></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
        <div className="workspace-data-footer ff-fields-footer">
          <span>Showing <strong>{loading ? "…" : filteredRecords.length ? `${pageStart + 1}–${Math.min(pageStart + EXPENSES_PER_PAGE, filteredRecords.length)} of ${filteredRecords.length}` : "0"}</strong> records</span>
          {!loading && filteredRecords.length > 0 && <Pagination className="ff-farm-pagination ff-field-pagination" aria-label="Harvest ledger pagination"><PaginationContent>
            <PaginationItem><PaginationPrevious disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} /></PaginationItem>
            {expensePageItems(currentPage, pageCount).map((item) => <PaginationItem key={item}>{typeof item === "number" ? <PaginationLink isActive={currentPage === item} aria-label={`Page ${item}`} onClick={() => setPage(item)}>{item}</PaginationLink> : <PaginationEllipsis />}</PaginationItem>)}
            <PaginationItem><PaginationNext disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} /></PaginationItem>
          </PaginationContent></Pagination>}
          <span>{currentFarmFilter === "ALL" ? "All farms" : farmNames.get(currentFarmFilter)}</span>
        </div>
      </div>

      {dialogOpen && <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDialogOpen(false); }}>
        <form className="dialog-card expense4-dialog expense4-create-dialog harvest4-create-dialog" onSubmit={submit}>
          <div className="dialog-heading">
            <div><span className="section-kicker">HARVEST ENTRY</span><h2>Add harvest record</h2><p>Record the yield from a crop planting.</p></div>
            <button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" disabled={saving} onClick={() => setDialogOpen(false)}><X size={19} /></button>
          </div>
          {formError && <div className="ff-error" role="alert">{formError}</div>}
          <div className="form-label">
            <span>Select crop planting</span>
            <ActivityPlantingSelector options={eligiblePlantings} selected={selectedPlanting} loading={loading} disabled={saving} onSelect={(id) => {
              const next = eligiblePlantings.find((option) => option.id === id);
              setForm((previous) => ({ ...previous, plantingId: id, harvestDate: previous.harvestDate && next && previous.harvestDate >= next.plantingDate && previous.harvestDate <= todayIso() ? previous.harvestDate : todayIso() }));
              setFormError("");
            }} />
            {selectedPlanting ? <small className="expense4-selection-hint"><Tractor size={13} aria-hidden="true" /> {selectedPlanting.status} · Planted on {selectedPlanting.plantedOn}</small> : <small className="expense4-selection-hint">Only Active or Harvesting plantings are available.</small>}
          </div>
          <div className="form-label">
            <label htmlFor="harvest-date">Harvest date</label>
            <DatePicker id="harvest-date" required disabled={saving || !selectedPlanting} min={selectedPlanting?.plantingDate} max={todayIso()} value={form.harvestDate} onChange={(value) => setForm((previous) => ({ ...previous, harvestDate: value }))} />
          </div>
          <div className="expense4-form-grid">
            <label className="form-label">Quantity<Input type="number" required disabled={saving} min="0.001" max="99999999999.999" step="0.001" value={form.quantity} onChange={(event) => setForm((previous) => ({ ...previous, quantity: event.target.value }))} placeholder="e.g. 150.000" /></label>
            <div className="form-label"><label htmlFor="harvest-unit">Unit</label><Select value={form.unit} disabled={saving} onValueChange={(value) => setForm((previous) => ({ ...previous, unit: value }))}><SelectTrigger id="harvest-unit" className="ifc-form-select"><SelectValue /></SelectTrigger><SelectContent align="start">{UNITS.map((unit) => <SelectItem key={unit} value={unit}>{humanize(unit)}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <label className="form-label">Notes (optional)<Textarea rows={3} disabled={saving} maxLength={2000} value={form.notes} onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Quality, grade or other observations..." /></label>
          <Alert className="expense4-audit-note" role="note"><span className="ff-field-area-warning-icon" aria-hidden="true"><UseAnimations animation={alertCircle} size={22} strokeColor="#806522" interaction="loop" render={(eventProps, animationProps) => <span {...eventProps} {...animationProps} />} /></span><AlertDescription>Harvest records cannot be edited after saving. Cancel an incorrect record and create a replacement to retain its audit history.</AlertDescription></Alert>
          <div className="dialog-actions"><button type="button" className="button-secondary" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={saving || loading || !selectedPlanting}><Plus size={15} /> {saving ? "Saving…" : "Save harvest"}</button></div>
        </form>
      </div>}
    </section>
  );
}

export default function ExpenseHarvestPage({ active, farms, onNavigate, notify }) {
  return active === "Expenses" ? <ExpensePage farms={farms} onNavigate={onNavigate} notify={notify} /> : <HarvestPage farms={farms} onNavigate={onNavigate} notify={notify} />;
}
