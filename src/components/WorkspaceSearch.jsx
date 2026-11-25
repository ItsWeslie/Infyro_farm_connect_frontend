import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Bell, CalendarDays, CircleUserRound, ClipboardList, LayoutDashboard, MapPinned, PackageCheck, Search, Settings, Sprout, Tractor, Wallet, X, Leaf } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "./ui/dialog";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "./ui/command";
import { fieldApi, cropTypeApi, cropPlantingApi, cropActivityApi, expenseApi, harvestApi, notificationApi } from "../api/client";

const pages = [
  ["Overview", "Portfolio dashboard", LayoutDashboard],
  ["Farms", "Manage your farms", Tractor],
  ["Fields", "Manage registered fields", MapPinned],
  ["Crop management", "Crop plantings and crop types", Sprout],
  ["Activities", "Daily crop activity records", ClipboardList],
  ["Calendar", "Planting and harvest milestones", CalendarDays],
  ["Expenses", "Farm finances and costs", Wallet],
  ["Harvest records", "Track harvested crops", PackageCheck],
  ["Notifications", "Crop milestone reminders", Bell],
  ["My Profile", "Personal information", CircleUserRound],
  ["Account Settings", "Theme preference and logout", Settings, "Settings"],
].map(([title, detail, icon, page]) => ({ key: "page:" + title, group: "Pages", title, detail, icon, page: page || title }));

const groups = ["Pages", "Farms", "Fields", "Crop types", "Crop plantings", "Activities", "Expenses", "Harvest records", "Notifications"];
const list = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  throw new Error("Unexpected list response");
};
const words = (value) => String(value ?? "").replace(/_/g, " ");
const join = (...items) => items.filter(item => item != null && item !== "").join(" · ");
const normalize = (value) => String(value ?? "").toLowerCase().trim();
const record = (group, page, kind, id, title, detail, icon, extra = {}) => ({
  key: [kind, extra.farmId || "", extra.plantingId || "", String(id)].join(":"),
  group, page, kind, id: String(id), title: String(title || "Untitled record"), detail, icon, ...extra,
});

