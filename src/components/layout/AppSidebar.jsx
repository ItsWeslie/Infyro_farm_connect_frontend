import { X, Leaf, ChevronDown, Check, Plus, ArrowRight, Sun, ArrowUpRight, CircleHelp, Ellipsis, CircleUserRound, Settings, LogOut, LogIn, Sprout, MapPinned } from "lucide-react";
import { Brand } from "./Brand";
import { Avatar } from "./Avatar";
import { navigation } from "../../data/navigation";

export function AppSidebar({
  mobileNav,
  setMobileNav,
  active,
  setActive,
  selectedFarm,
  setSelectedFarm,
  farms,
  isLiveConnected,
  farmOpen,
  setFarmOpen,
  notify,
  user,
  isAuthenticated,
  profileOpen,
  setProfileOpen,
  setAuthModalOpen,
  logout,
}) {
  return (
    <>
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
    </>
  );
}
