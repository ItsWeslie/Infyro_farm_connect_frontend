import { useState } from "react";
import { ArrowRight, CalendarDays, Plus, Sun } from "lucide-react";

export function CalendarPanel({ notify }) {
  const [month, setMonth] = useState(9);
  const [mode, setMode] = useState("Month");
  const [customEvents, setCustomEvents] = useState({});
  const [eventOpen, setEventOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState("");
  const monthName = new Date(2026, month, 1).toLocaleString("en", {
    month: "long",
  });
  const first = new Date(2026, month, 1).getDay();
  const days = new Date(2026, month + 1, 0).getDate();
  const events = {
    27: ["Soil check"],
    28: ["Inspect chilli"],
    30: ["Spinach harvest"],
    2: ["Rice inspection"],
    ...customEvents,
  };
  function addCalendarEvent(e) {
    e.preventDefault();
    if (!eventDraft.trim()) return;
    setCustomEvents({ ...customEvents, 29: [eventDraft.trim()] });
    setEventDraft("");
    setEventOpen(false);
    notify("Calendar event added to the demo calendar");
  }
  return (
    <div className="calendar-panel surface-card">
      <div className="calendar-panel-head">
        <div>
          <span className="section-kicker">PLAN AHEAD</span>
          <h2>{monthName} 2026</h2>
          <p>Make every day count, one task at a time.</p>
        </div>
        <div className="calendar-controls">
          <button className="button-primary" onClick={() => setEventOpen(true)}>
            <Plus size={14} /> Add event
          </button>
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}
          >
            <ArrowRight className="flip-arrow" size={17} />
          </button>
          <button className="button-secondary" onClick={() => setMonth(9)}>
            Today
          </button>
          <button
            className="icon-button"
            aria-label="Next month"
            onClick={() => setMonth((m) => (m + 1) % 12)}
          >
            <ArrowRight size={17} />
          </button>
          <div className="view-toggle">
            <button
              className={mode === "Month" ? "selected" : ""}
              onClick={() => setMode("Month")}
            >
              Month
            </button>
            <button
              className={mode === "Agenda" ? "selected" : ""}
              onClick={() => setMode("Agenda")}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>
      {eventOpen && (
        <form className="calendar-add-event" onSubmit={addCalendarEvent}>
          <label className="form-label">
            Event name
            <input
              autoFocus
              required
              value={eventDraft}
              onChange={(e) => setEventDraft(e.target.value)}
              placeholder="e.g. Soil health check"
            />
          </label>
          <span className="calendar-event-date">
            Scheduled for October 29, 2026 in this demo
          </span>
          <div className="dialog-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setEventOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="button-primary">
              <Plus size={14} /> Save event
            </button>
          </div>
        </form>
      )}
      {mode === "Month" ? (
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div className="calendar-weekday" key={d}>
              {d}
            </div>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <div className="calendar-day muted-day" key={"blank" + i} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const today = month === 9 && day === 27;
            const hasEvent = !!events[day];
            return (
              <button
                key={day}
                className={
                  "calendar-day " +
                  (today ? "today-day" : "") +
                  (hasEvent ? " has-event" : "")
                }
                onClick={() =>
                  notify(
                    (events[day] || ["No events planned"])[0] +
                      " · " +
                      monthName +
                      " " +
                      day,
                  )
                }
              >
                <span>{day}</span>
                {hasEvent && <small>{events[day][0]}</small>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="agenda-list">
          {[
            ["Oct 27", "Soil moisture check", "North Field"],
            ["Oct 28", "Inspect chilli plants", "East Field"],
            [
              "Oct 29",
              customEvents[29]?.[0] || "Prepare harvest crates",
              "Green Valley Farm",
            ],
            ["Oct 30", "Spinach harvest", "Kitchen Garden"],
            ["Nov 02", "Rice field inspection", "Paddy Field A"],
          ].map((e) => (
            <div className="agenda-row" key={e[0]}>
              <span>{e[0]}</span>
              <div>
                <strong>{e[1]}</strong>
                <small>{e[2]}</small>
              </div>
              <CalendarDays size={17} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
