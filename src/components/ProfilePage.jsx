import { ArrowRight, CircleUserRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ProfileDetail({ label, value, icon: Icon }) {
  return (
    <div className="ifc-profile-detail">
      <dt><Icon size={14} aria-hidden="true" />{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ProfilePage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const username = typeof user?.username === "string" ? user.username.trim() : "";
  const displayName = user?.name?.trim() || username || "Farm user";
  const email = typeof user?.email === "string" && user.email.trim() ? user.email.trim() : "";
  const role = typeof user?.role === "string" ? user.role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() || "IF";

  return (
    <section className="workspace-page ifc-profile-page">
      <div className="page-eyebrow"><span className="eyebrow-pip" /> YOUR ACCOUNT</div>
      <div className="workspace-title-row">
        <div className="workspace-title-icon"><CircleUserRound size={23} /></div>
        <div className="workspace-title-copy">
          <h1>My profile</h1>
          <p>View your personal and account information.</p>
        </div>
      </div>

      <div className="ifc-profile-grid">
        <section className="surface-card ifc-profile-card" aria-labelledby="profile-summary-title">
          <div className="ifc-profile-cover" aria-hidden="true"><span /><span /><span /></div>
          <div className="ifc-profile-summary">
            <div className="ifc-profile-avatar" aria-hidden="true">{initials}</div>
            <h2 id="profile-summary-title">{displayName}</h2>
            <p>{email || username || "Infyro Farms account"}</p>
            {isAuthenticated && <span className="ifc-live-status"><i /> Signed in</span>}
          </div>
          <div className="ifc-profile-summary-footer">
            <div><ShieldCheck size={17} aria-hidden="true" /><span><strong>Account security</strong><small>Manage your sign-in sessions.</small></span></div>
            <button type="button" className="button-secondary" onClick={() => onNavigate("Settings")}>Account settings <ArrowRight size={14} /></button>
          </div>
        </section>

        <section className="surface-card ifc-profile-information" aria-labelledby="profile-information-title">
          <div className="ifc-settings-card-heading">
            <span className="ifc-settings-icon"><UserRound size={19} /></span>
            <div><h2 id="profile-information-title">Personal information</h2><p>Your registered account details.</p></div>
          </div>
          <dl className="ifc-profile-details">
            <ProfileDetail label="Username" value={username || "Not available"} icon={UserRound} />
            <ProfileDetail label="Email address" value={email || "Not available in this session"} icon={Mail} />
            <ProfileDetail label="Account role" value={role || "Not available"} icon={ShieldCheck} />
            <div className="ifc-profile-detail">
              <dt><LockKeyhole size={14} aria-hidden="true" />Session status</dt>
              <dd>{isAuthenticated ? <span className="ifc-live-status"><i /> Authenticated</span> : "Not signed in"}</dd>
            </div>
          </dl>
          <div className="ifc-profile-readonly"><LockKeyhole size={15} aria-hidden="true" /><span>Account information is currently read-only.</span></div>
        </section>
      </div>
    </section>
  );
}
