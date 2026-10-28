import React from 'react';
import {
  Menu,
  Search,
  Command,
  CloudSun,
  Bell,
  CalendarDays,
  Droplets,
  Wallet,
  ArrowRight,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import { Avatar } from './Avatar';

export function Topbar({
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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#e8ede5] sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 gap-4">
      {/* Left breadcrumb & mobile toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="md:hidden p-2 rounded-lg text-[#7b897e] hover:bg-[#f1f5ed] border-0 bg-transparent cursor-pointer"
          aria-label="Open navigation"
          onClick={() => setMobileNav(true)}
        >
          <Menu size={20} />
        </button>
        <div className="text-xs text-[#89958b] flex items-center gap-1.5 whitespace-nowrap">
          <span className="hidden sm:inline">Farm workspace</span>
          <span className="text-[#c4cbc2] hidden sm:inline">/</span>
          <strong className="text-[#33473a] font-semibold">{active}</strong>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search */}
        <label className="hidden sm:flex items-center gap-2 h-9 w-44 md:w-56 border border-[#e9ede6] rounded-lg px-2.5 bg-white text-[#9aa49b] focus-within:border-[#7aa16d] focus-within:ring-2 focus-within:ring-[#7aa16d]/20 transition-all">
          <Search size={15} />
          <input
            className="border-0 outline-none w-full bg-transparent text-xs text-[#34483a] placeholder:text-[#a3aca4]"
            aria-label="Search workspace"
            placeholder="Search anything..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setActive('Crop management');
            }}
          />
          <kbd className="hidden lg:flex items-center gap-0.5 bg-[#f6f7f4] border border-[#ecefe8] rounded px-1 text-[9px] text-[#98a198]">
            <Command size={10} /> K
          </kbd>
        </label>

        <div className="hidden sm:block h-6 w-px bg-[#e9ede6]" />

        {/* Weather chip */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <div className="w-8 h-8 rounded-lg bg-[#fbf2dc] text-[#c69a45] grid place-items-center">
            <CloudSun size={18} />
          </div>
          <div>
            <strong className="block text-xs text-[#3c4d40] leading-none">29°C</strong>
            <small className="text-[10px] text-[#97a197] leading-none">Mostly sunny</small>
          </div>
        </div>

        {/* Notifications popover */}
        <div className="relative">
          <button
            className={`relative p-2 rounded-lg text-[#7b897e] hover:bg-[#f1f5ed] hover:text-[#386b49] border-0 bg-transparent cursor-pointer transition-colors ${
              notificationsOpen ? 'bg-[#f1f5ed] text-[#386b49]' : ''
            }`}
            aria-label="Notifications"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d8784f] ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-[#e8ede5] rounded-xl shadow-2xl p-3.5 z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#eff1ec]">
                <strong className="text-xs font-bold text-[#2c4132]">Notifications</strong>
                <span className="text-[10px] font-semibold bg-[#edf4e8] text-[#46734c] px-2 py-0.5 rounded-full">
                  3 new
                </span>
              </div>
              <div className="divide-y divide-[#f0f2ed] my-1">
                <div className="flex gap-2.5 py-2.5">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-[#fbf2df] text-[#b68c3e] grid place-items-center">
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <strong className="text-xs text-[#405043] block">Harvest coming up</strong>
                    <small className="text-[11px] text-[#8b978d] leading-tight block">
                      Spinach is almost ready · in 3 days
                    </small>
                  </div>
                </div>
                <div className="flex gap-2.5 py-2.5">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-[#eaf3e8] text-[#4c8051] grid place-items-center">
                    <Droplets size={14} />
                  </div>
                  <div>
                    <strong className="text-xs text-[#405043] block">Irrigation reminder</strong>
                    <small className="text-[11px] text-[#8b978d] leading-tight block">
                      Check moisture in North Field
                    </small>
                  </div>
                </div>
                <div className="flex gap-2.5 py-2.5">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-[#eaf1f8] text-[#6287ae] grid place-items-center">
                    <Wallet size={14} />
                  </div>
                  <div>
                    <strong className="text-xs text-[#405043] block">Weekly expenses ready</strong>
                    <small className="text-[11px] text-[#8b978d] leading-tight block">
                      Your farm spending overview is updated
                    </small>
                  </div>
                </div>
              </div>
              <button
                className="w-full pt-2 border-t border-[#edf0eb] text-center text-xs font-bold text-[#39734a] hover:underline flex items-center justify-center gap-1.5 border-0 bg-transparent cursor-pointer"
                onClick={() => {
                  setActive('Notifications');
                  setNotificationsOpen(false);
                }}
              >
                <span>View all notifications</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Profile Pill or Login Button */}
        {isAuthenticated ? (
          <button
            className="border-0 bg-transparent flex items-center gap-1.5 text-[#8a958b] p-0 cursor-pointer"
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
            className="border border-[#286044] bg-[#286044] hover:bg-[#204d37] text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            onClick={() => setAuthModalOpen(true)}
          >
            <LogIn size={13} />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
}

