import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { fieldApi, cropPlantingApi } from "../../api/client";

const STATUS_LABELS = {
  PLANNED: "Planned",
  ACTIVE: "Growing",
  HARVESTING: "Harvesting",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function unwrapList(response) {
  const list = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(list)) throw new Error("Crop or field records are unavailable.");
  return list;
}

function farmPlantings(fields, plantings) {
  const fieldNames = new Map(fields.filter((field) => field?.id != null).map((field) => [String(field.id), field.fieldName]));
  return plantings
    .filter((planting) => planting?.fieldId != null && fieldNames.has(String(planting.fieldId)))
    .map((planting) => ({ ...planting, fieldName: fieldNames.get(String(planting.fieldId)) }))
    .sort((a, b) => String(b.plantedOn || "").localeCompare(String(a.plantedOn || "")) || String(b.id).localeCompare(String(a.id)));
}

function dateLabel(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return "—";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function areaLabel(value) {
  if (value == null || (typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";
}

export default function FarmDetailsCrops({ farm }) {
  const farmId = farm?.id;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (farmId == null) return;
    let current = true;
    setRecords([]);
    setLoading(true);
    setError("");

    Promise.all([fieldApi.getByFarm(farmId), cropPlantingApi.getAll()])
      .then(([fields, plantings]) => {
        const items = farmPlantings(unwrapList(fields), unwrapList(plantings));
        if (current) setRecords(items);
      })
      .catch((requestError) => {
        if (current) setError(requestError.message || "Could not load crop plantings.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => { current = false; };
  }, [farmId, retryKey]);

  return (
    <Card className="ff-details-insight ff-details-fields ff-details-crops">
      <CardHeader><CardTitle>Crop plantings</CardTitle></CardHeader>
      <CardContent aria-busy={loading}>
        {loading ? (
          <p className="ff-details-note" role="status">Loading crop plantings…</p>
        ) : error ? (
          <div className="ff-details-load-error" role="alert">
            <p>{error}</p>
            <button type="button" className="button-secondary" onClick={() => setRetryKey((key) => key + 1)}>Retry</button>
          </div>
        ) : records.length === 0 ? (
          <div className="ff-details-fields-empty">
            <Sprout size={23} aria-hidden="true" />
            <strong>No crop plantings</strong>
            <p>No crops have been planted in this farm yet.</p>
          </div>
        ) : (
          <Table className="ff-details-table" aria-label="Crop plantings in selected farm">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Crop</TableHead>
                <TableHead scope="col">Field</TableHead>
                <TableHead scope="col">Crop area</TableHead>
                <TableHead scope="col">Planted on</TableHead>
                <TableHead scope="col">Expected harvest</TableHead>
                <TableHead scope="col">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((planting) => {
                const status = String(planting.status || "").toUpperCase();
                const label = STATUS_LABELS[status] || "Unavailable";
                return (
                  <TableRow key={planting.id}>
                    <TableCell>
                      <div className="ff-details-field-name">
                        <span className="ff-details-field-icon"><Sprout size={14} aria-hidden="true" /></span>
                        <strong>{planting.cropTypeName || "Unnamed crop"}</strong>
                      </div>
                    </TableCell>
                    <TableCell>{planting.fieldName || "—"}</TableCell>
                    <TableCell>{areaLabel(planting.cropArea)}</TableCell>
                    <TableCell>{dateLabel(planting.plantedOn)}</TableCell>
                    <TableCell>{dateLabel(planting.expectedHarvestOn)}</TableCell>
                    <TableCell><Badge variant="secondary" className="ff-details-crop-status" data-status={STATUS_LABELS[status] ? status.toLowerCase() : "unknown"}>{label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
