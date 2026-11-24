import { useState } from "react";
import { Check, ChevronsUpDown, Tractor } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./ui/command";

export default function FieldFarmSelector({ farms, selectedFarm, onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const selectedId = selectedFarm?.id == null ? "" : String(selectedFarm.id);
  const currentFarm = farms.find((farm) => String(farm.id) === selectedId) || selectedFarm;
  const fieldCount = Array.isArray(currentFarm?.fields) ? currentFarm.fields.length : null;

  return (
    <Popover open={open && !disabled} onOpenChange={(next) => setOpen(next && !disabled)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ff-field-farm-trigger"
          aria-label={"Switch farm. Selected farm: " + (currentFarm?.name || "None")}
          disabled={disabled}
        >
          <span className="ff-field-farm-icon"><Tractor size={17} aria-hidden="true" /></span>
          <span className="ff-field-farm-copy">
            <small>SELECTED FARM</small>
            <strong title={currentFarm?.name || ""}>{currentFarm?.name || "Select a farm"}</strong>
            {fieldCount !== null && <span>{fieldCount} registered {fieldCount === 1 ? "field" : "fields"}</span>}
          </span>
          <ChevronsUpDown className="ff-field-farm-chevron" size={14} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="ff-field-farm-popover" align="end" sideOffset={6} collisionPadding={12}>
        <Command label="Switch farm">
          <CommandInput placeholder="Search farms..." aria-label="Search farms" />
          <CommandList>
            <CommandEmpty>No matching farms.</CommandEmpty>
            <CommandGroup>
              {farms.map((farm) => {
                const id = String(farm.id);
                const selected = id === selectedId;
                return (
                  <CommandItem
                    key={id}
                    value={id}
                    keywords={[farm.name || "Unnamed farm"]}
                    data-current-farm={selected}
                    onSelect={() => {
                      if (!selected) onSelect(farm);
                      setOpen(false);
                    }}
                  >
                    <Tractor size={15} aria-hidden="true" />
                    <span className="ff-field-farm-option-name">{farm.name || "Unnamed farm"}</span>
                    {selected && <Check size={15} className="ff-field-farm-check" aria-label="Current farm" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
