import * as ProgressPrimitive from "@radix-ui/react-progress"

// Adapted from shadcn/ui new-york-v4 Progress (MIT).
const cn = (...classes) => classes.filter(Boolean).join(" ")

function Progress({
  className,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        "ifc-shadcn-progress",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="ifc-shadcn-progress-indicator"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
