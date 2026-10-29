import { useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Command,
  LayoutDashboard,
  Leaf,
  Menu,
  Ellipsis,
  Plus,
  Search,
  Sprout,
  X,
  MapPinned,
  CircleUserRound,
  Settings,
  LogOut,
  Droplets,
  Sun,
  Wallet,
  LogIn,
} from "lucide-react";
import "./App.css";
import { Dashboard } from "./components/dashboard/Dashboard";
import { WorkspacePage } from "./components/workspace/WorkspacePage";
import { Brand } from "./components/layout/Brand";
import { Avatar } from "./components/layout/Avatar";
import { navigation, initialCrops as crops } from "./data/navigation";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import LandingPage from "./components/LandingPage";
import {
  farmApi,
  farmSummaryApi,
} from "./api/client";

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
export default App;
