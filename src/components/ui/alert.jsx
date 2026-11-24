// Adapted from shadcn/ui new-york-v4 Alert (MIT).
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Alert({ className, variant = "default", ...props }) {
  return <div data-slot="alert" data-variant={variant} role="alert" className={cn("ifc-shadcn-alert", className)} {...props} />;
}

function AlertTitle({ className, ...props }) {
  return <div data-slot="alert-title" className={cn("ifc-shadcn-alert-title", className)} {...props} />;
}

function AlertDescription({ className, ...props }) {
  return <div data-slot="alert-description" className={cn("ifc-shadcn-alert-description", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
