import { useState } from "react";
import { ArrowRight, Bell, Check, Tractor, CircleUserRound, Sun } from "lucide-react";

export function SettingsPanel({ notify }) {
  const [units, setUnits] = useState("Acres");
  const [weather, setWeather] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [weekly, setWeekly] = useState(false);
  return (
    <div className="settings-layout">
      <div className="settings-menu surface-card">
        <div className="settings-menu-title">PREFERENCES</div>
        {[
          "Profile information",
          "Farm preferences",
          "Notifications",
          "Appearance",
        ].map((s, i) => (
          <button
            key={s}
            className={i === 1 ? "settings-menu-active" : ""}
            onClick={() => notify(s + " section selected")}
          >
            <span className="settings-menu-icon">
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
      <div className="settings-form surface-card">
        <span className="section-kicker">FARM PREFERENCES</span>
        <h2>Make it yours</h2>
        <p>Choose the defaults that make everyday farm work easier.</p>
        <label className="settings-field">
          Default measurement unit
          <select value={units} onChange={(e) => setUnits(e.target.value)}>
            <option>Acres</option>
            <option>Hectares</option>
            <option>Square metres</option>
          </select>
        </label>
        <div className="settings-option">
          <div>
            <strong>Weather updates</strong>
            <small>Show local conditions in your workspace.</small>
          </div>
          <button
            role="switch"
            aria-checked={weather}
            className={"switch " + (weather ? "switch-on" : "")}
            onClick={() => setWeather(!weather)}
          >
            <i />
          </button>
        </div>
        <div className="settings-option">
          <div>
            <strong>Farm reminders</strong>
            <small>Get nudges for tasks and upcoming harvests.</small>
          </div>
          <button
            role="switch"
            aria-checked={reminders}
            className={"switch " + (reminders ? "switch-on" : "")}
            onClick={() => setReminders(!reminders)}
          >
            <i />
          </button>
        </div>
        <div className="settings-option">
          <div>
            <strong>Weekly summary</strong>
            <small>A quick look at activities and expenses.</small>
          </div>
          <button
            role="switch"
            aria-checked={weekly}
            className={"switch " + (weekly ? "switch-on" : "")}
            onClick={() => setWeekly(!weekly)}
          >
            <i />
          </button>
        </div>
        <div className="settings-save">
          <span>Changes are local to this demo.</span>
          <button
            className="button-primary"
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
