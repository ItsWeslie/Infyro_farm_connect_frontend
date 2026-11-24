import { useEffect, useState } from "react";
import { Wallet, ClipboardList, Ban, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { expenseApi, fieldApi, cropPlantingApi } from "../../api/client";

function unwrapList(response) {
  const list = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(list)) throw new Error("Expense or related records are unavailable.");
  return list;
}

function farmExpenses(records, farmId) {
  return records.filter((record) => record?.id != null && record.farmId != null && String(record.farmId) === String(farmId))
    .sort((a, b) => String(b.expenseDate || "").localeCompare(String(a.expenseDate || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function plantingLookup(fields, plantings) {
  const names = new Map(fields.filter((field) => field?.id != null).map((field) => [String(field.id), field.fieldName]));
  return new Map(plantings
    .filter((planting) => planting?.id != null && planting.fieldId != null && names.has(String(planting.fieldId)))
    .map((planting) => [String(planting.id), { cropName: planting.cropTypeName, fieldName: names.get(String(planting.fieldId)) }]));
}

function amountInPaise(value) {
  if (value == null || (typeof value !== "number" && typeof value !== "string") || !String(value).trim()) return null;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value).trim());
  if (!match) return null;
  const paise = BigInt(match[1]) * 100n + BigInt((match[2] || "").padEnd(2, "0") || "0");
  return paise;
}

function currencyLabel(paise) {
  if (paise === null) return "—";
  const whole = paise / 100n;
  const fraction = String(paise % 100n).padStart(2, "0");
  return "₹" + whole.toLocaleString("en-IN") + "." + fraction;
}

function expenseMetrics(records) {
  let total = 0n;
  let invalidAmounts = false;
  let active = 0;
  let voided = 0;
  let cropLinked = 0;
  let unknownStatus = false;
  const categories = new Map();
  for (const record of records) {
    if (record.voided === true) { voided += 1; continue; }
    if (record.voided !== false) { unknownStatus = true; continue; }
    active += 1;
    if (record.cropPlantingId != null) cropLinked += 1;
    const amount = amountInPaise(record.amount);
    if (amount === null) { invalidAmounts = true; continue; }
    total += amount;
    const category = record.category || "UNCATEGORIZED";
    categories.set(category, (categories.get(category) || 0n) + amount);
  }
  const complete = !invalidAmounts && !unknownStatus;
  const breakdown = complete ? [...categories.entries()].sort((a, b) => a[1] === b[1] ? a[0].localeCompare(b[0]) : a[1] > b[1] ? -1 : 1) : [];
  return { total: complete ? total : null, active, voided, cropLinked, breakdown, complete, unknownStatus };
}

function percentOf(amount, total) {
  return total > 0n ? Number(amount * 10000n / total) / 100 : 0;
}

function humanize(value) {
  return value ? String(value).toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") : "—";
}

function dateLabel(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  return match ? match[3] + "/" + match[2] + "/" + match[1] : "—";
}

export default function FarmDetailsExpenses({ farm }) {
  const farmId = farm?.id;
  const [records, setRecords] = useState([]);
  const [lookup, setLookup] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [error, setError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (farmId == null) return;
    let current = true;
    setRecords([]);
    setLookup(new Map());
    setLoading(true);
    setLookupLoading(true);
    setError("");
    setLookupError("");

    expenseApi.getByFarm(farmId)
      .then((response) => {
        const items = farmExpenses(unwrapList(response), farmId);
        if (current) setRecords(items);
      })
      .catch((requestError) => { if (current) setError(requestError.message || "Could not load farm expenses."); })
      .finally(() => { if (current) setLoading(false); });

    Promise.all([fieldApi.getByFarm(farmId), cropPlantingApi.getAll()])
      .then(([fields, plantings]) => {
        const names = plantingLookup(unwrapList(fields), unwrapList(plantings));
        if (current) setLookup(names);
      })
      .catch(() => { if (current) setLookupError("Crop and field names could not be loaded. Expense records are still available."); })
      .finally(() => { if (current) setLookupLoading(false); });

    return () => { current = false; };
  }, [farmId, retryKey]);

  const metrics = expenseMetrics(records);
  const stats = [
    { label: "Total expenses", value: currencyLabel(metrics.total), icon: Wallet, detail: "All time · excludes cancelled" },
    { label: "Active expenses", value: metrics.unknownStatus ? "—" : metrics.active, icon: ClipboardList },
    { label: "Cancelled entries", value: metrics.unknownStatus ? "—" : metrics.voided, icon: Ban },
    { label: "Crop-linked", value: metrics.unknownStatus ? "—" : metrics.cropLinked, icon: Leaf, detail: "Active entries only" },
  ];
  const retry = () => setRetryKey((key) => key + 1);

  return (
    <div className="ff-details-expenses">
      {(error || lookupError) && (
        <div className="ff-details-load-error" role="alert">
          <div>{error && <p>{error}</p>}{lookupError && <p>{lookupError}</p>}</div>
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
              <strong>{loading ? "…" : error ? "—" : value}</strong>
              {detail && <small className="ff-details-stat-detail">{detail}</small>}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="ff-details-insight">
        <CardHeader><CardTitle>Spending by category</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="ff-details-note" role="status">Loading spending breakdown…</p> : error || !metrics.complete ? (
            <p className="ff-details-note">Spending breakdown is unavailable.</p>
          ) : metrics.breakdown.length === 0 ? (
            <p className="ff-details-note">No active expenses recorded.</p>
          ) : (
            <div className="ff-details-expense-breakdown">
              {metrics.breakdown.map(([category, amount]) => (
                <div className="ff-details-expense-category" key={category}>
                  <div><span>{humanize(category)}</span><strong>{currencyLabel(amount)}</strong></div>
                  <Progress value={percentOf(amount, metrics.total)} aria-label={humanize(category) + " share of spending"} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="ff-details-insight ff-details-fields ff-details-expense-ledger">
        <CardHeader><CardTitle>Expense records</CardTitle></CardHeader>
        <CardContent aria-busy={loading}>
          {loading ? <p className="ff-details-note" role="status">Loading expenses…</p> : error ? (
            <p className="ff-details-note">Expense records are unavailable.</p>
          ) : records.length === 0 ? (
            <div className="ff-details-fields-empty">
              <Wallet size={23} aria-hidden="true" />
              <strong>No expenses recorded</strong>
              <p>This farm has no expense records yet.</p>
            </div>
          ) : (
            <Table className="ff-details-table" aria-label="Expenses in selected farm">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Date</TableHead>
                  <TableHead scope="col">Description</TableHead>
                  <TableHead scope="col">Category</TableHead>
                  <TableHead scope="col">Crop / field</TableHead>
                  <TableHead scope="col">Amount</TableHead>
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const planting = lookup.get(String(record.cropPlantingId));
                  const status = record.voided === true ? "voided" : record.voided === false ? "active" : "unknown";
                  return (
                    <TableRow key={record.id} data-expense-status={status}>
                      <TableCell>{dateLabel(record.expenseDate)}</TableCell>
                      <TableCell>
                        <div className="ff-details-activity-copy ff-details-expense-description">
                          <strong>{record.description || "—"}</strong>
                          {record.voided === true && record.voidReason && <p>{record.voidReason}</p>}
                        </div>
                      </TableCell>
                      <TableCell>{humanize(record.category)}</TableCell>
                      <TableCell>
                        {record.cropPlantingId == null ? "Farm-wide" : planting ? (
                          <div className="ff-details-activity-crop">
                            <strong>{planting.cropName || "—"}</strong>
                            <small>{planting.fieldName || "—"}</small>
                          </div>
                        ) : lookupLoading ? "Loading…" : "Crop-linked"}
                      </TableCell>
                      <TableCell className="ff-details-expense-amount">{currencyLabel(amountInPaise(record.amount))}</TableCell>
                      <TableCell><Badge variant="secondary" className="ff-details-crop-status ff-details-expense-status" data-status={status}>{status === "voided" ? "Cancelled" : status === "active" ? "Active" : "Unavailable"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {!loading && !error && !metrics.complete && <p className="ff-details-note ff-details-expense-note">Some expense amounts or statuses are unavailable. Incomplete spending totals are not displayed.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