async function loadSearchRecords(farms, isCurrent, publish) {
  const base = [], history = [], failed = new Set();
  const farmNames = new Map(farms.filter(f => f.id != null).map(f => [String(f.id), f.name || "Unnamed farm"]));
  const fieldContexts = new Map(), plantingContexts = new Map();
  const knownFarms = [...farmNames.keys()];
  const jobs = [];
  const add = (rows, item) => { if (item.id !== "undefined" && item.id !== "null") rows.push(item); };
  for (const [id, name] of farmNames) add(base, record("Farms", "Farms", "farm", id, name, "Farm directory", Tractor, { farmId: id }));
  async function runJobs(tasks) {
    for (let offset = 0; offset < tasks.length && isCurrent(); offset += 6) {
      await Promise.all(tasks.slice(offset, offset + 6).map(async ({ label, run }) => {
        try { await run(); } catch { failed.add(label); }
      }));
    }
  }
  for (const farmId of knownFarms) {
    const farmName = farmNames.get(farmId);
    jobs.push({ label: "fields", run: async () => {
      for (const f of list(await fieldApi.getByFarm(farmId))) {
        if (f.id == null) continue;
        fieldContexts.set(String(f.id), { farmId, farmName, fieldName: f.fieldName || "Field" });
        add(base, record("Fields", "Fields", "field", f.id, f.fieldName || "Field", farmName, MapPinned, { farmId }));
      }
    }});
    jobs.push({ label: "crop types", run: async () => {
      for (const t of list(await cropTypeApi.getAll(farmId))) {
        add(base, record("Crop types", "Crop management", "type", t.id, t.name, farmName, Leaf, { farmId, keywords: t.description }));
      }
    }});
  }
  let allPlantings = [];
  if (knownFarms.length) jobs.push({ label: "crop plantings", run: async () => { allPlantings = list(await cropPlantingApi.getAll()); }});
  await runJobs(jobs);
  if (!isCurrent()) return;
  for (const p of allPlantings) {
    const context = fieldContexts.get(String(p.fieldId));
    if (!context || p.id == null) continue;
    const plantingId = String(p.id), cropName = p.cropTypeName || "Crop planting";
    plantingContexts.set(plantingId, { ...context, plantingId, cropName, plantedOn: p.plantedOn });
    add(base, record("Crop plantings", "Crop management", "planting", p.id, cropName, join(context.farmName, context.fieldName, p.plantedOn), Sprout, { farmId: context.farmId, plantingId, keywords: words(p.status) }));
  }
  publish({ entries: [...base], loading: true, failures: [...failed] });

  const deepJobs = [];
  for (const [farmId, farmName] of farmNames) {
    deepJobs.push({ label: "expenses", run: async () => {
      for (const e of list(await expenseApi.getByFarm(farmId))) {
        const context = plantingContexts.get(String(e.cropPlantingId));
        add(history, record("Expenses", "Expenses", "expense", e.id, e.description || "Expense", join(farmName, context?.cropName, words(e.category), e.expenseDate), Wallet, { farmId, keywords: join(e.amount, e.voided ? "Cancelled" : "Active", context?.fieldName) }));
      }
    }});
  }
  for (const [plantingId, p] of plantingContexts) {
    deepJobs.push({ label: "activities", run: async () => {
      for (const a of list(await cropActivityApi.getByPlanting(plantingId))) {
        add(history, record("Activities", "Activities", "activity", a.id, a.dailyActivity || "Activity", join(p.cropName, p.farmName, p.fieldName, "Day " + a.dayNumber), ClipboardList, { farmId: p.farmId, plantingId, keywords: join(words(a.cropStage), words(a.status), a.notes, a.nutritionAndWaterManagement, a.pestAndDiseaseControl) }));
      }
    }});
    deepJobs.push({ label: "harvest records", run: async () => {
      for (const h of list(await harvestApi.getByPlanting(plantingId))) {
        add(history, record("Harvest records", "Harvest records", "harvest", h.id, p.cropName + " harvest", join(p.farmName, p.fieldName, h.harvestDate, h.quantity, words(h.unit)), PackageCheck, { farmId: p.farmId, plantingId, keywords: join(h.notes, h.voided ? "Cancelled" : "Active") }));
      }
    }});
  }
  deepJobs.push({ label: "notifications", run: async () => {
    const seen = new Set(), size = 100;
    for (let page = 0; page < 10 && isCurrent(); page++) {
      const rows = list(await notificationApi.getAll(false, page, size));
      let added = 0;
      for (const n of rows) {
        if (n.id == null || seen.has(String(n.id))) continue;
        seen.add(String(n.id)); added++;
        add(history, record("Notifications", "Notifications", "notification", n.id, n.title || "Notification", join(words(n.eventType), n.eventDate), Bell, { keywords: n.read ? "Read" : "Unread" }));
      }
      if (rows.length < size) return;
      if (!added) throw new Error("Repeated notification page");
    }
    if (isCurrent()) failed.add("older notifications (search limited to 1,000)");
  }});
  await runJobs(deepJobs);
  if (isCurrent()) publish({ entries: [...base, ...history], loading: false, failures: [...failed] });
}

