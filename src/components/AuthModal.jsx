import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Leaf, Lock, Mail, User, Sprout, AlertCircle, Eye, EyeOff, X, ShieldCheck } from "lucide-react";

const PASSWORD_RULES = "Use at least 8 characters with an uppercase letter, lowercase letter, number, and one of !@#$%^&*().";

export function AuthModal({ isOpen, onClose, defaultMode = "login", onAuthSuccess }) {
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signup({ name, email, password });
      }
      // Sign in after registration, or sign in directly.
      await login(email, password);
      onClose();
      onAuthSuccess?.();
    } catch (cause) {
      setError(cause.message || "Authentication failed. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay auth-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <div className="dialog-card auth-dialog-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" aria-describedby="auth-modal-description">
        <div className="dialog-heading auth-modal-heading">
          <div className="auth-brand-head">
            <span className="auth-logo-badge"><Leaf size={20} /></span>
            <div>
              <span className="section-kicker">INFYRO FARM CONNECT</span>
              <h2 id="auth-modal-title">{mode === "login" ? "Welcome back" : "Start growing with us"}</h2>
              <p id="auth-modal-description">{mode === "login" ? "Sign in to return to your farm workspace." : "Create your account and bring your farm into focus."}</p>
            </div>
          </div>
          <button type="button" className="icon-button auth-modal-close" aria-label="Close dialog" onClick={onClose} disabled={submitting}><X size={18} /></button>
        </div>

        {error && <div className="auth-error-banner" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && <label className="form-label">Full name<div className="input-with-icon"><User size={16} /><input type="text" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="e.g. Ravi Kumar" value={name} onChange={(event) => setName(event.target.value)} /></div></label>}
          <label className="form-label">Email address<div className="input-with-icon"><Mail size={16} /><input type="email" name="email" autoComplete="email" required autoFocus placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div></label>
          <label className="form-label">Password<div className="input-with-icon"><Lock size={16} /><input type={showPassword ? "text" : "password"} name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 8 : undefined} pattern={mode === "signup" ? "(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()])[A-Za-z0-9!@#$%^&*()]{8,}" : undefined} title={mode === "signup" ? PASSWORD_RULES : undefined} maxLength={128} placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
          {mode === "signup" && <p className="auth-password-help"><ShieldCheck size={14} /> {PASSWORD_RULES}</p>}
          <button type="submit" className="button-primary auth-submit-button" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Sign in to workspace" : "Create account"} <ArrowRight size={15} /></button>
        </form>

        <div className="auth-mode-switch">
          {mode === "login" ? "New to Infyro Farm Connect?" : "Already have an account?"}
          <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")} disabled={submitting}>{mode === "login" ? "Create an account" : "Sign in"}</button>
        </div>
        <div className="auth-footer-note"><Sprout size={14} /><span>Your session is protected with a secure, HttpOnly cookie.</span></div>
      </div>
    </div>
  );
}
