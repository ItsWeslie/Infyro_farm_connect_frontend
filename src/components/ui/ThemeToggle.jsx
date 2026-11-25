import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ theme, setTheme, className = "" }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={["theme-toggle-button", dark && "is-dark", className].filter(Boolean).join(" ")}
      onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
      role="switch"
      aria-label="Dark mode"
      aria-checked={dark}
      data-tooltip={`Switch to ${dark ? "light" : "dark"} theme`}
    >
      <Sun className="theme-toggle-sun" size={12} aria-hidden="true" />
      <Moon className="theme-toggle-moon" size={12} aria-hidden="true" />
      <span className="theme-toggle-thumb" aria-hidden="true" />
    </button>
  );
}
