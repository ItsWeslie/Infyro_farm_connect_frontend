import { Menu, Search, Command, CloudSun, Bell, CalendarDays, Droplets, Wallet, ArrowRight, ChevronDown, LogIn } from "lucide-react";
import { Avatar } from "./Avatar";

export function WorkspaceTopbar({
  active,
  setMobileNav,
  search,
  setSearch,
  setActive,
  notificationsOpen,
  setNotificationsOpen,
  profileOpen,
  setProfileOpen,
  isAuthenticated,
  user,
  setAuthModalOpen,
}) {
  return (
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
  );
}