function SearchPanel({ farms, farmsLoading, farmsError, onChoose, onRetryFarms }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loadRecords, setLoadRecords] = useState(false);
  const [retry, setRetry] = useState(0);
  const [index, setIndex] = useState({ entries: [], loading: false, failures: [] });
  const farmKey = JSON.stringify(farms.filter(f => f.id != null).map(f => [String(f.id), f.name || "Unnamed farm"]).sort((a, b) => a[0].localeCompare(b[0])));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = normalize(query);
      setDebounced(next);
      if (next.length >= 2) setLoadRecords(true);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!loadRecords || farmsLoading) return;
    let current = true;
    const timer = window.setTimeout(() => {
      setIndex({ entries: [], loading: true, failures: [] });
      const snapshot = JSON.parse(farmKey).map(([id, name]) => ({ id, name }));
      loadSearchRecords(snapshot, () => current, setIndex).catch(() => {
        if (current) setIndex(previous => ({ ...previous, loading: false, failures: [...previous.failures, "workspace records"] }));
      });
    }, 0);
    return () => { current = false; window.clearTimeout(timer); };
  }, [loadRecords, farmsLoading, farmKey, retry]);

  const results = useMemo(() => {
    const term = normalize(query);
    if (!term) return pages;
    const tokens = term.split(/\s+/);
    const candidates = [...pages, ...(debounced.length >= 2 ? index.entries : [])];
    const seen = new Set();
    return candidates.filter(item => {
      if (seen.has(item.key)) return false;
      seen.add(item.key);
      const text = normalize(join(item.title, item.detail, item.group, item.keywords));
      return tokens.every(token => text.includes(token));
    }).sort((a, b) => Number(normalize(b.title).startsWith(term)) - Number(normalize(a.title).startsWith(term)) || a.title.localeCompare(b.title));
  }, [query, debounced, index.entries]);
  const searching = normalize(query).length >= 2 && (debounced !== normalize(query) || !loadRecords || farmsLoading || index.loading);

  return (
    <Command shouldFilter={false} loop label="Workspace search" className="ifc-workspace-command">
      <div className="ifc-search-heading">
        <CommandInput autoFocus value={query} onValueChange={setQuery} placeholder="Search pages, farms, fields, crops…" aria-label="Search workspace" />
        {query && <button type="button" className="ifc-search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}
        <DialogClose asChild><button type="button" className="ifc-search-escape" aria-label="Close search">Esc</button></DialogClose>
      </div>
      <CommandList className="ifc-search-results">
        {groups.map(group => {
          const matches = results.filter(item => item.group === group);
          if (!matches.length) return null;
          return <CommandGroup key={group} heading={!query.trim() && group === "Pages" ? "Quick navigation" : group}>
            {matches.slice(0, 10).map(item => {
              const Icon = item.icon;
              return <CommandItem key={item.key} value={item.key} onSelect={() => onChoose(item)}>
                <span className="ifc-search-result-icon"><Icon size={16} aria-hidden="true" /></span>
                <span className="ifc-search-result-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                <ArrowUpRight size={14} className="ifc-search-result-arrow" aria-hidden="true" />
              </CommandItem>;
            })}
            {matches.length > 10 && <div className="ifc-search-group-hint">Showing 10 of {matches.length} matches. Refine your search.</div>}
          </CommandGroup>;
        })}
        {searching && <div className="ifc-search-state" role="status">Searching your workspace…</div>}
        {!searching && query.trim() && results.length === 0 && <div className="ifc-search-state"><Search size={24} /><strong>No matching results</strong><span>{query.trim().length < 2 ? "Enter at least two characters to search records." : "Try a different name or keyword."}</span></div>}
        {!searching && query.trim().length >= 2 && (farmsError || index.failures.length > 0) && <div className="ifc-search-warning" role="status"><span>Some results may be missing{index.failures.length ? ": " + index.failures.join(", ") : "."}</span><button type="button" className="button-secondary" onClick={() => { if (farmsError) onRetryFarms?.().catch(() => {}); setRetry(value => value + 1); }}>Retry</button></div>}
      </CommandList>
      <div className="ifc-search-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
    </Command>
  );
}

export default function WorkspaceSearch({ farms, farmsLoading, farmsError, onChoose, onOpen, onRetryFarms }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const shortcut = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ? "⌘ K" : "Ctrl K";
  function changeOpen(next) {
    setOpen(next);
    if (next) onOpen?.();
  }
  useEffect(() => {
    function keydown(event) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k" || event.repeat) return;
      if (!open && document.querySelector('[role="dialog"][aria-modal="true"], .modal-overlay, .ifc-confirm-overlay')) return;
      event.preventDefault();
      setOpen(value => !value);
      if (!open) onOpen?.();
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [open, onOpen]);
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button ref={triggerRef} type="button" className="global-search ifc-global-search-trigger" aria-label="Search workspace" aria-keyshortcuts="Control+K Meta+K" data-tooltip="Search workspace">
          <Search size={16} aria-hidden="true" /><span>Search workspace…</span><kbd>{shortcut}</kbd>
        </button>
      </DialogTrigger>
      <DialogContent className="ifc-workspace-search-dialog" showCloseButton={false}>
        <DialogTitle className="sr-only">Workspace search</DialogTitle>
        <DialogDescription className="sr-only">Find pages and records across your farms.</DialogDescription>
        {open && <SearchPanel farms={farms} farmsLoading={farmsLoading} farmsError={farmsError} onRetryFarms={onRetryFarms} onChoose={item => { setOpen(false); onChoose(item); }} />}
      </DialogContent>
    </Dialog>
  );
}
