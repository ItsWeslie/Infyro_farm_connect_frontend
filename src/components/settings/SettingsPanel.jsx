import { useState } from "react";
import { ArrowRight, Bell, Check, Tractor, CircleUserRound, Sun } from "lucide-react";

export function SettingsPanel({ notify }) {
  const [units, setUnits] = useState("Acres");
  const [weather, setWeather] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [weekly, setWeekly] = useState(false);
  return (
    <div className="grid grid-cols-[minmax(190px,.7fr)_minmax(0,1.7fr)] gap-4 items-start max-[900px]:grid-cols-1">
      <div className="surface-card p-[14px] max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-1 max-[650px]:grid-cols-1">
        <div className="text-[8px] tracking-[1.2px] font-bold text-[#9aa59b] pt-[5px] px-2 pb-3 max-[900px]:col-span-full">PREFERENCES</div>
        {[
          "Profile information",
          "Farm preferences",
          "Notifications",
          "Appearance",
        ].map((s, i) => (
          <button
            key={s}
            className={`w-full border-0 bg-white rounded-lg flex items-center gap-[9px] py-[10px] px-2 text-left text-[10px] text-[#78867b] mb-[3px] max-[650px]:mb-0 ${i === 1 ? "bg-[#edf4e8] text-[#356943] font-bold" : ""}`}
            onClick={() => notify(s + " section selected")}
          >
            <span className="grid place-items-center">
              {i === 0 ? (
                <CircleUserRound size={16} />
              ) : i === 1 ? (
                <Tractor size={16} />
              ) : i === 2 ? (
                <Bell size={16} />
              ) : (
                <Sun size={16} />
              )}
            </span>
            {s}
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
      <div className="surface-card p-[22px] max-[650px]:p-4">
        <span className="section-kicker">FARM PREFERENCES</span>
        <h2 className="m-0 mt-[7px] font-[800] text-[19px] tracking-[-0.3px] text-[#2c4032] [font-family:Manrope,sans-serif]">Make it yours</h2>
        <p className="mt-[5px] mb-5 text-[10px] text-[#95a096]">Choose the defaults that make everyday farm work easier.</p>
        <label className="grid gap-2 text-[#58685a] text-[10px] font-bold mb-[18px]">
          Default measurement unit
          <select className="h-[39px] border border-[#e2e9de] rounded-lg px-[10px] bg-white text-[#4c5e50] text-[11px]" value={units} onChange={(e) => setUnits(e.target.value)}>
            <option>Acres</option>
            <option>Hectares</option>
            <option>Square metres</option>
          </select>
        </label>
        <div className="flex items-center justify-between gap-[15px] py-[15px] border-t border-[#edf0e9]">
          <div>
            <strong className="block text-[#425345] text-[11px]">Weather updates</strong>
            <small className="block text-[#96a096] text-[9px] mt-[5px] leading-[1.5]">Show local conditions in your workspace.</small>
          </div>
          <button
            role="switch"
            aria-checked={weather}
            className={`w-[37px] h-[21px] shrink-0 border-0 rounded-[20px] p-[3px] flex items-center transition-[background] duration-[180ms] ${weather ? "bg-[#6e9b63]" : "bg-[#dfe5dc]"}`}
            onClick={() => setWeather(!weather)}
          >
            <i className={`w-[15px] h-[15px] rounded-full bg-white shadow-[0_1px_3px_#0002] transition-transform duration-[180ms] ${weather ? "translate-x-4" : ""}`} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-[15px] py-[15px] border-t border-[#edf0e9]">
          <div>
            <strong className="block text-[#425345] text-[11px]">Farm reminders</strong>
            <small className="block text-[#96a096] text-[9px] mt-[5px] leading-[1.5]">Get nudges for tasks and upcoming harvests.</small>
          </div>
          <button
            role="switch"
            aria-checked={reminders}
            className={`w-[37px] h-[21px] shrink-0 border-0 rounded-[20px] p-[3px] flex items-center transition-[background] duration-[180ms] ${reminders ? "bg-[#6e9b63]" : "bg-[#dfe5dc]"}`}
            onClick={() => setReminders(!reminders)}
          >
            <i className={`w-[15px] h-[15px] rounded-full bg-white shadow-[0_1px_3px_#0002] transition-transform duration-[180ms] ${reminders ? "translate-x-4" : ""}`} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-[15px] py-[15px] border-t border-[#edf0e9]">
          <div>
            <strong className="block text-[#425345] text-[11px]">Weekly summary</strong>
            <small className="block text-[#96a096] text-[9px] mt-[5px] leading-[1.5]">A quick look at activities and expenses.</small>
          </div>
          <button
            role="switch"
            aria-checked={weekly}
            className={`w-[37px] h-[21px] shrink-0 border-0 rounded-[20px] p-[3px] flex items-center transition-[background] duration-[180ms] ${weekly ? "bg-[#6e9b63]" : "bg-[#dfe5dc]"}`}
            onClick={() => setWeekly(!weekly)}
          >
            <i className={`w-[15px] h-[15px] rounded-full bg-white shadow-[0_1px_3px_#0002] transition-transform duration-[180ms] ${weekly ? "translate-x-4" : ""}`} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#edf0e9] pt-[17px] mt-[5px] max-[650px]:items-start max-[650px]:flex-col">
          <span className="text-[9px] text-[#9aa49b]">Changes are local to this demo.</span>
          <button
            className="button-primary px-3 py-[9px] max-[650px]:w-full"
            onClick={() => notify("Preferences saved for this demo")}
          >
            <Check size={15} />
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
