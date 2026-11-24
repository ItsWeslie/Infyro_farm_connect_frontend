// Adapted from the shadcn/ui Calendar and Date Picker patterns (MIT).
import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

function Calendar({ className = "", ...props }) {
  return <DayPicker showOutsideDays className={`ifc-shadcn-calendar ${className}`.trim()} {...props} />;
}

function parseDate(value) {
  if (!value) return undefined;
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateValue(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function DatePicker({ id, value, onChange, min, required = false, disabled = false }) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const minimum = parseDate(min);
  return (
    <Popover open={open && !disabled} onOpenChange={(next) => setOpen(next && !disabled)}>
      <PopoverTrigger asChild>
        <button id={id} type="button" className="ifc-date-trigger" disabled={disabled} data-placeholder={!selected}>
          <CalendarDays size={15} aria-hidden="true" />
          <span>{selected ? selected.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Choose date"}</span>
          <ChevronDown size={13} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="ifc-date-popover" side="top" align="start" sideOffset={5} collisionPadding={12}>
        <Calendar mode="single" selected={selected} required={required}
          defaultMonth={minimum && (!selected || selected < minimum) ? minimum : selected}
          startMonth={minimum} disabled={minimum ? { before: minimum } : undefined}
          onSelect={(date) => { onChange(date ? toDateValue(date) : ""); setOpen(false); }} />
        {!required && selected && (
          <button type="button" className="ifc-date-clear" onClick={() => { onChange(""); setOpen(false); }}>Clear date</button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { Calendar, DatePicker };
