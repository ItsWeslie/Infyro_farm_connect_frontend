import { useMemo, useState, useEffect } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Command,
  Flower2,
  LayoutDashboard,
  Leaf,
  Menu,
  Ellipsis,
  MoreHorizontal,
  Plus,
  Search,
  Sprout,
  Tractor,
  Wheat,
  X,
  MapPinned,
  ClipboardList,
  PackageCheck,
  SlidersHorizontal,
  CircleUserRound,
  Settings,
  LogOut,
  CheckCheck,
  Clock3,
  Droplets,
  Sun,
  Wallet,
  TrendingUp,
  Eye,
  LogIn,
} from "lucide-react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import LandingPage from "./components/LandingPage";
import {
  farmApi,
  fieldApi,
  cropPlantingApi,
  cropTypeApi,
  cropActivityApi,
  expenseApi,
  harvestApi,
  farmSummaryApi,
  calendarApi,
  notificationApi,
} from "./api/client";
import {
  CropPlantingStatus,
  CropStage,
  ActivityStatus,
  ExpenseCategory,
  HarvestUnit,
} from "./types/enums";

const navigation = [
  {
    section: "WORKSPACE",
    items: [
      { label: "Overview", icon: LayoutDashboard },
      { label: "Farms", icon: Tractor },
      { label: "Fields", icon: MapPinned },
      { label: "Crop management", icon: Sprout, badge: "4" },
      { label: "Activities", icon: ClipboardList },
      { label: "Calendar", icon: CalendarDays, dot: true },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { label: "Expenses", icon: Wallet },
      { label: "Harvest records", icon: PackageCheck },
      { label: "Notifications", icon: Bell, badge: "3" },
    ],
  },
];
const crops = [
  {
    name: "Tomato",
    variety: "Arka Rakshak",
    field: "North Field",
    area: "1.2 acres",
    progress: 72,
    status: "Growing",
    harvest: "Nov 12, 2026",
    icon: "🍅",
    tone: "tomato",
  },
  {
    name: "Rice",
    variety: "Ponni",
    field: "Paddy Field A",
    area: "2.5 acres",
    progress: 48,
    status: "Growing",
    harvest: "Dec 04, 2026",
    icon: "🌾",
    tone: "rice",
  },
  {
    name: "Spinach",
    variety: "Palak Green",
    field: "Kitchen Garden",
    area: "0.4 acres",
    progress: 94,
    status: "Ready soon",
    harvest: "Oct 30, 2026",
    icon: "🥬",
    tone: "spinach",
  },
  {
    name: "Chilli",
    variety: "Guntur Sannam",
    field: "East Field",
    area: "0.8 acres",
    progress: 35,
    status: "Growing",
    harvest: "Jan 18, 2027",
    icon: "🌶️",
    tone: "chilli",
  },
];
const activities = [
  {
    icon: Droplets,
    tone: "blue",
    title: "Morning irrigation completed",
    detail: "North Field · Tomato",
    time: "Today, 8:30 AM",
  },
  {
    icon: Sprout,
    tone: "green",
    title: "Fertilizer applied",
    detail: "Paddy Field A · Rice",
    time: "Yesterday, 4:15 PM",
  },
  {
    icon: CheckCheck,
    tone: "gold",
    title: "Harvest record added",
    detail: "Kitchen Garden · Spinach",
    time: "Oct 24, 11:20 AM",
  },
];
const pageDescriptions = {
  Farms: "A home for every plot, plan, and growing season.",
  Fields: "Know your land, understand your soil, grow with confidence.",
  "Crop management": "Follow every crop from planting to harvest.",
  Activities: "Keep your daily farm work moving smoothly.",
  Calendar: "Your season at a glance, with every important date in view.",
  Expenses: "Understand where your farm investment goes.",
  "Harvest records": "Celebrate every harvest and learn from each season.",
  Notifications: "A calm place for updates that need your attention.",
  Settings: "Make your farm workspace feel like yours.",
};
function Brand({ onHome }) {
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
function Avatar({ small = false, name = "Ravi Kumar" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IF";
  return <div className={small ? "avatar avatar-small" : "avatar"}>{initials}</div>;
}
function App() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [sessionMinimumElapsed, setSessionMinimumElapsed] = useState(false);
  const [sessionWelcomeComplete, setSessionWelcomeComplete] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSessionMinimumElapsed(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || !sessionMinimumElapsed || sessionWelcomeComplete) return undefined;
    const timer = window.setTimeout(() => setSessionWelcomeComplete(true), 2000);
    return () => window.clearTimeout(timer);
  }, [loading, sessionMinimumElapsed, sessionWelcomeComplete]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [farmOpen, setFarmOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [cropName, setCropName] = useState("");

  // Live farms state from backend
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [backendSummary, setBackendSummary] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fallback local crops for demo mode
  const [localCrops, setLocalCrops] = useState(crops);

  // Fetch farms when user is authenticated
  useEffect(() => {
    async function loadFarms() {
      if (isAuthenticated) {
        try {
          const res = await farmApi.getOwnedFarms();
          const list = Array.isArray(res) ? res : res.data || [];
          if (list.length > 0) {
            setFarms(list);
            setSelectedFarm(list[0]);
            setIsLiveConnected(true);
          }
        } catch (err) {
          console.warn("Could not fetch farms from backend, using demo data:", err);
          setIsLiveConnected(false);
        }
      } else {
        setIsLiveConnected(false);
      }
    }
    loadFarms();
  }, [isAuthenticated]);

  // Load summary for selected farm
  useEffect(() => {
    async function loadSummary() {
      if (isAuthenticated && selectedFarm?.id) {
        try {
          const summary = await farmSummaryApi.getSummary(selectedFarm.id);
          setBackendSummary(summary);
        } catch (e) {
          // ignore or fallback
        }
      }
    }
    loadSummary();
  }, [selectedFarm, isAuthenticated]);

  const filteredCrops = useMemo(
    () =>
      localCrops.filter((c) =>
        [c.name, c.variety, c.field]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [localCrops, search],
  );

  if (loading || !sessionMinimumElapsed) {
    return (
      <div className="ifc-session-loading" role="status" aria-live="polite">
        <style>{`
          .ifc-session-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: var(--ifc-cream, #EFEAD5);
            color: var(--ifc-dark-green, #224823);
          }
          .ifc-session-loading > span {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
          }
          .ifc-session-loading-icon {
            display: inline-flex;
            animation: ifc-session-sprout 1.1s ease-in-out infinite;
          }
          .ifc-session-welcome {
            font-size: clamp(1.8rem, 5vw, 3.5rem);
            font-weight: 750;
            letter-spacing: -0.045em;
            text-align: center;
            animation: ifc-session-welcome-reveal 2000ms cubic-bezier(.2,.7,.2,1) both;
          }
          .ifc-session-welcome em {
            color: var(--ifc-light-green, #67992D);
            font-style: normal;
          }
          @keyframes ifc-session-sprout {
            0%, 100% { transform: translateY(0) rotate(-5deg); opacity: .75; }
            50% { transform: translateY(-5px) rotate(5deg); opacity: 1; }
          }
          @keyframes ifc-session-welcome-reveal {
            0% { opacity: 0; transform: translateY(18px); filter: blur(8px); clip-path: inset(0 100% 0 0); }
            45% { opacity: 1; filter: blur(0); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); clip-path: inset(0 0 0 0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ifc-session-loading-icon, .ifc-session-welcome { animation: none; }
            .ifc-session-welcome { opacity: 1; transform: none; filter: none; clip-path: none; }
          }
        `}</style>
        <span><i className="ifc-session-loading-icon"><Sprout size={22} /></i> Checking your farm session…</span>
      </div>
    );
  }
  if (!sessionWelcomeComplete) {
    return (
      <div className="ifc-session-loading" role="status" aria-live="polite">
        <style>{`
          .ifc-session-loading { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--ifc-cream, #EFEAD5); color: var(--ifc-dark-green, #224823); }
          .ifc-session-welcome { font-size: clamp(1.8rem, 5vw, 3.5rem); font-weight: 750; letter-spacing: -0.045em; text-align: center; animation: ifc-session-welcome-reveal 2000ms cubic-bezier(.2,.7,.2,1) both; }
          .ifc-session-welcome em { color: var(--ifc-light-green, #67992D); font-style: normal; }
          @keyframes ifc-session-welcome-reveal {
            0% { opacity: 0; transform: translateY(18px); filter: blur(8px); clip-path: inset(0 100% 0 0); }
            45% { opacity: 1; filter: blur(0); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); clip-path: inset(0 0 0 0); }
          }
          @media (prefers-reduced-motion: reduce) { .ifc-session-welcome { animation: none; opacity: 1; transform: none; filter: none; clip-path: none; } }
        `}</style>
        <h1 className="ifc-session-welcome">Welcome to <em>Infyro Farms</em></h1>
      </div>
    );
  }
  if (!isAuthenticated) return <LandingPage />;
  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__ifcToast);
    window.__ifcToast = window.setTimeout(() => setToast(""), 2600);
  }
  function addCrop(e) {
    e.preventDefault();
    if (!cropName.trim()) return;
    setLocalCrops([
      {
        name: cropName.trim(),
        variety: "Local variety",
        field: "Unassigned field",
        area: "—",
        progress: 4,
        status: "Planned",
        harvest: "To be scheduled",
        icon: "🌱",
        tone: "new",
      },
      ...localCrops,
    ]);
    setCropName("");
    setShowAdd(false);
    setActive("Crop management");
    notify("Your crop was added to the workspace");
  }
  const currentIcon =
    navigation.flatMap((g) => g.items).find((i) => i.label === active)?.icon ||
    LayoutDashboard;
  const PageIcon = currentIcon;
  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={"sidebar " + (mobileNav ? "sidebar-open" : "")}>
        <div className="sidebar-top">
          <Brand
            onHome={() => {
              setActive("Overview");
              setMobileNav(false);
            }}
          />
          <button
            className="icon-button mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          >
            <X size={19} />
          </button>
        </div>
        <button
          className="farm-switch"
          onClick={() => setFarmOpen(!farmOpen)}
          aria-expanded={farmOpen}
        >
          <div className="farm-avatar">
            <Leaf size={18} />
          </div>
          <span className="farm-meta">
            <strong>{selectedFarm ? selectedFarm.name : "Green Valley Farm"}</strong>
            <small>
              {isLiveConnected ? (
                <span className="live-badge"><i></i> Live {selectedFarm?.landArea ? `· ${selectedFarm.landArea} ac` : ""}</span>
              ) : (
                <>
                  <MapPinned size={11} /> Tambaram, Tamil Nadu
                </>
              )}
            </small>
          </span>
          <ChevronDown size={15} className={farmOpen ? "rotate" : ""} />
        </button>
        {farmOpen && (
          <div className="farm-popover">
            <strong>My farms</strong>
            {farms.length > 0 ? (
              farms.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFarm(f);
                    setFarmOpen(false);
                    notify(`${f.name} selected`);
                  }}
                >
                  <span className={"farm-dot " + (selectedFarm?.id === f.id ? "" : "farm-dot-muted")} />
                  {f.name} {selectedFarm?.id === f.id && <Check size={14} />}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => {
                    setFarmOpen(false);
                    notify("Green Valley Farm selected");
                  }}
                >
                  <span className="farm-dot" />
                  Green Valley Farm <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setFarmOpen(false);
                    notify("Demo farm switcher");
                  }}
                >
                  <span className="farm-dot farm-dot-muted" />
                  Sunrise Plot <Plus size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setFarmOpen(false);
                setActive("Farms");
              }}
              className="popover-footer"
            >
              Manage all farms <ArrowRight size={13} />
            </button>
          </div>
        )}
        <nav className="side-navigation" aria-label="Main navigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.section}>
              <div className="nav-label">{group.section}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={
                      "nav-item " + (active === item.label ? "nav-active" : "")
                    }
                    onClick={() => {
                      setActive(item.label);
                      setMobileNav(false);
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active === item.label ? 2.2 : 1.8}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {item.dot && <span className="nav-notice-dot" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="season-card">
            <div className="season-icon">
              <Sun size={17} />
            </div>
            <div>
              <strong>Growing together</strong>
              <p>Small steps every day lead to a thriving farm.</p>
            </div>
            <button
              aria-label="Learn more about farm tips"
              onClick={() => notify("More farm tips are coming soon")}
            >
              <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className="sidebar-help"
            onClick={() => notify("Help centre is coming soon")}
          >
            <CircleHelp size={17} />
            <span>Help & support</span>
            <ArrowUpRight size={14} />
          </button>
          <div className="profile-area">
            {isAuthenticated ? (
              <button
                className="profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <Avatar name={user?.name || user?.username} />
                <span className="profile-copy">
                  <strong>{user?.name || user?.username}</strong>
                  <small>Live Account</small>
                </span>
                <Ellipsis size={19} />
              </button>
            ) : (
              <button
                className="profile-button auth-sign-btn"
                onClick={() => setAuthModalOpen(true)}
              >
                <div className="avatar avatar-auth"><LogIn size={15} /></div>
                <span className="profile-copy">
                  <strong>Sign in</strong>
                  <small>Connect with backend</small>
                </span>
              </button>
            )}
            {profileOpen && (
              <div className="profile-popover">
                <button
                  onClick={() => {
                    setActive("Settings");
                    setProfileOpen(false);
                  }}
                >
                  <CircleUserRound size={16} /> My profile
                </button>
                <button
                  onClick={() => {
                    setActive("Settings");
                    setProfileOpen(false);
                  }}
                >
                  <Settings size={16} /> Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    notify("Signed out successfully");
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>Farm workspace</span>
              <span className="crumb-slash">/</span>
              <strong>{active}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <label className="global-search">
              <Search size={16} />
              <input
                aria-label="Search workspace"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setActive("Crop management");
                }}
              />
              <kbd>
                <Command size={10} /> K
              </kbd>
            </label>
            <div className="top-divider" />
            <div className="weather-chip">
              <span className="weather-icon">
                <CloudSun size={20} />
              </span>
              <span>
                <strong>29°C</strong>
                <small>Mostly sunny</small>
              </span>
            </div>
            <div className="popover-anchor">
              <button
                className={
                  "icon-button top-icon " +
                  (notificationsOpen ? "icon-selected" : "")
                }
                aria-label="Notifications"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
              >
                <Bell size={19} />
                <i className="notification-dot" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <strong>Notifications</strong>
                    <span>3 new</span>
                  </div>
                  <div className="notification-row">
                    <span className="notification-symbol gold">
                      <CalendarDays size={16} />
                    </span>
                    <span>
                      <strong>Harvest coming up</strong>
                      <small>Spinach is almost ready · in 3 days</small>
                    </span>
                  </div>
                  <div className="notification-row">
                    <span className="notification-symbol green">
                      <Droplets size={16} />
                    </span>
                    <span>
                      <strong>Irrigation reminder</strong>
                      <small>Check moisture in North Field</small>
                    </span>
                  </div>
                  <div className="notification-row">
                    <span className="notification-symbol blue">
                      <Wallet size={16} />
                    </span>
                    <span>
                      <strong>Weekly expenses ready</strong>
                      <small>Your farm spending overview is updated</small>
                    </span>
                  </div>
                  <button
                    className="popover-footer"
                    onClick={() => {
                      setActive("Notifications");
                      setNotificationsOpen(false);
                    }}
                  >
                    View all notifications <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <button
                className="top-profile"
                aria-label="Open profile menu"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
              >
                <Avatar small name={user?.name || user?.username} />
                <ChevronDown size={14} />
              </button>
            ) : (
              <button
                className="button-primary top-auth-btn"
                onClick={() => setAuthModalOpen(true)}
              >
                <LogIn size={14} /> Sign in
              </button>
            )}
          </div>
        </header>
        <div className="page-content">
          {active === "Overview" ? (
            <Dashboard
              filteredCrops={filteredCrops}
              cropCount={localCrops.length}
              search={search}
              setSearch={setSearch}
              onAdd={() => setShowAdd(true)}
              onNavigate={setActive}
              notify={notify}
              summary={backendSummary}
              selectedFarm={selectedFarm}
            />
          ) : (
            <WorkspacePage
              active={active}
              onNavigate={setActive}
              notify={notify}
              onAdd={() => setShowAdd(true)}
              selectedFarm={selectedFarm}
              isLive={isLiveConnected}
            />
          )}
          <footer className="app-footer">
            <span>© 2026 Infyro Farm Connect</span>
            <span className="footer-status">
              <i /> Your farm, growing with you
            </span>
            <button onClick={() => notify("Help centre is coming soon")}>
              Help centre <ArrowUpRight size={13} />
            </button>
          </footer>
        </div>
      </main>
      {showAdd && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAdd(false);
          }}
        >
          <form className="dialog-card" onSubmit={addCrop}>
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">GROW SOMETHING NEW</span>
                <h2>Add a crop</h2>
                <p>Start a new chapter for your farm.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setShowAdd(false)}
              >
                <X size={19} />
              </button>
            </div>
            <label className="form-label">
              Crop name
              <input
                required
                autoFocus
                placeholder="e.g. Tomato, Okra, Spinach"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
              />
            </label>
            <div className="dialog-note">
              <Sprout size={17} />
              <span>
                This demo entry will be added to your local crop directory.
              </span>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary">
                <Plus size={16} />
                Add crop
              </button>
            </div>
          </form>
        </div>
      )}
      {toast && (
        <div role="status" className="toast-message">
          <span>
            <Check size={15} />
          </span>
          {toast}
        </div>
      )}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => notify("Signed in to IFC Backend!")}
      />
    </div>
  );
}
const workspaceData = {
  Farms: {
    eyebrow: "YOUR LAND, AT A GLANCE",
    title: "Your farms",
    description: "Every growing space, gathered in one place.",
    stats: [
      ["Total farms", "02", "registered spaces"],
      ["Total land", "8.4 ac", "across all farms"],
      ["Active fields", "04", "being cultivated"],
      ["This season", "Kharif", "current cycle"],
    ],
    rows: [
      [
        "Green Valley Farm",
        "Tambaram, Tamil Nadu",
        "5.6 acres",
        "4 fields",
        "Active",
      ],
      [
        "Sunrise Plot",
        "Vandalur, Tamil Nadu",
        "2.8 acres",
        "2 fields",
        "Active",
      ],
    ],
  },
  Fields: {
    eyebrow: "EVERY PATCH HAS POTENTIAL",
    title: "Field directory",
    description: "Understand your land and what is growing in it.",
    stats: [
      ["Total fields", "06", "across your farms"],
      ["Cultivated", "4.9 ac", "currently in use"],
      ["Available", "3.5 ac", "ready to plan"],
      ["Soil checks", "02", "recently recorded"],
    ],
    rows: [
      ["North Field", "Green Valley Farm", "1.2 acres", "Tomato", "Growing"],
      ["Paddy Field A", "Green Valley Farm", "2.5 acres", "Rice", "Growing"],
      [
        "Kitchen Garden",
        "Green Valley Farm",
        "0.4 acres",
        "Spinach",
        "Ready soon",
      ],
      ["East Field", "Sunrise Plot", "0.8 acres", "Chilli", "Growing"],
      ["West Patch", "Sunrise Plot", "1.7 acres", "—", "Available"],
    ],
  },
  "Crop management": {
    eyebrow: "FROM SEED TO HARVEST",
    title: "Crop management",
    description: "Keep every planting on track through the growing season.",
    stats: [
      ["Total plantings", "04", "this season"],
      ["Growing", "02", "actively developing"],
      ["Ready soon", "01", "harvest approaching"],
      ["Planned", "01", "awaiting a start"],
    ],
    rows: [
      ["Tomato", "Arka Rakshak", "North Field", "72%", "Growing"],
      ["Rice", "Ponni", "Paddy Field A", "48%", "Growing"],
      ["Spinach", "Palak Green", "Kitchen Garden", "94%", "Ready soon"],
      ["Chilli", "Guntur Sannam", "East Field", "35%", "Growing"],
    ],
  },
  Activities: {
    eyebrow: "THE WORK BEHIND THE GROWTH",
    title: "Farm activities",
    description: "A clear view of the work happening across your fields.",
    stats: [
      ["Logged this week", "12", "farm activities"],
      ["Completed", "09", "tasks checked off"],
      ["Upcoming", "03", "planned tasks"],
      ["On schedule", "92%", "weekly completion"],
    ],
    rows: [
      [
        "Morning irrigation",
        "North Field · Tomato",
        "Today, 8:30 AM",
        "Ravi Kumar",
        "Completed",
      ],
      [
        "Fertilizer application",
        "Paddy Field A · Rice",
        "Yesterday, 4:15 PM",
        "Ravi Kumar",
        "Completed",
      ],
      [
        "Inspect leaf health",
        "East Field · Chilli",
        "Oct 28, 9:00 AM",
        "Ravi Kumar",
        "Upcoming",
      ],
      [
        "Harvest preparation",
        "Kitchen Garden · Spinach",
        "Oct 30, 7:30 AM",
        "Ravi Kumar",
        "Upcoming",
      ],
      [
        "Weed control",
        "North Field · Tomato",
        "Oct 25, 10:00 AM",
        "Ravi Kumar",
        "Completed",
      ],
    ],
  },
  Expenses: {
    eyebrow: "SPEND WITH CLARITY",
    title: "Farm expenses",
    description: "Track the cost of caring for your farm and plan ahead.",
    stats: [
      ["This month", "₹8,450", "total recorded"],
      ["Last month", "₹9,225", "previous total"],
      ["Biggest category", "Fertilizer", "₹2,600 this month"],
      ["Budget used", "56%", "of ₹15,000 plan"],
    ],
    rows: [
      [
        "Organic fertilizer",
        "FERTILIZER",
        "Paddy Field A",
        "₹2,600",
        "Oct 24, 2026",
      ],
      [
        "Seeds & seedlings",
        "SEEDS_AND_SEEDLINGS",
        "North Field",
        "₹1,850",
        "Oct 20, 2026",
      ],
      [
        "Irrigation supplies",
        "IRRIGATION",
        "Green Valley Farm",
        "₹1,500",
        "Oct 17, 2026",
      ],
      ["Farm labour", "LABOUR", "Multiple fields", "₹1,400", "Oct 14, 2026"],
      [
        "Fuel & transport",
        "FUEL_AND_TRANSPORT",
        "Green Valley Farm",
        "₹1,100",
        "Oct 08, 2026",
      ],
    ],
  },
  "Harvest records": {
    eyebrow: "EVERY HARVEST TELLS A STORY",
    title: "Harvest records",
    description: "Capture your yield and learn from every growing cycle.",
    stats: [
      ["Harvest entries", "08", "records this season"],
      ["Total yield", "426 kg", "recorded to date"],
      ["Best yield", "Rice", "210 kg recorded"],
      ["Recent harvest", "24 Oct", "Spinach · 18 kg"],
    ],
    rows: [
      ["Spinach", "Kitchen Garden", "18 kg", "Oct 24, 2026", "Grade A"],
      ["Tomato", "North Field", "42 kg", "Oct 18, 2026", "Grade A"],
      ["Rice", "Paddy Field A", "210 kg", "Oct 12, 2026", "Grade A"],
      ["Chilli", "East Field", "26 kg", "Oct 06, 2026", "Grade B"],
      ["Tomato", "North Field", "38 kg", "Sep 28, 2026", "Grade A"],
    ],
  },
  Calendar: {
    eyebrow: "MAKE ROOM FOR WHAT MATTERS",
    title: "Season calendar",
    description: "Plan field work, milestones, and harvest days at a glance.",
    stats: [
      ["This month", "08", "scheduled events"],
      ["Upcoming", "03", "next seven days"],
      ["Tasks done", "12", "completed this month"],
      ["Next milestone", "Oct 30", "spinach harvest"],
    ],
    rows: [
      [
        "Oct 27 · Today",
        "Check soil moisture",
        "North Field",
        "Ravi Kumar",
        "Today",
      ],
      [
        "Oct 28 · Tomorrow",
        "Inspect chilli plants",
        "East Field",
        "Ravi Kumar",
        "Planned",
      ],
      [
        "Oct 29 · Thu",
        "Prepare harvest crates",
        "Green Valley Farm",
        "Ravi Kumar",
        "Planned",
      ],
      [
        "Oct 30 · Fri",
        "Spinach harvest",
        "Kitchen Garden",
        "Ravi Kumar",
        "Important",
      ],
      [
        "Nov 02 · Mon",
        "Rice field inspection",
        "Paddy Field A",
        "Ravi Kumar",
        "Planned",
      ],
    ],
  },
  Notifications: {
    eyebrow: "A LITTLE NUDGE AT THE RIGHT TIME",
    title: "Notifications",
    description: "Important reminders and updates for your farm.",
    stats: [
      ["Unread", "03", "need a look"],
      ["This week", "08", "total updates"],
      ["Reminders", "04", "scheduled"],
      ["Completed", "05", "marked as read"],
    ],
    rows: [
      [
        "Harvest coming up",
        "Spinach is almost ready in 3 days.",
        "Today, 9:00 AM",
        "Harvest",
        "Unread",
      ],
      [
        "Irrigation reminder",
        "Check soil moisture in North Field.",
        "Today, 7:30 AM",
        "Reminder",
        "Unread",
      ],
      [
        "Weekly expenses ready",
        "Your farm spending overview is updated.",
        "Yesterday, 6:00 PM",
        "Report",
        "Unread",
      ],
      [
        "Activity logged",
        "Fertilizer application was recorded.",
        "Oct 25, 4:15 PM",
        "Activity",
        "Read",
      ],
    ],
  },
  Settings: {
    eyebrow: "YOUR WORKSPACE, YOUR WAY",
    title: "Settings",
    description: "Manage your profile and personalize your farm workspace.",
    stats: [
      ["Profile", "Complete", "personal details"],
      ["Farm units", "Acres", "measurement preference"],
      ["Notifications", "Enabled", "reminders active"],
      ["Appearance", "Earth", "current theme"],
    ],
    rows: [
      [
        "Personal profile",
        "Name, contact details, and preferences",
        "Ravi Kumar",
        "Edit profile",
        "Available",
      ],
      [
        "Farm preferences",
        "Units, location, and default farm",
        "Acres · Tamil Nadu",
        "Edit preferences",
        "Available",
      ],
      [
        "Notifications",
        "Reminders and activity updates",
        "Enabled",
        "Manage alerts",
        "Available",
      ],
      [
        "Appearance",
        "Theme and visual preferences",
        "Earth-inspired",
        "Customize",
        "Available",
      ],
    ],
  },
};
const pageMeta = {
  Farms: {
    icon: Tractor,
    cta: "Add farm",
    columns: ["FARM NAME", "LOCATION", "LAND AREA", "FIELDS", "STATUS"],
    labels: ["Farm name", "Location", "Land area (acres)"],
  },
  Fields: {
    icon: MapPinned,
    cta: "Add field",
    columns: ["FIELD NAME", "FARM", "AREA", "CURRENT CROP", "STATUS"],
    labels: ["Field name", "Farm name", "Area (acres)"],
  },
  "Crop management": {
    icon: Sprout,
    cta: "Add crop",
    columns: ["CROP", "VARIETY", "FIELD", "PROGRESS", "STATUS"],
    labels: ["Crop name", "Variety", "Field"],
  },
  Activities: {
    icon: ClipboardList,
    cta: "Log activity",
    columns: [
      "ACTIVITY",
      "FIELD / CROP",
      "DATE & TIME",
      "ASSIGNED TO",
      "STATUS",
    ],
    labels: ["Activity name", "Field or crop", "Date"],
  },
  Expenses: {
    icon: Wallet,
    cta: "Add expense",
    columns: ["DESCRIPTION", "CATEGORY", "FARM / FIELD", "AMOUNT", "DATE"],
    labels: ["Expense description", "Category", "Amount (₹)"],
    categories: Object.values(ExpenseCategory),
  },
  "Harvest records": {
    icon: PackageCheck,
    cta: "Record harvest",
    columns: ["CROP", "FIELD", "QUANTITY", "UNIT", "HARVEST DATE"],
    labels: ["Crop name", "Field", "Quantity harvested", "Unit"],
    units: Object.values(HarvestUnit),
  },
  Calendar: {
    icon: CalendarDays,
    cta: "Add event",
    columns: ["DATE", "EVENT", "LOCATION", "ASSIGNED TO", "STATUS"],
    labels: ["Event name", "Date", "Location"],
  },
  Notifications: {
    icon: Bell,
    cta: "Mark all read",
    columns: ["NOTIFICATION", "DETAILS", "RECEIVED", "TYPE", "STATUS"],
    labels: [],
  },
  Settings: {
    icon: Settings,
    cta: "Save preferences",
    columns: ["SETTING", "DESCRIPTION", "CURRENT VALUE", "ACTION", "STATUS"],
    labels: [],
  },
};
function WorkspacePage({ active, onNavigate, notify, onAdd }) {
  const data = workspaceData[active] || workspaceData.Farms;
  const meta = pageMeta[active] || pageMeta.Farms;
  const Icon = meta.icon;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [layout, setLayout] = useState("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [formValues, setFormValues] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [items, setItems] = useState(data.rows);
  const [readAll, setReadAll] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const filtered = items.filter(
    (row) =>
      row.join(" ").toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" ||
        row[row.length - 1] === filter ||
        row.some((cell) => cell.toLowerCase() === filter.toLowerCase())),
  );
  function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const row =
      active === "Farms"
        ? [
            draft.trim(),
            formValues[1] || "Tambaram, Tamil Nadu",
            formValues[2] || "—",
            formValues[3] || "0",
            formValues[4] || "New",
          ]
        : active === "Fields"
          ? [
              draft.trim(),
              formValues[1] || "Green Valley Farm",
              formValues[2] || "—",
              formValues[3] || "—",
              formValues[4] || "Available",
            ]
          : active === "Crop management"
            ? [
                draft.trim(),
                formValues[1] || "Local variety",
                formValues[2] || "Unassigned field",
                formValues[3] || "0%",
                formValues[4] || "Planned",
              ]
            : active === "Activities"
              ? [
                  draft.trim(),
                  formValues[1] || "Unassigned field",
                  formValues[2] || "Today",
                  formValues[3] || "Ravi Kumar",
                  formValues[4] || "Planned",
                ]
              : active === "Expenses"
                ? [
                    draft.trim(),
                    formValues[1] || "OTHER",
                    formValues[2] || "Green Valley Farm",
                    formValues[3] || "₹0",
                    formValues[4] || "Today",
                  ]
                : active === "Harvest records"
                  ? [
                      draft.trim(),
                      formValues[1] || "Unassigned field",
                      formValues[2] || "0 kg",
                      formValues[3] || "Today",
                      formValues[4] || "Pending",
                    ]
                  : [
                      draft.trim(),
                      formValues[1] || "Today",
                      formValues[2] || "Green Valley Farm",
                      formValues[3] || "Ravi Kumar",
                      formValues[4] || "Planned",
                    ];
    if (editingRow) {
      setItems(items.map((item) => (item === editingRow ? row : item)));
      notify("Demo record updated");
    } else {
      setItems([row, ...items]);
      notify("Added to your demo workspace");
    }
    setDraft("");
    setFormValues({});
    setEditingRow(null);
    setDialogOpen(false);
  }
  function primaryAction() {
    if (active === "Notifications") {
      setReadAll(true);
      notify("All notifications marked as read");
      return;
    }
    if (active === "Settings") {
      notify("Your demo preferences are saved");
      return;
    }
    setDraft("");
    setFormValues({});
    setEditingRow(null);
    setDialogOpen(true);
  }
  const statusOptions = [
    ...new Set(data.rows.map((row) => row[row.length - 1])),
  ].filter((v) =>
    [
      "Growing",
      "Ready soon",
      "Planned",
      "Completed",
      "Upcoming",
      "Unread",
      "Read",
      "Active",
      "Available",
      "Grade A",
      "Grade B",
      "Important",
    ].includes(v),
  );
  return (
    <section className="workspace-page">
      <div className="page-eyebrow">
        <span className="eyebrow-pip" />
        {data.eyebrow}
      </div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon">
          <Icon size={23} />
        </div>
        <div className="workspace-title-copy">
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
        <div className="workspace-title-actions">
          <button
            className="button-secondary desktop-secondary"
            onClick={() => notify("Your demo report is ready to explore")}
          >
            <ArrowDownRight size={15} /> Export report
          </button>
          <button className="button-primary" onClick={primaryAction}>
            {active === "Notifications" ? (
              <Check size={16} />
            ) : active === "Settings" ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}{" "}
            {meta.cta}
          </button>
        </div>
      </div>
      <div className="workspace-stats">
        {data.stats.map((stat, i) => (
          <article className="workspace-stat surface-card" key={stat[0]}>
            <div className="workspace-stat-label">
              {stat[0]}
              <span className={"workspace-stat-icon ws-tone-" + i}>
                <Icon size={15} />
              </span>
            </div>
            <strong>{stat[1]}</strong>
            <small>{stat[2]}</small>
            <span className="workspace-stat-accent" />
          </article>
        ))}
      </div>
      {active === "Calendar" && <CalendarPanel notify={notify} />}
      {active === "Settings" ? (
        <SettingsPanel notify={notify} />
      ) : (
        <div className="workspace-data-card surface-card">
          <div className="workspace-data-heading">
            <div>
              <h2>
                {active === "Notifications"
                  ? "All updates"
                  : active === "Activities"
                    ? "Activity log"
                    : active === "Expenses"
                      ? "Expense ledger"
                      : active === "Harvest records"
                        ? "Harvest history"
                        : active === "Calendar"
                          ? "Upcoming events"
                          : "All " + active.toLowerCase()}
              </h2>
              <p>Explore, search, and manage your farm information.</p>
            </div>
            <div className="view-toggle">
              <button
                className={layout === "table" ? "selected" : ""}
                onClick={() => setLayout("table")}
                aria-label="Table view"
              >
                <ClipboardList size={15} />
              </button>
              <button
                className={layout === "cards" ? "selected" : ""}
                onClick={() => setLayout("cards")}
                aria-label="Card view"
              >
                <LayoutDashboard size={15} />
              </button>
            </div>
          </div>
          <div className="workspace-toolbar">
            <label className="table-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={"Search " + active.toLowerCase() + "..."}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <label className="workspace-filter">
              <SlidersHorizontal size={15} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <span className="result-count">{filtered.length} records</span>
          </div>
          {layout === "table" ? (
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead>
                  <tr>
                    {meta.columns.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={row[0] + i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          {j === row.length - 1 ? (
                            <span className={"status-pill " + statusTone(cell)}>
                              <i />
                              {active === "Notifications" && readAll
                                ? "Read"
                                : cell}
                            </span>
                          ) : j === 0 ? (
                            <strong className="workspace-cell-title">
                              {cell}
                            </strong>
                          ) : (
                            <span
                              className={
                                cell.startsWith("₹") ? "money-cell" : ""
                              }
                            >
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                      <td>
                        <button
                          className="row-action"
                          aria-label={"More actions for " + row[0]}
                          onClick={() => setSelectedRecord(row)}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-state">
                  <Search size={23} />
                  <strong>No matching records</strong>
                  <span>Try changing your search or status filter.</span>
                  <button
                    className="button-secondary"
                    onClick={() => {
                      setQuery("");
                      setFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="workspace-record-grid">
              {filtered.map((row, i) => (
                <article className="workspace-record-card" key={row[0] + i}>
                  <div className="record-card-icon">
                    <Icon size={19} />
                  </div>
                  <span className="record-card-kicker">
                    {active === "Expenses"
                      ? "EXPENSE ENTRY"
                      : active === "Harvest records"
                        ? "HARVEST RECORD"
                        : active === "Notifications"
                          ? "FARM UPDATE"
                          : active === "Calendar"
                            ? "SCHEDULED EVENT"
                            : "FARM RECORD"}
                  </span>
                  <h3>{row[0]}</h3>
                  <p>{row.slice(1, 3).join(" · ")}</p>
                  <div className="record-card-bottom">
                    <span
                      className={
                        "status-pill " + statusTone(row[row.length - 1])
                      }
                    >
                      <i />
                      {row[row.length - 1]}
                    </span>
                    <button
                      className="row-action"
                      onClick={() => setSelectedRecord(row)}
                      aria-label="Open record details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="workspace-data-footer">
            <span>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{items.length}</strong> records
            </span>
            <span>Demo workspace · Sample data</span>
          </div>
        </div>
      )}
      {selectedRecord && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
        >
          <section
            className="dialog-card record-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-detail-title"
          >
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">
                  {active.toUpperCase()} · RECORD DETAIL
                </span>
                <h2 id="record-detail-title">{selectedRecord[0]}</h2>
                <p>
                  Review the information currently available in this demo
                  workspace.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close details"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={19} />
              </button>
            </div>
            <div className="record-detail-grid">
              {meta.columns.map((label, index) => (
                <div className="record-detail-field" key={label}>
                  <span>{label}</span>
                  <strong>
                    {active === "Notifications" && index === 4 && readAll
                      ? "Read"
                      : selectedRecord[index] || "—"}
                  </strong>
                </div>
              ))}
            </div>
            <div className="dialog-note">
              <Sprout size={17} />
              <span>Sample data only — changes are not sent to a backend.</span>
            </div>
            <div className="dialog-actions">
              <button
                className="button-secondary"
                onClick={() => setSelectedRecord(null)}
              >
                Close details
              </button>
              <button
                className="button-primary"
                onClick={() => {
                  setEditingRow(selectedRecord);
                  setFormValues(
                    Object.fromEntries(
                      selectedRecord
                        .slice(1)
                        .map((value, index) => [index + 1, value]),
                    ),
                  );
                  setDraft(selectedRecord[0]);
                  setSelectedRecord(null);
                  setDialogOpen(true);
                }}
              >
                Edit record <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
      {dialogOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDialogOpen(false);
          }}
        >
          <form className="dialog-card" onSubmit={submit}>
            <div className="dialog-heading">
              <div>
                <span className="section-kicker">FARM WORKSPACE</span>
                <h2>{editingRow ? "Edit record" : meta.cta}</h2>
                <p>
                  {editingRow
                    ? "Update the details for this demo record."
                    : "Add a new entry to this demo screen."}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setDialogOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
            <label className="form-label">
              {meta.labels[0] || "Name"}
              <input
                autoFocus
                required
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  "Enter " + (meta.labels[0] || "name").toLowerCase()
                }
              />
            </label>
            {meta.labels.slice(1).map((label, index) => (
              <label className="form-label" key={label}>
                {label}
                {label === "Category" && meta.categories ? (
                  <select
                    className="form-select"
                    value={formValues[index + 1] ?? meta.categories[0]}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [index + 1]: e.target.value,
                      })
                    }
                  >
                    {meta.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                ) : label === "Unit" && meta.units ? (
                  <select
                    className="form-select"
                    value={formValues[index + 1] ?? meta.units[0]}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [index + 1]: e.target.value,
                      })
                    }
                  >
                    {meta.units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={formValues[index + 1] ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [index + 1]: e.target.value,
                      })
                    }
                    placeholder={"Enter " + label.toLowerCase()}
                  />
                )}
              </label>
            ))}
            <div className="dialog-note">
              <Sprout size={17} />
              <span>
                This entry is stored only in the current browser session.
              </span>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary">
                <Plus size={16} />
                Create entry
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
function statusTone(status) {
  const s = status.toLowerCase();
  if (["active", "growing", "completed", "read", "grade a"].includes(s))
    return "status-growing";
  if (["ready soon", "important", "unread", "upcoming"].includes(s))
    return "status-ready";
  if (["planned", "available", "pending", "new"].includes(s))
    return "status-planned";
  return "status-planned";
}
function CalendarPanel({ notify }) {
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
function SettingsPanel({ notify }) {
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
function Dashboard({
  filteredCrops,
  cropCount,
  search,
  setSearch,
  onAdd,
  onNavigate,
  notify,
  summary,
  selectedFarm,
}) {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(" ")[0] : "Ravi";

  // If summary from backend is available, use live values
  const totalPlantingsVal = summary?.totalPlantings != null ? String(summary.totalPlantings).padStart(2, "0") : String(cropCount).padStart(2, "0");
  const totalFieldsVal = summary?.totalFields != null ? String(summary.totalFields).padStart(2, "0") : "04";
  const harvestRecordsVal = summary?.harvestRecordCount != null ? String(summary.harvestRecordCount).padStart(2, "0") : "03";
  const totalExpensesVal = summary?.totalExpenses != null ? `₹${summary.totalExpenses.toLocaleString()}` : "₹8,450";

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="page-eyebrow">
            <span className="eyebrow-pip" />
            TODAY · {selectedFarm?.name ? selectedFarm.name.toUpperCase() : "GREEN VALLEY FARM"}
          </div>
          <h1>
            Good day, {userName} <span className="wave">✳</span>
          </h1>
          <p>Here’s what’s happening on your farm today.</p>
        </div>
        <button className="button-primary" onClick={onAdd}>
          <Plus size={17} /> Add new crop
        </button>
      </section>
      <section className="hero-banner">
        <div className="hero-copy">
          <div className="hero-tag">
            <Flower2 size={14} /> YOUR FARM, IN RHYTHM
          </div>
          <h2>
            Every season is a<br />
            <em>fresh beginning.</em>
          </h2>
          <p>
            Healthy soil. Thoughtful care. A little patience.
            <br />
            You’re growing something wonderful.
          </p>
          <button
            className="hero-button"
            onClick={() => onNavigate("Crop management")}
          >
            Explore your crops <ArrowRight size={15} />
          </button>
          <div className="hero-note">
            <span>
              <Sun size={14} />
            </span>{" "}
            A beautiful day to grow something good
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of growing plants">
          <svg
            className="hero-art-vector"
            viewBox="0 0 520 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="hillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbe8ca" />
                <stop offset="100%" stopColor="#c2d8a5" />
              </linearGradient>
              <linearGradient id="hillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ec08d" />
                <stop offset="100%" stopColor="#7ba569" />
              </linearGradient>
            </defs>

            {/* Sun with warm glow */}
            <circle cx="370" cy="56" r="44" fill="url(#sunGlow)" />
            <circle cx="370" cy="56" r="54" fill="#fef3c7" opacity="0.35" />

            {/* Clouds */}
            <g opacity="0.8" fill="#ffffff">
              <path d="M210 50 a12 12 0 0 1 20 -4 a16 16 0 0 1 28 2 a10 10 0 0 1 12 10 l-60 0 a8 8 0 0 1 0 -8 z" />
              <path d="M430 78 a9 9 0 0 1 15 -3 a12 12 0 0 1 21 2 a8 8 0 0 1 9 8 l-45 0 a6 6 0 0 1 0 -7 z" opacity="0.65" />
            </g>

            {/* Rolling background hill */}
            <path
              d="M120 230 C200 130 340 105 520 160 L520 230 Z"
              fill="url(#hillBackGrad)"
            />

            {/* Rolling foreground hill */}
            <path
              d="M170 230 C290 145 420 155 520 185 L520 230 Z"
              fill="url(#hillFrontGrad)"
            />

            {/* Crops / Sprouting Plants Vector Art */}
            {/* Plant 1 (Left tall sprout) */}
            <g transform="translate(265, 125)">
              <path d="M12 90 Q10 40 4 0" stroke="#3d6339" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 55 C-8 45 -12 25 2 20 C10 32 8 48 6 55 Z" fill="#58854d" />
              <path d="M8 35 C20 26 25 8 12 5 C4 18 6 30 8 35 Z" fill="#6c9b5f" />
              <path d="M4 12 C-4 2 -2 -10 6 -8 C10 -2 7 8 4 12 Z" fill="#7eae6f" />
            </g>

            {/* Plant 2 (Middle flourishing sprout) */}
            <g transform="translate(325, 140)">
              <path d="M10 80 Q14 35 18 0" stroke="#365832" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M13 50 C28 42 32 24 20 18 C12 28 12 44 13 50 Z" fill="#507c46" />
              <path d="M11 32 C-2 25 -6 9 6 6 C13 16 12 28 11 32 Z" fill="#66945a" />
              <path d="M17 12 C28 2 28 -12 18 -10 C12 -2 15 8 17 12 Z" fill="#79a86b" />
            </g>

            {/* Plant 3 (Right young sprout) */}
            <g transform="translate(385, 155)">
              <path d="M8 70 Q5 35 0 5" stroke="#3d6339" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M5 45 C-6 38 -9 22 2 18 C8 26 6 39 5 45 Z" fill="#58854d" />
              <path d="M4 25 C14 18 17 4 7 2 C1 11 3 20 4 25 Z" fill="#6ca061" />
            </g>

            {/* Blooming Flower on the hill */}
            <g transform="translate(445, 142)">
              <path d="M6 75 Q4 45 6 18" stroke="#4b7042" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="6" cy="14" r="5" fill="#f59e0b" />
              <circle cx="6" cy="6" r="4.5" fill="#fef3c7" />
              <circle cx="14" cy="14" r="4.5" fill="#fef3c7" />
              <circle cx="6" cy="22" r="4.5" fill="#fef3c7" />
              <circle cx="-2" cy="14" r="4.5" fill="#fef3c7" />
            </g>
          </svg>
          <span className="art-caption">
            GROW WITH CARE <Flower2 size={12} />
          </span>
        </div>
      </section>
      <section className="stats-grid">
        <StatCard
          label="Total crops"
          value={totalPlantingsVal}
          suffix="plantings"
          icon={Sprout}
          tone="sage"
          trend="+2 new"
          foot="this season"
          visual="bars"
        />
        <StatCard
          label="Active fields"
          value={totalFieldsVal}
          suffix="fields"
          icon={MapPinned}
          tone="blue"
          trend={summary?.totalFields ? `${summary.totalFields} registered` : "4.9 acres"}
          foot="under cultivation"
          visual="fields"
        />
        <StatCard
          label="Harvest records"
          value={harvestRecordsVal}
          suffix="records"
          icon={Wheat}
          tone="amber"
          trend="Yield logged"
          foot="across plots"
          visual="calendar"
        />
        <StatCard
          label="Total expenses"
          value={totalExpensesVal}
          suffix=""
          icon={Wallet}
          tone="lilac"
          trend="Farm ledger"
          foot="current total"
          visual="line"
        />
      </section>
      <section className="insights-strip surface-card">
        <div className="insights-copy">
          <span className="section-kicker">
            <TrendingUp size={13} /> SEASON INSIGHTS
          </span>
          <h2>Steady growth, thoughtful planning.</h2>
          <p>
            A quick look at your farm’s sample activity and spending patterns.
          </p>
          <button
            className="button-link"
            onClick={() => onNavigate("Expenses")}
          >
            Explore farm expenses <ArrowRight size={14} />
          </button>
        </div>
        <div className="insight-chart">
          <div className="chart-legend">
            <span>
              <i className="legend-green" />
              Income
            </span>
            <span>
              <i className="legend-gold" />
              Expenses
            </span>
            <small>Last 6 months</small>
          </div>
          <div
            className="chart-bars"
            aria-label="Illustrative six-month income and expenses comparison"
          >
            {[
              ["May", 58, 34],
              ["Jun", 72, 42],
              ["Jul", 64, 49],
              ["Aug", 86, 54],
              ["Sep", 77, 47],
              ["Oct", 94, 56],
            ].map(([month, income, expense]) => (
              <div className="chart-month" key={month}>
                <div className="chart-bar-pair">
                  <span
                    className="chart-bar income-bar"
                    style={{ height: income + "%" }}
                  />
                  <span
                    className="chart-bar expense-bar"
                    style={{ height: expense + "%" }}
                  />
                </div>
                <small>{month}</small>
              </div>
            ))}
          </div>
          <p className="chart-disclaimer">
            Illustrative demo values · not financial records
          </p>
        </div>
      </section>
      <section className="dashboard-grid">
        <div className="surface-card crop-card">
          <div className="section-heading">
            <div>
              <h2>Your growing crops</h2>
              <p>A little progress goes a long way.</p>
            </div>
            <button
              className="button-link"
              onClick={() => onNavigate("Crop management")}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-tools">
            <label className="table-search">
              <Search size={15} />
              <input
                placeholder="Search crops or fields..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button aria-label="Clear search" onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <button
              className="filter-button"
              onClick={() => notify("All crop statuses are currently shown")}
            >
              <SlidersHorizontal size={15} />
              Filter
            </button>
          </div>
          <div className="crop-table-wrap">
            <table className="crop-table">
              <thead>
                <tr>
                  <th>CROP</th>
                  <th>FIELD</th>
                  <th>PROGRESS</th>
                  <th>STATUS</th>
                  <th>HARVEST</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.slice(0, 4).map((c) => (
                  <tr key={c.name}>
                    <td>
                      <div className="crop-identity">
                        <span className={"crop-emoji " + c.tone}>{c.icon}</span>
                        <span>
                          <strong>{c.name}</strong>
                          <small>{c.variety}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong className="field-name">{c.field}</strong>
                      <small className="field-area">{c.area}</small>
                    </td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-track">
                          <span style={{ width: c.progress + "%" }} />
                        </div>
                        <small>{c.progress}%</small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          "status-pill " +
                          (c.status === "Ready soon"
                            ? "status-ready"
                            : c.status === "Planned"
                              ? "status-planned"
                              : "status-growing")
                        }
                      >
                        <i />
                        {c.status}
                      </span>
                    </td>
                    <td className="harvest-date">{c.harvest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCrops.length === 0 && (
              <div className="empty-state">
                <Sprout size={22} />
                <strong>No crops found</strong>
                <span>Try another crop or field name.</span>
              </div>
            )}
          </div>
          <div className="table-footer">
            <span>
              Showing <strong>{Math.min(filteredCrops.length, 4)}</strong> of{" "}
              <strong>{filteredCrops.length}</strong> crops
            </span>
            <button onClick={() => onNavigate("Crop management")}>
              Open crop directory <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="right-column">
          <div className="surface-card activity-card">
            <div className="section-heading">
              <div>
                <h2>Recent activity</h2>
                <p>The latest from your fields.</p>
              </div>
              <button
                className="icon-button subtle-icon"
                aria-label="Activity options"
                onClick={() => notify("Activity options are coming soon")}
              >
                <MoreHorizontal size={19} />
              </button>
            </div>
            <div className="activity-list">
              {activities.map((a) => {
                const Icon = a.icon;
                return (
                  <div className="activity-item" key={a.title}>
                    <span className={"activity-icon " + a.tone}>
                      <Icon size={16} />
                    </span>
                    <div className="activity-copy">
                      <strong>{a.title}</strong>
                      <p>{a.detail}</p>
                      <small>
                        <Clock3 size={11} />
                        {a.time}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="activity-link"
              onClick={() => onNavigate("Activities")}
            >
              View activity log <ArrowRight size={14} />
            </button>
          </div>
          <div className="field-note">
            <div className="field-note-top">
              <span>
                <Flower2 size={13} /> FIELD NOTE
              </span>
              <span>NO. 024</span>
            </div>
            <div className="field-note-illustration" aria-hidden="true">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Soil/drop badge */}
                <path
                  d="M24 8 C24 8 12 24 12 32 C12 38.6 17.4 44 24 44 C30.6 44 36 38.6 36 32 C36 24 24 8 24 8 Z"
                  fill="#7ea16b"
                  opacity="0.35"
                />
                <path
                  d="M24 13 C24 13 15 26 15 32 C15 37 19 41 24 41 C29 41 33 37 33 32 C33 26 24 13 24 13 Z"
                  fill="#5d8851"
                  opacity="0.6"
                />
                {/* Sprouting leaf with clean veins */}
                <path
                  d="M24 38 C28 28 39 16 54 14 C52 28 42 41 26 42"
                  fill="#477340"
                  opacity="0.8"
                />
                <path
                  d="M24 38 Q36 27 54 14"
                  stroke="#c5dfb5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M34 29 Q39 24 42 21"
                  stroke="#c5dfb5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M30 33 Q34 33 38 30"
                  stroke="#c5dfb5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Morning dew drop */}
                <circle cx="46" cy="18" r="2.5" fill="#fef3c7" opacity="0.9" />
              </svg>
            </div>
            <h3>
              A little care goes
              <br />a long way.
            </h3>
            <p>
              Check soil moisture before watering. Your crops — and your water
              bill — will thank you.
            </p>
            <button onClick={() => notify("Tip saved to your field notes")}>
              Save this tip <ArrowUpRight size={14} />
            </button>
            <Flower2 className="note-decoration" size={64} />
          </div>
        </div>
      </section>
    </>
  );
}
function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
  trend,
  foot,
  visual,
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={"stat-icon " + tone}>
          <Icon size={17} />
        </span>
      </div>
      <div className="stat-value">
        {value}
        <small>{suffix}</small>
      </div>
      <div className="stat-foot">
        <span className={visual === "line" ? "positive-trend" : "trend-tag"}>
          {trend}
        </span>
        <span>{foot}</span>
      </div>
      <div className={"stat-visual " + visual}>
        {visual === "bars" ? (
          Array.from({ length: 12 }, (_, i) => <i key={i} />)
        ) : visual === "fields" ? (
          Array.from({ length: 4 }, (_, i) => <i key={i} />)
        ) : visual === "calendar" ? (
          <>
            <b>
              30<small>OCT</small>
            </b>
            <b>
              02<small>NOV</small>
            </b>
            <b>
              04<small>NOV</small>
            </b>
          </>
        ) : (
          <svg viewBox="0 0 120 32" preserveAspectRatio="none">
            <path
              d="M1 25 C14 24 15 10 28 16 S45 27 58 17 S73 19 83 9 S102 17 119 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </article>
  );
}
export default App;
