import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Leaf,
  MapPinned,
  Pencil,
  Plus,
  Ruler,
  Search,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import { SkeletonBlock } from "./ui/Skeleton";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import {
  cropActivityApi,
  cropPlantingApi,
  cropTypeApi,
  fieldApi,
} from "../api/client";

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
    <select className="form-select" value={value} onChange={onChange} disabled={disabled}>
      <option value="">Choose a field</option>
      {fields.map((field) => (
        <option key={field.id} value={field.id}>
          {field.fieldName} · {numberLabel(field.availableArea)} available
        </option>
      ))}
    </select>
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
  const [pageError, setPageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [section, setSection] = useState("plantings");

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

  const [selectedPlantingId, setSelectedPlantingId] = useState("");
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

  const farmId = selectedFarm?.id;

  useEffect(() => {
    let current = true;
    if (!farmId) {
      setFields([]);
      setCropTypes([]);
      setPlantings([]);
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
        if (current) setLoading(false);
      });

    return () => { current = false; };
  }, [farmId, reloadKey, notify]);

  const fieldById = useMemo(
    () => new Map(fields.map((field) => [String(field.id), field])),
    [fields],
  );

  const farmPlantings = useMemo(
    () => plantings.filter((planting) => fieldById.has(String(planting.fieldId))),
    [plantings, fieldById],
  );

  const selectedPlanting = useMemo(
    () => farmPlantings.find((planting) => String(planting.id) === String(selectedPlantingId)) || null,
    [farmPlantings, selectedPlantingId],
  );

  useEffect(() => {
    setSelectedPlantingId((current) => (
      farmPlantings.some((planting) => String(planting.id) === String(current))
        ? current
        : String(farmPlantings[0]?.id || "")
    ));
  }, [farmPlantings]);

  useEffect(() => {
    if (active !== "Activities" || !selectedPlantingId) {
      setActivities([]);
      setActivityError("");
      setActivitiesLoading(false);
      return undefined;
    }

    let current = true;
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
        if (current) setActivitiesLoading(false);
      });

    return () => { current = false; };
  }, [active, selectedPlantingId, reloadKey, activityReload, notify]);

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

  if (!selectedFarm?.id) {
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

  const isActivities = active === "Activities";
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
        <div className="workspace-title-actions crop3-title-actions">
          {farms.length > 1 && (
            <label className="ff-farm-select">
              <span>Farm</span>
              <select value={selectedFarm.id} onChange={(event) => {
                const nextFarm = farms.find((farm) => String(farm.id) === event.target.value);
                if (nextFarm) setSelectedFarm(nextFarm);
              }}>
                {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
          )}
          {isActivities ? (
            <button className="button-primary" type="button" onClick={openCreateActivity} disabled={!selectedPlanting}>
              <Plus size={15} /> Log activity
            </button>
          ) : isTypes ? (
            <button className="button-primary" type="button" onClick={openCreateType}>
              <Plus size={15} /> Add crop type
            </button>
          ) : (
            <button className="button-primary" type="button" onClick={openCreatePlanting} disabled={!fields.length || !cropTypes.length}>
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
          <Stat label="Plantings" value={farmPlantings.length} detail="in this farm" icon={Sprout} />
          <Stat label="Active crops" value={activePlantings} detail="growing or harvesting" icon={Leaf} />
          <Stat label="Crop types" value={cropTypes.length} detail="available in this farm" icon={ClipboardList} />
          <Stat label="Fields" value={fields.length} detail="ready for planting" icon={MapPinned} />
        </div>
      ) : isTypes ? (
        <div className="workspace-stats">
          <Stat label="Crop types" value={cropTypes.length} detail="registered in this farm" icon={Leaf} />
          <Stat label="With maturity defaults" value={cropTypes.filter((item) => item.defaultMaturityTimeInDays).length} detail="ready for quick planting" icon={CalendarDays} />
          <Stat label="Used by plantings" value={new Set(farmPlantings.map((item) => item.cropTypeId)).size} detail="crop varieties in use" icon={Sprout} />
          <Stat label="Fields" value={fields.length} detail="in this farm" icon={MapPinned} />
        </div>
      ) : (
        <div className="workspace-stats">
          <Stat label="Activity entries" value={activities.length} detail="for selected planting" icon={ClipboardList} />
          <Stat label="In progress" value={activities.filter((item) => item.status === "IN_PROGRESS").length} detail="work underway" icon={Sprout} />
          <Stat label="Completed" value={activities.filter((item) => item.status === "COMPLETED").length} detail="activities finished" icon={Check} />
          <Stat label="Planned" value={activities.filter((item) => item.status === "PLANNED").length} detail="upcoming work" icon={CalendarDays} />
        </div>
      )}

      <div className="workspace-data-card surface-card crop3-data-card">
        <div className="workspace-data-heading">
          <div>
            <h2>{isActivities ? "Activities for this planting" : isTypes ? "Crop library" : "Plantings in " + selectedFarm.name}</h2>
            <p>{isActivities ? "Choose a planting to view its chronological activity history." : isTypes ? "Crop types are configured separately for each farm." : "Planting area is reserved against the selected field by the backend."}</p>
          </div>
          {isActivities && (
            <label className="crop3-planting-select">
              <span>Planting</span>
              <select value={selectedPlantingId} onChange={(event) => setSelectedPlantingId(event.target.value)}>
                <option value="">Choose a planting</option>
                {farmPlantings.map((planting) => (
                  <option key={planting.id} value={planting.id}>
                    {planting.cropTypeName} · {fieldById.get(String(planting.fieldId))?.fieldName || "Field"} · {dateLabel(planting.plantedOn)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="workspace-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isActivities ? "Search activities..." : isTypes ? "Search crop types..." : "Search plantings..."} />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
          </label>
          {!isActivities && !isTypes && (
            <label className="workspace-filter crop3-status-filter">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All statuses</option>
                {["PLANNED", "ACTIVE", "HARVESTING", "COMPLETED", "CANCELLED"].map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
              </select>
              <ChevronDown size={13} />
            </label>
          )}
          <span className="result-count">
            {isActivities ? activities.filter((item) => [item.dailyActivity, item.cropStage, item.status].join(" ").toLowerCase().includes(search.toLowerCase())).length : isTypes ? filteredTypes.length : filteredPlantings.length} records
          </span>
        </div>

        {(pageError || (isActivities && activityError)) && <div className="ff-error" role="alert">{isActivities ? activityError || pageError : pageError}</div>}

        {loading ? (
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
                  {filteredTypes.map((cropType) => {
                    const used = farmPlantings.filter((item) => String(item.cropTypeId) === String(cropType.id)).length;
                    return (
                      <tr key={cropType.id}>
                        <td><strong className="workspace-cell-title">{cropType.name}</strong></td>
                        <td className="crop3-description">{cropType.description || "—"}</td>
                        <td>{cropType.defaultMaturityTimeInDays ? cropType.defaultMaturityTimeInDays + " days" : "Not set"}</td>
                        <td>{used}</td>
                        <td><div className="ff-row-actions">
                          <button type="button" className="ff-icon-button" aria-label={"Edit " + cropType.name} onClick={() => openEditType(cropType)}><Pencil size={14} /></button>
                          <button type="button" className="ff-icon-button ff-danger" aria-label={"Delete " + cropType.name} disabled={used > 0 || deletingId === "type-" + cropType.id} onClick={() => deleteType(cropType)}><Trash2 size={14} /></button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : isActivities ? (
          activitiesLoading ? (
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
                        <button type="button" className="ff-icon-button" aria-label="Edit activity" onClick={() => openEditActivity(activity)} disabled={["COMPLETED", "CANCELLED"].includes(activity.status)}><Pencil size={14} /></button>
                        {ACTIVITY_TRANSITIONS[activity.status]?.length > 0 && (
                          <select className="crop3-action-select" aria-label="Change activity status" defaultValue="" onChange={(event) => { changeActivityStatus(activity, event.target.value); event.target.value = ""; }}>
                            <option value="" disabled>Move to…</option>
                            {ACTIVITY_TRANSITIONS[activity.status].map((next) => <option key={next} value={next}>{humanize(next)}</option>)}
                          </select>
                        )}
                        <button type="button" className="ff-icon-button ff-danger" aria-label="Delete activity" disabled={activity.status !== "PLANNED" || deletingId === "activity-" + activity.id} onClick={() => deleteActivity(activity)}><Trash2 size={14} /></button>
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
                {filteredPlantings.map((planting) => {
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
                        <button type="button" className="ff-icon-button" aria-label={"Edit " + planting.cropTypeName + " planting"} disabled={["COMPLETED", "CANCELLED"].includes(planting.status)} onClick={() => openEditPlanting(planting)}><Pencil size={14} /></button>
                        {transitions.length > 0 && (
                          <select className="crop3-action-select" aria-label="Change planting status" defaultValue="" onChange={(event) => { changePlantingStatus(planting, event.target.value); event.target.value = ""; }}>
                            <option value="" disabled>Move to…</option>
                            {transitions.map((next) => <option key={next} value={next}>{humanize(next)}</option>)}
                          </select>
                        )}
                        <button type="button" className="ff-icon-button ff-danger" aria-label={"Delete " + planting.cropTypeName + " planting"} disabled={planting.status !== "PLANNED" || deletingId === "planting-" + planting.id} onClick={() => deletePlanting(planting)}><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="workspace-data-footer">
          <span>Showing <strong>{isActivities ? activities.length : isTypes ? filteredTypes.length : filteredPlantings.length}</strong> {isActivities ? "activity logs" : isTypes ? "crop types" : "plantings"}</span>
          <span>{selectedFarm.name} · data from IFC backend</span>
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
          <form className="dialog-card crop3-dialog" onSubmit={submitPlanting}>
            <div className="dialog-heading"><div><span className="section-kicker">PLANTING RECORD</span><h2>{editingPlanting ? "Edit planting" : "Add planting"}</h2><p>Assign a crop type and area to a field in {selectedFarm.name}.</p></div><button type="button" className="icon-button" aria-label="Close dialog" disabled={plantingSaving} onClick={() => setPlantingDialogOpen(false)}><X size={19} /></button></div>
            {plantingError && <div className="ff-error" role="alert">{plantingError}</div>}
            {!editingPlanting && <label className="form-label">Field<FieldSelect fields={fields} value={plantingForm.fieldId} onChange={(event) => setPlantingForm({ ...plantingForm, fieldId: event.target.value })} /></label>}
            <label className="form-label">Crop type<select className="form-select" required value={plantingForm.cropTypeId} onChange={(event) => { const cropType = cropTypes.find((item) => String(item.id) === event.target.value); setPlantingForm({ ...plantingForm, cropTypeId: event.target.value, maturityTimeInDays: cropType?.defaultMaturityTimeInDays ? String(cropType.defaultMaturityTimeInDays) : "" }); }}><option value="">Choose a crop type</option>{cropTypes.map((cropType) => <option key={cropType.id} value={cropType.id}>{cropType.name}</option>)}</select></label>
            <label className="form-label">Crop area<input type="number" required min="0.01" step="0.01" value={plantingForm.cropArea} onChange={(event) => setPlantingForm({ ...plantingForm, cropArea: event.target.value })} placeholder="e.g. 0.75" /></label>
            {plantingForm.fieldId && !editingPlanting && <div className="dialog-note"><Ruler size={16} /><span>Available field area: {numberLabel(fields.find((field) => String(field.id) === String(plantingForm.fieldId))?.availableArea)}. Use the same area unit as the field; the backend validates reservations when saving.</span></div>}
            <div className="crop3-form-grid">
              <label className="form-label">Planting date<input type="date" required value={plantingForm.plantedOn} onChange={(event) => setPlantingForm({ ...plantingForm, plantedOn: event.target.value })} /></label>
              <label className="form-label">Expected harvest<input type="date" min={plantingForm.plantedOn || undefined} value={plantingForm.expectedHarvestOn} onChange={(event) => setPlantingForm({ ...plantingForm, expectedHarvestOn: event.target.value })} /></label>
            </div>
            <label className="form-label">Maturity time (days)<input type="number" min="1" step="1" value={plantingForm.maturityTimeInDays} onChange={(event) => setPlantingForm({ ...plantingForm, maturityTimeInDays: event.target.value })} placeholder="Uses crop type default when blank" /></label>
            <div className="dialog-note"><CalendarDays size={16} /><span>Leave expected harvest empty to let the backend calculate it from the planting date and maturity time.</span></div>
            <div className="dialog-actions"><button type="button" className="button-secondary" disabled={plantingSaving} onClick={() => setPlantingDialogOpen(false)}>Cancel</button><button type="submit" className="button-primary" disabled={plantingSaving || !cropTypes.length || !fields.length}><Plus size={15} /> {plantingSaving ? "Saving…" : editingPlanting ? "Save changes" : "Create planting"}</button></div>
          </form>
        </div>
      )}

      {activityDialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !activitySaving) setActivityDialogOpen(false); }}>
          <form className="dialog-card crop3-dialog" onSubmit={submitActivity}>
            <div className="dialog-heading"><div><span className="section-kicker">FIELD JOURNAL</span><h2>{editingActivity ? "Edit activity" : "Log an activity"}</h2><p>{selectedPlanting?.cropTypeName} · {fieldById.get(String(selectedPlanting?.fieldId))?.fieldName || "Field"}</p></div><button type="button" className="icon-button" aria-label="Close dialog" disabled={activitySaving} onClick={() => setActivityDialogOpen(false)}><X size={19} /></button></div>
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
