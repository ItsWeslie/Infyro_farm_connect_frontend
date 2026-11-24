// Adapted from the shadcn/ui Radix Select pattern (MIT).
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function Select(props) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectValue(props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("ifc-select-trigger", className)} {...props}>
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronDown size={13} aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", sideOffset = 5, ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content data-slot="select-content" className={cn("ifc-select-content", className)} position={position} sideOffset={sideOffset} {...props}>
        <SelectPrimitive.ScrollUpButton className="ifc-select-scroll"><ChevronUp size={13} aria-hidden="true" /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport data-slot="select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="ifc-select-scroll"><ChevronDown size={13} aria-hidden="true" /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn("ifc-select-item", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ifc-select-indicator">
        <Check size={13} aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
