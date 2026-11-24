import { useEffect, useState } from "react";
import { MapPinned } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Progress } from "../ui/progress";
import { fieldApi } from "../../api/client";

function parseArea(value) {
  if (value == null || (typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function fieldMetrics(field) {
  const total = parseArea(field?.totalArea);
  const available = parseArea(field?.availableArea);
  const allocated = total !== null && available !== null && available <= total ? total - available : null;
  const percent = allocated !== null && total > 0 ? allocated / total * 100 : null;
  return { total, available, allocated, percent };
}

function areaLabel(value, digits = 2) {
  return value === null ? "—" : value.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

function unwrapFields(response) {
  const records = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(records)) throw new Error("Field records are unavailable.");
  return records;
}

export default function FarmDetailsFields({ farm }) {
  const farmId = farm?.id;
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (farmId == null) return;
    let current = true;
    setFields([]);
    setLoading(true);
    setError("");

    fieldApi.getByFarm(farmId)
      .then((response) => {
        const records = unwrapFields(response);
        if (current) setFields(records);
      })
      .catch((requestError) => {
        if (current) setError(requestError.message || "Could not load fields.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => { current = false; };
  }, [farmId, retryKey]);

  return (
    <Card className="ff-details-insight ff-details-fields">
      <CardHeader><CardTitle>Registered fields</CardTitle></CardHeader>
      <CardContent aria-busy={loading}>
        {loading ? (
          <p className="ff-details-note" role="status">Loading fields…</p>
        ) : error ? (
          <div className="ff-details-load-error" role="alert">
            <p>{error}</p>
            <button type="button" className="button-secondary" onClick={() => setRetryKey((key) => key + 1)}>Retry</button>
          </div>
        ) : fields.length === 0 ? (
          <div className="ff-details-fields-empty">
            <MapPinned size={23} aria-hidden="true" />
            <strong>No registered fields</strong>
            <p>This farm does not have any fields yet.</p>
          </div>
        ) : (
          <Table className="ff-details-table" aria-label="Fields in selected farm">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Field name</TableHead>
                <TableHead scope="col">Total area</TableHead>
                <TableHead scope="col">Allocated area</TableHead>
                <TableHead scope="col">Available area</TableHead>
                <TableHead scope="col">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => {
                const { total, available, allocated, percent } = fieldMetrics(field);
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="ff-details-field-name">
                        <span className="ff-details-field-icon"><MapPinned size={14} aria-hidden="true" /></span>
                        <strong>{field.fieldName || "Unnamed field"}</strong>
                      </div>
                    </TableCell>
                    <TableCell>{areaLabel(total)}</TableCell>
                    <TableCell>{areaLabel(allocated)}</TableCell>
                    <TableCell>{areaLabel(available)}</TableCell>
                    <TableCell>
                      {percent === null ? "—" : (
                        <div className="ff-details-field-utilization">
                          <Progress value={percent} aria-label={`Land utilization for ${field.fieldName || "field"}`} />
                          <span>{areaLabel(percent, 1)}%</span>
                        </div>
                      )}
                    </TableCell>
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
