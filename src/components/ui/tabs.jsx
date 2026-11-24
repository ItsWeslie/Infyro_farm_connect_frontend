import * as TabsPrimitive from "@radix-ui/react-tabs"

// Adapted from shadcn/ui new-york-v4 Tabs (MIT).
// JavaScript and data-slot theme styling for Infyro Farms.
const cn = (...classes) => classes.filter(Boolean).join(" ")

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "ifc-shadcn-tabs",
        className
      )}
      {...props}
    />
  )
}

function tabsListVariants({ variant = "default" } = {}) {
  return cn("ifc-shadcn-tabs-list", variant === "line" && "ifc-shadcn-tabs-line");
}

function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn("ifc-shadcn-tabs-trigger", className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("ifc-shadcn-tabs-content", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
