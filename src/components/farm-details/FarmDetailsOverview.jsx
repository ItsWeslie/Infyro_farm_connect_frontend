import { LandPlot, MapPinned, Sprout, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "../ui/card";

function parseArea(value) {
  if (value == null || value === "") return null;
  const area = Number(value);
  return Number.isFinite(area) && area >= 0 ? area : null;
}

function sumArea(fields, key) {
  if (!Array.isArray(fields)) return null;
  const values = fields.map((field) => parseArea(field[key]));
  return values.some((value) => value === null)
    ? null
    : values.reduce((sum, value) => sum + value, 0);
}

function areaLabel(value) {
  return value === null ? "—" : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function FarmDetailsOverview({ farm }) {
  const fields = Array.isArray(farm?.fields) ? farm.fields : null;
  const total = sumArea(fields, "totalArea");
  const available = sumArea(fields, "availableArea");
  const allocated = total !== null && available !== null && available <= total ? total - available : null;
  const stats = [
    { label: "Total land", value: areaLabel(total), icon: LandPlot },
    { label: "Total fields", value: fields?.length ?? "—", icon: MapPinned },
    { label: "Available land", value: areaLabel(available), icon: Sprout },
    { label: "Allocated land", value: areaLabel(allocated), icon: Ruler },
  ];

  return (
    <div className="ff-details-overview">
      <div className="ff-details-stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="ff-details-stat">
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardAction><Icon size={15} aria-hidden="true" /></CardAction>
            </CardHeader>
            <CardContent><strong>{value}</strong></CardContent>
          </Card>
        ))}
      </div>
      {(!fields || total === null || available === null || allocated === null) && (
        <p className="ff-details-note">Some land details are unavailable for this farm.</p>
      )}
    </div>
  );
}
