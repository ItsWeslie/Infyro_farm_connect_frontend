import React from 'react';

export function Brand({ onHome, variant = "tailwind" }) {
  if (variant === "legacy") {
    return (
      <button
        type="button"
        className="brand brand-logo"
        aria-label="Infyro Farm home"
        onClick={onHome}
      >
        <img
          src="/infyro-farm-logo.png"
          alt="Infyro Farm — Farm smarter. Grow better."
          className=""
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex items-center min-h-[42px] w-full p-0 border-0 bg-transparent cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9ecb8e] rounded-md transition-opacity hover:opacity-95"
      aria-label="Infyro Farm home"
      onClick={onHome}
    >
      <img
        src="/infyro-farm-logo.png"
        alt="Infyro Farm — Farm smarter. Grow better."
        className="block w-full max-w-[210px] h-auto max-h-[54px] object-contain object-left"
      />
    </button>
  );
}

