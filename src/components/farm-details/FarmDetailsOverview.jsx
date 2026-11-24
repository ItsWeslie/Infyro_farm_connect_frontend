import { useEffect, useState } from "react";
import { LandPlot, MapPinned, Sprout, Ruler, Leaf, Wallet, Wheat, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "../ui/card";
import { Progress } from "../ui/progress";
import { farmSummaryApi, fieldApi } from "../../api/client";

function parseAmount(value) {
  if (value == null || (typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function sumArea(fields, key) {
  if (!Array.isArray(fields)) return null;
  const values = fields.map((field) => parseAmount(field?.[key]));
  return values.some((value) => value === null)
    ? null
    : values.reduce((sum, value) => sum + value, 0);
}

function landMetrics(fields) {
  const total = sumArea(fields, "totalArea");
  const available = sumArea(fields, "availableArea");
  const allocated = total !== null && available !== null && available <= total ? total - available : null;
  const percent = allocated !== null && total > 0 ? (allocated / total) * 100 : null;
  return { total, available, allocated, percent };
}

function numberLabel(value, digits = 2) {
  const amount = parseAmount(value);
  return amount === null ? "—" : amount.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

function currencyLabel(value) {
  const amount = parseAmount(value);
  return amount === null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
}

function unwrapFields(response) {
  const fields = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(fields)) throw new Error("Field records are unavailable.");
  return fields;
}

function unwrapSummary(response, farmId) {
  const summary = response?.data ?? response;
  if (!summary || String(summary.farmId) !== String(farmId)) throw new Error("Farm summary is unavailable.");
  return summary;
}

function unitLabel(unit) {
  return unit.toLowerCase().replaceAll("_", " ");
}

export default function FarmDetailsOverview({ farm }) {
  const farmId = farm?.id;
  const [fields, setFields] = useState(null);
  const [summary, setSummary] = useState(null);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [fieldsError, setFieldsError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (farmId == null) return;
    let current = true;
    setFields(null);
    setSummary(null);
    setFieldsLoading(true);
    setSummaryLoading(true);
    setFieldsError("");
    setSummaryError("");

    fieldApi.getByFarm(farmId)
      .then((response) => {
        const records = unwrapFields(response);
        if (current) setFields(records);
      })
      .catch((error) => { if (current) setFieldsError(error.message || "Could not load field details."); })
      .finally(() => { if (current) setFieldsLoading(false); });

    farmSummaryApi.getSummary(farmId)
      .then((response) => {
        const data = unwrapSummary(response, farmId);
        if (current) setSummary(data);
      })
      .catch((error) => { if (current) setSummaryError(error.message || "Could not load farm summary."); })
      .finally(() => { if (current) setSummaryLoading(false); });

    return () => { current = false; };
  }, [farmId, retryKey]);

  const { total, available, allocated, percent } = landMetrics(fields);
  const stats = [
    { label: "Total land", value: numberLabel(total), icon: LandPlot, loading: fieldsLoading },
    { label: "Total fields", value: numberLabel(fields?.length ?? summary?.totalFields, 0), icon: MapPinned, loading: fieldsLoading && summaryLoading },
    { label: "Available land", value: numberLabel(available), icon: Sprout, loading: fieldsLoading },
    { label: "Allocated land", value: numberLabel(allocated), icon: Ruler, loading: fieldsLoading },
    { label: "Total plantings", value: numberLabel(summary?.totalPlantings, 0), icon: Layers, loading: summaryLoading },
    { label: "Active plantings", value: numberLabel(summary?.plantingsByStatus?.ACTIVE, 0), icon: Leaf, loading: summaryLoading },
    { label: "Total expenses", value: currencyLabel(summary?.totalExpenses), icon: Wallet, loading: summaryLoading, detail: "All time · excludes voided" },
    { label: "Harvest records", value: numberLabel(summary?.harvestRecordCount, 0), icon: Wheat, loading: summaryLoading, detail: "All time · excludes voided" },
  ];
  const yieldEntries = Object.entries(summary?.harvestQuantityByUnit ?? {}).filter(([, value]) => parseAmount(value) !== null);

  return (
    <div className="ff-details-overview">
      {(fieldsError || summaryError) && (
        <div className="ff-details-load-error" role="alert">
          <div>{fieldsError && <p>Land details: {fieldsError}</p>}{summaryError && <p>Farm summary: {summaryError}</p>}</div>
          <button type="button" className="button-secondary" onClick={() => setRetryKey((key) => key + 1)}>Retry</button>
        </div>
      )}
      <div className="ff-details-stat-grid">
        {stats.map(({ label, value, icon: Icon, loading, detail }) => (
          <Card key={label} className="ff-details-stat" aria-busy={loading}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardAction><Icon size={15} aria-hidden="true" /></CardAction>
            </CardHeader>
            <CardContent><strong>{loading ? "…" : value}</strong>{detail && <small className="ff-details-stat-detail">{detail}</small>}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="ff-details-insight">
        <CardHeader>
          <CardTitle>Land utilization</CardTitle>
          <CardAction>{percent === null ? "—" : numberLabel(percent, 1) + "%"}</CardAction>
        </CardHeader>
        <CardContent>
          {fieldsLoading ? <p className="ff-details-note">Loading land details…</p> : percent !== null ? (
            <>
              <Progress value={percent} aria-label="Allocated land percentage" />
              <div className="ff-details-land-legend">
                <span><i className="ff-land-allocated" />Allocated: {numberLabel(allocated)}</span>
                <span><i className="ff-land-available" />Available: {numberLabel(available)}</span>
              </div>
            </>
          ) : <p className="ff-details-note">{total === 0 && allocated === 0 ? "No registered land area yet." : "Land utilization is unavailable."}</p>}
        </CardContent>
      </Card>
      <Card className="ff-details-insight">
        <CardHeader><CardTitle>Harvest quantity by unit</CardTitle></CardHeader>
        <CardContent>
          {summaryLoading ? <p className="ff-details-note">Loading harvest totals…</p> : !summary ? <p className="ff-details-note">Harvest totals are unavailable.</p> : yieldEntries.length === 0 ? <p className="ff-details-note">No recorded harvest quantities.</p> : (
            <div className="ff-details-yield-grid">
              {yieldEntries.map(([unit, value]) => <span key={unit}><strong>{numberLabel(value, 3)}</strong> {unitLabel(unit)}</span>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
