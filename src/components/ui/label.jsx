// Adapted from the shadcn/ui Label pattern (MIT).
function Label({ className = "", ...props }) {
  return <label data-slot="label" className={`ifc-shadcn-label ${className}`.trim()} {...props} />;
}
export { Label };
