import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuContent = React.forwardRef(function DropdownMenuContent(
  { className = "", sideOffset = 8, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={`ifc-dropdown-menu-content ${className}`.trim()}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

const DropdownMenuLabel = React.forwardRef(function DropdownMenuLabel(
  { className = "", ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={`ifc-dropdown-menu-label ${className}`.trim()}
      {...props}
    />
  );
});

const DropdownMenuItem = React.forwardRef(function DropdownMenuItem(
  { className = "", variant = "default", ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-variant={variant}
      className={`ifc-dropdown-menu-item ${className}`.trim()}
      {...props}
    />
  );
});

const DropdownMenuSeparator = React.forwardRef(function DropdownMenuSeparator(
  { className = "", ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={`ifc-dropdown-menu-separator ${className}`.trim()}
      {...props}
    />
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";
DropdownMenuLabel.displayName = "DropdownMenuLabel";
DropdownMenuItem.displayName = "DropdownMenuItem";
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
