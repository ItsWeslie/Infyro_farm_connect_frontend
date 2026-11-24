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
import { DatePicker } from "./ui/calendar";
import { Alert, AlertDescription } from "./ui/alert";
import FieldFarmSelector from "./FieldFarmSelector";
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

export default function CropManagementPage({
  active,
  farms,
  selectedFarm,
  setSelectedFarm,
  onNavigate,
  notify,
}) {
  const confirmDialog = useConfirmDialog();
  const [fields, setFields] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [plantings, setPlantings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedFarmId, setLoadedFarmId] = useState(null);
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

  const [requestedPlantingId, setRequestedPlantingId] = useState("");
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
  const farmId = selectedFarm?.id;
  const activityFarmIds = JSON.stringify([...new Set(farms.filter((farm) => farm.id != null).map((farm) => String(farm.id)))].sort());
  const activityPlantingKey = JSON.stringify([activityFarmIds, reloadKey]);
  const activityPlantingsPending = isActivities && activityPlantingData.key !== activityPlantingKey;
  const farmDataPending = Boolean(farmId) && (loading || String(loadedFarmId) !== String(farmId));
  const switchDisabled = typeDialogOpen || plantingDialogOpen || activityDialogOpen || typeSaving || plantingSaving || activitySaving || deletingId !== null || pendingStatusChanges > 0;

  function switchFarm(farm) {
    if (switchDisabled || String(farm.id) === String(farmId)) return;
    setSearch("");
    setStatusFilter("ALL");
    setPageError("");
    setSelectedFarm(farm);
  }

  function farmStat(value) {
    return farmDataPending ? "…" : pageError && !fields.length && !cropTypes.length && !plantings.length ? "—" : value;
  }

  useEffect(() => {
    let current = true;
    if (isActivities) return undefined;
    if (!farmId) {
      setFields([]);
      setCropTypes([]);
      setPlantings([]);
      setLoadedFarmId(null);
      setLoading(false);
      setPageError("");
      return undefined;
    }

    setLoading(true);
    setPageError("");
    Promise.all([
      fieldApi.getByFarm(farmId),
      cropTypeApi.getAll(farmId),
      cropPlantingApi.getAll(),
    ])
      .then(([fieldResponse, cropTypeResponse, plantingResponse]) => {
        if (!current) return;
        setFields(toList(fieldResponse));
        setCropTypes(toList(cropTypeResponse));
        setPlantings(toList(plantingResponse));
      })
      .catch((error) => {
        if (!current) return;
        setFields([]);
        setCropTypes([]);
        setPlantings([]);
        setPageError(error.message || "Unable to load crop management data.");
        notify(error.message || "Unable to load crop management data.", "error");
      })
      .finally(() => {
        if (current) {
          setLoadedFarmId(farmId);
          setLoading(false);
        }
      });

    return () => { current = false; };
  }, [farmId, reloadKey, notify, isActivities]);

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
    if (!isActivities) return undefined;
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
  }, [isActivities, activityFarmIds, activityPlantingKey]);

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

  const selectedActivityOption = activityPlantingOptions.find((option) => option.id === requestedPlantingId) || activityPlantingOptions[0] || null;
  const selectedPlanting = selectedActivityOption?.planting || null;
  const selectedPlantingId = selectedActivityOption?.id || "";
  const activityRequestKey = JSON.stringify([selectedPlantingId, activityPlantingKey, activityReload]);
  const activityLogsPending = isActivities && Boolean(selectedPlantingId) && (activitiesLoading || loadedActivityKey !== activityRequestKey);

  useEffect(() => {
    if (isActivities && !activityPlantingsPending) {
      setRequestedPlantingId(selectedPlantingId);
    }
  }, [isActivities, activityPlantingsPending, selectedPlantingId]);

  function selectActivityPlanting(id) {
    if (switchDisabled || id === selectedPlantingId) return;
    setRequestedPlantingId(id);
    setSearch("");
    setActivityError("");
  }

  useEffect(() => {
    if (!isActivities || !selectedPlantingId) {
      setActivities([]);
      setActivityError("");
      setActivitiesLoading(false);
      setLoadedActivityKey(null);
      return undefined;
    }

    let current = true;
    setActivities([]);
    setActivitiesLoading(true);
    setActivityError("");
    cropActivityApi.getByPlanting(selectedPlantingId)
      .then((response) => {
        if (current) setActivities(toList(response));
      })
      .catch((error) => {
        if (!current) return;
        setActivities([]);
        setActivityError(error.message || "Unable to load activity logs.");
        notify(error.message || "Unable to load activity logs.", "error");
      })
      .finally(() => {
        if (current) {
          setLoadedActivityKey(activityRequestKey);
          setActivitiesLoading(false);
        }
      });

    return () => { current = false; };
  }, [isActivities, selectedPlantingId, activityRequestKey, notify]);

  useEffect(() => {
    setSearch("");
    setStatusFilter("ALL");
    if (active === "Crop management") setSection("plantings");
  }, [active]);

  const filteredPlantings = useMemo(() => {
    const normalized = search.toLowerCase();
    return farmPlantings.filter((planting) => {
      const field = fieldById.get(String(planting.fieldId));
      const matchesSearch = [
        planting.cropTypeName,
        field?.fieldName,
        planting.status,
        planting.plantedOn,
      ].join(" ").toLowerCase().includes(normalized);
      return matchesSearch && (statusFilter === "ALL" || planting.status === statusFilter);
    });
  }, [farmPlantings, fieldById, search, statusFilter]);

  const filteredTypes = useMemo(() => cropTypes.filter((cropType) => (
    [cropType.name, cropType.description].join(" ").toLowerCase().includes(search.toLowerCase())
  )), [cropTypes, search]);

  const isCropLibrary = section === "types";
  const filteredCropCount = isCropLibrary ? filteredTypes.length : filteredPlantings.length;
  const cropPageCount = Math.max(1, Math.ceil(filteredCropCount / CROPS_PER_PAGE));
  const currentCropPage = Math.min(cropPage, cropPageCount);
  const cropPageStart = (currentCropPage - 1) * CROPS_PER_PAGE;
  const paginatedTypes = filteredTypes.slice(cropPageStart, cropPageStart + CROPS_PER_PAGE);
  const paginatedPlantings = filteredPlantings.slice(cropPageStart, cropPageStart + CROPS_PER_PAGE);

  useEffect(() => {
    setCropPage(1);
  }, [farmId, active, section, search, statusFilter]);

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
    setTypeForm(INITIAL_TYPE_FORM);
    setTypeError("");
    setTypeDialogOpen(true);
  }

  function openEditType(cropType) {
    setEditingType(cropType);
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
    if (!typeForm.name.trim()) return;
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
      const response = editingType
        ? await cropTypeApi.update(farmId, editingType.id, payload)
        : await cropTypeApi.create(farmId, payload);
      const savedType = response?.data || response;
      if (savedType && typeof savedType === "object" && savedType.id != null) {
        setCropTypes((current) => editingType
          ? current.map((item) => item.id === editingType.id ? savedType : item)
          : [savedType, ...current.filter((item) => item.id !== savedType.id)]);
      } else {
        refreshData();
      }
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
      await cropTypeApi.delete(farmId, cropType.id);
      setCropTypes((current) => current.filter((item) => item.id !== cropType.id));
      notify("Crop type deleted");
    } catch (error) {
      notify(error.message || "Unable to delete this crop type.", "error");
      setPageError(error.message || "Unable to delete this crop type.");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreatePlanting() {
    const firstCropType = cropTypes[0];
    setEditingPlanting(null);
    setPlantingForm({
      ...INITIAL_PLANTING_FORM,
      fieldId: String(fields[0]?.id || ""),
      cropTypeId: String(firstCropType?.id || ""),
      plantedOn: todayIso(),
      maturityTimeInDays: firstCropType?.defaultMaturityTimeInDays
        ? String(firstCropType.defaultMaturityTimeInDays)
        : "",
    });
    setPlantingError("");
    setPlantingDialogOpen(true);
  }

  function openEditPlanting(planting) {
    setEditingPlanting(planting);
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
    const cropType = cropTypes.find((item) => String(item.id) === String(plantingForm.cropTypeId));
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
    if (!plantingForm.plantedOn) {
      setPlantingError("Choose the planting date.");
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
      const response = editingPlanting
        ? await cropPlantingApi.update(editingPlanting.id, payload)
        : await cropPlantingApi.create(Number(plantingForm.fieldId), payload);
      const savedPlanting = response?.data || response;
      if (savedPlanting && typeof savedPlanting === "object" && savedPlanting.id != null) {
        setPlantings((current) => editingPlanting
          ? current.map((item) => item.id === editingPlanting.id ? savedPlanting : item)
          : [savedPlanting, ...current.filter((item) => item.id !== savedPlanting.id)]);
      } else {
        refreshData();
      }
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
      const response = await cropPlantingApi.updateStatus(planting.id, nextStatus);
      const updatedPlanting = response?.data || response;
      setPlantings((current) => current.map((item) => item.id === planting.id
        ? { ...item, ...(updatedPlanting && typeof updatedPlanting === "object" ? updatedPlanting : {}), status: updatedPlanting?.status || nextStatus }
        : item));
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
      setPlantings((current) => current.filter((item) => item.id !== planting.id));
      notify("Planting deleted");
    } catch (error) {
      notify(error.message || "Unable to delete this planting.", "error");
      setPageError(error.message || "Unable to delete this planting.");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateActivity() {
    setEditingActivity(null);
    setActivityForm({
      ...INITIAL_ACTIVITY_FORM,
      dayNumber: String(Math.max(0, ...activities.map((item) => Number(item.dayNumber) || 0)) + 1),
    });
    setActivityFormError("");
    setActivityDialogOpen(true);
  }

  function openEditActivity(activity) {
    setEditingActivity(activity);
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
    if (!selectedPlantingId) {
      setActivityFormError("Choose a planting before adding an activity.");
      return;
    }
    if (!activityForm.dailyActivity.trim()) {
      setActivityFormError("Describe the activity.");
      return;
    }

    const payload = {
      cropPlantingId: Number(selectedPlantingId),
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
      const response = editingActivity
        ? await cropActivityApi.update(editingActivity.id, payload)
        : await cropActivityApi.create(payload);
      const savedActivity = response?.data || response;
      if (savedActivity && typeof savedActivity === "object" && savedActivity.id != null) {
        setActivities((current) => editingActivity
          ? current.map((item) => item.id === editingActivity.id ? savedActivity : item)
          : [savedActivity, ...current.filter((item) => item.id !== savedActivity.id)]);
      } else {
        setActivityReload((value) => value + 1);
      }
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
    if (!nextStatus) return;
    setPendingStatusChanges((count) => count + 1);
    setActivityError("");
    try {
      const response = await cropActivityApi.updateStatus(activity.id, nextStatus);
      const updatedActivity = response?.data || response;
      setActivities((current) => current.map((item) => item.id === activity.id
        ? { ...item, ...(updatedActivity && typeof updatedActivity === "object" ? updatedActivity : {}), status: updatedActivity?.status || nextStatus }
        : item));
      notify("Activity status changed to " + humanize(nextStatus));
    } catch (error) {
      notify(error.message || "Unable to change activity status.", "error");
      setActivityError(error.message || "Unable to change activity status.");
    } finally {
      setPendingStatusChanges((count) => count - 1);
    }
  }

  async function deleteActivity(activity) {
    const confirmed = await confirmDialog({ title: "Delete this activity?", message: "Delete this planned activity?", details: "The activity will be permanently removed from this planting log.", confirmLabel: "Delete activity", tone: "danger" });
    if (!confirmed) return;
    setDeletingId("activity-" + activity.id);
    setActivityError("");
    try {
      await cropActivityApi.delete(activity.id);
      setActivities((current) => current.filter((item) => item.id !== activity.id));
      notify("Activity deleted");
    } catch (error) {
      notify(error.message || "Unable to delete this activity.", "error");
      setActivityError(error.message || "Unable to delete this activity.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isActivities && !selectedFarm?.id) {
    return (
      <section className="workspace-page">
        <div className="page-eyebrow"><span className="eyebrow-pip" /> CROP WORKSPACE</div>
        <div className="empty-state surface-card crop3-no-farm">
          <Sprout size={28} />
          <strong>No farm selected</strong>
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
          <h1>{isActivities ? "Crop activity log" : "Crop management"}</h1>
          <p>{isActivities ? "Record the work, observations, and care behind each planting." : "Manage farm crop types and track every planting through its growing cycle."}</p>
        </div>
        <div className={`workspace-title-actions crop3-title-actions${isActivities ? "" : " ff-field-title-actions"}`}>
          {!isActivities && farms.length > 0 && (
            <FieldFarmSelector farms={farms} selectedFarm={selectedFarm} onSelect={switchFarm} disabled={switchDisabled} />
          )}
          {isActivities ? (
            <button className="button-primary" type="button" onClick={openCreateActivity} disabled={!selectedPlanting || activityPlantingsPending || activityLogsPending}>
              <Plus size={15} /> Log activity
            </button>
          ) : isTypes ? (
            <button className="button-primary" type="button" onClick={openCreateType} disabled={farmDataPending}>
              <Plus size={15} /> Add crop type
            </button>
          ) : (
            <button className="button-primary" type="button" onClick={openCreatePlanting} disabled={farmDataPending || !fields.length || !cropTypes.length}>
              <Plus size={15} /> Add planting
            </button>
          )}
        </div>
      </div>

      {!isActivities && (
        <div className="crop3-tabs" role="tablist" aria-label="Crop management sections">
          <button type="button" role="tab" aria-selected={!isTypes} className={!isTypes ? "selected" : ""} onClick={() => { setSection("plantings"); setSearch(""); }}>
            <Sprout size={14} /> Plantings
          </button>
          <button type="button" role="tab" aria-selected={isTypes} className={isTypes ? "selected" : ""} onClick={() => { setSection("types"); setSearch(""); }}>
            <Leaf size={14} /> Crop library
          </button>
          <span className="crop3-tab-hint">{selectedFarm.name}</span>
        </div>
      )}

      {!isActivities && !isTypes ? (
        <div className="workspace-stats">
          <Stat label="Plantings" value={farmStat(farmPlantings.length)} detail="in this farm" icon={Sprout} />
          <Stat label="Active crops" value={farmStat(activePlantings)} detail="growing or harvesting" icon={Leaf} />
          <Stat label="Crop types" value={farmStat(cropTypes.length)} detail="available in this farm" icon={ClipboardList} />
          <Stat label="Fields" value={farmStat(fields.length)} detail="ready for planting" icon={MapPinned} />
        </div>
      ) : isTypes ? (
        <div className="workspace-stats">
          <Stat label="Crop types" value={farmStat(cropTypes.length)} detail="registered in this farm" icon={Leaf} />
          <Stat label="With maturity defaults" value={farmStat(cropTypes.filter((item) => item.defaultMaturityTimeInDays).length)} detail="ready for quick planting" icon={CalendarDays} />
          <Stat label="Used by plantings" value={farmStat(new Set(farmPlantings.map((item) => item.cropTypeId)).size)} detail="crop varieties in use" icon={Sprout} />
          <Stat label="Fields" value={farmStat(fields.length)} detail="in this farm" icon={MapPinned} />
        </div>
      ) : (
        <div className="workspace-stats">
          <Stat label="Activity entries" value={activityPlantingsPending || activityLogsPending ? "…" : activities.length} detail="for selected planting" icon={ClipboardList} />
          <Stat label="In progress" value={activityPlantingsPending || activityLogsPending ? "…" : activities.filter((item) => item.status === "IN_PROGRESS").length} detail="work underway" icon={Sprout} />
          <Stat label="Completed" value={activityPlantingsPending || activityLogsPending ? "…" : activities.filter((item) => item.status === "COMPLETED").length} detail="activities finished" icon={Check} />
          <Stat label="Planned" value={activityPlantingsPending || activityLogsPending ? "…" : activities.filter((item) => item.status === "PLANNED").length} detail="upcoming work" icon={CalendarDays} />
        </div>
      )}

      <div className="workspace-data-card surface-card crop3-data-card">
        <div className="workspace-data-heading">
          <div>
            <h2 className="crop3-planting-title">
              {isActivities ? <ClipboardList size={14} aria-hidden="true" /> : isTypes ? <Leaf size={14} aria-hidden="true" /> : <Sprout size={14} aria-hidden="true" />}
              {isActivities ? (selectedPlanting ? "Activities for " + selectedActivityOption.cropName : "Activities for this planting") : isTypes ? "Crop library" : "Plantings in " + selectedFarm.name}
            </h2>
            <p>{isActivities ? "View and manage the activity history of the selected planting." : isTypes ? "Crop types are configured separately for each farm." : "Planting area is reserved against the selected field by the backend."}</p>
          </div>
          {isActivities && (
            <div className="crop3-activity-planting-row">
              <ActivityPlantingSelector
                options={activityPlantingOptions}
                selected={selectedActivityOption}
                onSelect={selectActivityPlanting}
                loading={activityPlantingsPending}
                disabled={switchDisabled}
              />
            </div>
          )}
        </div>

        <div className="workspace-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isActivities ? "Search activities..." : isTypes ? "Search crop types..." : "Search plantings..."} />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
          </label>
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
            {!activityPlantingsPending && activityPlantingData.error && <div className="ff-error" role="alert">{activityPlantingData.error}</div>}
            {!activityLogsPending && activityError && <div className="ff-error" role="alert">{activityError}</div>}
          </>
        ) : !farmDataPending && pageError && <div className="ff-error" role="alert">{pageError}</div>}

        {(isActivities ? activityPlantingsPending : farmDataPending) ? (
          <SkeletonBlock rows={5} />
        ) : !isActivities && !isTypes && fields.length === 0 ? (
          <div className="empty-state"><MapPinned size={23} /><strong>No fields in this farm</strong><span>Add a field before creating a crop planting.</span><button className="button-secondary" type="button" onClick={() => onNavigate("Fields")}>Manage fields <ArrowRight size={14} /></button></div>
        ) : !isActivities && isTypes ? (
          loading ? (
            <SkeletonBlock rows={4} />
          ) : filteredTypes.length === 0 ? (
            <div className="empty-state"><Leaf size={23} /><strong>{search ? "No matching crop types" : "No crop types yet"}</strong><span>{search ? "Try another search." : "Create crop types such as tomato, rice, or chilli for this farm."}</span>{!search && <button className="button-primary" type="button" onClick={openCreateType}><Plus size={14} /> Add crop type</button>}</div>
          ) : (
            <div className="workspace-table-wrap">
              <table className="workspace-table crop3-table">
                <thead><tr><th>CROP TYPE</th><th>DESCRIPTION</th><th>DEFAULT MATURITY</th><th>PLANTINGS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {paginatedTypes.map((cropType) => {
                    const used = farmPlantings.filter((item) => String(item.cropTypeId) === String(cropType.id)).length;
                    return (
                      <tr key={cropType.id}>
                        <td><strong className="workspace-cell-title">{cropType.name}</strong></td>
                        <td className="crop3-description">{cropType.description || "—"}</td>
                        <td>{cropType.defaultMaturityTimeInDays ? cropType.defaultMaturityTimeInDays + " days" : "Not set"}</td>
                        <td>{used}</td>
                        <td><div className="ff-row-actions">
                          <UseAnimations
                            animation={edit}
                            size={14}
                            interaction="hover"
                            render={(eventProps, animationProps) => (
                              <button {...eventProps} type="button" className="ff-icon-button" aria-label={"Edit " + cropType.name} onClick={() => openEditType(cropType)}>
                                <span {...animationProps} aria-hidden="true" />
                              </button>
                            )}
                          />
                          <UseAnimations
                            animation={trash2}
                            size={14}
                            interaction="hover"
                            render={(eventProps, animationProps) => (
                              <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label={"Delete " + cropType.name} disabled={used > 0 || deletingId === "type-" + cropType.id} onClick={() => deleteType(cropType)}>
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
          ) : !selectedPlanting ? (
            <div className="empty-state"><Sprout size={23} /><strong>No plantings available</strong><span>Create a planting first, then log field activity against it.</span><button className="button-primary" type="button" onClick={() => onNavigate("Crop management")}>Go to crop management <ArrowRight size={14} /></button></div>
          ) : activities.length === 0 ? (
            <div className="empty-state"><ClipboardList size={23} /><strong>No activity logs yet</strong><span>Start a daily journal for {selectedPlanting.cropTypeName}.</span><button className="button-primary" type="button" onClick={openCreateActivity}><Plus size={14} /> Log first activity</button></div>
          ) : (
            <div className="workspace-table-wrap">
              <table className="workspace-table crop3-table">
                <thead><tr><th>DAY</th><th>GROWTH STAGE</th><th>ACTIVITY</th><th>CREATED</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {activities.filter((item) => [item.dailyActivity, item.cropStage, item.status, item.dayNumber].join(" ").toLowerCase().includes(search.toLowerCase())).map((activity) => (
                    <tr key={activity.id}>
                      <td>Day {activity.dayNumber}</td>
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
                            <button {...eventProps} type="button" className="ff-icon-button" aria-label="Edit activity" onClick={() => openEditActivity(activity)} disabled={["COMPLETED", "CANCELLED"].includes(activity.status)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                        {ACTIVITY_TRANSITIONS[activity.status]?.length > 0 && (
                          <Select value="" onValueChange={(next) => changeActivityStatus(activity, next)}>
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
                            <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label="Delete activity" disabled={activity.status !== "PLANNED" || deletingId === "activity-" + activity.id} onClick={() => deleteActivity(activity)}>
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
          <div className="empty-state"><Sprout size={23} /><strong>No plantings yet</strong><span>Create a crop type first, then assign it to one of your fields.</span>{cropTypes.length === 0 ? <button className="button-secondary" type="button" onClick={() => setSection("types")}>Create a crop type <ArrowRight size={14} /></button> : <button className="button-primary" type="button" onClick={openCreatePlanting}><Plus size={14} /> Add planting</button>}</div>
        ) : filteredPlantings.length === 0 ? (
          <div className="empty-state"><Search size={23} /><strong>No matching plantings</strong><span>Try changing your search or status filter.</span></div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table crop3-table">
              <thead><tr><th>CROP</th><th>FIELD</th><th>AREA</th><th>PLANTED</th><th>EXPECTED HARVEST</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {paginatedPlantings.map((planting) => {
                  const field = fieldById.get(String(planting.fieldId));
                  const transitions = PLANTING_TRANSITIONS[planting.status] || [];
                  return (
                    <tr key={planting.id}>
                      <td><strong className="workspace-cell-title">{planting.cropTypeName}</strong></td>
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
                            <button {...eventProps} type="button" className="ff-icon-button" aria-label={"Edit " + planting.cropTypeName + " planting"} disabled={["COMPLETED", "CANCELLED"].includes(planting.status)} onClick={() => openEditPlanting(planting)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                        {transitions.length > 0 && (
                          <Select value="" onValueChange={(next) => changePlantingStatus(planting, next)}>
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
                            <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label={"Delete " + planting.cropTypeName + " planting"} disabled={planting.status !== "PLANNED" || deletingId === "planting-" + planting.id} onClick={() => deletePlanting(planting)}>
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

        <div className={isActivities ? "workspace-data-footer" : "workspace-data-footer ff-fields-footer"}>
          <span>
            Showing <strong>{isActivities ? (activityPlantingsPending || activityLogsPending ? "…" : activities.length) : farmDataPending ? "…" : filteredCropCount ? `${cropPageStart + 1}–${Math.min(cropPageStart + CROPS_PER_PAGE, filteredCropCount)} of ${filteredCropCount}` : "0"}</strong> {isActivities ? "activity logs" : isTypes ? "crop types" : "plantings"}
          </span>
          {!isActivities && !farmDataPending && filteredCropCount > 0 && (
            <Pagination className="ff-farm-pagination ff-field-pagination" aria-label={isTypes ? "Crop library pagination" : "Plantings pagination"}>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious disabled={currentCropPage === 1} onClick={() => setCropPage(currentCropPage - 1)} />
                </PaginationItem>
                {cropPageItems(currentCropPage, cropPageCount).map((item) => (
                  <PaginationItem key={item}>
                    {typeof item === "number" ? (
                      <PaginationLink isActive={currentCropPage === item} aria-label={`Page ${item}`} onClick={() => setCropPage(item)}>{item}</PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext disabled={currentCropPage === cropPageCount} onClick={() => setCropPage(currentCropPage + 1)} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          <span>{isActivities ? selectedActivityOption?.farmName || "No planting selected" : selectedFarm.name}</span>
        </div>
      </div>

      {typeDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !typeSaving) setTypeDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog" onSubmit={submitType}>
            <div className="dialog-heading"><div><span className="section-kicker">CROP LIBRARY</span><h2>{editingType ? "Edit crop type" : "Add crop type"}</h2><p>Crop types are saved to {selectedFarm.name}.</p></div><button type="button" className="icon-button" aria-label="Close dialog" disabled={typeSaving} onClick={() => setTypeDialogOpen(false)}><X size={19} /></button></div>
            {typeError && <div className="ff-error" role="alert">{typeError}</div>}
            <label className="form-label">Crop name<input required maxLength={100} value={typeForm.name} onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })} placeholder="e.g. Tomato" /></label>
            <label className="form-label">Description<textarea rows={3} maxLength={500} value={typeForm.description} onChange={(event) => setTypeForm({ ...typeForm, description: event.target.value })} placeholder="Variety, growing notes, or other details" /></label>
            <label className="form-label">Default maturity (days)<input type="number" min="1" step="1" value={typeForm.defaultMaturityTimeInDays} onChange={(event) => setTypeForm({ ...typeForm, defaultMaturityTimeInDays: event.target.value })} placeholder="e.g. 90" /></label>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={typeSaving} onClick={() => setTypeDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={typeSaving || !typeForm.name.trim()}><Plus size={15} /> {typeSaving ? "Saving…" : editingType ? "Save changes" : "Create crop type"}</button></div>
          </form>
        </div>
      )}

      {plantingDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !plantingSaving) setPlantingDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog crop3-planting-dialog" onSubmit={submitPlanting}>
            <div className="dialog-heading"><div><span className="section-kicker">PLANTING RECORD</span><h2>{editingPlanting ? "Edit planting" : "Add planting"}</h2><p>Assign a crop type and area to a field in {selectedFarm.name}.</p></div><button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" disabled={plantingSaving} onClick={() => setPlantingDialogOpen(false)}><X size={19} /></button></div>
            {plantingError && <div className="ff-error" role="alert">{plantingError}</div>}
            {!editingPlanting && (
              <div className="form-label">
                <label htmlFor="planting-field">Field</label>
                <FieldSelect fields={fields} value={plantingForm.fieldId} disabled={plantingSaving} onChange={(value) => setPlantingForm((current) => ({ ...current, fieldId: value }))} />
              </div>
            )}
            <div className="form-label">
              <label htmlFor="planting-crop-type">Crop type</label>
              <Select required disabled={plantingSaving} value={plantingForm.cropTypeId} onValueChange={(value) => {
                const cropType = cropTypes.find((item) => String(item.id) === value);
                setPlantingForm((current) => ({ ...current, cropTypeId: value, maturityTimeInDays: cropType?.defaultMaturityTimeInDays ? String(cropType.defaultMaturityTimeInDays) : "" }));
              }}>
                <SelectTrigger id="planting-crop-type" className="ifc-form-select"><SelectValue placeholder="Choose a crop type" /></SelectTrigger>
                <SelectContent align="start">
                  {cropTypes.map((cropType) => <SelectItem key={cropType.id} value={String(cropType.id)}>{cropType.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="form-label">Crop area
              <Input type="number" required min="0.01" step="0.01" disabled={plantingSaving} value={plantingForm.cropArea} onChange={(event) => setPlantingForm((current) => ({ ...current, cropArea: event.target.value }))} placeholder="e.g. 0.75" />
            </label>
            {plantingForm.fieldId && !editingPlanting && (
              <Alert className="crop3-area-info" variant="info" role="status">
                <Info size={16} aria-hidden="true" />
                <AlertDescription>Available field area: <strong>{numberLabel(fields.find((field) => String(field.id) === String(plantingForm.fieldId))?.availableArea)}</strong></AlertDescription>
              </Alert>
            )}
            <div className="crop3-form-grid">
              <div className="form-label">
                <label htmlFor="planting-date">Planting date</label>
                <DatePicker id="planting-date" required disabled={plantingSaving} value={plantingForm.plantedOn} onChange={(value) => setPlantingForm((current) => ({ ...current, plantedOn: value, expectedHarvestOn: current.expectedHarvestOn && current.expectedHarvestOn < value ? "" : current.expectedHarvestOn }))} />
              </div>
              <div className="form-label">
                <label htmlFor="planting-harvest-date">Expected harvest <span className="crop3-optional">(optional)</span></label>
                <DatePicker id="planting-harvest-date" disabled={plantingSaving} value={plantingForm.expectedHarvestOn} min={plantingForm.plantedOn} onChange={(value) => setPlantingForm((current) => ({ ...current, expectedHarvestOn: value }))} />
              </div>
            </div>
            <label className="form-label">Maturity time (days)
              <Input type="number" min="1" step="1" disabled={plantingSaving} value={plantingForm.maturityTimeInDays} onChange={(event) => setPlantingForm((current) => ({ ...current, maturityTimeInDays: event.target.value }))} placeholder="Uses crop type default when blank" />
            </label>
            <div className="dialog-note"><CalendarDays size={16} /><span>Leave expected harvest empty to calculate it from the planting date and maturity time.</span></div>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={plantingSaving} onClick={() => setPlantingDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={plantingSaving || !cropTypes.length || !fields.length}><Plus size={15} /> {plantingSaving ? "Saving…" : editingPlanting ? "Save changes" : "Create planting"}</button></div>
          </form>
        </div>
      )}

      {activityDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !activitySaving) setActivityDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog" onSubmit={submitActivity}>
            <div className="dialog-heading"><div><span className="section-kicker">FIELD JOURNAL</span><h2>{editingActivity ? "Edit activity" : "Log an activity"}</h2><p>{selectedActivityOption?.cropName} · {selectedActivityOption?.farmName} · {selectedActivityOption?.fieldName}</p></div><button type="button" className="icon-button" aria-label="Close dialog" disabled={activitySaving} onClick={() => setActivityDialogOpen(false)}><X size={19} /></button></div>
            {activityFormError && <div className="ff-error" role="alert">{activityFormError}</div>}
            <div className="crop3-form-grid">
              <label className="form-label">Crop-cycle day<input type="number" required min="1" step="1" value={activityForm.dayNumber} onChange={(event) => setActivityForm({ ...activityForm, dayNumber: event.target.value })} /></label>
              <label className="form-label">Growth stage<select className="form-select" value={activityForm.cropStage} onChange={(event) => setActivityForm({ ...activityForm, cropStage: event.target.value })}><option value="">Not specified</option>{CROP_STAGES.map((stage) => <option key={stage} value={stage}>{humanize(stage)}</option>)}</select></label>
            </div>
            <label className="form-label">Daily activity<input required maxLength={2000} value={activityForm.dailyActivity} onChange={(event) => setActivityForm({ ...activityForm, dailyActivity: event.target.value })} placeholder="e.g. Drip irrigation and soil inspection" /></label>
            <label className="form-label">Nutrition and water management<textarea rows={2} maxLength={2000} value={activityForm.nutritionAndWaterManagement} onChange={(event) => setActivityForm({ ...activityForm, nutritionAndWaterManagement: event.target.value })} placeholder="Optional observations" /></label>
            <label className="form-label">Pest and disease control<textarea rows={2} maxLength={2000} value={activityForm.pestAndDiseaseControl} onChange={(event) => setActivityForm({ ...activityForm, pestAndDiseaseControl: event.target.value })} placeholder="Optional observations" /></label>
            <label className="form-label">Notes<textarea rows={2} maxLength={2000} value={activityForm.notes} onChange={(event) => setActivityForm({ ...activityForm, notes: event.target.value })} placeholder="Additional notes" /></label>
            <label className="form-label">Status<select className="form-select" value={activityForm.status} onChange={(event) => setActivityForm({ ...activityForm, status: event.target.value })}>{(editingActivity ? [editingActivity.status, ...(ACTIVITY_TRANSITIONS[editingActivity.status] || [])] : ["PLANNED"]).map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select></label>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={activitySaving} onClick={() => setActivityDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={activitySaving}><Plus size={15} /> {activitySaving ? "Saving…" : editingActivity ? "Save changes" : "Save activity"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}
