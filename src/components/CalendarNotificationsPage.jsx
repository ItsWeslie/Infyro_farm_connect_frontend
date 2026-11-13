import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Wheat,
} from "lucide-react";
import { calendarApi, notificationApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

const NOTIFICATION_PAGE_SIZE = 20;

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function fromDateKey(value) {
  if (!value || typeof value !== "string") return new Date(NaN);
  const parts = value.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], 12);
}

function displayDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
  const date = fromDateKey(value);
  return Number.isNaN(date.getTime()) ? value || "Date unavailable" : date.toLocaleDateString(undefined, options);
}

function displayTimestamp(value, fallbackDate) {
  const date = value ? new Date(value) : fromDateKey(fallbackDate);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function eventTypeLabel(type) {
  if (type === "PLANTING") return "Planting";
  if (type === "HARVEST") return "Expected harvest";
  return String(type || "Farm event").replaceAll("_", " ").toLowerCase();
}

function eventTypeClass(type) {
  return type === "HARVEST" ? "harvest" : "planting";
}

function EventTypeIcon({ type, size = 15 }) {
  if (type === "HARVEST") return <Wheat size={size} />;
  if (type === "PLANTING") return <Sprout size={size} />;
  return <CalendarDays size={size} />;
}

function NotificationTypeIcon({ type }) {
  if (type === "HARVEST") return <Wheat size={17} />;
  if (type === "PLANTING") return <Sprout size={17} />;
  return <Bell size={17} />;
}

export function CalendarPage() {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [view, setView] = useState("month");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const from = toDateKey(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1));
  const to = toDateKey(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0));
  const monthTitle = monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    calendarApi.getEvents(from, to)
      .then((response) => {
        if (!active) return;
        setEvents(Array.isArray(response) ? response : []);
      })
      .catch((requestError) => {
        if (!active) return;
        setEvents([]);
        setError(requestError.message || "Unable to load calendar events.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [from, to, retryKey]);

  useEffect(() => {
    const selected = fromDateKey(selectedDate);
    if (
      selected.getFullYear() !== monthCursor.getFullYear() ||
      selected.getMonth() !== monthCursor.getMonth()
    ) {
      setSelectedDate(from);
    }
  }, [from, monthCursor, selectedDate]);

  const visibleEvents = useMemo(
    () => events.filter((event) => eventFilter === "ALL" || event.eventType === eventFilter),
    [events, eventFilter],
  );

  const eventsByDate = useMemo(() => {
    return visibleEvents.reduce((groups, event) => {
      const key = event.eventDate;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
      return groups;
    }, {});
  }, [visibleEvents]);

  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1).getDay();
    const numberOfDays = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + numberOfDays) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstWeekday + 1;
      return day > 0 && day <= numberOfDays ? day : null;
    });
  }, [monthCursor]);

  const selectedEvents = eventsByDate[selectedDate] || [];
  const todayKey = toDateKey(new Date());

  function changeMonth(offset) {
    setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function goToToday() {
    const now = new Date();
    setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(toDateKey(now));
  }

  return (
    <section className="ifc-live-page">
      <div className="ifc-live-page-heading">
        <div>
          <span className="page-eyebrow"><i className="eyebrow-pip" /> YOUR FARM MILESTONES</span>
          <h1>Calendar</h1>
          <p>Planting dates and expected harvests from your crop records.</p>
        </div>
        <div className="ifc-live-heading-meta">
          <span className="ifc-live-status"><i /> Live backend data</span>
          <span>{events.length} {events.length === 1 ? "milestone" : "milestones"} this month</span>
        </div>
      </div>

      <div className="ifc-calendar-card surface-card">
        <div className="ifc-calendar-toolbar">
          <div className="ifc-calendar-month-title">
            <span className="ifc-calendar-icon"><CalendarDays size={19} /></span>
            <div>
              <h2>{monthTitle}</h2>
              <p>{loading ? "Syncing your farm calendar…" : "Choose a day to see its milestones."}</p>
            </div>
          </div>
          <div className="ifc-calendar-controls">
            <label className="ifc-calendar-filter">
              <span>Show</span>
              <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
                <option value="ALL">All milestones</option>
                <option value="PLANTING">Planting dates</option>
                <option value="HARVEST">Expected harvests</option>
              </select>
            </label>
            <div className="ifc-calendar-month-nav">
              <button type="button" className="icon-button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="button-secondary" onClick={goToToday}>Today</button>
              <button type="button" className="icon-button" aria-label="Next month" onClick={() => changeMonth(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="ifc-calendar-view-toggle">
              <button type="button" className={view === "month" ? "selected" : ""} onClick={() => setView("month")}>Month</button>
              <button type="button" className={view === "agenda" ? "selected" : ""} onClick={() => setView("agenda")}>Agenda</button>
            </div>
          </div>
        </div>

        {error && (
          <div className="ifc-live-error" role="alert">
            <span>{error}</span>
            <button type="button" className="button-secondary" onClick={() => setRetryKey((key) => key + 1)}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {view === "month" ? (
          <div className="ifc-calendar-layout">
            <div className="ifc-calendar-main">
              <div className="ifc-calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div className="ifc-calendar-weekday" key={day}>{day}</div>
                ))}
                {calendarCells.map((day, index) => {
                  if (!day) return <div className="ifc-calendar-blank" key={"blank-" + index} />;
                  const dateKey = toDateKey(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day));
                  const dayEvents = eventsByDate[dateKey] || [];
                  const selected = selectedDate === dateKey;
                  const isToday = todayKey === dateKey;
                  return (
                    <button
                      type="button"
                      key={dateKey}
                      aria-label={displayDate(dateKey, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) + ", " + dayEvents.length + " milestones"}
                      aria-pressed={selected}
                      className={"ifc-calendar-day" + (selected ? " is-selected" : "") + (isToday ? " is-today" : "")}
                      onClick={() => setSelectedDate(dateKey)}
                    >
                      <span className="ifc-calendar-day-number">{day}</span>
                      <span className="ifc-calendar-day-events">
                        {dayEvents.slice(0, 2).map((event) => (
                          <span className={"ifc-calendar-marker " + eventTypeClass(event.eventType)} key={event.eventKey} title={event.title}>
                            <i />{event.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && <small>+{dayEvents.length - 2} more</small>}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="ifc-calendar-legend">
                <span><i className="planting" /> Planting</span>
                <span><i className="harvest" /> Expected harvest</span>
              </div>
            </div>
            <aside className="ifc-calendar-day-panel">
              <div className="ifc-calendar-day-panel-heading">
                <span className="section-kicker">DAY DETAILS</span>
                <h3>{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</h3>
                <p>{selectedEvents.length} {selectedEvents.length === 1 ? "milestone" : "milestones"} scheduled</p>
              </div>
              {loading && <div className="ifc-calendar-panel-state">Loading milestones…</div>}
              {!loading && selectedEvents.length === 0 && (
                <div className="ifc-calendar-panel-empty">
                  <CalendarDays size={22} />
                  <strong>No milestones on this day</strong>
                  <span>Planting and expected harvest dates will appear here when they fall on this date.</span>
                </div>
              )}
              {!loading && selectedEvents.map((event) => (
                <article className="ifc-calendar-event-card" key={event.eventKey}>
                  <div className={"ifc-calendar-event-icon " + eventTypeClass(event.eventType)}>
                    <EventTypeIcon type={event.eventType} />
                  </div>
                  <div className="ifc-calendar-event-copy">
                    <span className={"ifc-event-type " + eventTypeClass(event.eventType)}>{eventTypeLabel(event.eventType)}</span>
                    <h4>{event.title}</h4>
                    <div><strong>{event.farmName || "Farm"}</strong></div>
                    <div className="ifc-calendar-event-field"><MapPin size={12} /> {event.fieldName || "Field not specified"}</div>
                    <small>Status: {String(event.status || "—").replaceAll("_", " ")}</small>
                  </div>
                </article>
              ))}
            </aside>
          </div>
        ) : (
          <div className="ifc-calendar-agenda">
            {loading && <div className="ifc-calendar-panel-state">Loading milestones…</div>}
            {!loading && visibleEvents.length === 0 && (
              <div className="ifc-calendar-panel-empty">
                <CalendarDays size={22} />
                <strong>No milestones this month</strong>
                <span>Planting and expected harvest dates are generated from crop planting records.</span>
              </div>
            )}
            {!loading && visibleEvents.map((event) => (
              <button type="button" className="ifc-calendar-agenda-row" key={event.eventKey} onClick={() => { setSelectedDate(event.eventDate); setView("month"); }}>
                <div className="ifc-calendar-agenda-date">
                  <strong>{fromDateKey(event.eventDate).getDate()}</strong>
                  <span>{fromDateKey(event.eventDate).toLocaleDateString(undefined, { month: "short" })}</span>
                </div>
                <div className={"ifc-calendar-event-icon " + eventTypeClass(event.eventType)}>
                  <EventTypeIcon type={event.eventType} />
                </div>
                <div className="ifc-calendar-agenda-copy">
                  <strong>{event.title}</strong>
                  <span>{event.farmName || "Farm"} · {event.fieldName || "Field not specified"}</span>
                </div>
                <span className={"ifc-event-type " + eventTypeClass(event.eventType)}>{eventTypeLabel(event.eventType)}</span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        )}
        <div className="ifc-calendar-footnote">
          <Clock3 size={14} />
          Calendar events are generated from crop planting dates and expected harvest dates. Custom events and activity scheduling are not currently exposed by the backend.
        </div>
      </div>
    </section>
  );
}

export function NotificationsPage({ unreadCount = 0, onNotificationsChanged, notify }) {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [pendingId, setPendingId] = useState(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await notificationApi.getAll(false, 0, NOTIFICATION_PAGE_SIZE);
      const rows = Array.isArray(response) ? response : [];
      setNotifications(rows);
      setPage(0);
      setHasMore(rows.length === NOTIFICATION_PAGE_SIZE);
    } catch (requestError) {
      setError(requestError.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesText = !normalizedQuery || [
        item.title,
        item.eventType,
        item.eventDate,
      ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === "ALL" ||
        (filter === "UNREAD" && !item.read) ||
        (filter === "READ" && item.read);
      return matchesText && matchesFilter;
    });
  }, [notifications, query, filter]);

  const unreadLoaded = notifications.filter((item) => !item.read).length;
  const readLoaded = notifications.length - unreadLoaded;

  async function notifySummaryChanged() {
    if (typeof onNotificationsChanged !== "function") return;
    try {
      await onNotificationsChanged();
    } catch {
      // The notification action succeeded even if refreshing the header count failed.
    }
  }

  async function markOneRead(item) {
    if (item.read || pendingId !== null) return;
    setPendingId(item.id);
    try {
      const updated = await notificationApi.markRead(item.id);
      setNotifications((current) => current.map((notification) =>
        notification.id === item.id ? (updated || { ...notification, read: true }) : notification
      ));
      await notifySummaryChanged();
      if (notify) notify("Notification marked as read");
    } catch (requestError) {
      if (notify) notify(requestError.message || "Could not mark this notification as read.");
    } finally {
      setPendingId(null);
    }
  }

  async function markLoadedRead() {
    const unread = notifications.filter((item) => !item.read);
    if (!unread.length || pendingId !== null) return;
    setPendingId("loaded");
    const results = await Promise.allSettled(unread.map((item) => notificationApi.markRead(item.id)));
    const successful = new Map();
    results.forEach((result, index) => {
      if (result.status === "fulfilled") successful.set(unread[index].id, result.value);
    });
    setNotifications((current) => current.map((item) => {
      if (!successful.has(item.id)) return item;
      return successful.get(item.id) || { ...item, read: true };
    }));
    await notifySummaryChanged();
    const count = successful.size;
    if (notify) {
      notify(count === unread.length
        ? "All loaded notifications marked as read"
        : count + " of " + unread.length + " notifications marked as read");
    }
    setPendingId(null);
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setError("");
    try {
      const response = await notificationApi.getAll(false, nextPage, NOTIFICATION_PAGE_SIZE);
      const rows = Array.isArray(response) ? response : [];
      setNotifications((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        return [...current, ...rows.filter((item) => !existingIds.has(item.id))];
      });
      setPage(nextPage);
      setHasMore(rows.length === NOTIFICATION_PAGE_SIZE);
    } catch (requestError) {
      setError(requestError.message || "Unable to load more notifications.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="ifc-live-page">
      <div className="ifc-live-page-heading">
        <div>
          <span className="page-eyebrow"><i className="eyebrow-pip" /> UPDATES FROM YOUR FARM</span>
          <h1>Notifications</h1>
          <p>Reminders and milestones generated by your farm records.</p>
        </div>
        <div className="ifc-live-heading-actions">
          <button type="button" className="button-secondary" onClick={loadFirstPage} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button type="button" className="button-primary" onClick={markLoadedRead} disabled={unreadLoaded === 0 || pendingId !== null}>
            <Check size={15} /> {pendingId === "loaded" ? "Marking…" : "Mark loaded as read"}
          </button>
        </div>
      </div>

      <div className="ifc-notification-stats">
        <article className="surface-card">
          <span>Unread in inbox</span>
          <strong>{unreadCount}</strong>
          <small>Live count from backend</small>
        </article>
        <article className="surface-card">
          <span>Loaded notifications</span>
          <strong>{notifications.length}</strong>
          <small>Across loaded pages</small>
        </article>
        <article className="surface-card">
          <span>Read on this device view</span>
          <strong>{readLoaded}</strong>
          <small>In the loaded list</small>
        </article>
      </div>

      <div className="ifc-notifications-card surface-card">
        <div className="ifc-notifications-toolbar">
          <label className="table-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications…" />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
          </label>
          <div className="ifc-notification-filters" role="group" aria-label="Notification status filter">
            <button type="button" className={filter === "ALL" ? "selected" : ""} onClick={() => setFilter("ALL")}>All</button>
            <button type="button" className={filter === "UNREAD" ? "selected" : ""} onClick={() => setFilter("UNREAD")}>Unread</button>
            <button type="button" className={filter === "READ" ? "selected" : ""} onClick={() => setFilter("READ")}>Read</button>
          </div>
        </div>

        {error && <div className="ifc-live-error" role="alert"><span>{error}</span><button type="button" className="button-secondary" onClick={loadFirstPage}>Retry</button></div>}
        {loading && <div className="ifc-notification-state"><RefreshCw size={20} className="ifc-spinning" /><strong>Loading your notifications…</strong></div>}
        {!loading && filteredNotifications.length === 0 && (
          <div className="ifc-notification-state">
            <Inbox size={27} />
            <strong>{notifications.length ? "No matching notifications" : "You’re all caught up"}</strong>
            <span>{notifications.length ? "Try another search or status filter." : "New planting and harvest reminders will appear here when they are generated."}</span>
            {(query || filter !== "ALL") && <button type="button" className="button-secondary" onClick={() => { setQuery(""); setFilter("ALL"); }}>Clear filters</button>}
          </div>
        )}
        {!loading && filteredNotifications.length > 0 && (
          <div className="ifc-notification-list">
            {filteredNotifications.map((item) => (
              <article className={"ifc-notification-item" + (item.read ? " is-read" : " is-unread")} key={item.id}>
                <span className={"ifc-notification-icon " + eventTypeClass(item.eventType)}>
                  <NotificationTypeIcon type={item.eventType} />
                </span>
                <div className="ifc-notification-copy">
                  <div className="ifc-notification-title-line">
                    <h3>{item.title}</h3>
                    {!item.read && <span className="ifc-unread-indicator">New</span>}
                  </div>
                  <div className="ifc-notification-meta">
                    <span className={"ifc-event-type " + eventTypeClass(item.eventType)}>{eventTypeLabel(item.eventType)}</span>
                    {item.eventDate && <span>Milestone date: {displayDate(item.eventDate)}</span>}
                    <span><Clock3 size={12} /> {displayTimestamp(item.scheduledAt, item.eventDate)}</span>
                  </div>
                </div>
                <div className="ifc-notification-action">
                  {item.read ? (
                    <span className="ifc-read-label"><Check size={13} /> Read</span>
                  ) : (
                    <button type="button" className="button-secondary" onClick={() => markOneRead(item)} disabled={pendingId !== null}>
                      <Check size={13} /> {pendingId === item.id ? "Saving…" : "Mark read"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {hasMore && !loading && (
          <div className="ifc-notifications-load-more">
            <button type="button" className="button-secondary" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading…" : "Load more notifications"}
            </button>
          </div>
        )}
        <div className="ifc-notifications-footnote">
          The backend exposes individual mark-as-read actions, so “Mark loaded as read” updates the notifications currently loaded in this list; it is not a server-side bulk operation.
        </div>
      </div>
    </section>
  );
}

export function SettingsPage({ notify }) {
  const { user, logout, logoutAll } = useAuth();
  const [busy, setBusy] = useState("");

  const displayName = user?.name || user?.username || "Signed-in user";
  const email = user?.email || (user?.username && user.username.includes("@") ? user.username : "Not provided");
  const username = user?.username || "Not available";

  async function signOutEverywhere() {
    if (typeof window !== "undefined" && !window.confirm("Sign out of all active sessions for this account?")) return;
    setBusy("all");
    try {
      await logoutAll();
    } catch (error) {
      if (notify) notify(error.message || "The local session was cleared, but the server could not confirm every session was revoked.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="ifc-live-page">
      <div className="ifc-live-page-heading">
        <div>
          <span className="page-eyebrow"><i className="eyebrow-pip" /> ACCOUNT & SECURITY</span>
          <h1>Settings</h1>
          <p>Review your account details and manage active sessions.</p>
        </div>
      </div>
      <div className="ifc-settings-grid">
        <section className="ifc-settings-card surface-card">
          <div className="ifc-settings-card-heading">
            <span className="ifc-settings-icon"><ShieldCheck size={19} /></span>
            <div><h2>Account information</h2><p>Details returned by your authenticated session.</p></div>
          </div>
          <dl className="ifc-account-details">
            <div><dt>Display name</dt><dd>{displayName}</dd></div>
            <div><dt>Username</dt><dd>{username}</dd></div>
            <div><dt>Email address</dt><dd>{email}</dd></div>
            <div><dt>Session status</dt><dd><span className="ifc-live-status"><i /> Authenticated</span></dd></div>
          </dl>
          <div className="ifc-settings-note">
            Profile editing is not available in the current backend API. Account details are shown as read-only rather than displaying a form that cannot be saved.
          </div>
        </section>
        <section className="ifc-settings-card surface-card">
          <div className="ifc-settings-card-heading">
            <span className="ifc-settings-icon"><ShieldCheck size={19} /></span>
            <div><h2>Session security</h2><p>Choose whether to end this session or revoke all sessions.</p></div>
          </div>
          <div className="ifc-session-action">
            <div><strong>Sign out on this device</strong><span>End the current session.</span></div>
            <button type="button" className="button-secondary" onClick={logout}>Sign out</button>
          </div>
          <div className="ifc-session-action">
            <div><strong>Sign out everywhere</strong><span>Revoke all refresh sessions for this account.</span></div>
            <button type="button" className="button-primary" onClick={signOutEverywhere} disabled={busy !== ""}>
              {busy === "all" ? "Signing out…" : "Sign out all sessions"}
            </button>
          </div>
          <div className="ifc-settings-note">
            Measurement, weather, appearance, and notification preferences are not persisted by the backend yet, so this page does not claim those settings sync to your account.
          </div>
        </section>
      </div>
    </section>
  );
}
