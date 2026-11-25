import { TooltipTarget } from "./tooltip"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

// Adapted from shadcn/ui (new-york-v4), MIT license.
// JavaScript and native buttons for client-side pagination; theme styles use data slots.
const cn = (...classes) => classes.filter(Boolean).join(" ")

function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row flex-wrap items-center justify-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }) {
  return <li data-slot="pagination-item" {...props} />
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      data-size={size}
      className={className}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}) {
  return (
    <TooltipTarget text="Previous page" disabledReason="No previous page">
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
    </TooltipTarget>
  )
}

function PaginationNext({
  className,
  ...props
}) {
  return (
    <TooltipTarget text="Next page" disabledReason="No next page">
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
    </TooltipTarget>
  )
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
