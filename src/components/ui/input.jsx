// Adapted from the shadcn/ui Input pattern (MIT).
function Input({ className = "", type = "text", ...props }) {
  return <input type={type} data-slot="input" className={`ifc-shadcn-input ${className}`.trim()} {...props} />;
}
export { Input };
