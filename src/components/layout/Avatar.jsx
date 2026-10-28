import React from 'react';

export function Avatar({ small = false, name = "Ravi Kumar" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IF";

  const sizeClass = small ? "w-8 h-8 text-[10px]" : "w-9 h-9 text-xs";

  return (
    <div
      className={`shrink-0 rounded-full grid place-items-center bg-[#f0dfcc] text-[#8b6649] font-bold border-2 border-white shadow-xs ${sizeClass}`}
    >
      {initials}
    </div>
  );
}

