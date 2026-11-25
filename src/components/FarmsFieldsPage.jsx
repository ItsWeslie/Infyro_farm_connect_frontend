import { TooltipTarget } from "./ui/tooltip";
import { useEffect, useMemo, useRef, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import checkmark from "react-useanimations/lib/checkmark";
import edit from "react-useanimations/lib/edit";
import trash2 from "react-useanimations/lib/trash2";
import alertCircle from "react-useanimations/lib/alertCircle";
import {
  ArrowRight,
  Building2,
  Eye,
  FolderOpen,
  LandPlot,
  MapPinned,
  Plus,
  Ruler,
  Search,
  Sprout,
  Tractor,
  X,
} from "lucide-react";
import { farmApi, fieldApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";
import { Alert, AlertDescription } from "./ui/alert";
import FarmDetailsDialog from "./farm-details/FarmDetailsDialog";
import { Input } from "./ui/input";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./ui/pagination";
import { useConfirmDialog } from "../context/ConfirmDialogContext";

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function areaLabel(value) {
  return numeric(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function totalArea(fields, key = "totalArea") {
  return fields.reduce((sum, field) => sum + numeric(field?.[key]), 0);
}

const FARMS_PER_PAGE = 5;
const FIELDS_PER_PAGE = 5;

function farmPageItems(page, totalPages) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((value, index) => (
    index > 0 && value - pages[index - 1] > 1
      ? [`gap-${value}`, value]
      : [value]
  ));
}

function Stat({ label, value, detail, icon: Icon }) {
  return (
    <article className="workspace-stat surface-card">
      <div className="workspace-stat-label">
        {label}
        <span className="workspace-stat-icon">
          <Icon size={15} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
      <span className="workspace-stat-accent" />
    </article>
  );
}

export default function FarmsFieldsPage({
  active,
  farms,
  setFarms,
  farmsLoading,
  farmsError,
  selectedFarm,
  setSelectedFarm,
  refreshFarms,
  onNavigate,
  notify,
}) {
  const confirmDialog = useConfirmDialog();
  const isFarmsPage = active === "Farms";
  const [query, setQuery] = useState("");
  const [farmPage, setFarmPage] = useState(1);
  const [fieldPage, setFieldPage] = useState(1);
  const [detailsFarm, setDetailsFarm] = useState(null);
  const detailsTriggerRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [farmSaveSuccess, setFarmSaveSuccess] = useState(false);
  const dialogVersionRef = useRef(0);
  const submitLockRef = useRef(false);
  const dialogBusy = saving || farmSaveSuccess;
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [fieldData, setFieldData] = useState({ key: null, records: [], failedFarms: [] });
  const [fieldsError, setFieldsError] = useState("");
  const [fieldReload, setFieldReload] = useState(0);
  const [farmFilter, setFarmFilter] = useState("ALL");
  const [formFarmId, setFormFarmId] = useState("");
  const ownedFarmsKey = JSON.stringify([...new Set(farms.filter((farm) => farm.id != null).map((farm) => String(farm.id)))].sort());
  const requestKey = JSON.stringify([ownedFarmsKey, fieldReload]);
  const fieldsPending = farmsLoading || fieldData.key !== requestKey;
  const fields = useMemo(() => fieldData.key === requestKey ? fieldData.records : [], [fieldData, requestKey]);
  const failedFarms = fieldsPending ? [] : fieldData.failedFarms;
  const farmById = useMemo(() => new Map(farms.map((farm) => [String(farm.id), farm])), [farms]);
  const currentFarmFilter = farmFilter === "ALL" || farmById.has(farmFilter) ? farmFilter : "ALL";
  const formFarm = farmById.get(editing && !isFarmsPage ? String(editing.farmId) : formFarmId);
  const formFarmFields = fields.filter((field) => field.farmId === String(formFarm?.id));
  const formFarmAreaAvailable = !fieldsPending && formFarm && !failedFarms.includes(String(formFarm.id));

  function updateFarmFields(farmId, nextFields) {
    const id = String(farmId);
    const ownedFields = nextFields.map((field) => ({ ...field, farmId: id }));
    setFieldData((current) => ({ ...current, records: [...current.records.filter((field) => field.farmId !== id), ...ownedFields] }));
    setFarms((current) => current.map((farm) => String(farm.id) === id ? { ...farm, fields: ownedFields } : farm));
    setSelectedFarm((current) => current && String(current.id) === id ? { ...current, fields: ownedFields } : current);
  }

  useEffect(() => {
    if (isFarmsPage || farmsLoading) return undefined;
    let current = true;
    const ids = JSON.parse(ownedFarmsKey);
    setFieldsError("");
    Promise.allSettled(ids.map((id) => fieldApi.getByFarm(id))).then((results) => {
      if (!current) return;
      const records = [];
      const failedFarms = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          unwrapList(result.value).forEach((field) => {
            if (field.id != null) records.push({ ...field, farmId: ids[index] });
          });
        } else {
          failedFarms.push(ids[index]);
        }
      });
      setFieldData({ key: requestKey, records, failedFarms });
    });
    return () => { current = false; };
  }, [isFarmsPage, farmsLoading, ownedFarmsKey, requestKey]);

  useEffect(() => {
    setQuery("");
    setFarmPage(1);
    setFieldPage(1);
    setFarmFilter("ALL");
    setFormFarmId("");
    setDetailsFarm(null);
    dialogVersionRef.current += 1;
    setFarmSaveSuccess(false);
    setDialogOpen(false);
    setEditing(null);
  }, [active]);

  useEffect(() => {
    if (!farmSaveSuccess || !dialogOpen || !isFarmsPage || !editing) return;
    const timer = setTimeout(() => {
      setDialogOpen(false);
      setEditing(null);
      setName("");
      setFarmSaveSuccess(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, [farmSaveSuccess, dialogOpen, isFarmsPage, editing]);

  const farmStats = useMemo(() => {
    const allFields = farms.flatMap((farm) => farm.fields || []);
    return {
      farms: farms.length,
      fields: allFields.length,
      totalArea: totalArea(allFields),
      availableArea: totalArea(allFields, "availableArea"),
    };
  }, [farms]);

  const fieldStats = useMemo(() => ({
    count: fields.length,
    totalArea: totalArea(fields),
    availableArea: totalArea(fields, "availableArea"),
    usedArea: Math.max(0, totalArea(fields) - totalArea(fields, "availableArea")),
  }), [fields]);

  const filteredFarms = useMemo(() => farms.filter((farm) => (
    [farm.name, String(farm.id)].join(" ").toLowerCase().includes(query.toLowerCase())
  )), [farms, query]);

  const farmPageCount = Math.max(1, Math.ceil(filteredFarms.length / FARMS_PER_PAGE));
  const currentFarmPage = Math.min(farmPage, farmPageCount);
  const paginatedFarms = filteredFarms.slice(
    (currentFarmPage - 1) * FARMS_PER_PAGE,
    currentFarmPage * FARMS_PER_PAGE,
  );

  function changeQuery(value) {
    setQuery(value);
    setFarmPage(1);
    setFieldPage(1);
  }

  const filteredFields = useMemo(() => fields.filter((field) => (
    (currentFarmFilter === "ALL" || field.farmId === currentFarmFilter) &&
    [field.fieldName, farmById.get(field.farmId)?.name, field.totalArea, field.availableArea]
      .join(" ").toLowerCase().includes(query.trim().toLowerCase())
  )).sort((a, b) => String(farmById.get(a.farmId)?.name || "").localeCompare(String(farmById.get(b.farmId)?.name || "")) || String(a.fieldName || "").localeCompare(String(b.fieldName || "")) || String(a.id).localeCompare(String(b.id))), [fields, query, farmById, currentFarmFilter]);

  const fieldPageCount = Math.max(1, Math.ceil(filteredFields.length / FIELDS_PER_PAGE));
  const currentFieldPage = Math.min(fieldPage, fieldPageCount);
  const paginatedFields = filteredFields.slice(
    (currentFieldPage - 1) * FIELDS_PER_PAGE,
    currentFieldPage * FIELDS_PER_PAGE,
  );

  useEffect(() => {
    setFieldPage(1);
  }, [currentFarmFilter]);

  useEffect(() => {
    if (!isFarmsPage && !fieldsPending && !fieldsError && !farmsLoading) {
      setFieldPage((page) => Math.min(page, fieldPageCount));
    }
  }, [isFarmsPage, fieldsPending, fieldsError, farmsLoading, fieldPageCount]);

  function openCreate() {
    dialogVersionRef.current += 1;
    setFarmSaveSuccess(false);
    setEditing(null);
    setFormError("");
    setName("");
    setArea("");
    setFormFarmId(!isFarmsPage && currentFarmFilter !== "ALL" ? currentFarmFilter : !isFarmsPage && farms.length === 1 ? String(farms[0].id) : "");
    setDialogOpen(true);
  }

  function openEdit(record) {
    dialogVersionRef.current += 1;
    setFarmSaveSuccess(false);
    setEditing(record);
    setFormFarmId(isFarmsPage ? "" : String(record.farmId));
    setFormError("");
    setName(isFarmsPage ? record.name || "" : record.fieldName || "");
    setArea(record.totalArea == null ? "" : String(record.totalArea));
    setDialogOpen(true);
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!name.trim() || dialogBusy || submitLockRef.current) return;
    submitLockRef.current = true;
    const dialogVersion = dialogVersionRef.current;
    setFormError("");
    setSaving(true);
    const wasEditing = Boolean(editing);
    try {
      if (isFarmsPage) {
        const payload = { farmName: name.trim() };
        const response = wasEditing
          ? await farmApi.update(editing.id, payload)
          : await farmApi.create(payload);
        const savedFarm = response?.data || response;
        if (savedFarm && typeof savedFarm === "object" && savedFarm.id != null) {
          setFarms((current) => wasEditing
            ? current.map((farm) => farm.id === editing.id ? savedFarm : farm)
            : [savedFarm, ...current.filter((farm) => farm.id !== savedFarm.id)]);
          if (!wasEditing) {
            setSelectedFarm(savedFarm);
            setFarmPage(1);
          }
          else if (selectedFarm?.id === savedFarm.id) setSelectedFarm(savedFarm);
        } else {
          refreshFarms(response?.id || (wasEditing ? editing.id : undefined)).catch((error) => notify(error.message || "Unable to sync the farm list.", "error"));
        }
        if (wasEditing) {
          // Only show success in the same Edit farm dialog that submitted the request.
          if (dialogVersionRef.current === dialogVersion) setFarmSaveSuccess(true);
          notify("Farm updated successfully");
        } else {
          setDialogOpen(false);
          setEditing(null);
          setName("");
          notify("Farm created successfully");
        }
      } else {
        if (!formFarm) throw new Error("Choose a farm before adding a field.");
        const targetFarmId = String(formFarm.id);
        const targetFields = fields.filter((field) => field.farmId === targetFarmId);
        if (wasEditing) {
          const response = await fieldApi.update(editing.id, { fieldName: name.trim() });
          const updatedField = response?.data || response;
          if (updatedField && typeof updatedField === "object" && updatedField.id != null) {
            updateFarmFields(targetFarmId, targetFields.map((item) => String(item.id) === String(editing.id) ? updatedField : item));
          }
        } else {
          const parsedArea = Number(area);
          if (!Number.isFinite(parsedArea) || parsedArea < 0.01 || parsedArea > 99999999.99) {
            throw new Error("Enter a valid area between 0.01 and 99,999,999.99 in your chosen area unit.");
          }
          if ((String(area).split(".")[1] || "").length > 2) throw new Error("Area can have at most two decimal places.");
          const response = await fieldApi.create(formFarm.id, { fieldName: name.trim(), totalArea: parsedArea });
          const createdField = response?.data || response;
          // Do not replace cached farm fields with an incomplete list after a failed fetch.
          if (formFarmAreaAvailable && createdField && typeof createdField === "object" && createdField.id != null) {
            updateFarmFields(targetFarmId, [createdField, ...targetFields.filter((item) => String(item.id) !== String(createdField.id))]);
          }
          setFieldPage(1);
        }
        setFieldReload((value) => value + 1);
        if (!formFarmAreaAvailable) refreshFarms().catch((error) => notify(error.message || "Unable to sync the farm list.", "error"));
        setDialogOpen(false);
        setEditing(null);
        setName("");
        setArea("");
        notify(wasEditing ? "Field updated successfully" : "Field created successfully");
      }
    } catch (error) {
      notify(error.message || "Unable to save this record.", "error");
      if (dialogVersionRef.current === dialogVersion) {
        setFarmSaveSuccess(false);
        setFormError(error.message || `Unable to save this ${isFarmsPage ? "farm" : "field"}.`);
      }
    } finally {
      submitLockRef.current = false;
      setSaving(false);
    }
  }

  async function deleteFarm(farm) {
    const confirmed = await confirmDialog({ title: "Delete this farm?", message: `Delete “${farm.name}”?`, details: "This permanently removes the farm from your workspace. This action cannot be undone.", confirmLabel: "Delete farm", tone: "danger" });
    if (!confirmed) return;
    setDeletingId(farm.id);
    try {
      await farmApi.delete(farm.id);
      setFarms((current) => current.filter((item) => item.id !== farm.id));
      setFarmPage(Math.min(currentFarmPage, Math.max(1, Math.ceil(filteredFarms.filter((item) => item.id !== farm.id).length / FARMS_PER_PAGE))));
      if (selectedFarm?.id === farm.id) {
        const nextFarm = farms.find((item) => item.id !== farm.id) || null;
        setSelectedFarm(nextFarm);
      }
      notify("Farm deleted successfully");
    } catch (error) {
      notify(error.message || "Unable to delete this farm.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteField(field) {
    const confirmed = await confirmDialog({ title: "Delete this field?", message: `Delete “${field.fieldName}”?`, details: "This action cannot be undone. Make sure the field is no longer needed before continuing.", confirmLabel: "Delete field", tone: "danger" });
    if (!confirmed) return;
    setDeletingId(field.id);
    setFieldsError("");
    try {
      await fieldApi.delete(field.id);
      updateFarmFields(field.farmId, fields.filter((item) => item.farmId === field.farmId && String(item.id) !== String(field.id)));
      setFieldReload((value) => value + 1);
      notify("Field deleted successfully");
    } catch (error) {
      notify(error.message || "Unable to delete this field.", "error");
      setFieldsError(error.message || "Unable to delete this field.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-eyebrow">
        <span className="eyebrow-pip" />
        {isFarmsPage ? "YOUR LAND, AT A GLANCE" : "EVERY PATCH HAS POTENTIAL"}
      </div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon">
          {isFarmsPage ? <Tractor size={23} /> : <MapPinned size={23} />}
        </div>
        <div className="workspace-title-copy">
          <h1>{isFarmsPage ? "Your farms" : "Your fields"}</h1>
          <p>
            {isFarmsPage
              ? "Create and manage the farms connected to your account."
              : "Manage fields and land allocation across your farms."}
          </p>
        </div>
        <div className={isFarmsPage ? "workspace-title-actions" : "workspace-title-actions ff-field-title-actions"}>
          <button
            className="button-primary"
            type="button"
            onClick={openCreate}
            disabled={!isFarmsPage && (farmsLoading || !farms.length || dialogBusy)}
          >
            <Plus size={16} /> {isFarmsPage ? "Add farm" : "Add field"}
          </button>
        </div>
      </div>

      {isFarmsPage ? (
        <div className="workspace-stats">
          <Stat label="Total farms" value={farmStats.farms} detail="registered farms" icon={Tractor} />
          <Stat label="Total land" value={areaLabel(farmStats.totalArea)} detail="sum of registered field areas" icon={LandPlot} />
          <Stat label="Total fields" value={farmStats.fields} detail="across all farms" icon={MapPinned} />
          <Stat label="Available land" value={areaLabel(farmStats.availableArea)} detail="not assigned to plantings" icon={Sprout} />
        </div>
      ) : (
        <div className="workspace-stats">
          <Stat label="Total fields" value={fieldsPending ? "…" : fieldStats.count} detail={failedFarms.length ? "Partial data · available farms" : "across all farms"} icon={MapPinned} />
          <Stat label="Total field area" value={fieldsPending ? "…" : areaLabel(fieldStats.totalArea)} detail={failedFarms.length ? "Partial data · registered area" : "registered field area"} icon={Ruler} />
          <Stat label="Allocated area" value={fieldsPending ? "…" : areaLabel(fieldStats.usedArea)} detail={failedFarms.length ? "Partial data · allocated area" : "currently allocated"} icon={Building2} />
          <Stat label="Available area" value={fieldsPending ? "…" : areaLabel(fieldStats.availableArea)} detail={failedFarms.length ? "Partial data · available area" : "ready for allocation"} icon={Sprout} />
        </div>
      )}

      <div className="workspace-data-card surface-card ff-data-card">
        <div className="workspace-data-heading">
          <div>
            <h2 className="ff-farm-directory-title">
              {isFarmsPage ? <FolderOpen size={14} aria-hidden="true" /> : <MapPinned size={14} aria-hidden="true" />}
              {isFarmsPage ? "Farm directory" : "Fields in your farms"}
            </h2>
            <p>
              {isFarmsPage
                ? "View and manage all your registered farms in one place."
                : "View and manage registered fields across all your farms."}
            </p>
          </div>
        </div>

        <div className="workspace-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder={`Search ${isFarmsPage ? "farms" : "fields"}...`}
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => changeQuery("")}>
                <X size={14} />
              </button>
            )}
          </label>
          {!isFarmsPage && <>
            <Select value={currentFarmFilter} onValueChange={(value) => { setFarmFilter(value); setFieldPage(1); }}>
              <SelectTrigger className="expense4-ledger-filter ff-field-filter" aria-label="Filter fields by farm"><SelectValue /></SelectTrigger>
              <SelectContent align="start"><SelectItem value="ALL">All farms</SelectItem>{farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}</SelectContent>
            </Select>
            <span className="result-count">{fieldsPending ? "…" : filteredFields.length} fields</span>
          </>}
        </div>

        {!isFarmsPage && !fieldsPending && failedFarms.length > 0 && <div className="expense4-ledger-load-warning" role="status"><span>Could not load fields for {failedFarms.map((id) => farmById.get(id)?.name || "Farm").join(", ")}. Totals and records may be incomplete.</span><button type="button" className="button-secondary" onClick={() => setFieldReload((value) => value + 1)}>Retry</button></div>}
        {(isFarmsPage ? farmsError : fieldsError || farmsError) && (
          <div className="ff-error" role="alert">
            {isFarmsPage ? farmsError : fieldsError || farmsError}
          </div>
        )}

        {isFarmsPage ? (
          farmsLoading ? (
            <SkeletonBlock rows={4} />
          ) : filteredFarms.length === 0 ? (
            <div className="empty-state">
              <Building2 size={23} />
              <strong>{query ? "No matching farms" : "No farms yet"}</strong>
              <span>{query ? "Try another search term." : "Add your first farm to start organizing your land."}</span>
              {!query && <button type="button" className="button-primary" onClick={openCreate}><Plus size={15} /> Add your first farm</button>}
            </div>
          ) : (
            <div className="workspace-table-wrap">
              <table className="workspace-table ff-table">
                <thead>
                  <tr><th>FARM NAME</th><th>LAND AREA</th><th>FIELDS</th><th>AVAILABLE AREA</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {paginatedFarms.map((farm) => {
                    const farmFields = farm.fields || [];
                    return (
                      <tr key={farm.id}>
                        <td><strong className="workspace-cell-title">{farm.name}</strong></td>
                        <td>{areaLabel(totalArea(farmFields))}</td>
                        <td>{farmFields.length}</td>
                        <td>{areaLabel(totalArea(farmFields, "availableArea"))}</td>
                        <td>
                          <div className="ff-row-actions">
                            <button type="button" className="ff-action-button" aria-haspopup="dialog" aria-label={`View details for ${farm.name}`} onClick={(event) => { detailsTriggerRef.current = event.currentTarget; setDetailsFarm(farm); }}>
                              <Eye size={13} aria-hidden="true" /> View details
                            </button>
                            <UseAnimations
                              animation={edit}
                              size={14}
                              interaction="hover"
                              onClick={() => openEdit(farm)}
                              aria-label={`Edit ${farm.name}`}
                              render={(eventProps, animationProps) => (
                                <button {...eventProps} type="button" className="ff-icon-button" aria-label={`Edit ${farm.name}`}>
                                  <span {...animationProps} aria-hidden="true" />
                                </button>
                              )}
                            />
                            <UseAnimations
                              animation={trash2}
                              size={14}
                              interaction="hover"
                              onClick={() => deleteFarm(farm)}
                              aria-label={`Delete ${farm.name}`}
                              render={(eventProps, animationProps) => (
                                <TooltipTarget disabledReason="Deletion is in progress.">
                                  <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label={`Delete ${farm.name}`} disabled={deletingId === farm.id}>
                                    <span {...animationProps} aria-hidden="true" />
                                  </button>
                                </TooltipTarget>
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : farmsLoading ? (
          <SkeletonBlock rows={4} />
        ) : !farms.length ? (
          <div className="empty-state">
            <MapPinned size={23} />
            <strong>No farms available</strong>
            <span>Create a farm first, then add fields to it.</span>
            <button type="button" className="button-secondary" onClick={() => onNavigate("Farms")}>Go to farms <ArrowRight size={14} /></button>
          </div>
        ) : fieldsPending ? (
          <SkeletonBlock rows={4} />
        ) : filteredFields.length === 0 ? (
          <div className="empty-state">
            <MapPinned size={23} />
            <strong>{failedFarms.length ? "No available matching fields" : query || currentFarmFilter !== "ALL" ? "No matching fields" : "No fields yet"}</strong>
            <span>{failedFarms.length ? "Retry unavailable farms or adjust your filters." : query || currentFarmFilter !== "ALL" ? "Try another search or farm filter." : "Add a field with its measured area to get started."}</span>
            {!query && !failedFarms.length && <button type="button" className="button-primary" onClick={openCreate}><Plus size={15} /> Add a field</button>}
          </div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table ff-table">
              <thead>
                <tr><th>FIELD NAME</th><th>FARM</th><th>TOTAL AREA</th><th>AVAILABLE AREA</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {paginatedFields.map((field) => (
                  <tr key={field.farmId + ":" + field.id}>
                    <td><strong className="workspace-cell-title">{field.fieldName}</strong></td>
                    <td>{farmById.get(field.farmId)?.name || "Unnamed farm"}</td>
                    <td>{areaLabel(field.totalArea)}</td>
                    <td>{areaLabel(field.availableArea)}</td>
                    <td>
                      <div className="ff-row-actions">
                        <UseAnimations
                          animation={edit}
                          size={14}
                          interaction="hover"
                          render={(eventProps, animationProps) => (
                            <button {...eventProps} type="button" className="ff-icon-button" aria-label={`Edit ${field.fieldName}`} onClick={() => openEdit(field)}>
                              <span {...animationProps} aria-hidden="true" />
                            </button>
                          )}
                        />
                        <UseAnimations
                          animation={trash2}
                          size={14}
                          interaction="hover"
                          render={(eventProps, animationProps) => (
                            <TooltipTarget disabledReason="Deletion is in progress.">
                              <button {...eventProps} type="button" className="ff-icon-button ff-danger" aria-label={`Delete ${field.fieldName}`} disabled={deletingId === field.id} onClick={() => deleteField(field)}>
                                <span {...animationProps} aria-hidden="true" />
                              </button>
                            </TooltipTarget>
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFarmsPage && !farmsLoading && filteredFarms.length > 0 && (
          <Pagination className="ff-farm-pagination" aria-label="Farm directory pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious disabled={currentFarmPage === 1} onClick={() => setFarmPage(currentFarmPage - 1)} />
              </PaginationItem>
              {farmPageItems(currentFarmPage, farmPageCount).map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink isActive={currentFarmPage === item} aria-label={`Page ${item}`} onClick={() => setFarmPage(item)}>{item}</PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext disabled={currentFarmPage === farmPageCount} onClick={() => setFarmPage(currentFarmPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {!isFarmsPage && (
          <div className="workspace-data-footer ff-fields-footer">
            <span>
              Showing <strong>{fieldsPending ? "…" : filteredFields.length ? `${(currentFieldPage - 1) * FIELDS_PER_PAGE + 1}–${Math.min(currentFieldPage * FIELDS_PER_PAGE, filteredFields.length)} of ${filteredFields.length}` : "0"}</strong> fields
            </span>
            {!isFarmsPage && !farmsLoading && !fieldsPending && filteredFields.length > 0 && (
              <Pagination className="ff-farm-pagination ff-field-pagination" aria-label="Fields pagination">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious disabled={currentFieldPage === 1} onClick={() => setFieldPage(currentFieldPage - 1)} />
                  </PaginationItem>
                  {farmPageItems(currentFieldPage, fieldPageCount).map((item) => (
                    <PaginationItem key={item}>
                      {typeof item === "number" ? (
                        <PaginationLink isActive={currentFieldPage === item} aria-label={`Page ${item}`} onClick={() => setFieldPage(item)}>{item}</PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext disabled={currentFieldPage === fieldPageCount} onClick={() => setFieldPage(currentFieldPage + 1)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            <span>{currentFarmFilter === "ALL" ? "All farms" : farmById.get(currentFarmFilter)?.name}</span>
          </div>
        )}
      </div>

      {isFarmsPage && (
        <FarmDetailsDialog farm={detailsFarm} onClose={() => setDetailsFarm(null)} triggerRef={detailsTriggerRef} />
      )}

      {dialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !dialogBusy) setDialogOpen(false);
        }}>
          <form className={isFarmsPage ? "dialog-card" : "dialog-card ff-field-entry-dialog"} onSubmit={submitForm}>
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">{isFarmsPage ? "FARM MANAGEMENT" : "FIELD MANAGEMENT"}</span>
                <h2>{editing ? `Edit ${isFarmsPage ? "farm" : "field"}` : isFarmsPage ? "Add a farm" : "Add a field"}</h2>
                <p>{isFarmsPage ? "Give this farm a name you will recognize." : editing ? "Update the name of this registered field." : "Register a new field within your farm."}</p>
              </div>
              <button type="button" className="icon-button ff-edit-farm-close" aria-label="Close dialog" onClick={() => setDialogOpen(false)} disabled={dialogBusy}><X size={19} /></button>
            </div>
            {formError && <div className="ff-error" role="alert">{formError}</div>}
            {!isFarmsPage && (editing ? (
              <div className="ff-form-context ff-edit-field-context"><span>Farm</span><strong>{formFarm?.name || "Farm unavailable"}</strong></div>
            ) : (
              <>
                <div className="form-label"><label htmlFor="field-farm">Select farm</label><Select required value={formFarm ? formFarmId : ""} disabled={dialogBusy} onValueChange={(value) => { setFormFarmId(value); setFormError(""); }}><SelectTrigger id="field-farm" className="ifc-form-select"><SelectValue placeholder="Choose a farm" /></SelectTrigger><SelectContent align="start">{farms.filter((farm) => farm.id != null).map((farm) => <SelectItem key={farm.id} value={String(farm.id)}>{farm.name || "Unnamed farm"}</SelectItem>)}</SelectContent></Select></div>
                {formFarm && <div className="ff-field-farm-area-context"><span className="ff-field-farm-icon"><Tractor size={17} aria-hidden="true" /></span><div><strong>{formFarm.name}</strong><small>{formFarmAreaAvailable ? areaLabel(totalArea(formFarmFields)) + " registered field area" : fieldsPending ? "Loading field areas…" : "Field area unavailable"}</small></div><div className="ff-field-farm-area-value"><strong>{formFarmAreaAvailable ? areaLabel(totalArea(formFarmFields, "availableArea")) : "—"}</strong><small>Available field area</small></div></div>}
              </>
            ))}
            <label className="form-label">
              {isFarmsPage ? "Farm name" : "Field name"}
              {isFarmsPage ? <input autoFocus required maxLength={120} disabled={Boolean(editing && dialogBusy)} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Green Valley Farm" /> : <Input autoFocus required maxLength={120} disabled={dialogBusy} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. North Field" />}
            </label>
            {!isFarmsPage && !editing && (
              <>
                <label className="form-label">
                  Total area
                  <Input required type="number" min="0.01" max="99999999.99" step="0.01" disabled={dialogBusy} value={area} onChange={(event) => setArea(event.target.value)} placeholder="e.g. 1.25" />
                  <small className="ff-field-area-hint">Enter the measured area in your consistent land area unit.</small>
                </label>
              </>
            )}
            {!isFarmsPage && (
              <Alert className="ff-field-area-warning" role="note">
                <span className="ff-field-area-warning-icon" aria-hidden="true">
                  <UseAnimations animation={alertCircle} size={22} strokeColor="#806522" interaction="loop" render={(eventProps, animationProps) => <span {...eventProps} {...animationProps} />} />
                </span>
                <AlertDescription>Once a field's area is assigned, it cannot be changed, as crop plantings may already be linked to it.</AlertDescription>
              </Alert>
            )}
            <div className="dialog-actions">
              <button type="button" className="button-secondary" disabled={dialogBusy} onClick={() => setDialogOpen(false)}>Cancel</button>
              {isFarmsPage && editing ? (
                <button type="submit" className="button-primary ff-edit-farm-save" data-save-state={farmSaveSuccess ? "success" : saving ? "loading" : "idle"} disabled={dialogBusy || !name.trim()} aria-busy={saving}>
                  {farmSaveSuccess ? (
                    <><span className="ff-edit-farm-save-animation" aria-hidden="true"><UseAnimations key="saved" animation={checkmark} size={19} strokeColor="#ffffff" autoplay loop={false} render={(_, animationProps) => <span {...animationProps} />} /></span><span>Saved</span></>
                  ) : saving ? (
                    <><span className="ff-edit-farm-save-animation" aria-hidden="true"><UseAnimations key="saving" animation={loading2} size={19} strokeColor="#ffffff" autoplay loop render={(_, animationProps) => <span {...animationProps} />} /></span><span>Saving…</span></>
                  ) : "Save changes"}
                </button>
              ) : (
                <button type="submit" className="button-primary" disabled={saving || !name.trim() || (!isFarmsPage && (!formFarm || (!editing && (!area || !Number.isFinite(Number(area)) || Number(area) < 0.01))))}>
                  <Plus size={15} /> {saving ? "Saving…" : editing ? "Save changes" : isFarmsPage ? "Create" : "Add field"}
                </button>
              )}
              {isFarmsPage && editing && <span className="sr-only" role="status">{farmSaveSuccess ? "Farm saved successfully." : saving ? "Saving farm changes." : ""}</span>}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
