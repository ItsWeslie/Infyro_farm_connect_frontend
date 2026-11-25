import { useState } from "react";
import { Check, ChevronsUpDown, Sprout, Tractor } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./ui/command";

export default function ActivityPlantingSelector({ options, selected, onSelect, loading, disabled = false, placeholder = "Select a planting" }) {
  const [open, setOpen] = useState(false);
  const unavailable = disabled || loading || options.length === 0;
  const groups = new Map();
  options.forEach((option) => {
    if (!groups.has(option.farmId)) groups.set(option.farmId, { name: option.farmName, items: [] });
    groups.get(option.farmId).items.push(option);
  });

  return (
    <Popover open={open && !unavailable} onOpenChange={(next) => setOpen(next && !unavailable)}>
      <PopoverTrigger asChild>
        <button type="button" className="ff-field-farm-trigger crop3-activity-planting-trigger"
          aria-label={"Select planting. " + (selected ? selected.cropName + ", " + selected.farmName + ", " + selected.fieldName : "No planting selected")}
          disabled={unavailable}>
          <span className="ff-field-farm-icon"><Sprout size={18} aria-hidden="true" /></span>
          <span className="ff-field-farm-copy">
            <small>SELECTED PLANTING</small>
            <strong>{loading ? "Loading plantings…" : selected?.cropName || (options.length ? placeholder : "No plantings available")}</strong>
            {selected && <span>{selected.farmName} · {selected.fieldName} · {selected.plantedOn}</span>}
          </span>
          <ChevronsUpDown className="ff-field-farm-chevron" size={14} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="ff-field-farm-popover crop3-activity-planting-popover" align="start" sideOffset={6} collisionPadding={12}>
        <Command label="Select planting">
          <CommandInput placeholder="Search crop, farm or field..." aria-label="Search plantings" />
          <CommandList>
            <CommandEmpty>No matching plantings.</CommandEmpty>
            {[...groups.entries()].map(([farmId, group]) => (
              <CommandGroup key={farmId} heading={<span className="crop3-planting-group-heading"><Tractor size={13} aria-hidden="true" />{group.name}</span>}>
                {group.items.map((option) => (
                  <CommandItem key={option.id} value={option.id}
                    keywords={[option.cropName, option.farmName, option.fieldName, option.plantedOn, option.status]}
                    data-current-farm={option.id === selected?.id}
                    onSelect={() => { onSelect(option.id); setOpen(false); }}>
                    <Sprout size={15} aria-hidden="true" />
                    <span className="crop3-planting-option-copy">
                      <strong>{option.cropName}</strong>
                      <small>{option.fieldName} · {option.plantedOn} · {option.status}</small>
                    </span>
                    {option.id === selected?.id && <Check size={15} className="ff-field-farm-check" aria-label="Selected planting" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
