import { useEffect, useState } from "react";
import { Wheat, ClipboardList, Ban, CalendarDays, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { fieldApi, cropPlantingApi, harvestApi } from "../../api/client";

const UNIT_LABELS = {
  KILOGRAM: "kg", TONNE: "t", GRAM: "g", PIECE: "pieces",
  LITRE: "L", BUNCH: "bunches", BOX: "boxes", BAG: "bags",
};

function unwrapList(response) {
  const list = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(list)) throw new Error("Harvest or related records are unavailable.");
  return list;
}

function farmPlantings(fields, plantings) {
  const names = new Map(fields.filter((field) => field?.id != null).map((field) => [String(field.id), field.fieldName]));
  return plantings
    .filter((planting) => planting?.id != null && planting.fieldId != null && names.has(String(planting.fieldId)))
    .map((planting) => ({ ...planting, fieldName: names.get(String(planting.fieldId)) }));
}

function attachHarvests(planting, records) {
  return records
    .filter((record) => record?.id != null && record.cropPlantingId != null && String(record.cropPlantingId) === String(planting.id))
    .map((record) => ({ ...record, cropName: planting.cropTypeName, fieldName: planting.fieldName }));
}

function sortHarvests(records) {
  return [...records].sort((a, b) => String(b.harvestDate || "").localeCompare(String(a.harvestDate || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function quantityInThousandths(value) {
  if (value == null || (typeof value !== "number" && typeof value !== "string")) return null;
  const match = /^(\d+)(?:\.(\d{1,3}))?$/.exec(String(value).trim());
  if (!match) return null;
  return BigInt(match[1]) * 1000n + BigInt((match[2] || "").padEnd(3, "0"));
}

function quantityLabel(value) {
  if (value === null) return "—";
  const fraction = String(value % 1000n).padStart(3, "0").replace(/0+$/, "");
  return (value / 1000n).toLocaleString("en-IN") + (fraction ? "." + fraction : "");
}

function dateLabel(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  return match ? match[3] + "/" + match[2] + "/" + match[1] : "—";
}

function harvestMetrics(records) {
  let active = 0;
  let cancelled = 0;
  let unknownStatus = false;
  let invalidQuantity = false;
  let invalidDate = false;
  const dates = new Set();
  const units = new Map();
  for (const record of records) {
    if (record.voided === true) { cancelled += 1; continue; }
    if (record.voided !== false) { unknownStatus = true; continue; }
    active += 1;
    if (dateLabel(record.harvestDate) === "—") invalidDate = true;
    else dates.add(record.harvestDate);
    const quantity = quantityInThousandths(record.quantity);
    if (quantity === null || !Object.hasOwn(UNIT_LABELS, record.unit)) { invalidQuantity = true; continue; }
    units.set(record.unit, (units.get(record.unit) || 0n) + quantity);
  }
  const complete = !unknownStatus && !invalidQuantity;
  return {
    active, cancelled, unknownStatus, complete,
    dates: invalidDate || unknownStatus ? null : dates.size,
    byUnit: complete ? [...units.entries()].sort(([a], [b]) => a.localeCompare(b)) : [],
  };
}

export default function FarmDetailsHarvests({ farm }) {
  const farmId = farm?.id;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedCount, setFailedCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (farmId == null) return;
    let current = true;
    setRecords([]);
    setLoading(true);
    setError("");
    setFailedCount(0);

    async function loadHarvests() {
      try {
        const [fieldsResponse, plantingsResponse] = await Promise.all([
          fieldApi.getByFarm(farmId), cropPlantingApi.getAll(),
        ]);
        if (!current) return;
        const plantings = farmPlantings(unwrapList(fieldsResponse), unwrapList(plantingsResponse));
        const items = [];
        let failures = 0;
        // Fetch at most six planting ledgers concurrently; stop after unmount.
        for (let offset = 0; offset < plantings.length && current; offset += 6) {
          const responses = await Promise.allSettled(plantings.slice(offset, offset + 6).map(async (planting) => {
            const response = await harvestApi.getByPlanting(planting.id);
            return attachHarvests(planting, unwrapList(response));
          }));
          if (!current) return;
          for (const response of responses) {
            if (response.status === "fulfilled") items.push(...response.value);
            else failures += 1;
          }
        }
        if (current) {
          setRecords(sortHarvests(items));
          setFailedCount(failures);
        }
      } catch (requestError) {
        if (current) setError(requestError.message || "Could not load farm harvests.");
      } finally {
        if (current) setLoading(false);
      }
    }

    loadHarvests();
    return () => { current = false; };
  }, [farmId, retryKey]);

  const metrics = harvestMetrics(records);
  const incomplete = Boolean(error) || failedCount > 0;
  const stats = [
    { label: "Active harvests", value: metrics.unknownStatus ? "—" : metrics.active, icon: ClipboardList },
    { label: "Cancelled records", value: metrics.unknownStatus ? "—" : metrics.cancelled, icon: Ban },
    { label: "Harvest dates", value: metrics.dates ?? "—", icon: CalendarDays, detail: "Distinct active harvest dates" },
    { label: "Yield units", value: metrics.complete ? metrics.byUnit.length : "—", icon: Layers, detail: "Kept separate by unit" },
  ];
  const retry = () => setRetryKey((key) => key + 1);

  return (
    <div className="ff-details-harvests">
      {(error || failedCount > 0) && (
        <div className="ff-details-load-error" role="alert">
          <p>{error || `Could not load harvests for ${failedCount} ${failedCount === 1 ? "planting" : "plantings"}. Records may be incomplete; farm-wide totals are unavailable.`}</p>
          <button type="button" className="button-secondary" onClick={retry}>Retry</button>
        </div>
      )}
      <div className="ff-details-stat-grid">
        {stats.map(({ label, value, icon: Icon, detail }) => (
          <Card key={label} className="ff-details-stat" aria-busy={loading}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardAction><Icon size={15} aria-hidden="true" /></CardAction>
            </CardHeader>
            <CardContent>
              <strong>{loading ? "…" : incomplete ? "—" : value}</strong>
              {detail && <small className="ff-details-stat-detail">{detail}</small>}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="ff-details-insight">
        <CardHeader><CardTitle>Harvest quantity by unit</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="ff-details-note" role="status">Loading harvest quantities…</p> : incomplete || !metrics.complete ? (
            <p className="ff-details-note">Complete harvest quantities are unavailable.</p>
          ) : metrics.byUnit.length === 0 ? (
            <p className="ff-details-note">No active harvest quantities recorded.</p>
          ) : (
            <div className="ff-details-yield-grid">
              {metrics.byUnit.map(([unit, quantity]) => <span key={unit}><strong>{quantityLabel(quantity)}</strong> {UNIT_LABELS[unit]}</span>)}
            </div>
          )}
          <p className="ff-details-note ff-details-harvest-note">All time · excludes cancelled records. Different units are not combined.</p>
        </CardContent>
      </Card>
      <Card className="ff-details-insight ff-details-fields ff-details-harvest-ledger">
        <CardHeader><CardTitle>Harvest records</CardTitle></CardHeader>
        <CardContent aria-busy={loading}>
          {loading ? <p className="ff-details-note" role="status">Loading harvest records…</p> : records.length === 0 ? (
            incomplete ? <p className="ff-details-note">Harvest records are unavailable.</p> : (
              <div className="ff-details-fields-empty">
                <Wheat size={23} aria-hidden="true" />
                <strong>No harvest records</strong>
                <p>No harvests have been recorded for this farm yet.</p>
              </div>
            )
          ) : (
            <Table className="ff-details-table" aria-label="Harvest records in selected farm">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Harvest date</TableHead>
                  <TableHead scope="col">Crop / field</TableHead>
                  <TableHead scope="col">Quantity</TableHead>
                  <TableHead scope="col">Unit</TableHead>
                  <TableHead scope="col">Notes</TableHead>
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const status = record.voided === true ? "cancelled" : record.voided === false ? "active" : "unknown";
                  return (
                    <TableRow key={record.id} data-harvest-status={status}>
                      <TableCell>{dateLabel(record.harvestDate)}</TableCell>
                      <TableCell>
                        <div className="ff-details-activity-crop">
                          <strong>{record.cropName || "—"}</strong>
                          <small>{record.fieldName || "—"}</small>
                        </div>
                      </TableCell>
                      <TableCell className="ff-details-harvest-quantity">{quantityLabel(quantityInThousandths(record.quantity))}</TableCell>
                      <TableCell>{UNIT_LABELS[record.unit] || "—"}</TableCell>
                      <TableCell>
                        <div className="ff-details-harvest-copy">
                          {record.notes || "—"}
                          {record.voided === true && record.voidReason && <p>{record.voidReason}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="ff-details-crop-status" data-status={status}>{status === "cancelled" ? "Cancelled" : status === "active" ? "Active" : "Unavailable"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
