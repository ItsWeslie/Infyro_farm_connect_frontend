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
import { AppSidebar } from "./components/layout/AppSidebar";
import { WorkspaceTopbar } from "./components/layout/WorkspaceTopbar";
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
      <AppSidebar
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        active={active}
        setActive={setActive}
        selectedFarm={selectedFarm}
        setSelectedFarm={setSelectedFarm}
        farms={farms}
        isLiveConnected={isLiveConnected}
        farmOpen={farmOpen}
        setFarmOpen={setFarmOpen}
        notify={notify}
        user={user}
        isAuthenticated={isAuthenticated}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        setAuthModalOpen={setAuthModalOpen}
        logout={logout}
      />
      <main className="main-area">
        <WorkspaceTopbar
          active={active}
          setMobileNav={setMobileNav}
          search={search}
          setSearch={setSearch}
          setActive={setActive}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          isAuthenticated={isAuthenticated}
          user={user}
          setAuthModalOpen={setAuthModalOpen}
        />
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
