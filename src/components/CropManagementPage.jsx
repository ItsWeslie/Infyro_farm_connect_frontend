import { useEffect, useMemo, useState } from "react";
import UseAnimations from "react-useanimations";
import edit from "react-useanimations/lib/edit";
import trash2 from "react-useanimations/lib/trash2";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Info,
  Leaf,
  MapPinned,
  Plus,
  Search,
  Sprout,
  X,
} from "lucide-react";
import { SkeletonBlock } from "./ui/Skeleton";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { DatePicker } from "./ui/calendar";
import { Alert, AlertDescription } from "./ui/alert";

import ActivityPlantingSelector from "./ActivityPlantingSelector";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "./ui/pagination";
import {
  cropActivityApi,
  cropPlantingApi,
  cropTypeApi,
  fieldApi,
} from "../api/client";

const CROPS_PER_PAGE = 5;

function cropPageItems(page, totalPages) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((value, index) =>
    index > 0 && value - pages[index - 1] > 1 ? [`gap-${value}`, value] : [value]
  );
}

const PLANTING_TRANSITIONS = {
  PLANNED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["HARVESTING", "COMPLETED", "CANCELLED"],
  HARVESTING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const ACTIVITY_TRANSITIONS = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const CROP_STAGES = [
  "LAND_PREPARATION",
  "SOWING_OR_TRANSPLANTING",
  "GERMINATION",
  "VEGETATIVE_GROWTH",
  "FLOWERING",
  "FRUITING_OR_GRAIN_FILLING",
  "MATURITY",
  "HARVEST",
  "OTHER",
];

const INITIAL_PLANTING_FORM = {
  fieldId: "",
  cropTypeId: "",
  cropArea: "",
  plantedOn: "",
  expectedHarvestOn: "",
  maturityTimeInDays: "",
};

const INITIAL_TYPE_FORM = {
  name: "",
  description: "",
  defaultMaturityTimeInDays: "",
};

const INITIAL_ACTIVITY_FORM = {
  dayNumber: "1",
  cropStage: "",
  dailyActivity: "",
  nutritionAndWaterManagement: "",
  pestAndDiseaseControl: "",
  notes: "",
  status: "PLANNED",
};

function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function numberLabel(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "—";
}

function dateLabel(value) {
  if (!value) return "Not set";
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function humanize(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function StatusPill({ status }) {
  const tone = status === "COMPLETED" || status === "ACTIVE" || status === "IN_PROGRESS"
    ? "status-growing"
    : status === "HARVESTING"
      ? "status-ready"
      : "status-planned";
  return <span className={"status-pill " + tone}><i />{humanize(status)}</span>;
}

function FieldSelect({ fields, value, onChange, disabled = false }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled} required>
      <SelectTrigger id="planting-field" className="ifc-form-select"><SelectValue placeholder="Choose a field" /></SelectTrigger>
      <SelectContent align="start">
        {fields.map((field) => <SelectItem key={field.id} value={String(field.id)}>{field.fieldName} · {numberLabel(field.availableArea)} available</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function FarmFormSelect({ id, farms, value, onChange, disabled }) {
  return <div className="form-label"><label htmlFor={id}>Farm</label><Select required value={value} disabled={disabled} onValueChange={onChange}><SelectTrigger id={id} className="ifc-form-select"><SelectValue placeholder="Choose a farm" /></SelectTrigger><SelectContent align="start">{farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}</SelectContent></Select></div>;
}

export default function CropManagementPage({
  active,
  farms,
  farmsLoading = false,
  farmsError = "",
  refreshFarms,
  onNavigate,
  notify,
}) {
  const confirmDialog = useConfirmDialog();
  const [cropData, setCropData] = useState({ key: null, fields: [], types: [], plantings: [], warnings: [], failedFields: [], failedTypes: [], plantingsFailed: false });
  const [farmFilter, setFarmFilter] = useState("ALL");
  const [typeFarmId, setTypeFarmId] = useState("");
  const [plantingFarmId, setPlantingFarmId] = useState("");
  const [pendingStatusChanges, setPendingStatusChanges] = useState(0);
  const [pageError, setPageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [section, setSection] = useState("plantings");
  const [cropPage, setCropPage] = useState(1);

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState(INITIAL_TYPE_FORM);
  const [typeError, setTypeError] = useState("");
  const [typeSaving, setTypeSaving] = useState(false);

  const [plantingDialogOpen, setPlantingDialogOpen] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState(null);
  const [plantingForm, setPlantingForm] = useState(INITIAL_PLANTING_FORM);
  const [plantingError, setPlantingError] = useState("");
  const [plantingSaving, setPlantingSaving] = useState(false);

  const [activityPage, setActivityPage] = useState(1);
  const [activityPlantingFilter, setActivityPlantingFilter] = useState("ALL");
  const [activityFormPlantingId, setActivityFormPlantingId] = useState("");
  const [failedActivityPlantings, setFailedActivityPlantings] = useState([]);
  const [activityPlantingData, setActivityPlantingData] = useState({ key: null, entries: [], error: "" });
  const [loadedActivityKey, setLoadedActivityKey] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityReload, setActivityReload] = useState(0);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm, setActivityForm] = useState(INITIAL_ACTIVITY_FORM);
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityFormError, setActivityFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const isActivities = active === "Activities";
  const activityFarmIds = JSON.stringify([...new Set(farms.filter((farm) => farm.id != null).map((farm) => String(farm.id)))].sort());
  const activityPlantingKey = JSON.stringify([activityFarmIds, reloadKey]);
  const activityPlantingsPending = isActivities && (farmsLoading || activityPlantingData.key !== activityPlantingKey);
  const cropDataKey = JSON.stringify([activityFarmIds, reloadKey]);
  const farmDataPending = !isActivities && cropData.key !== cropDataKey;
  const fields = useMemo(() => farmDataPending ? [] : cropData.fields, [farmDataPending, cropData.fields]);
  const cropTypes = useMemo(() => farmDataPending ? [] : cropData.types, [farmDataPending, cropData.types]);
  const plantings = useMemo(() => farmDataPending ? [] : cropData.plantings, [farmDataPending, cropData.plantings]);
  const farmNames = useMemo(() => new Map(farms.map((farm) => [String(farm.id), farm.name || "Unnamed farm"])), [farms]);
  const currentFarmFilter = farmFilter === "ALL" || farmNames.has(farmFilter) ? farmFilter : "ALL";
  const warnings = farmDataPending ? [] : cropData.warnings;
  const switchDisabled = typeDialogOpen || plantingDialogOpen || activityDialogOpen || typeSaving || plantingSaving || activitySaving || deletingId !== null || pendingStatusChanges > 0;
  const defaultFarmId = currentFarmFilter !== "ALL" ? currentFarmFilter : farms.length === 1 ? String(farms[0].id) : "";
  const plantingFields = fields.filter((field) => field.farmId === plantingFarmId);
  const plantingTypes = cropTypes.filter((type) => type.farmId === plantingFarmId);
  const plantingField = plantingFields.find((field) => String(field.id) === plantingForm.fieldId);
  const plantingAreaLimit = plantingField ? Number(plantingField.availableArea) + (editingPlanting ? Number(editingPlanting.cropArea) : 0) : null;
  const canCreatePlanting = fields.some((field) => cropTypes.some((type) => type.farmId === field.farmId));

  function farmStat(value) {
    return farmDataPending ? "…" : value;
  }

  function statDetail(detail) {
    return warnings.length ? "Partial data · " + detail : detail;
  }

  useEffect(() => {
    if (isActivities) return undefined;
    let current = true;
    const ids = JSON.parse(activityFarmIds);
    setPageError("");
    if (!ids.length) {
      setCropData({ key: cropDataKey, fields: [], types: [], plantings: [], warnings: [], failedFields: [], failedTypes: [], plantingsFailed: false });
      return undefined;
    }
    Promise.all([
      Promise.allSettled(ids.map((id) => fieldApi.getByFarm(id))),
      Promise.allSettled(ids.map((id) => cropTypeApi.getAll(id))),
      Promise.allSettled([cropPlantingApi.getAll()]),
    ]).then(([fieldResults, typeResults, plantingResults]) => {
      if (!current) return;
      const fields = [], types = [], warnings = [], failedFields = [], failedTypes = [];
      fieldResults.forEach((result, index) => {
        if (result.status === "fulfilled") toList(result.value).forEach((field) => fields.push({ ...field, farmId: ids[index] }));
        else { failedFields.push(ids[index]); warnings.push("fields"); }
      });
      typeResults.forEach((result, index) => {
        if (result.status === "fulfilled") toList(result.value).forEach((type) => types.push({ ...type, farmId: ids[index] }));
        else { failedTypes.push(ids[index]); warnings.push("crop types"); }
      });
      const plantingsFailed = plantingResults[0].status === "rejected";
      if (plantingsFailed) warnings.push("plantings");
      const contexts = new Map(fields.map((field) => [String(field.id), field.farmId]));
      const plantings = plantingsFailed ? [] : toList(plantingResults[0].value).flatMap((planting) => {
        const farmId = contexts.get(String(planting.fieldId));
        return farmId ? [{ ...planting, farmId }] : [];
      });
      setCropData({ key: cropDataKey, fields, types, plantings, warnings, failedFields, failedTypes, plantingsFailed });
    }).catch(() => {
      if (current) setCropData({ key: cropDataKey, fields: [], types: [], plantings: [], warnings: ["crop management data"], failedFields: ids, failedTypes: ids, plantingsFailed: true });
    });
    return () => { current = false; };
  }, [isActivities, activityFarmIds, cropDataKey]);

  const fieldById = useMemo(
    () => new Map(fields.map((field) => [String(field.id), field])),
    [fields],
  );

  const farmPlantings = useMemo(
    () => plantings.filter((planting) => fieldById.has(String(planting.fieldId))),
    [plantings, fieldById],
  );

  // Activities are independent of the globally selected farm.
  useEffect(() => {
    if (!isActivities || farmsLoading) return undefined;
    let current = true;
    const ids = JSON.parse(activityFarmIds);
    if (!ids.length) {
      setActivityPlantingData({ key: activityPlantingKey, entries: [], error: "" });
      return undefined;
    }

    Promise.all([
      cropPlantingApi.getAll(),
      Promise.allSettled(ids.map((id) => fieldApi.getByFarm(id))),
    ]).then(([plantingResponse, fieldResults]) => {
      if (!current) return;
      const contexts = new Map();
      fieldResults.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        toList(result.value).forEach((field) => {
          contexts.set(String(field.id), { farmId: ids[index], field });
        });
      });
      const entries = toList(plantingResponse).flatMap((planting) => {
        const context = contexts.get(String(planting.fieldId));
        return context ? [{ planting, ...context }] : [];
      });
      const failed = fieldResults.filter((result) => result.status === "rejected").length;
      setActivityPlantingData({
        key: activityPlantingKey,
        entries,
        error: failed ? "Unable to load fields for some farms. Only available plantings are shown." : "",
      });
    }).catch((error) => {
      if (!current) return;
      setActivityPlantingData({ key: activityPlantingKey, entries: [], error: error.message || "Unable to load plantings." });
    });
    return () => { current = false; };
  }, [isActivities, activityFarmIds, activityPlantingKey, farmsLoading]);

  const activityPlantingOptions = useMemo(() => {
    if (activityPlantingsPending) return [];
    const names = new Map(farms.map((farm) => [String(farm.id), farm.name]));
    return activityPlantingData.entries.map(({ planting, farmId: entryFarmId, field }) => ({
      id: String(planting.id),
      planting,
      farmId: entryFarmId,
      farmName: names.get(entryFarmId) || "Unnamed farm",
      fieldName: field.fieldName || "Field",
      cropName: planting.cropTypeName || "Crop",
      plantedOn: dateLabel(planting.plantedOn),
      status: humanize(planting.status),
    })).sort((a, b) => a.farmName.localeCompare(b.farmName) || a.cropName.localeCompare(b.cropName) || a.fieldName.localeCompare(b.fieldName) || a.id.localeCompare(b.id));
  }, [activityPlantingData.entries, activityPlantingsPending, farms]);

  const activityOptionById = useMemo(() => new Map(activityPlantingOptions.map((option) => [option.id, option])), [activityPlantingOptions]);
  const selectedActivityOption = activityOptionById.get(activityFormPlantingId) || null;
  const filteredActivityOptions = activityPlantingOptions.filter((option) => currentFarmFilter === "ALL" || option.farmId === currentFarmFilter);
  const currentActivityPlantingFilter = filteredActivityOptions.some((option) => option.id === activityPlantingFilter) ? activityPlantingFilter : "ALL";
  const activityRequestKey = JSON.stringify([activityPlantingKey, activityReload]);
  const activityLogsPending = isActivities && (activityPlantingsPending || activitiesLoading || loadedActivityKey !== activityRequestKey);
  const activityPartial = Boolean(farmsError || activityPlantingData.error || failedActivityPlantings.length);

  function activityStatDetail(detail) {
    return activityPartial && !activityLogsPending ? "Partial data · " + detail : detail;
  }

  function selectActivityPlanting(id) {
    if (activitySaving || editingActivity || !activityOptionById.has(id)) return;
    setActivityFormPlantingId(id);
    const nextDay = failedActivityPlantings.includes(id) ? 1 : activities.reduce((max, item) => String(item.cropPlantingId) === id ? Math.max(max, Number(item.dayNumber) || 0) : max, 0) + 1;
    setActivityForm((current) => ({ ...current, dayNumber: String(nextDay) }));
    setActivityFormError("");
  }

  useEffect(() => {
    if (!isActivities || activityPlantingsPending) return undefined;
    let current = true;
    const entries = activityPlantingData.entries;
    setActivitiesLoading(true);
    setActivityError("");
    async function loadActivities() {
      const records = [], failures = [];
      for (let start = 0; start < entries.length; start += 8) {
        const batch = entries.slice(start, start + 8);
        const results = await Promise.allSettled(batch.map(({ planting }) => cropActivityApi.getByPlanting(planting.id)));
        if (!current) return;
        results.forEach((result, index) => {
          const { planting, farmId } = batch[index];
          if (result.status === "rejected") failures.push(String(planting.id));
          else toList(result.value).forEach((item) => records.push({ ...item, cropPlantingId: planting.id, farmId }));
        });
      }
      if (!current) return;
      records.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || Number(b.id) - Number(a.id));
      setActivities(records);
      setFailedActivityPlantings(failures);
      setLoadedActivityKey(activityRequestKey);
      setActivitiesLoading(false);
    }
    loadActivities().catch(() => {
      if (!current) return;
      setActivities([]);
      setFailedActivityPlantings(entries.map(({ planting }) => String(planting.id)));
      setLoadedActivityKey(activityRequestKey);
      setActivitiesLoading(false);
    });
    return () => { current = false; };
  }, [isActivities, activityPlantingsPending, activityPlantingData.entries, activityRequestKey]);

  useEffect(() => {
    setSearch("");
    setStatusFilter("ALL");
    setFarmFilter("ALL");
    setActivityPlantingFilter("ALL");
    setActivityDialogOpen(false);
    if (active === "Crop management") setSection("plantings");
    setTypeDialogOpen(false);
    setPlantingDialogOpen(false);
  }, [active]);

  const filteredPlantings = useMemo(() => {
    const normalized = search.toLowerCase();
    return farmPlantings.filter((planting) => {
      const field = fieldById.get(String(planting.fieldId));
      const matchesSearch = [
        planting.cropTypeName,
        field?.fieldName,
        farmNames.get(planting.farmId),
        planting.status,
        planting.plantedOn,
      ].join(" ").toLowerCase().includes(normalized);
      return matchesSearch && (currentFarmFilter === "ALL" || planting.farmId === currentFarmFilter) && (statusFilter === "ALL" || planting.status === statusFilter);
    });
  }, [farmPlantings, fieldById, search, statusFilter, farmNames, currentFarmFilter]);

  const filteredTypes = useMemo(() => cropTypes.filter((cropType) => (
    (currentFarmFilter === "ALL" || cropType.farmId === currentFarmFilter) && [cropType.name, cropType.description, farmNames.get(cropType.farmId)].join(" ").toLowerCase().includes(search.toLowerCase())
  )), [cropTypes, search, farmNames, currentFarmFilter]);

  const isCropLibrary = section === "types";
  const filteredCropCount = isCropLibrary ? filteredTypes.length : filteredPlantings.length;
  const cropPageCount = Math.max(1, Math.ceil(filteredCropCount / CROPS_PER_PAGE));
  const currentCropPage = Math.min(cropPage, cropPageCount);
  const cropPageStart = (currentCropPage - 1) * CROPS_PER_PAGE;
  const paginatedTypes = filteredTypes.slice(cropPageStart, cropPageStart + CROPS_PER_PAGE);
  const paginatedPlantings = filteredPlantings.slice(cropPageStart, cropPageStart + CROPS_PER_PAGE);

  const filteredActivities = useMemo(() => {
    if (activityLogsPending) return [];
    const query = search.trim().toLowerCase();
    return activities.filter((item) => {
      const option = activityOptionById.get(String(item.cropPlantingId));
      return (currentFarmFilter === "ALL" || item.farmId === currentFarmFilter)
        && (currentActivityPlantingFilter === "ALL" || String(item.cropPlantingId) === currentActivityPlantingFilter)
        && (statusFilter === "ALL" || item.status === statusFilter)
        && [item.dailyActivity, item.cropStage, humanize(item.cropStage), item.status, humanize(item.status), item.dayNumber, item.createdAt, item.notes, item.nutritionAndWaterManagement, item.pestAndDiseaseControl, option?.cropName, option?.farmName, option?.fieldName].join(" ").toLowerCase().includes(query);
    });
  }, [activities, activityLogsPending, activityOptionById, currentFarmFilter, currentActivityPlantingFilter, statusFilter, search]);
  const activityPageCount = Math.max(1, Math.ceil(filteredActivities.length / CROPS_PER_PAGE));
  const currentActivityPage = Math.min(activityPage, activityPageCount);
  const activityPageStart = (currentActivityPage - 1) * CROPS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(activityPageStart, activityPageStart + CROPS_PER_PAGE);

  useEffect(() => {
    setActivityPage(1);
  }, [active, currentFarmFilter, currentActivityPlantingFilter, statusFilter, search]);

  useEffect(() => {
    if (isActivities && !activityPlantingsPending && !activityLogsPending) {
      setActivityPage((page) => Math.min(page, activityPageCount));
    }
  }, [isActivities, activityPlantingsPending, activityLogsPending, activityPageCount]);

  const tablePending = isActivities ? activityPlantingsPending || activityLogsPending : farmDataPending;
  const tableCount = isActivities ? filteredActivities.length : filteredCropCount;
  const tablePage = isActivities ? currentActivityPage : currentCropPage;
  const tablePageCount = isActivities ? activityPageCount : cropPageCount;
  const tablePageStart = isActivities ? activityPageStart : cropPageStart;
  const setTablePage = isActivities ? setActivityPage : setCropPage;

  useEffect(() => {
    setCropPage(1);
  }, [currentFarmFilter, active, section, search, statusFilter]);

  useEffect(() => {
    if (!farmDataPending && active !== "Activities") {
      setCropPage((page) => Math.min(page, cropPageCount));
    }
  }, [farmDataPending, active, cropPageCount]);

  const activePlantings = farmPlantings.filter((planting) => (
    ["ACTIVE", "HARVESTING"].includes(planting.status)
  )).length;

  function refreshData() {
    setReloadKey((value) => value + 1);
  }

  function openCreateType() {
    setEditingType(null);
    setTypeFarmId(defaultFarmId);
    setTypeForm(INITIAL_TYPE_FORM);
    setTypeError("");
    setTypeDialogOpen(true);
  }

  function openEditType(cropType) {
    setEditingType(cropType);
    setTypeFarmId(cropType.farmId);
    setTypeForm({
      name: cropType.name || "",
      description: cropType.description || "",
      defaultMaturityTimeInDays: cropType.defaultMaturityTimeInDays == null
        ? ""
        : String(cropType.defaultMaturityTimeInDays),
    });
    setTypeError("");
    setTypeDialogOpen(true);
  }

  async function submitType(event) {
    event.preventDefault();
    if (!typeForm.name.trim() || typeSaving) return;
    if (!farmNames.has(typeFarmId) || (editingType && editingType.farmId !== typeFarmId)) { setTypeError("Choose a valid farm."); return; }
    const maturityDays = typeForm.defaultMaturityTimeInDays
      ? Number(typeForm.defaultMaturityTimeInDays)
      : null;
    if (maturityDays !== null && (!Number.isInteger(maturityDays) || maturityDays <= 0)) {
      setTypeError("Default maturity must be a positive whole number of days.");
      return;
    }
    setTypeSaving(true);
    setTypeError("");
    const payload = {
      name: typeForm.name.trim(),
      description: typeForm.description.trim() || null,
      defaultMaturityTimeInDays: maturityDays,
    };
    try {
      if (editingType) await cropTypeApi.update(typeFarmId, editingType.id, payload);
      else await cropTypeApi.create(typeFarmId, payload);
      refreshData();
      setTypeDialogOpen(false);
      setEditingType(null);
      setTypeForm(INITIAL_TYPE_FORM);
      notify(editingType ? "Crop type updated" : "Crop type created");
    } catch (error) {
      notify(error.message || "Unable to save this crop type.", "error");
      setTypeError(error.message || "Unable to save this crop type.");
    } finally {
      setTypeSaving(false);
    }
  }

  async function deleteType(cropType) {
    if (cropData.plantingsFailed || cropData.failedFields.includes(cropType.farmId)) { setPageError("Planting usage is unavailable. Retry before deleting a crop type."); return; }
    const inUse = farmPlantings.some((planting) => String(planting.cropTypeId) === String(cropType.id));
    if (inUse) {
      setPageError("This crop type is already used by a planting and cannot be deleted.");
      return;
    }
    const confirmed = await confirmDialog({ title: "Delete crop type?", message: `Delete “${cropType.name}”?`, details: "This crop type will be removed from this farm and cannot be recovered.", confirmLabel: "Delete crop type", tone: "danger" });
    if (!confirmed) return;
    setDeletingId("type-" + cropType.id);
    setPageError("");
    try {
      await cropTypeApi.delete(cropType.farmId, cropType.id);
      refreshData();
      notify("Crop type deleted");
    } catch (error) {
      notify(error.message || "Unable to delete this crop type.", "error");
      setPageError(error.message || "Unable to delete this crop type.");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreatePlanting() {
    setEditingPlanting(null);
    setPlantingFarmId(defaultFarmId);
    setPlantingForm({ ...INITIAL_PLANTING_FORM, plantedOn: todayIso() });
    setPlantingError("");
    setPlantingDialogOpen(true);
  }

  function openEditPlanting(planting) {
    setEditingPlanting(planting);
    setPlantingFarmId(planting.farmId);
    setPlantingForm({
      fieldId: String(planting.fieldId),
      cropTypeId: String(planting.cropTypeId),
      cropArea: String(planting.cropArea),
      plantedOn: planting.plantedOn || "",
      expectedHarvestOn: planting.expectedHarvestOn || "",
      maturityTimeInDays: planting.maturityTimeInDays == null
        ? ""
        : String(planting.maturityTimeInDays),
    });
    setPlantingError("");
    setPlantingDialogOpen(true);
  }

  async function submitPlanting(event) {
    event.preventDefault();
    setPlantingError("");
    const cropType = plantingTypes.find((item) => String(item.id) === String(plantingForm.cropTypeId));
    if (!farmNames.has(plantingFarmId) || !plantingField || (editingPlanting && editingPlanting.farmId !== plantingFarmId)) { setPlantingError("Choose a field belonging to the selected farm."); return; }
    const area = Number(plantingForm.cropArea);
    const maturity = plantingForm.maturityTimeInDays
      ? Number(plantingForm.maturityTimeInDays)
      : null;

    if (!cropType) {
      setPlantingError("Choose a crop type for this planting.");
      return;
    }
    if (!Number.isFinite(area) || area < 0.01) {
      setPlantingError("Crop area must be at least 0.01.");
      return;
    }
    if (plantingAreaLimit !== null && Number.isFinite(plantingAreaLimit) && area > plantingAreaLimit + 1e-9) { setPlantingError("Crop area cannot exceed the available field area."); return; }
    if (!plantingForm.plantedOn) {
      setPlantingError("Choose the planting date.");
      return;
    }
    // Existing historical plantings remain editable without changing their original date.
    if (plantingForm.plantedOn < todayIso() && plantingForm.plantedOn !== editingPlanting?.plantedOn) {
      setPlantingError("Planting date must be today or a future date.");
      return;
    }
    if (plantingForm.expectedHarvestOn && plantingForm.expectedHarvestOn < plantingForm.plantedOn) {
      setPlantingError("Expected harvest date cannot be before the planting date.");
      return;
    }
    if (maturity !== null && (!Number.isInteger(maturity) || maturity <= 0)) {
      setPlantingError("Maturity time must be a positive whole number of days.");
      return;
    }
    if ((!maturity || maturity <= 0) && !cropType.defaultMaturityTimeInDays) {
      setPlantingError("Enter maturity days or configure a default for this crop type.");
      return;
    }

    const payload = {
      cropTypeId: Number(plantingForm.cropTypeId),
      cropArea: area,
      plantedOn: plantingForm.plantedOn,
      expectedHarvestOn: plantingForm.expectedHarvestOn || null,
      maturityTimeInDays: maturity,
    };
    setPlantingSaving(true);
    try {
      if (!editingPlanting && !plantingForm.fieldId) throw new Error("Choose a field before creating a planting.");
      if (editingPlanting) await cropPlantingApi.update(editingPlanting.id, payload);
      else await cropPlantingApi.create(Number(plantingForm.fieldId), payload);
      refreshData();
      setPlantingDialogOpen(false);
      setEditingPlanting(null);
      notify(editingPlanting ? "Planting updated" : "Planting created");
    } catch (error) {
      notify(error.message || "Unable to save this planting.", "error");
      setPlantingError(error.message || "Unable to save this planting.");
    } finally {
      setPlantingSaving(false);
    }
  }

  async function changePlantingStatus(planting, nextStatus) {
    if (!nextStatus) return;
    setPendingStatusChanges((count) => count + 1);
    setPageError("");
    try {
      await cropPlantingApi.updateStatus(planting.id, nextStatus);
      refreshData();
      notify("Planting status changed to " + humanize(nextStatus));
    } catch (error) {
      notify(error.message || "Unable to change planting status.", "error");
      setPageError(error.message || "Unable to change planting status.");
    } finally {
      setPendingStatusChanges((count) => count - 1);
    }
  }

  async function deletePlanting(planting) {
    const confirmed = await confirmDialog({ title: "Delete this planting?", message: `Delete the ${planting.cropTypeName} planting?`, details: "Only planned plantings can be deleted. This action cannot be undone.", confirmLabel: "Delete planting", tone: "danger" });
    if (!confirmed) return;
    setDeletingId("planting-" + planting.id);
    setPageError("");
    try {
      await cropPlantingApi.delete(planting.id);
      refreshData();
      notify("Planting deleted");
    } catch (error) {
      notify(error.message || "Unable to delete this planting.", "error");
      setPageError(error.message || "Unable to delete this planting.");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateActivity() {
    if (switchDisabled || activityLogsPending || !activityPlantingOptions.length) return;
    setEditingActivity(null);
    const initialId = currentActivityPlantingFilter !== "ALL" ? currentActivityPlantingFilter : filteredActivityOptions.length === 1 ? filteredActivityOptions[0].id : "";
    setActivityFormPlantingId(initialId);
    const nextDay = !initialId || failedActivityPlantings.includes(initialId) ? 1 : activities.reduce((max, item) => String(item.cropPlantingId) === initialId ? Math.max(max, Number(item.dayNumber) || 0) : max, 0) + 1;
    setActivityForm({ ...INITIAL_ACTIVITY_FORM, dayNumber: String(nextDay) });
    setActivityFormError("");
    setActivityDialogOpen(true);
  }

  function openEditActivity(activity) {
    if (switchDisabled || activityLogsPending || ["COMPLETED", "CANCELLED"].includes(activity.status)) return;
    setEditingActivity(activity);
    setActivityFormPlantingId(String(activity.cropPlantingId));
    setActivityForm({
      dayNumber: String(activity.dayNumber || 1),
      cropStage: activity.cropStage || "",
      dailyActivity: activity.dailyActivity || "",
      nutritionAndWaterManagement: activity.nutritionAndWaterManagement || "",
      pestAndDiseaseControl: activity.pestAndDiseaseControl || "",
      notes: activity.notes || "",
      status: activity.status || "PLANNED",
    });
    setActivityFormError("");
    setActivityDialogOpen(true);
  }

  async function submitActivity(event) {
    event.preventDefault();
    const dayNumber = Number(activityForm.dayNumber);
    if (!Number.isInteger(dayNumber) || dayNumber <= 0) {
      setActivityFormError("Crop-cycle day must be a positive whole number.");
      return;
    }
    if (!selectedActivityOption || (editingActivity && String(editingActivity.cropPlantingId) !== activityFormPlantingId)) {
      setActivityFormError("Choose a planting before adding an activity.");
      return;
    }
    if (!activityForm.dailyActivity.trim()) {
      setActivityFormError("Describe the activity.");
      return;
    }

    const payload = {
      cropPlantingId: Number(activityFormPlantingId),
      dayNumber,
      cropStage: activityForm.cropStage || null,
      dailyActivity: activityForm.dailyActivity.trim(),
      nutritionAndWaterManagement: activityForm.nutritionAndWaterManagement.trim() || null,
      pestAndDiseaseControl: activityForm.pestAndDiseaseControl.trim() || null,
      notes: activityForm.notes.trim() || null,
      status: activityForm.status,
    };
    setActivitySaving(true);
    setActivityFormError("");
    try {
      if (editingActivity) await cropActivityApi.update(editingActivity.id, payload);
      else await cropActivityApi.create(payload);
      setActivityReload((value) => value + 1);
      setActivityDialogOpen(false);
      setEditingActivity(null);
      notify(editingActivity ? "Activity updated" : "Activity logged");
    } catch (error) {
      notify(error.message || "Unable to save this activity.", "error");
      setActivityFormError(error.message || "Unable to save this activity.");
    } finally {
      setActivitySaving(false);
    }
  }

  async function changeActivityStatus(activity, nextStatus) {
    if (switchDisabled || activityLogsPending || !ACTIVITY_TRANSITIONS[activity.status]?.includes(nextStatus)) return;
    setPendingStatusChanges((count) => count + 1);
    setActivityError("");
    try {
      await cropActivityApi.updateStatus(activity.id, nextStatus);
      setActivityReload((value) => value + 1);
      notify("Activity status changed to " + humanize(nextStatus));
    } catch (error) {
      notify(error.message || "Unable to change activity status.", "error");
      setActivityError(error.message || "Unable to change activity status.");
    } finally {
      setPendingStatusChanges((count) => count - 1);
    }
  }

  async function deleteActivity(activity) {
    if (switchDisabled || activityLogsPending || activity.status !== "PLANNED") return;
    const confirmed = await confirmDialog({ title: "Delete this activity?", message: "Delete this planned activity?", details: "The activity will be permanently removed from this planting log.", confirmLabel: "Delete activity", tone: "danger" });
    if (!confirmed) return;
    setDeletingId("activity-" + activity.id);
    setActivityError("");
    try {
      await cropActivityApi.delete(activity.id);
      setActivityReload((value) => value + 1);
      notify("Activity deleted");
    } catch (error) {
      notify(error.message || "Unable to delete this activity.", "error");
      setActivityError(error.message || "Unable to delete this activity.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isActivities && !farms.length) {
    return (
      <section className="workspace-page">
        <div className="page-eyebrow"><span className="eyebrow-pip" /> CROP WORKSPACE</div>
        <div className="empty-state surface-card crop3-no-farm">
          <Sprout size={28} />
          <strong>No farms available</strong>
          <span>Create a farm and at least one field before managing crops.</span>
          <button className="button-primary" type="button" onClick={() => onNavigate("Farms")}>
            Go to farms <ArrowRight size={14} />
          </button>
        </div>
      </section>
    );
  }

  const isTypes = !isActivities && section === "types";

  return (
    <section className="workspace-page">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> {isActivities ? "DAILY FIELD JOURNAL" : "FROM SEED TO HARVEST"}</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon">{isActivities ? <ClipboardList size={23} /> : <Sprout size={23} />}</div>
        <div className="workspace-title-copy">
          <h1>{isActivities ? "Crop activities" : "Crop management"}</h1>
          <p>{isActivities ? "Track and manage daily crop activities across your farms." : "Plan, manage and track crops across your farms."}</p>
        </div>
        {isActivities && (
          <div className="workspace-title-actions crop3-title-actions">
            <button className="button-primary" type="button" onClick={openCreateActivity} disabled={!activityPlantingOptions.length || activityLogsPending || switchDisabled}>
              <Plus size={15} /> Log activity
            </button>
          </div>
        )}
      </div>

      {!isActivities && (
        <div className="crop3-tab-actions-row">
          <div className="crop3-tabs" role="tablist" aria-label="Crop management sections">
            <button type="button" role="tab" aria-selected={!isTypes} className={!isTypes ? "selected" : ""} onClick={() => { setSection("plantings"); setSearch(""); }}>
              <Sprout size={14} /> Crop plantings
            </button>
            <button type="button" role="tab" aria-selected={isTypes} className={isTypes ? "selected" : ""} onClick={() => { setSection("types"); setSearch(""); }}>
              <Leaf size={14} /> Crop types
            </button>
            <span className="crop3-tab-hint">All farms</span>
          </div>
          <div className="crop3-tab-create-action">
            {isTypes ? (
              <button className="button-primary" type="button" onClick={openCreateType} disabled={farmDataPending || switchDisabled}>
                <Plus size={15} /> Add crop type
              </button>
            ) : (
              <button className="button-primary" type="button" onClick={openCreatePlanting} disabled={farmDataPending || switchDisabled || !canCreatePlanting}>
                <Plus size={15} /> Add planting
              </button>
            )}
          </div>
        </div>
      )}

      {!isActivities && !isTypes ? (
        <div className="workspace-stats">
          <Stat label="Plantings" value={farmStat(farmPlantings.length)} detail={statDetail("across all farms")} icon={Sprout} />
          <Stat label="Active crops" value={farmStat(activePlantings)} detail={statDetail("growing or harvesting")} icon={Leaf} />
          <Stat label="Crop types" value={farmStat(cropTypes.length)} detail={statDetail("registered crop types")} icon={ClipboardList} />
          <Stat label="Fields" value={farmStat(fields.length)} detail={statDetail("across all farms")} icon={MapPinned} />
        </div>
      ) : isTypes ? (
        <div className="workspace-stats">
          <Stat label="Crop types" value={farmStat(cropTypes.length)} detail={statDetail("across all farms")} icon={Leaf} />
          <Stat label="With maturity defaults" value={farmStat(cropTypes.filter((item) => item.defaultMaturityTimeInDays).length)} detail={statDetail("ready for quick planting")} icon={CalendarDays} />
          <Stat label="Used by plantings" value={farmStat(new Set(farmPlantings.map((item) => item.cropTypeId)).size)} detail={statDetail("crop varieties in use")} icon={Sprout} />
          <Stat label="Fields" value={farmStat(fields.length)} detail={statDetail("across all farms")} icon={MapPinned} />
        </div>
      ) : (
        <div className="workspace-stats">
          <Stat label="Activity entries" value={activityPlantingsPending || activityLogsPending ? "…" : activities.length} detail={activityStatDetail("across all farms")} icon={ClipboardList} />
          <Stat label="In progress" value={activityPlantingsPending || activityLogsPending ? "…" : activities.filter((item) => item.status === "IN_PROGRESS").length} detail={activityStatDetail("work underway")} icon={Sprout} />
          <Stat label="Completed" value={activityPlantingsPending || activityLogsPending ? "…" : activities.filter((item) => item.status === "COMPLETED").length} detail={activityStatDetail("activities finished")} icon={Check} />
          <Stat label="Planned" value={activityPlantingsPending || activityLogsPending ? "…" : activities.filter((item) => item.status === "PLANNED").length} detail={activityStatDetail("upcoming work")} icon={CalendarDays} />
        </div>
      )}

      <div className={"workspace-data-card surface-card crop3-data-card" + (isActivities ? " crop3-activity-ledger expense4-ledger" : "")}>
        <div className="workspace-data-heading">
          <div>
            <h2 className="crop3-planting-title">
              {isActivities ? <ClipboardList size={14} aria-hidden="true" /> : isTypes ? <Leaf size={14} aria-hidden="true" /> : <Sprout size={14} aria-hidden="true" />}
              {isActivities ? "Activity records" : isTypes ? "Crop type directory" : "Crop plantings"}
            </h2>
            <p>{isActivities ? "View and manage daily crop activity records across all your farms." : isTypes ? "Manage crop varieties registered across your farms." : "View and manage plantings across all your farms."}</p>
          </div>
        </div>

        <div className={"workspace-toolbar" + (isActivities ? " expense4-ledger-toolbar" : "")}>
          <label className="table-search">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isActivities ? "Search activities, crops or fields..." : isTypes ? "Search crop types..." : "Search plantings..."} />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
          </label>
          {<Select value={currentFarmFilter} onValueChange={(value) => { setFarmFilter(value); if (isActivities) setActivityPlantingFilter("ALL"); }} disabled={switchDisabled}>
            <SelectTrigger className="expense4-ledger-filter crop3-farm-filter" aria-label={isActivities ? "Filter activities by farm" : "Filter crops by farm"}><SelectValue /></SelectTrigger>
            <SelectContent align="start"><SelectItem value="ALL">All farms</SelectItem>{farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}</SelectContent>
          </Select>}
          {isActivities && <>
            <Select value={currentActivityPlantingFilter} onValueChange={setActivityPlantingFilter} disabled={switchDisabled || activityPlantingsPending}>
              <SelectTrigger className="expense4-ledger-filter crop3-activity-filter" aria-label="Filter activities by planting"><SelectValue /></SelectTrigger>
              <SelectContent align="start"><SelectItem value="ALL">All plantings</SelectItem>{filteredActivityOptions.map((option) => <SelectItem key={option.id} value={option.id}>{option.cropName} · {option.farmName} · {option.fieldName} · {option.plantedOn} (#{option.id})</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={switchDisabled}>
              <SelectTrigger className="expense4-ledger-filter crop3-activity-status-filter" aria-label="Filter activities by status"><SelectValue /></SelectTrigger>
              <SelectContent align="start"><SelectItem value="ALL">All statuses</SelectItem>{Object.keys(ACTIVITY_TRANSITIONS).map((status) => <SelectItem key={status} value={status}>{humanize(status)}</SelectItem>)}</SelectContent>
            </Select>
          </>}
          {!isActivities && !isTypes && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="crop3-status-filter" aria-label="Filter plantings by status">
                <span className="crop3-status-label">Status</span>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="crop3-status-menu" align="start">
                <SelectItem value="ALL">All statuses</SelectItem>
                {["PLANNED", "ACTIVE", "HARVESTING", "COMPLETED", "CANCELLED"].map((status) => (
                  <SelectItem key={status} value={status}>{humanize(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isActivities ? (
          <>
            {!activityLogsPending && activityPartial && <div className="expense4-ledger-load-warning" role="status"><span>{farmsError ? "Farm data could not be loaded. " : ""}{activityPlantingData.error ? activityPlantingData.error + " " : ""}{failedActivityPlantings.length ? "Activity history could not be loaded for " + failedActivityPlantings.length + " planting(s). " : ""}Records and statistics may be incomplete.</span><button type="button" className="button-secondary" disabled={switchDisabled} onClick={() => { if (farmsError) refreshFarms?.(); refreshData(); }}>Retry</button></div>}
            {!activityLogsPending && activityError && <div className="ff-error" role="alert">{activityError}</div>}
          </>
        ) : !farmDataPending && pageError && <div className="ff-error" role="alert">{pageError}</div>}

        {!isActivities && !farmDataPending && warnings.length > 0 && <div className="expense4-ledger-load-warning" role="status"><span>Some farm, crop type or planting data could not be loaded. Records and statistics may be incomplete.</span><button type="button" className="button-secondary" disabled={switchDisabled} onClick={refreshData}>Retry</button></div>}
        {(isActivities ? activityPlantingsPending : farmDataPending) ? (
          <SkeletonBlock rows={5} />
        ) : !isActivities && !isTypes && fields.length === 0 ? (
          <div className="empty-state"><MapPinned size={23} /><strong>No fields available</strong><span>Add a field before creating a crop planting.</span><button className="button-secondary" type="button" onClick={() => onNavigate("Fields")}>Manage fields <ArrowRight size={14} /></button></div>
        ) : !isActivities && isTypes ? (
          filteredTypes.length === 0 ? (
            <div className="empty-state"><Leaf size={23} /><strong>{search || currentFarmFilter !== "ALL" ? "No matching crop types" : "No crop types yet"}</strong><span>{search || currentFarmFilter !== "ALL" ? "Try another search or farm filter." : "Register crop types such as tomato, rice, or chilli in your farms."}</span>{!search && <button className="button-primary" type="button" onClick={openCreateType}><Plus size={14} /> Add crop type</button>}</div>
          ) : (
            <div className="workspace-table-wrap">
              <table className="workspace-table crop3-table">
                <thead><tr><th>CROP TYPE</th><th>FARM</th><th>DESCRIPTION</th><th>DEFAULT MATURITY</th><th>PLANTINGS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {paginatedTypes.map((cropType) => {
                    const used = farmPlantings.filter((item) => String(item.cropTypeId) === String(cropType.id)).length;
                    return (
                      <tr key={cropType.id}>
                        <td><strong className="workspace-cell-title">{cropType.name}</strong></td>
                        <td>{farmNames.get(cropType.farmId)}</td>
                        <td className="crop3-description">{cropType.description || "—"}</td>
                        <td>{cropType.defaultMaturityTimeInDays ? cropType.defaultMaturityTimeInDays + " days" : "Not set"}</td>
                        <td>{cropData.plantingsFailed || cropData.failedFields.includes(cropType.farmId) ? "—" : used}</td>
                        <td><div className="ff-row-actions">
                          <UseAnimations
                            animation={edit}
                            size={14}
                            interaction="hover"
                            render={(eventProps, animationProps) => (
                              <button {...eventProps} type="button" className="ff-icon-button" aria-label={"Edit " + cropType.name} disabled={switchDisabled} onClick={() => openEditType(cropType)}>
                                <span {...animationProps} aria-hidden="true" />
                              </button>
                            )}
                          />
                          <UseAnimations
                            animation={trash2}
                            size={14}
                            interaction="hover"
                            render={(eventProps, animationProps) => (
                              <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label={"Delete " + cropType.name} disabled={used > 0 || switchDisabled || cropData.plantingsFailed || cropData.failedFields.includes(cropType.farmId)} onClick={() => deleteType(cropType)}>
                                <span {...animationProps} aria-hidden="true" />
                              </button>
                            )}
                          />
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : isActivities ? (
          activityLogsPending ? (
            <SkeletonBlock rows={4} />
          ) : !activityPlantingOptions.length ? (
            <div className="empty-state"><Sprout size={23} /><strong>{activityPartial ? "Planting data unavailable" : "No plantings available"}</strong><span>{activityPartial ? "Retry loading the missing farm or planting data." : "Create a planting first, then log field activity against it."}</span><button className="button-primary" type="button" onClick={() => onNavigate("Crop management")}>Go to crop management <ArrowRight size={14} /></button></div>
          ) : activities.length === 0 ? (
            <div className="empty-state"><ClipboardList size={23} /><strong>{activityPartial ? "No activity records available" : "No activity logs yet"}</strong><span>{activityPartial ? "Some activity histories could not be loaded." : "Start a daily journal for any of your crop plantings."}</span><button className="button-primary" type="button" onClick={openCreateActivity}><Plus size={14} /> Log first activity</button></div>
          ) : filteredActivities.length === 0 ? (
            <div className="empty-state"><Search size={23} /><strong>No matching activities</strong><span>Try changing your search or filters.</span></div>
          ) : (
            <div className="workspace-table-wrap">
              <table className="workspace-table crop3-table">
                <thead><tr><th>DAY</th><th>PLANTING</th><th>GROWTH STAGE</th><th>ACTIVITY</th><th>CREATED</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {paginatedActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>Day {activity.dayNumber}</td>
                      <td><strong className="workspace-cell-title">{activityOptionById.get(String(activity.cropPlantingId))?.cropName || "Crop"}</strong><small className="crop3-subtext">{farmNames.get(activity.farmId) || "Farm"} · {activityOptionById.get(String(activity.cropPlantingId))?.fieldName || "Field"}</small><small className="crop3-subtext">Planted {activityOptionById.get(String(activity.cropPlantingId))?.plantedOn || "—"}</small></td>
                      <td>{activity.cropStage ? humanize(activity.cropStage) : "—"}</td>
                      <td><strong className="workspace-cell-title">{activity.dailyActivity}</strong><small className="crop3-subtext">{activity.notes || activity.nutritionAndWaterManagement || activity.pestAndDiseaseControl || ""}</small></td>
                      <td>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : "—"}</td>
                      <td><StatusPill status={activity.status} /></td>
                      <td><div className="ff-row-actions">
                        <UseAnimations
                          animation={edit}
                          size={14}
                          interaction="hover"
                          render={(eventProps, animationProps) => (
                            <button {...eventProps} type="button" className="ff-icon-button" aria-label="Edit activity" onClick={() => openEditActivity(activity)} disabled={switchDisabled || ["COMPLETED", "CANCELLED"].includes(activity.status)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                        {ACTIVITY_TRANSITIONS[activity.status]?.length > 0 && (
                          <Select value="" disabled={switchDisabled} onValueChange={(next) => changeActivityStatus(activity, next)}>
                            <SelectTrigger className="crop3-action-select" aria-label="Change activity status">
                              <SelectValue placeholder="Move to…" />
                            </SelectTrigger>
                            <SelectContent className="crop3-action-menu" align="end">
                              {ACTIVITY_TRANSITIONS[activity.status].map((next) => <SelectItem key={next} value={next}>{humanize(next)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        <UseAnimations
                          animation={trash2}
                          size={14}
                          interaction="hover"
                          render={(eventProps, animationProps) => (
                            <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label="Delete activity" disabled={activity.status !== "PLANNED" || switchDisabled} onClick={() => deleteActivity(activity)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : farmPlantings.length === 0 ? (
          <div className="empty-state"><Sprout size={23} /><strong>No plantings yet</strong><span>Create a crop type first, then assign it to one of your fields.</span>{!canCreatePlanting ? <button className="button-secondary" type="button" onClick={() => setSection("types")}>Create a crop type <ArrowRight size={14} /></button> : <button className="button-primary" type="button" onClick={openCreatePlanting}><Plus size={14} /> Add planting</button>}</div>
        ) : filteredPlantings.length === 0 ? (
          <div className="empty-state"><Search size={23} /><strong>No matching plantings</strong><span>Try changing your search, farm or status filter.</span></div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table crop3-table">
              <thead><tr><th>CROP</th><th>FARM</th><th>FIELD</th><th>AREA</th><th>PLANTED</th><th>EXPECTED HARVEST</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {paginatedPlantings.map((planting) => {
                  const field = fieldById.get(String(planting.fieldId));
                  const transitions = PLANTING_TRANSITIONS[planting.status] || [];
                  return (
                    <tr key={planting.id}>
                      <td><strong className="workspace-cell-title">{planting.cropTypeName}</strong></td>
                      <td>{farmNames.get(planting.farmId)}</td>
                      <td>{field?.fieldName || "Field"}</td>
                      <td>{numberLabel(planting.cropArea)}</td>
                      <td>{dateLabel(planting.plantedOn)}</td>
                      <td>{dateLabel(planting.expectedHarvestOn)}</td>
                      <td><StatusPill status={planting.status} /></td>
                      <td><div className="ff-row-actions">
                        <UseAnimations
                          animation={edit}
                          size={14}
                          interaction="hover"
                          render={(eventProps, animationProps) => (
                            <button {...eventProps} type="button" className="ff-icon-button" aria-label={"Edit " + planting.cropTypeName + " planting"} disabled={switchDisabled || ["COMPLETED", "CANCELLED"].includes(planting.status) || cropData.failedTypes.includes(planting.farmId)} onClick={() => openEditPlanting(planting)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                        {transitions.length > 0 && (
                          <Select value="" disabled={switchDisabled} onValueChange={(next) => changePlantingStatus(planting, next)}>
                            <SelectTrigger className="crop3-action-select" aria-label="Change planting status">
                              <SelectValue placeholder="Move to…" />
                            </SelectTrigger>
                            <SelectContent className="crop3-action-menu" align="end">
                              {transitions.map((next) => <SelectItem key={next} value={next}>{humanize(next)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        <UseAnimations
                          animation={trash2}
                          size={14}
                          interaction="hover"
                          render={(eventProps, animationProps) => (
                            <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label={"Delete " + planting.cropTypeName + " planting"} disabled={planting.status !== "PLANNED" || switchDisabled} onClick={() => deletePlanting(planting)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="workspace-data-footer ff-fields-footer">
          <span>
            Showing <strong>{tablePending ? "…" : tableCount ? `${tablePageStart + 1}–${Math.min(tablePageStart + CROPS_PER_PAGE, tableCount)} of ${tableCount}` : "0"}</strong> {isActivities ? "activity logs" : isTypes ? "crop types" : "plantings"}
          </span>
          {!tablePending && tableCount > 0 && (
            <Pagination className="ff-farm-pagination ff-field-pagination" aria-label={isActivities ? "Activity logs pagination" : isTypes ? "Crop library pagination" : "Plantings pagination"}>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious disabled={tablePage === 1} onClick={() => setTablePage(tablePage - 1)} />
                </PaginationItem>
                {cropPageItems(tablePage, tablePageCount).map((item) => (
                  <PaginationItem key={item}>
                    {typeof item === "number" ? (
                      <PaginationLink isActive={tablePage === item} aria-label={`Page ${item}`} onClick={() => setTablePage(item)}>{item}</PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext disabled={tablePage === tablePageCount} onClick={() => setTablePage(tablePage + 1)} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          <span>{currentFarmFilter === "ALL" ? "All farms" : farmNames.get(currentFarmFilter)}</span>
        </div>
      </div>

      {typeDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !typeSaving) setTypeDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog crop3-type-dialog" onSubmit={submitType}>
            <div className="dialog-heading"><div><span className="section-kicker">CROP LIBRARY</span><h2>{editingType ? "Edit crop type" : "Add crop type"}</h2><p>{editingType ? "Update this registered crop variety." : "Register a crop variety for your farm."}</p></div><button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" disabled={typeSaving} onClick={() => setTypeDialogOpen(false)}><X size={19} /></button></div>
            {typeError && <div className="ff-error" role="alert">{typeError}</div>}
            <FarmFormSelect id="crop-type-farm" farms={farms} value={typeFarmId} disabled={typeSaving || Boolean(editingType)} onChange={(value) => { setTypeFarmId(value); setTypeError(""); }} />
            <label className="form-label">Crop name<Input required maxLength={100} value={typeForm.name} onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })} placeholder="e.g. Tomato" /></label>
            <label className="form-label">Description<Textarea rows={3} maxLength={500} value={typeForm.description} onChange={(event) => setTypeForm({ ...typeForm, description: event.target.value })} placeholder="Variety, growing notes, or other details" /></label>
            <label className="form-label">Default maturity (days)<Input type="number" min="1" step="1" value={typeForm.defaultMaturityTimeInDays} onChange={(event) => setTypeForm({ ...typeForm, defaultMaturityTimeInDays: event.target.value })} placeholder="e.g. 90" /></label>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={typeSaving} onClick={() => setTypeDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={typeSaving || !typeForm.name.trim() || !farmNames.has(typeFarmId)}><Plus size={15} /> {typeSaving ? "Saving…" : editingType ? "Save changes" : "Create crop type"}</button></div>
          </form>
        </div>
      )}

      {plantingDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !plantingSaving) setPlantingDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog crop3-planting-dialog" onSubmit={submitPlanting}>
            <div className="dialog-heading"><div><span className="section-kicker">PLANTING RECORD</span><h2>{editingPlanting ? "Edit planting" : "Add planting"}</h2><p>Assign a crop type and area to a field.</p></div><button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" disabled={plantingSaving} onClick={() => setPlantingDialogOpen(false)}><X size={19} /></button></div>
            {plantingError && <div className="ff-error" role="alert">{plantingError}</div>}
            <FarmFormSelect id="planting-farm" farms={farms} value={plantingFarmId} disabled={plantingSaving || Boolean(editingPlanting)} onChange={(value) => { setPlantingFarmId(value); setPlantingForm((current) => ({ ...current, fieldId: "", cropTypeId: "", cropArea: "", maturityTimeInDays: "" })); setPlantingError(""); }} />
            {!editingPlanting && plantingFarmId && (!plantingFields.length || !plantingTypes.length) && <div className="crop3-farm-form-hint">{cropData.failedFields.includes(plantingFarmId) || cropData.failedTypes.includes(plantingFarmId) ? "Field or crop type data is unavailable. Retry from the directory." : "This farm needs at least one field and crop type before adding a planting."}</div>}
            {!editingPlanting && (
              <div className="form-label">
                <label htmlFor="planting-field">Field</label>
                <FieldSelect fields={plantingFields} value={plantingForm.fieldId} disabled={plantingSaving || !plantingFarmId || !plantingFields.length} onChange={(value) => setPlantingForm((current) => ({ ...current, fieldId: value, cropArea: "" }))} />
              </div>
            )}
            {plantingField && <div className="crop3-field-area-context"><MapPinned size={17} aria-hidden="true" /><div><strong>{plantingField.fieldName}</strong><small>{editingPlanting ? "Area available for this planting (including current allocation)" : "Available field area"}</small></div><strong>{numberLabel(plantingAreaLimit)}</strong></div>}
            <div className="form-label">
              <label htmlFor="planting-crop-type">Crop type</label>
              <Select required disabled={plantingSaving || !plantingFarmId || !plantingTypes.length} value={plantingForm.cropTypeId} onValueChange={(value) => {
                const cropType = plantingTypes.find((item) => String(item.id) === value);
                setPlantingForm((current) => ({ ...current, cropTypeId: value, maturityTimeInDays: cropType?.defaultMaturityTimeInDays ? String(cropType.defaultMaturityTimeInDays) : "" }));
              }}>
                <SelectTrigger id="planting-crop-type" className="ifc-form-select"><SelectValue placeholder="Choose a crop type" /></SelectTrigger>
                <SelectContent align="start">
                  {plantingTypes.map((cropType) => <SelectItem key={cropType.id} value={String(cropType.id)}>{cropType.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="form-label">Crop area
              <Input type="number" required min="0.01" step="0.01" disabled={plantingSaving || !plantingField} max={plantingAreaLimit != null && Number.isFinite(plantingAreaLimit) ? Math.round(plantingAreaLimit * 100) / 100 : undefined} value={plantingForm.cropArea} onChange={(event) => setPlantingForm((current) => ({ ...current, cropArea: event.target.value }))} placeholder="e.g. 0.75" />
            </label>
            {plantingField && (
              <Alert className="crop3-area-info" variant="info" role="status"><Info size={16} aria-hidden="true" /><AlertDescription>Crop area cannot exceed the available field area.</AlertDescription></Alert>
            )}
            <div className="crop3-form-grid">
              <div className="form-label">
                <label htmlFor="planting-date">Planting date</label>
                <DatePicker id="planting-date" required disabled={plantingSaving} min={todayIso()} value={plantingForm.plantedOn} onChange={(value) => setPlantingForm((current) => ({ ...current, plantedOn: value, expectedHarvestOn: current.expectedHarvestOn && current.expectedHarvestOn < value ? "" : current.expectedHarvestOn }))} />
              </div>
              <div className="form-label">
                <label htmlFor="planting-harvest-date">Expected harvest <span className="crop3-optional">(optional)</span></label>
                <DatePicker id="planting-harvest-date" disabled={plantingSaving} value={plantingForm.expectedHarvestOn} min={plantingForm.plantedOn} onChange={(value) => setPlantingForm((current) => ({ ...current, expectedHarvestOn: value }))} />
              </div>
            </div>
            <label className="form-label">Maturity time (days)
              <Input type="number" min="1" step="1" disabled={plantingSaving} value={plantingForm.maturityTimeInDays} onChange={(event) => setPlantingForm((current) => ({ ...current, maturityTimeInDays: event.target.value }))} placeholder="Uses crop type default when blank" />
            </label>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={plantingSaving} onClick={() => setPlantingDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={plantingSaving || !plantingField || !plantingTypes.some((type) => String(type.id) === plantingForm.cropTypeId) || !plantingForm.cropArea || Number(plantingForm.cropArea) < 0.01 || (plantingAreaLimit != null && Number(plantingForm.cropArea) > plantingAreaLimit + 1e-9)}><Plus size={15} /> {plantingSaving ? "Saving…" : editingPlanting ? "Save changes" : "Create planting"}</button></div>
          </form>
        </div>
      )}

      {activityDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !activitySaving) setActivityDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog crop3-activity-dialog" onSubmit={submitActivity}>
            <div className="dialog-heading"><div><span className="section-kicker">ACTIVITY ENTRY</span><h2>{editingActivity ? "Edit activity" : "Log activity"}</h2><p>{editingActivity ? "Update the activity details for this planting." : "Record a daily activity for your crop planting."}</p></div><button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" disabled={activitySaving} onClick={() => setActivityDialogOpen(false)}><X size={19} /></button></div>
            {activityFormError && <div className="ff-error" role="alert">{activityFormError}</div>}
            <div className="form-label"><span>Crop planting</span><ActivityPlantingSelector options={activityPlantingOptions} selected={selectedActivityOption} onSelect={selectActivityPlanting} loading={activityPlantingsPending} disabled={activitySaving || Boolean(editingActivity)} />{failedActivityPlantings.includes(activityFormPlantingId) && <small className="expense4-selection-hint">Activity history is unavailable. Enter the correct crop-cycle day.</small>}</div>
            <div className="crop3-form-grid">
              <label className="form-label">Crop-cycle day<Input disabled={activitySaving} type="number" required min="1" step="1" value={activityForm.dayNumber} onChange={(event) => setActivityForm({ ...activityForm, dayNumber: event.target.value })} /></label>
              <div className="form-label">
                <label htmlFor="activity-growth-stage">Growth stage</label>
                <Select disabled={activitySaving} value={activityForm.cropStage || "not-specified"} onValueChange={(value) => setActivityForm((current) => ({ ...current, cropStage: value === "not-specified" ? "" : value }))}>
                  <SelectTrigger id="activity-growth-stage" className="ifc-form-select"><SelectValue placeholder="Not specified" /></SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="not-specified">Not specified</SelectItem>
                    {CROP_STAGES.map((stage) => <SelectItem key={stage} value={stage}>{humanize(stage)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="form-label">Daily activity<Input disabled={activitySaving} required maxLength={2000} value={activityForm.dailyActivity} onChange={(event) => setActivityForm({ ...activityForm, dailyActivity: event.target.value })} placeholder="e.g. Drip irrigation and soil inspection" /></label>
            <label className="form-label">Nutrition and water management<Textarea disabled={activitySaving} rows={2} maxLength={2000} value={activityForm.nutritionAndWaterManagement} onChange={(event) => setActivityForm({ ...activityForm, nutritionAndWaterManagement: event.target.value })} placeholder="Optional observations" /></label>
            <label className="form-label">Pest and disease control<Textarea disabled={activitySaving} rows={2} maxLength={2000} value={activityForm.pestAndDiseaseControl} onChange={(event) => setActivityForm({ ...activityForm, pestAndDiseaseControl: event.target.value })} placeholder="Optional observations" /></label>
            <label className="form-label">Notes<Textarea disabled={activitySaving} rows={2} maxLength={2000} value={activityForm.notes} onChange={(event) => setActivityForm({ ...activityForm, notes: event.target.value })} placeholder="Additional notes" /></label>
            <div className="form-label">
              <label htmlFor="activity-log-status">Status</label>
              <Select disabled={activitySaving} value={activityForm.status} onValueChange={(value) => setActivityForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger id="activity-log-status" className="ifc-form-select"><SelectValue placeholder="Choose status" /></SelectTrigger>
                <SelectContent align="start">
                  {(editingActivity ? [editingActivity.status, ...(ACTIVITY_TRANSITIONS[editingActivity.status] || [])] : ["PLANNED"]).map((status) => <SelectItem key={status} value={status}>{humanize(status)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={activitySaving} onClick={() => setActivityDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={activitySaving || !selectedActivityOption}><Plus size={15} /> {activitySaving ? "Saving…" : editingActivity ? "Save changes" : "Save activity"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}
