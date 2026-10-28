import React from 'react';
import {
  X,
  Leaf,
  ChevronDown,
  Check,
  Plus,
  ArrowRight,
  Sun,
  ArrowUpRight,
  CircleHelp,
  Ellipsis,
  CircleUserRound,
  Settings,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Brand } from './Brand';
import { Avatar } from './Avatar';
import { navigation } from '../../data/navigation';

export function Sidebar({
  mobileNav,
  setMobileNav,
  active,
  setActive,
  farmOpen,
  setFarmOpen,
  selectedFarm,
  setSelectedFarm,
  farms,
  isLiveConnected,
  notify,
  profileOpen,
  setProfileOpen,
  isAuthenticated,
  user,
  setAuthModalOpen,
  logout,
}) {
  return (
    <>
      {mobileNav && (
        <button
          className="fixed inset-0 bg-[#1a2b20]/40 z-30 md:hidden backdrop-blur-xs border-0 cursor-pointer"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#e8ede5] flex flex-col p-5 z-40 transition-transform duration-250 ease-in-out md:translate-x-0 ${
          mobileNav ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand & Mobile close */}
        <div className="flex items-center justify-between pb-6">
          <Brand
            onHome={() => {
              setActive('Overview');
              setMobileNav(false);
            }}
          />
          <button
            className="md:hidden p-1.5 rounded-lg text-[#7b897e] hover:bg-[#f1f5ed] border-0 bg-transparent cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          >
            <X size={19} />
          </button>
        </div>

        {/* Farm Switcher */}
        <div className="relative mb-5">
          <button
            className="w-full bg-[#f6f8f3] border border-[#edf0e8] hover:border-[#dfe5da] rounded-xl p-2.5 flex items-center gap-2.5 text-left text-[#748277] transition-all cursor-pointer"
            onClick={() => setFarmOpen(!farmOpen)}
            aria-expanded={farmOpen}
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-[#e4efdc] text-[#4c7c4d] grid place-items-center">
              <Leaf size={18} />
            </div>
            <span className="min-w-0 flex-1">
              <strong className="text-xs text-[#34463a] block truncate">
                {selectedFarm ? selectedFarm.name : 'Green Valley Farm'}
              </strong>
              <small className="flex items-center gap-1 text-[10px] text-[#8c998e] mt-0.5 truncate">
                {isLiveConnected ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[9px] px-1.5 py-0.5 rounded-full bg-[#e3f5e1] text-[#236e3c]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2e9e4f] animate-pulse" />
                    Live {selectedFarm?.landArea ? `· ${selectedFarm.landArea} ac` : ''}
                  </span>
                ) : (
                  <span>Tambaram, Tamil Nadu</span>
                )}
              </small>
            </span>
            <ChevronDown
              size={15}
              className={`shrink-0 transition-transform duration-200 ${farmOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {farmOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e8ede5] rounded-xl shadow-lg p-2 z-50">
              <strong className="text-[10px] font-bold text-[#91a092] uppercase tracking-wider px-2 py-1 block">
                My farms
              </strong>
              {farms.length > 0 ? (
                farms.map((f) => (
                  <button
                    key={f.id}
                    className="w-full border-0 bg-transparent hover:bg-[#f5f8f2] p-2 flex items-center gap-2 text-left rounded-lg text-xs text-[#435449] cursor-pointer"
                    onClick={() => {
                      setSelectedFarm(f);
                      setFarmOpen(false);
                      notify(`${f.name} selected`);
                    }}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedFarm?.id === f.id ? 'bg-[#6f9c63]' : 'bg-[#d7b26a]'
                      }`}
                    />
                    <span className="flex-1 truncate">{f.name}</span>
                    {selectedFarm?.id === f.id && <Check size={14} className="text-[#4f8655]" />}
                  </button>
                ))
              ) : (
                <>
                  <button
                    className="w-full border-0 bg-transparent hover:bg-[#f5f8f2] p-2 flex items-center gap-2 text-left rounded-lg text-xs text-[#435449] cursor-pointer"
                    onClick={() => {
                      setFarmOpen(false);
                      notify('Green Valley Farm selected');
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#6f9c63]" />
                    <span className="flex-1">Green Valley Farm</span>
                    <Check size={14} className="text-[#4f8655]" />
                  </button>
                  <button
                    className="w-full border-0 bg-transparent hover:bg-[#f5f8f2] p-2 flex items-center gap-2 text-left rounded-lg text-xs text-[#435449] cursor-pointer"
                    onClick={() => {
                      setFarmOpen(false);
                      notify('Demo farm switcher');
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#d7b26a]" />
                    <span className="flex-1">Sunrise Plot</span>
                    <Plus size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setFarmOpen(false);
                  setActive('Farms');
                }}
                className="w-full border-t border-[#edf0eb] mt-1 pt-2 bg-transparent text-[#39734a] hover:underline flex items-center justify-between text-[11px] font-semibold px-2 cursor-pointer"
              >
                <span>Manage all farms</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto space-y-4 pr-1" aria-label="Main navigation">
          {navigation.map((group) => (
            <div key={group.section}>
              <div className="text-[10px] font-bold tracking-wider text-[#a0aaa0] px-3 pb-2 uppercase">
                {group.section}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.label;
                  return (
                    <button
                      key={item.label}
                      className={`w-full border-0 rounded-lg flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#eaf3e8] text-[#245b40] font-bold shadow-xs'
                          : 'bg-transparent text-[#67756a] hover:bg-[#f7f9f5] hover:text-[#315c40]'
                      }`}
                      onClick={() => {
                        setActive(item.label);
                        setMobileNav(false);
                      }}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-[#d9e9d3] text-[#386947]'
                              : 'bg-[#f0f2ec] text-[#8a978b]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#d7a04d]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom card & Profile */}
        <div className="pt-3 border-t border-[#edf0eb] space-y-3 mt-auto">
          {/* Farm quote widget */}
          <div className="flex items-start gap-2 bg-[#f5f7ed] border border-[#edf0e2] rounded-xl p-2.5">
            <div className="w-7 h-7 shrink-0 rounded-md bg-[#e8edcf] text-[#ad9248] grid place-items-center">
              <Sun size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <strong className="text-[11px] text-[#3b4d39] font-bold block truncate">Growing together</strong>
              <p className="text-[10px] text-[#8a9685] leading-tight m-0 mt-0.5">Small daily steps lead to a thriving harvest.</p>
            </div>
            <button
              className="border-0 bg-transparent text-[#84927f] hover:text-[#286044] p-1 cursor-pointer"
              aria-label="Learn more about farm tips"
              onClick={() => notify('More farm tips are coming soon')}
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Help & Support */}
          <button
            className="w-full flex items-center gap-2 border-0 bg-transparent text-[#7f8c81] hover:text-[#286044] px-1 py-1.5 text-xs text-left cursor-pointer"
            onClick={() => notify('Help centre is coming soon')}
          >
            <CircleHelp size={16} />
            <span className="flex-1">Help & support</span>
            <ArrowUpRight size={13} />
          </button>

          {/* User Profile / Auth Area */}
          <div className="relative pt-1 border-t border-[#edf0eb]">
            {isAuthenticated ? (
              <button
                className="w-full border-0 bg-transparent flex items-center gap-2.5 p-1 text-left text-[#7c887e] rounded-lg hover:bg-[#f7f9f5] cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <Avatar name={user?.name || user?.username} />
                <span className="flex-1 min-w-0">
                  <strong className="text-xs text-[#34463a] font-bold block truncate">
                    {user?.name || user?.username}
                  </strong>
                  <small className="text-[10px] text-[#98a198] block truncate">Farm Owner</small>
                </span>
                <Ellipsis size={18} />
              </button>
            ) : (
              <button
                className="w-full border border-[#286044] bg-[#286044] hover:bg-[#204d37] text-white flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                onClick={() => setAuthModalOpen(true)}
              >
                <LogIn size={15} />
                <span>Sign in / Register</span>
              </button>
            )}

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#e8ede5] rounded-xl shadow-xl p-1.5 z-50 space-y-0.5">
                <button
                  className="w-full border-0 bg-transparent hover:bg-[#f5f8f2] flex items-center gap-2 p-2 text-left text-xs text-[#596a5c] rounded-md cursor-pointer"
                  onClick={() => {
                    setActive('Settings');
                    setProfileOpen(false);
                  }}
                >
                  <CircleUserRound size={15} /> My profile
                </button>
                <button
                  className="w-full border-0 bg-transparent hover:bg-[#f5f8f2] flex items-center gap-2 p-2 text-left text-xs text-[#596a5c] rounded-md cursor-pointer"
                  onClick={() => {
                    setActive('Settings');
                    setProfileOpen(false);
                  }}
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  className="w-full border-0 bg-transparent hover:bg-[#fdf2f2] text-[#b91c1c] flex items-center gap-2 p-2 text-left text-xs rounded-md cursor-pointer"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    notify('Signed out successfully');
                  }}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

