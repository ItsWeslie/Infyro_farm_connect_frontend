// Adapted from the shadcn/ui Button pattern (MIT).
function Button({ className = "", type = "button", ...props }) {
  return <button type={type} data-slot="button" className={`ifc-shadcn-button ${className}`.trim()} {...props} />;
}
export { Button };
