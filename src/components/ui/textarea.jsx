// Adapted from the shadcn/ui Textarea pattern (MIT).
function Textarea({ className = "", ...props }) {
  return <textarea data-slot="textarea" className={`ifc-shadcn-textarea ${className}`.trim()} {...props} />;
}
export { Textarea };
