export function Avatar({ small = false, name = "Ravi Kumar" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IF";

  const sizeClass = small ? "w-[31px] h-[31px]" : "w-[34px] h-[34px]";

  return (
    <div
      className={`shrink-0 rounded-full grid place-items-center bg-[#f0dfcc] text-[#8b6649] text-[10px] font-bold border-2 border-white shadow-[0_0_0_1px_#efe4d7] ${sizeClass}`}
    >
      {initials}
    </div>
  );
}
