import { useEffect, useMemo, useState } from "react";
import UseAnimations from "react-useanimations";
import alertCircle from "react-useanimations/lib/alertCircle";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
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
  X,
} from "lucide-react";
import { calendarApi, notificationApi } from "../api/client";
import { SkeletonBlock } from "./ui/Skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "./ui/pagination";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useAuth } from "../context/AuthContext";

const NOTIFICATION_PAGE_SIZE = 5;

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

export function CalendarPage({ notify }) {
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
        if (notify) notify(requestError.message || "Unable to load calendar events.", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [from, to, retryKey, notify]);

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

  const milestoneNote = (
    <div className="ifc-calendar-info-wrap">
      <div className="ifc-calendar-info" role="note">
        <span className="ff-field-area-warning-icon" aria-hidden="true">
          <UseAnimations animation={alertCircle} size={22} strokeColor="#806522" interaction="loop" render={(eventProps, animationProps) => <span {...eventProps} {...animationProps} />} />
        </span>
        <span>Calendar events are generated from crop planting dates and expected harvest dates.</span>
      </div>
    </div>
  );

  return (
    <section className="ifc-live-page ifc-accent-page" data-accent="purple">
      <div className="ifc-live-page-heading">
        <div>
          <span className="page-eyebrow"><i className="eyebrow-pip" /> YOUR FARM MILESTONES</span>
          <h1>Calendar</h1>
          <p>Planting dates and expected harvests from your crop records.</p>
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
            <div className="ifc-calendar-filter">
              <label htmlFor="calendar-event-filter">Show</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger id="calendar-event-filter" className="ifc-calendar-show-select"><SelectValue /></SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="ALL">All milestones</SelectItem>
                  <SelectItem value="PLANTING">Planting dates</SelectItem>
                  <SelectItem value="HARVEST">Expected harvests</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {milestoneNote}
            </div>
            <aside className="ifc-calendar-day-panel">
              <div className="ifc-calendar-day-panel-heading">
                <span className="section-kicker">DAY DETAILS</span>
                <h3>{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</h3>
                <p>{selectedEvents.length} {selectedEvents.length === 1 ? "milestone" : "milestones"} scheduled</p>
              </div>
              {loading && <SkeletonBlock rows={4} />}
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
            {milestoneNote}
          </div>
        )}
      </div>
    </section>
  );
}

