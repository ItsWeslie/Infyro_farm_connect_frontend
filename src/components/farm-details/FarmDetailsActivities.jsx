import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { fieldApi, cropPlantingApi, cropActivityApi } from "../../api/client";

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function unwrapList(response) {
  const list = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(list)) throw new Error("Activity or planting records are unavailable.");
  return list;
}

function farmPlantings(fields, plantings) {
  const fieldNames = new Map(fields.filter((field) => field?.id != null).map((field) => [String(field.id), field.fieldName]));
  return plantings
    .filter((planting) => planting?.id != null && planting.fieldId != null && fieldNames.has(String(planting.fieldId)))
    .map((planting) => ({ ...planting, fieldName: fieldNames.get(String(planting.fieldId)) }));
}

function attachActivities(planting, activities) {
  return activities
    .filter((activity) => activity?.id != null && activity.cropPlantingId != null && String(activity.cropPlantingId) === String(planting.id))
    .map((activity) => ({ ...activity, cropName: planting.cropTypeName, fieldName: planting.fieldName }));
}

function sortActivities(records) {
  return [...records].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || a.createdAt || "") || 0;
    const bTime = Date.parse(b.updatedAt || b.createdAt || "") || 0;
    return bTime - aTime || Number(b.dayNumber || 0) - Number(a.dayNumber || 0) || String(b.id).localeCompare(String(a.id));
  });
}

function humanize(value) {
  return value ? String(value).toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : "—";
}

function dayLabel(value) {
  if (value == null || String(value).trim() === "") return "—";
  const day = Number(value);
  return Number.isInteger(day) && day > 0 ? "Day " + day : "—";
}

export default function FarmDetailsActivities({ farm }) {
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

    async function loadActivities() {
      try {
        const [fieldsResponse, plantingsResponse] = await Promise.all([
          fieldApi.getByFarm(farmId), cropPlantingApi.getAll(),
        ]);
        if (!current) return;
        const plantings = farmPlantings(unwrapList(fieldsResponse), unwrapList(plantingsResponse));
        const results = [];
        let failures = 0;
        // Bound concurrent requests and stop starting new requests on tab close.
        for (let offset = 0; offset < plantings.length && current; offset += 6) {
          const batch = plantings.slice(offset, offset + 6);
          const responses = await Promise.allSettled(batch.map(async (planting) => {
            const response = await cropActivityApi.getByPlanting(planting.id);
            return attachActivities(planting, unwrapList(response));
          }));
          if (!current) return;
          for (const response of responses) {
            if (response.status === "fulfilled") results.push(...response.value);
            else failures += 1;
          }
        }
        if (current) {
          setRecords(sortActivities(results));
          setFailedCount(failures);
        }
      } catch (requestError) {
        if (current) setError(requestError.message || "Could not load farm activities.");
      } finally {
        if (current) setLoading(false);
      }
    }
    loadActivities();
    return () => { current = false; };
  }, [farmId, retryKey]);

  function retry() {
    setRetryKey((key) => key + 1);
  }

  return (
    <Card className="ff-details-insight ff-details-fields ff-details-activities">
      <CardHeader><CardTitle>Crop activities</CardTitle></CardHeader>
      <CardContent aria-busy={loading}>
        {loading ? (
          <p className="ff-details-note" role="status">Loading crop activities…</p>
        ) : error ? (
          <div className="ff-details-load-error" role="alert">
            <p>{error}</p>
            <button type="button" className="button-secondary" onClick={retry}>Retry</button>
          </div>
        ) : (
          <>
            {failedCount > 0 && (
              <div className="ff-details-load-error ff-details-activities-warning" role="alert">
                <p>Could not load activities for {failedCount} {failedCount === 1 ? "planting" : "plantings"}. Results may be incomplete.</p>
                <button type="button" className="button-secondary" onClick={retry}>Retry</button>
              </div>
            )}
            {records.length === 0 ? (
              failedCount === 0 && (
                <div className="ff-details-fields-empty">
                  <ClipboardList size={23} aria-hidden="true" />
                  <strong>No crop activities</strong>
                  <p>No activity logs have been recorded for this farm yet.</p>
                </div>
              )
            ) : (
              <Table className="ff-details-table" aria-label="Crop activities in selected farm">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Activity</TableHead>
                    <TableHead scope="col">Crop / field</TableHead>
                    <TableHead scope="col">Day</TableHead>
                    <TableHead scope="col">Crop stage</TableHead>
                    <TableHead scope="col">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((activity) => {
                    const status = String(activity.status || "").toUpperCase();
                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="ff-details-activity-copy">
                            <strong>{activity.dailyActivity || "—"}</strong>
                            {activity.nutritionAndWaterManagement && <p><b>Nutrition &amp; water:</b> {activity.nutritionAndWaterManagement}</p>}
                            {activity.pestAndDiseaseControl && <p><b>Pest &amp; disease:</b> {activity.pestAndDiseaseControl}</p>}
                            {activity.notes && <p><b>Notes:</b> {activity.notes}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="ff-details-activity-crop">
                            <strong>{activity.cropName || "—"}</strong>
                            <small>{activity.fieldName || "—"}</small>
                          </div>
                        </TableCell>
                        <TableCell>{dayLabel(activity.dayNumber)}</TableCell>
                        <TableCell>{humanize(activity.cropStage)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="ff-details-crop-status ff-details-activity-status" data-status={STATUS_LABELS[status] ? status.toLowerCase() : "unknown"}>{STATUS_LABELS[status] || "Unavailable"}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
