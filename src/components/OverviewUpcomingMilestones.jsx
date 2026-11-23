import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleAlert, MapPin, Sprout, Tractor, Wheat } from "lucide-react";
import { calendarApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function eventDateLabel(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value + "T12:00:00");
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

function isHarvestEvent(type) {
  return String(type || "").toUpperCase().includes("HARVEST");
}

export default function OverviewUpcomingMilestones({ onNavigate }) {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let current = true;
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    const from = dateKey(today);
    const to = dateKey(end);

    setLoading(true);
    setEvents(null);
    setError("");
    calendarApi.getEvents(from, to)
      .then((result) => {
        if (!current) return;
        const upcoming = (Array.isArray(result) ? result : [])
          .filter((event) => event.eventDate && event.eventDate >= from && event.eventDate <= to)
          .sort((left, right) => left.eventDate.localeCompare(right.eventDate))
          .slice(0, 5);
        setEvents(upcoming);
      })
      .catch((requestError) => {
        if (current) {
          setEvents([]);
          setError(requestError.message || "Upcoming milestones could not be loaded.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [retryKey]);

  return (
    <section className="ifc-overview-panel ifc-overview-side-panel ifc-overview-milestones-panel surface-card" aria-labelledby="ifc-overview-milestones-title">
      <div className="ifc-overview-panel-heading">
        <div>
          <span className="ifc-overview-kicker">NEXT 30 DAYS</span>
          <h2 id="ifc-overview-milestones-title">Upcoming milestones</h2>
          <p>Nearest planting and expected-harvest dates across your farms.</p>
        </div>
        <CalendarDays size={19} />
      </div>

      {error && (
        <div className="ifc-overview-warning ifc-overview-milestones-error" role="alert">
          <CircleAlert size={15} />
          <span>{error}</span>
          <button type="button" className="button-secondary" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
        </div>
      )}

      {loading && events === null ? (
        <div className="ifc-overview-milestones-loading" role="status" aria-label="Loading upcoming milestones">
          <SkeletonBlock rows={4} />
        </div>
      ) : events?.length ? (
        <div className="ifc-overview-milestone-list">
          {events.map((event, index) => {
            const harvest = isHarvestEvent(event.eventType);
            return (
              <article
                className="ifc-overview-milestone ifc-overview-milestone-entry"
                key={event.eventKey || [event.eventType, event.sourceId, event.eventDate, index].join("-")}
              >
                <span className={"ifc-overview-milestone-icon " + (harvest ? "harvest" : "planting")} aria-hidden="true">
                  {harvest ? <Wheat size={17} /> : <Sprout size={17} />}
                </span>
                <div className="ifc-overview-milestone-info">
                  <div className="ifc-overview-milestone-title-row">
                    <strong title={event.title || undefined}>
                      {event.title || (harvest ? "Expected harvest" : "Planting milestone")}
                    </strong>
                  </div>
                  {(event.farmName || event.fieldName) && (
                    <div className="ifc-overview-milestone-meta">
                      {event.farmName && (
                        <span className="ifc-overview-milestone-farm" title={event.farmName}>
                          <Tractor size={11} aria-hidden="true" />
                          <span>{event.farmName}</span>
                        </span>
                      )}
                      {event.fieldName && (
                        <span className="ifc-overview-milestone-field" title={event.fieldName}>
                          <MapPin size={11} aria-hidden="true" />
                          <span>{event.fieldName}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <time className="ifc-overview-milestone-date" dateTime={event.eventDate}>
                  <CalendarDays size={11} aria-hidden="true" />
                  {eventDateLabel(event.eventDate)}
                </time>
              </article>
            );
          })}
        </div>
      ) : !error ? (
        <div className="ifc-overview-section-empty compact">
          <CalendarDays size={21} />
          <strong>No upcoming milestones</strong>
          <span>There are no planting or expected-harvest dates in the next 30 days.</span>
        </div>
      ) : null}

      <button type="button" className="ifc-overview-panel-footer" onClick={() => onNavigate("Calendar")}>
        Open farm calendar <ArrowRight size={14} />
      </button>
    </section>
  );
}