export function NotificationsPage({ unreadCount = 0, onNotificationsChanged, notify }) {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [pendingId, setPendingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, rows: [], hasMore: false, error: "" });
  const [actionError, setActionError] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const requestKey = JSON.stringify([filter, normalizedQuery, page, reloadKey]);
  const loading = result.key !== requestKey;
  const notifications = loading ? [] : result.rows;
  const hasMore = !loading && result.hasMore;
  const error = loading ? "" : result.error;
  const unreadOnPage = notifications.filter((item) => !item.read).length;
  const inboxUnread = Math.max(0, Number(unreadCount) || 0, unreadOnPage);
  const busy = pendingId !== null;

  // The API provides offset pages and an unread-only filter, but no read-only
  // or text-search endpoint. Scan paged results only as far as necessary to
  // fill the requested filtered page and determine whether another exists.
  useEffect(() => {
    let current = true;
    async function load() {
      try {
        let rows = [];
        let more = false;
        if (!normalizedQuery && filter !== "READ") {
          const response = await notificationApi.getAll(filter === "UNREAD", page, NOTIFICATION_PAGE_SIZE);
          if (!current) return;
          if (!Array.isArray(response)) throw new Error("Unexpected notification response.");
          rows = response;
          if (rows.length === NOTIFICATION_PAGE_SIZE) {
            const next = await notificationApi.getAll(filter === "UNREAD", page + 1, NOTIFICATION_PAGE_SIZE);
            if (!current) return;
            if (!Array.isArray(next)) throw new Error("Unexpected notification response.");
            more = next.length > 0;
          }
        } else {
          const matches = [];
          const seen = new Set();
          const target = (page + 1) * NOTIFICATION_PAGE_SIZE + 1;
          const chunkSize = 50;
          for (let sourcePage = 0; matches.length < target; sourcePage += 1) {
            const response = await notificationApi.getAll(filter === "UNREAD", sourcePage, chunkSize);
            if (!current) return;
            if (!Array.isArray(response)) throw new Error("Unexpected notification response.");
            let newIds = 0;
            for (const item of response) {
              if (seen.has(item.id)) continue;
              seen.add(item.id);
              newIds += 1;
              if (filter === "READ" && !item.read) continue;
              const text = [item.title, item.eventType, eventTypeLabel(item.eventType), item.eventDate, displayDate(item.eventDate), displayTimestamp(item.scheduledAt, item.eventDate)].filter(Boolean).join(" ").toLowerCase();
              if (!normalizedQuery || text.includes(normalizedQuery)) matches.push(item);
            }
            if (response.length < chunkSize) break;
            if (!newIds) throw new Error("Notification pages could not be loaded completely.");
          }
          rows = matches.slice(page * NOTIFICATION_PAGE_SIZE, (page + 1) * NOTIFICATION_PAGE_SIZE);
          more = matches.length > (page + 1) * NOTIFICATION_PAGE_SIZE;
        }
        if (!current) return;
        if (!rows.length && page > 0) {
          setPage((previous) => Math.max(0, previous - 1));
          return;
        }
        setResult({ key: requestKey, rows, hasMore: more, error: "" });
      } catch (requestError) {
        if (current) setResult({ key: requestKey, rows: [], hasMore: false, error: requestError.message || "Unable to load notifications." });
      }
    }
    load();
    return () => { current = false; };
  }, [filter, normalizedQuery, page, requestKey]);

  async function notifySummaryChanged() {
    if (typeof onNotificationsChanged !== "function") return;
    try { await onNotificationsChanged(); } catch { /* The read action has already succeeded. */ }
  }

  async function markOneRead(item) {
    if (item.read || busy || loading) return;
    setPendingId(item.id);
    setActionError("");
    try {
      await notificationApi.markRead(item.id);
      setReloadKey((key) => key + 1);
      await notifySummaryChanged();
      if (notify) notify("Notification marked as read");
    } catch (requestError) {
      const message = requestError.message || "Could not mark this notification as read.";
      setActionError(message);
      if (notify) notify(message, "error");
    } finally {
      setPendingId(null);
    }
  }

  async function markAllRead() {
    if (busy || loading || !inboxUnread) return;
    setPendingId("all");
    setActionError("");
    const ids = new Set();
    let successful = 0;
    let failed = 0;
    try {
      // Snapshot all unread IDs before changing read status; changing the
      // unread list while advancing its offset would skip notifications.
      const chunkSize = 100;
      for (let sourcePage = 0; ; sourcePage += 1) {
        const response = await notificationApi.getAll(true, sourcePage, chunkSize);
        if (!Array.isArray(response)) throw new Error("Unexpected notification response.");
        const previousSize = ids.size;
        response.forEach((item) => { if (!item.read && item.id != null) ids.add(item.id); });
        if (response.length < chunkSize) break;
        if (ids.size === previousSize) throw new Error("Unable to retrieve the complete unread inbox.");
      }
      const unreadIds = [...ids];
      for (let offset = 0; offset < unreadIds.length; offset += 8) {
        const results = await Promise.allSettled(unreadIds.slice(offset, offset + 8).map((id) => notificationApi.markRead(id)));
        results.forEach((entry) => { if (entry.status === "fulfilled") successful += 1; else failed += 1; });
      }
      if (failed) {
        const message = successful + " of " + unreadIds.length + " notifications marked as read. Try again for the remaining notifications.";
        setActionError(message);
        if (notify) notify(message, successful ? "warning" : "error");
      } else if (notify) {
        notify(unreadIds.length ? "All retrieved unread notifications marked as read" : "You're all caught up");
      }
    } catch (requestError) {
      const message = requestError.message || "Unable to mark all notifications as read.";
      setActionError(message);
      if (notify) notify(message, "error");
    } finally {
      setPage(0);
      setReloadKey((key) => key + 1);
      await notifySummaryChanged();
      setPendingId(null);
    }
  }

  function changeFilter(value) {
    setFilter(value);
    setPage(0);
    setActionError("");
  }

  function renderInbox() {
    return (
      <>
        {(error || actionError) && <div className="ifc-live-error" role="alert"><span>{error || actionError}</span>{error && <button type="button" className="button-secondary" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>}</div>}
        {loading ? <SkeletonBlock rows={5} /> : !error && notifications.length === 0 ? (
          <div className="ifc-notification-state">
            <Inbox size={27} />
            <strong>{normalizedQuery ? "No matching notifications" : filter === "UNREAD" ? "You're all caught up" : filter === "READ" ? "No read notifications" : "No notifications yet"}</strong>
            <span>{normalizedQuery ? "Try another search." : filter === "UNREAD" ? "You have no unread notifications." : filter === "READ" ? "Notifications you've read will appear here." : "New planting and harvest reminders will appear here."}</span>
            {(query || filter !== "ALL") && <button type="button" className="button-secondary" disabled={busy} onClick={() => { setQuery(""); changeFilter("ALL"); }}>Clear filters</button>}
          </div>
        ) : !error && (
          <div className="ifc-notification-list">
            {notifications.map((item) => (
              <article className={"ifc-notification-item" + (item.read ? " is-read" : " is-unread")} key={item.id}>
                <span className={"ifc-notification-icon " + eventTypeClass(item.eventType)}><NotificationTypeIcon type={item.eventType} /></span>
                <div className="ifc-notification-copy">
                  <div className="ifc-notification-title-line"><h3>{item.title}</h3></div>
                  <div className="ifc-notification-meta">
                    <span className={"ifc-event-type " + eventTypeClass(item.eventType)}>{eventTypeLabel(item.eventType)}</span>
                    {item.eventDate && <span>Milestone: {displayDate(item.eventDate)}</span>}
                    <span><Clock3 size={12} /> {displayTimestamp(item.scheduledAt, item.eventDate)}</span>
                  </div>
                </div>
                <div className="ifc-notification-action">
                  {item.read ? <span className="ifc-inbox-read-icon" title="Read"><CheckCheck size={16} aria-label="Read" /></span> : <>
                    <span className="ifc-inbox-unread-dot" aria-label="Unread" />
                    <button type="button" className="ifc-inbox-read-button" title="Mark as read" aria-label={"Mark " + item.title + " as read"} disabled={busy} onClick={() => markOneRead(item)}><Check size={16} /></button>
                  </>}
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="ifc-inbox-footer">
          <span>{loading ? "Loading notifications…" : error ? "Notifications unavailable" : notifications.length ? `Showing ${page * NOTIFICATION_PAGE_SIZE + 1}–${page * NOTIFICATION_PAGE_SIZE + notifications.length}${!hasMore ? " of " + (page * NOTIFICATION_PAGE_SIZE + notifications.length) : ""} notifications` : "Showing 0 notifications"}</span>
          {!loading && !error && (notifications.length > 0 || page > 0) && <Pagination className="ff-farm-pagination ff-field-pagination" aria-label="Notification pagination"><PaginationContent>
            <PaginationItem><PaginationPrevious disabled={busy || page === 0} onClick={() => setPage((previous) => Math.max(0, previous - 1))} /></PaginationItem>
            {page > 0 && <PaginationItem><PaginationLink disabled={busy} aria-label={`Page ${page}`} onClick={() => setPage(page - 1)}>{page}</PaginationLink></PaginationItem>}
            <PaginationItem><PaginationLink isActive aria-label={`Page ${page + 1}`}>{page + 1}</PaginationLink></PaginationItem>
            {hasMore && <PaginationItem><PaginationLink disabled={busy} aria-label={`Page ${page + 2}`} onClick={() => setPage(page + 1)}>{page + 2}</PaginationLink></PaginationItem>}
            <PaginationItem><PaginationNext disabled={busy || !hasMore} onClick={() => setPage(page + 1)} /></PaginationItem>
          </PaginationContent></Pagination>}
          <span>{inboxUnread} unread</span>
        </div>
      </>
    );
  }

  return (
    <section className="workspace-page ifc-inbox-page ifc-accent-page" data-accent="blue">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> UPDATES FROM YOUR FARM</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon"><Bell size={23} /></div>
        <div className="workspace-title-copy"><h1>Notifications</h1><p>Stay updated on your farm milestones and reminders.</p></div>
        <div className="workspace-title-actions ifc-inbox-heading-actions"><button type="button" className="button-secondary" onClick={markAllRead} disabled={loading || !inboxUnread || busy}><CheckCheck size={15} /> {pendingId === "all" ? "Marking…" : "Mark all as read"}</button></div>
      </div>
      <div className="ifc-notifications-card surface-card ifc-inbox-card">
        <div className="ifc-inbox-heading"><h2><Inbox size={15} aria-hidden="true" /> Inbox</h2>{inboxUnread > 0 && <span className="ifc-inbox-unread-count">{inboxUnread} unread</span>}</div>
        <Tabs value={filter} onValueChange={changeFilter} className="ifc-inbox-tabs">
          <div className="ifc-notifications-toolbar">
            <label className="table-search"><Search size={15} /><input value={query} disabled={busy} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Search notifications…" aria-label="Search notifications" />{query && <button type="button" disabled={busy} aria-label="Clear search" onClick={() => { setQuery(""); setPage(0); }}><X size={14} /></button>}</label>
            <TabsList aria-label="Notification status filter" className="ifc-notification-filters">
              <TabsTrigger value="ALL" disabled={busy}>All</TabsTrigger><TabsTrigger value="UNREAD" disabled={busy}>Unread</TabsTrigger><TabsTrigger value="READ" disabled={busy}>Read</TabsTrigger>
            </TabsList>
          </div>
          {["ALL", "UNREAD", "READ"].map((value) => <TabsContent value={value} key={value}>{filter === value && renderInbox()}</TabsContent>)}
        </Tabs>
      </div>
    </section>
  );
}

export function SettingsPage({ notify }) {
  const confirmDialog = useConfirmDialog();
  const { user, logout, logoutAll } = useAuth();
  const [busy, setBusy] = useState("");

  const displayName = user?.name || user?.username || "Signed-in user";
  const email = user?.email || (user?.username && user.username.includes("@") ? user.username : "Not provided");
  const username = user?.username || "Not available";

  async function signOutEverywhere() {
    const confirmed = await confirmDialog({ title: "Sign out everywhere?", message: "Sign out of all active sessions for this account?", details: "This revokes your active sessions on other devices. You may need to sign in again.", confirmLabel: "Sign out everywhere", tone: "danger" });
    if (!confirmed) return;
    setBusy("all");
    try {
      await logoutAll();
    } catch (error) {
      if (notify) notify(error.message || "The local session was cleared, but the server could not confirm every session was revoked.", "error");
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
