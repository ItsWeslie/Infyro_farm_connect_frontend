import { Sprout } from "lucide-react";

export function Brand({ onHome }) {
  return (
    <button
      type="button"
      className="flex items-center min-h-[42px] w-full p-0 border-0 bg-transparent cursor-pointer text-left rounded-md transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#9ecb8e] focus-visible:outline-offset-1"
      aria-label="Infyro Farm home"
      onClick={onHome}
    >
      <img
        src="/infyro-farm-logo.png"
        alt="Infyro Farm — Farm smarter. Grow better."
        className="block w-[190px] max-w-full h-auto max-h-[58px] object-contain object-left"
      />
    </button>
  );
}
