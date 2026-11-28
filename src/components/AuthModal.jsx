import { useRef, useState } from "react";
import UseAnimations from "react-useanimations";
import alertCircle from "react-useanimations/lib/alertCircle";
import arrowRight from "react-useanimations/lib/arrowRight";
import { ArrowRight, CheckCircle2, Circle, Eye, EyeOff, LoaderCircle, Lock, Mail, User, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

const allowedPassword = /^[A-Za-z0-9!@#$%^&*()]{8,128}$/;
const PASSWORD_HELP = "Use only letters, numbers and these special characters: !@#$%^&*()";

function PasswordRequirements({ password }) {
  const rules = [
    ["At least 8 characters", password.length >= 8],
    ["Uppercase and lowercase letters", /[A-Z]/.test(password) && /[a-z]/.test(password)],
    ["At least one number", /[0-9]/.test(password)],
    ["At least one special character", /[!@#$%^&*()]/.test(password)],
  ];
  const met = rules.filter(([, valid]) => valid).length;
  const validCharacters = /^[A-Za-z0-9!@#$%^&*()]*$/.test(password);
  return (
    <div className="ifc-auth-requirements" id="ifc-auth-password-rules">
      <div className="ifc-auth-requirements-head">
        <strong>Password requirements</strong>
        <span className={met === 4 && validCharacters ? "is-met" : ""} aria-live="polite">{met}/4 met</span>
      </div>
      <div className="ifc-auth-requirements-meter" aria-hidden="true">
        {rules.map(([label], index) => <i key={label} className={index < met ? "is-met" : ""} />)}
      </div>
      <ul>
        {rules.map(([label, valid]) => (
          <li key={label} className={valid ? "is-met" : ""}>
            {valid ? <CheckCircle2 size={13} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
            <span className="sr-only">{valid ? "Met: " : "Not met: "}</span>{label}
          </li>
        ))}
      </ul>
      <p className={!validCharacters ? "is-invalid" : ""}>{PASSWORD_HELP}</p>
    </div>
  );
}

function AuthForm({ defaultMode, submitting, setSubmitting, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(defaultMode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState("");
  const requestPending = useRef(false);
  const { login, signup } = useAuth();
  const isSignup = mode === "signup";

  function switchMode(nextMode) {
    if (submitting || requestPending.current || nextMode === mode) return;
    setMode(nextMode);
    setError("");
    setPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (requestPending.current || submitting) return;
    setError("");
    if (isSignup && (name.trim().length < 2 || name.trim().length > 100)) {
      setError("Enter your full name using 2 to 100 characters.");
      return;
    }
    if (isSignup && (!allowedPassword.test(password) || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()]/.test(password))) {
      setError("Your password must meet all four requirements and use the permitted characters.");
      return;
    }
    requestPending.current = true;
    setSubmitting(true);
    setShowPassword(false);
    setPhase(isSignup ? "creating" : "signing");
    let registered = false;
    try {
      if (isSignup) {
        await signup({ name, email, password });
        registered = true;
        setPhase("signing");
      }
      await login(email, password);
      onClose();
      onAuthSuccess?.();
    } catch (cause) {
      if (registered) {
        setMode("login");
        setPassword("");
        setError("Your account was created, but automatic sign-in failed. Please sign in with your password.");
      } else {
        setError(cause?.message || (isSignup ? "Unable to create your account. Please try again." : "Unable to sign in. Please check your details and try again."));
      }
    } finally {
      requestPending.current = false;
      setSubmitting(false);
      setPhase("");
    }
  }

  return (
    <>
      <div className="ifc-auth-brand-row">
        <div className="brand-logo ifc-auth-brand" aria-label="Infyro Farm">
          <span className="brand-logo-mark" aria-hidden="true"><img src="/infyro-farm-logo-3.png" alt="" /></span>
          <span className="brand-logo-copy">
            <span className="brand-logo-name"><span className="brand-logo-infyro">Infyro</span><span className="brand-logo-farm">Farm</span></span>
            <span className="brand-logo-tagline">FARM SMARTER. GROW BETTER.</span>
          </span>
        </div>
        <button type="button" className="ifc-auth-close" aria-label="Close dialog" data-tooltip="Close dialog" disabled={submitting} onClick={onClose}><X size={19} aria-hidden="true" /></button>
      </div>
      <div className="ifc-auth-heading" key={mode}>
        <DialogTitle>{isSignup ? "Let's grow together" : "Welcome back"}</DialogTitle>
        <DialogDescription>{isSignup ? "Create an account to start your farming journey." : "Sign in to manage your farm workspace."}</DialogDescription>
      </div>

      <Tabs value={mode} onValueChange={switchMode} className="ifc-auth-tabs">
        <TabsList aria-label="Authentication mode" className="ifc-auth-tabs-list">
          <TabsTrigger value="login" disabled={submitting}>Sign in</TabsTrigger>
          <TabsTrigger value="signup" disabled={submitting}>Sign up</TabsTrigger>
        </TabsList>
        <TabsContent value={mode} className="ifc-auth-tab-content">
          {error && (
            <Alert variant="destructive" className="ifc-auth-error">
              <span className="ifc-auth-error-icon" aria-hidden="true">
                <UseAnimations animation={alertCircle} size={22} interaction="loop" strokeColor="currentColor" />
              </span>
              <div>
                <AlertTitle>{isSignup ? "Unable to create account" : "Unable to sign in"}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="ifc-auth-form" aria-busy={submitting}>
            {isSignup && (
              <div className="ifc-auth-field">
                <label htmlFor="ifc-auth-name">Full name</label>
                <div className="ifc-auth-input-wrap">
                  <User size={16} aria-hidden="true" />
                  <Input id="ifc-auth-name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Enter your full name" disabled={submitting} value={name} onChange={(event) => setName(event.target.value)} data-auth-initial-focus="" />
                </div>
              </div>
            )}
            <div className="ifc-auth-field">
              <label htmlFor="ifc-auth-email">Email address</label>
              <div className="ifc-auth-input-wrap">
                <Mail size={16} aria-hidden="true" />
                <Input id="ifc-auth-email" type="email" name="email" autoComplete="email" required placeholder="you@example.com" disabled={submitting} value={email} onChange={(event) => setEmail(event.target.value)} data-auth-initial-focus={!isSignup ? "" : undefined} />
              </div>
            </div>
            <div className="ifc-auth-field">
              <label htmlFor="ifc-auth-password">Password</label>
              <div className="ifc-auth-input-wrap">
                <Lock size={16} aria-hidden="true" />
                <Input id="ifc-auth-password" type={showPassword ? "text" : "password"} name="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : undefined} maxLength={128} aria-describedby={isSignup ? "ifc-auth-password-rules" : undefined} disabled={submitting} placeholder={isSignup ? "Create a strong password" : "Enter your password"} value={password} onChange={(event) => setPassword(event.target.value)} />
                <button type="button" className="ifc-auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} data-tooltip={showPassword ? "Hide password" : "Show password"} aria-controls="ifc-auth-password" disabled={submitting} onClick={() => setShowPassword(visible => !visible)}>
                  <span key={String(showPassword)} className="ifc-auth-eye">{showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}</span>
                </button>
              </div>
            </div>
            {isSignup && <PasswordRequirements password={password} />}
            <button type="submit" className="button-primary ifc-auth-submit" disabled={submitting}>
              {submitting ? <><LoaderCircle size={16} className="ifc-auth-spinner" aria-hidden="true" />{phase === "creating" ? "Creating your account…" : "Signing in…"}</> : <>{isSignup ? "Create account" : "Sign in"}<UseAnimations animation={arrowRight} size={18} interaction="hover" strokeColor="currentColor" render={(eventProps, animationProps) => <span {...eventProps} {...animationProps} aria-hidden="true" />} /></>}
            </button>
          </form>
        </TabsContent>
      </Tabs>
      <div className="ifc-auth-footer">
        <span>{isSignup ? "Already have an account?" : "New to Infyro Farms?"}</span>
        <button type="button" disabled={submitting} onClick={() => switchMode(isSignup ? "login" : "signup")}>{isSignup ? "Sign in" : "Create account"}<ArrowRight size={12} aria-hidden="true" /></button>
      </div>
    </>
  );
}

export function AuthModal({ isOpen, onClose, defaultMode = "login", onAuthSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const previousFocus = useRef(null);
  function close() {
    if (!submitting) onClose();
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent
        className="ifc-auth-dialog"
        overlayClassName="ifc-auth-overlay"
        showCloseButton={false}
        onEscapeKeyDown={(event) => { if (submitting) event.preventDefault(); }}
        onInteractOutside={(event) => { if (submitting) event.preventDefault(); }}
        onOpenAutoFocus={(event) => {
          previousFocus.current = document.activeElement;
          const field = event.target?.querySelector?.("[data-auth-initial-focus]");
          if (field) { event.preventDefault(); field.focus({ preventScroll: true }); }
        }}
        onCloseAutoFocus={(event) => {
          if (previousFocus.current?.isConnected) {
            event.preventDefault();
            previousFocus.current.focus({ preventScroll: true });
          }
        }}
      >
        <AuthForm defaultMode={defaultMode} submitting={submitting} setSubmitting={setSubmitting} onClose={onClose} onAuthSuccess={onAuthSuccess} />
      </DialogContent>
    </Dialog>
  );
}
