// Adapted from shadcn/ui new-york-v4 Badge (MIT), span-only display variant.
const cn = (...classes) => classes.filter(Boolean).join(" ")

function badgeVariants({ variant = "default" } = {}) {
  return cn("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap", "ifc-shadcn-badge", "ifc-shadcn-badge-" + variant);
}

function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
