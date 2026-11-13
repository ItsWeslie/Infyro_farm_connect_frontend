import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  MapPinned,
  Pencil,
  Plus,
  Ruler,
  Search,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import { farmApi, fieldApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";

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
  const isFarmsPage = active === "Farms";
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [fields, setFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState("");
  const [fieldReload, setFieldReload] = useState(0);

  function updateSelectedFarmFields(nextFields) {
    setFields(nextFields);
    if (!selectedFarm?.id) return;
    setFarms((current) => current.map((farm) => farm.id === selectedFarm.id ? { ...farm, fields: nextFields } : farm));
    setSelectedFarm((current) => current?.id === selectedFarm.id ? { ...current, fields: nextFields } : current);
  }

  useEffect(() => {
    if (isFarmsPage) return undefined;
    const farmId = selectedFarm?.id;
    let current = true;
    if (!farmId) {
      setFields([]);
      setFieldsLoading(false);
      setFieldsError("");
      return undefined;
    }

    setFieldsLoading(true);
    setFieldsError("");
    fieldApi.getByFarm(farmId)
      .then((response) => {
        if (current) setFields(unwrapList(response));
      })
      .catch((error) => {
        if (!current) return;
        setFields([]);
        setFieldsError(error.message || "Unable to load fields for this farm.");
        notify(error.message || "Unable to load fields for this farm.", "error");
      })
      .finally(() => {
        if (current) setFieldsLoading(false);
      });

    return () => { current = false; };
  }, [isFarmsPage, selectedFarm?.id, fieldReload, notify]);

  useEffect(() => {
    setQuery("");
    setDialogOpen(false);
    setEditing(null);
  }, [active]);

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

  const filteredFields = useMemo(() => fields.filter((field) => (
    [field.fieldName, selectedFarm?.name, field.totalArea, field.availableArea]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  )), [fields, query, selectedFarm?.name]);

  function openCreate() {
    setEditing(null);
    setFormError("");
    setName("");
    setArea("");
    setDialogOpen(true);
  }

  function openEdit(record) {
    setEditing(record);
    setFormError("");
    setName(isFarmsPage ? record.name || "" : record.fieldName || "");
    setArea(record.totalArea == null ? "" : String(record.totalArea));
    setDialogOpen(true);
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!name.trim()) return;
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
          if (!wasEditing) setSelectedFarm(savedFarm);
          else if (selectedFarm?.id === savedFarm.id) setSelectedFarm(savedFarm);
        } else {
          refreshFarms(response?.id || (wasEditing ? editing.id : undefined)).catch((error) => notify(error.message || "Unable to sync the farm list.", "error"));
        }
        setDialogOpen(false);
        setEditing(null);
        setName("");
        notify(wasEditing ? "Farm updated successfully" : "Farm created successfully");
      } else {
        if (!selectedFarm?.id) {
          throw new Error("Choose a farm before adding a field.");
        }
        if (wasEditing) {
          const response = await fieldApi.update(editing.id, { fieldName: name.trim() });
          const updatedField = response?.data || response;
          if (updatedField && typeof updatedField === "object" && updatedField.id != null) {
            updateSelectedFarmFields(fields.map((item) => item.id === editing.id ? updatedField : item));
          } else {
            setFieldReload((value) => value + 1);
          }
        } else {
          const parsedArea = Number(area);
          if (!Number.isFinite(parsedArea) || parsedArea < 0.01) {
            throw new Error("Enter an area of at least 0.01 in your farm's chosen area unit.");
          }
          const response = await fieldApi.create(selectedFarm.id, {
            fieldName: name.trim(),
            totalArea: parsedArea,
          });
          const createdField = response?.data || response;
          if (createdField && typeof createdField === "object" && createdField.id != null) {
            updateSelectedFarmFields([createdField, ...fields.filter((item) => item.id !== createdField.id)]);
          } else {
            setFieldReload((value) => value + 1);
          }
        }
        setDialogOpen(false);
        setEditing(null);
        setName("");
        setArea("");
        notify(wasEditing ? "Field updated successfully" : "Field created successfully");
      }
    } catch (error) {
      notify(error.message || "Unable to save this record.", "error");
      setFormError(error.message || `Unable to save this ${isFarmsPage ? "farm" : "field"}.`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteFarm(farm) {
    if (!window.confirm(`Delete “${farm.name}”? This cannot be undone.`)) return;
    setDeletingId(farm.id);
    try {
      await farmApi.delete(farm.id);
      setFarms((current) => current.filter((item) => item.id !== farm.id));
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
    if (!window.confirm(`Delete “${field.fieldName}”? This cannot be undone.`)) return;
    setDeletingId(field.id);
    setFieldsError("");
    try {
      await fieldApi.delete(field.id);
      updateSelectedFarmFields(fields.filter((item) => item.id !== field.id));
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
          {isFarmsPage ? <Building2 size={23} /> : <MapPinned size={23} />}
        </div>
        <div className="workspace-title-copy">
          <h1>{isFarmsPage ? "Your farms" : "Field directory"}</h1>
          <p>
            {isFarmsPage
              ? "Create and manage the farms connected to your account."
              : "Manage field names and land area within each of your farms."}
          </p>
        </div>
        <div className="workspace-title-actions">
          <button
            className="button-primary"
            type="button"
            onClick={openCreate}
            disabled={!isFarmsPage && !selectedFarm?.id}
          >
            <Plus size={16} /> {isFarmsPage ? "Add farm" : "Add field"}
          </button>
        </div>
      </div>

      {isFarmsPage ? (
        <div className="workspace-stats">
          <Stat label="Total farms" value={farmStats.farms} detail="registered farms" icon={Building2} />
          <Stat label="Total land" value={areaLabel(farmStats.totalArea)} detail="sum of registered field areas" icon={Ruler} />
          <Stat label="Total fields" value={farmStats.fields} detail="across all farms" icon={MapPinned} />
          <Stat label="Available land" value={areaLabel(farmStats.availableArea)} detail="not assigned to plantings" icon={Sprout} />
        </div>
      ) : (
        <div className="workspace-stats">
          <Stat label="Total fields" value={fieldStats.count} detail="in the selected farm" icon={MapPinned} />
          <Stat label="Total area" value={areaLabel(fieldStats.totalArea)} detail="registered field area" icon={Ruler} />
          <Stat label="Available area" value={areaLabel(fieldStats.availableArea)} detail="available across selected fields" icon={Sprout} />
          <Stat label="Allocated area" value={areaLabel(fieldStats.usedArea)} detail="currently allocated" icon={Building2} />
        </div>
      )}

      <div className="workspace-data-card surface-card ff-data-card">
        <div className="workspace-data-heading">
          <div>
            <h2>{isFarmsPage ? "Farm directory" : "Fields in this farm"}</h2>
            <p>
              {isFarmsPage
                ? "Only farms returned by the backend are shown here."
                : "Area values are provided by the farm backend."}
            </p>
          </div>
          {!isFarmsPage && farms.length > 0 && (
            <label className="ff-farm-select">
              <span>Farm</span>
              <select
                value={selectedFarm?.id || ""}
                onChange={(event) => {
                  const nextFarm = farms.find((farm) => String(farm.id) === event.target.value);
                  if (nextFarm) setSelectedFarm(nextFarm);
                }}
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="workspace-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${isFarmsPage ? "farms" : "fields"}...`}
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={14} />
              </button>
            )}
          </label>
          <span className="result-count">
            {isFarmsPage ? filteredFarms.length : filteredFields.length} records
          </span>
        </div>

        {(isFarmsPage ? farmsError : fieldsError) && (
          <div className="ff-error" role="alert">
            {isFarmsPage ? farmsError : fieldsError}
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
                  {filteredFarms.map((farm) => {
                    const farmFields = farm.fields || [];
                    return (
                      <tr key={farm.id}>
                        <td><strong className="workspace-cell-title">{farm.name}</strong></td>
                        <td>{areaLabel(totalArea(farmFields))}</td>
                        <td>{farmFields.length}</td>
                        <td>{areaLabel(totalArea(farmFields, "availableArea"))}</td>
                        <td>
                          <div className="ff-row-actions">
                            <button type="button" className="ff-action-button" onClick={() => { setSelectedFarm(farm); onNavigate("Fields"); }}>
                              View fields <ArrowRight size={13} />
                            </button>
                            <button type="button" className="ff-icon-button" aria-label={`Edit ${farm.name}`} onClick={() => openEdit(farm)}><Pencil size={14} /></button>
                            <button type="button" className="ff-icon-button ff-danger" aria-label={`Delete ${farm.name}`} disabled={deletingId === farm.id} onClick={() => deleteFarm(farm)}><Trash2 size={14} /></button>
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
        ) : !selectedFarm?.id ? (
          <div className="empty-state">
            <MapPinned size={23} />
            <strong>No farm selected</strong>
            <span>Create a farm first, then add fields to it.</span>
            <button type="button" className="button-secondary" onClick={() => onNavigate("Farms")}>Go to farms <ArrowRight size={14} /></button>
          </div>
        ) : fieldsLoading ? (
          <SkeletonBlock rows={4} />
        ) : filteredFields.length === 0 ? (
          <div className="empty-state">
            <MapPinned size={23} />
            <strong>{query ? "No matching fields" : "No fields in this farm yet"}</strong>
            <span>{query ? "Try another search term." : "Add a field with its measured area to get started."}</span>
            {!query && <button type="button" className="button-primary" onClick={openCreate}><Plus size={15} /> Add a field</button>}
          </div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table ff-table">
              <thead>
                <tr><th>FIELD NAME</th><th>FARM</th><th>TOTAL AREA</th><th>AVAILABLE AREA</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filteredFields.map((field) => (
                  <tr key={field.id}>
                    <td><strong className="workspace-cell-title">{field.fieldName}</strong></td>
                    <td>{selectedFarm.name}</td>
                    <td>{areaLabel(field.totalArea)}</td>
                    <td>{areaLabel(field.availableArea)}</td>
                    <td>
                      <div className="ff-row-actions">
                        <button type="button" className="ff-icon-button" aria-label={`Edit ${field.fieldName}`} onClick={() => openEdit(field)}><Pencil size={14} /></button>
                        <button type="button" className="ff-icon-button ff-danger" aria-label={`Delete ${field.fieldName}`} disabled={deletingId === field.id} onClick={() => deleteField(field)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="workspace-data-footer">
          <span>
            Showing <strong>{isFarmsPage ? filteredFarms.length : filteredFields.length}</strong> {isFarmsPage ? "farms" : "fields"}
          </span>
          <span>{isFarmsPage ? "Farm data from IFC backend" : selectedFarm?.name || "Select a farm"}</span>
        </div>
      </div>

      {dialogOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialogOpen(false);
        }}>
          <form className="dialog-card" onSubmit={submitForm}>
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">{isFarmsPage ? "FARM MANAGEMENT" : "FIELD MANAGEMENT"}</span>
                <h2>{editing ? `Edit ${isFarmsPage ? "farm" : "field"}` : isFarmsPage ? "Add a farm" : "Add a field"}</h2>
                <p>{isFarmsPage ? "Give this farm a name you will recognize." : `Add a field under ${selectedFarm?.name || "your selected farm"}.`}</p>
              </div>
              <button type="button" className="icon-button" aria-label="Close dialog" onClick={() => setDialogOpen(false)} disabled={saving}><X size={19} /></button>
            </div>
            {formError && <div className="ff-error" role="alert">{formError}</div>}
            {!isFarmsPage && (
              <div className="ff-form-context">
                <span>Farm</span>
                <strong>{selectedFarm?.name || "No farm selected"}</strong>
              </div>
            )}
            <label className="form-label">
              {isFarmsPage ? "Farm name" : "Field name"}
              <input autoFocus required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder={isFarmsPage ? "e.g. Green Valley Farm" : "e.g. North Field"} />
            </label>
            {!isFarmsPage && !editing && (
              <>
                <label className="form-label">
                  Total area
                  <input required type="number" min="0.01" step="0.01" value={area} onChange={(event) => setArea(event.target.value)} placeholder="e.g. 1.25" />
                </label>
                <div className="dialog-note">
                  <Ruler size={16} />
                  <span>The current backend stores a numeric area without a unit field. Use one consistent unit for all fields in this farm.</span>
                </div>
              </>
            )}
            {!isFarmsPage && editing && (
              <div className="dialog-note">
                <Ruler size={16} />
                <span>Current area: {areaLabel(editing.totalArea)}. The backend currently allows field name changes only; area is read-only.</span>
              </div>
            )}
            {isFarmsPage && editing && (
              <div className="dialog-note">
                <MapPinned size={16} />
                <span>Farm area is calculated from its fields. The current backend does not support changing an existing field’s area.</span>
              </div>
            )}
            <div className="dialog-actions">
              <button type="button" className="button-secondary" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</button>
              <button type="submit" className="button-primary" disabled={saving || !name.trim()}>
                <Plus size={15} /> {saving ? "Saving…" : editing ? "Save changes" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
