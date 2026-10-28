import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Leaf, Lock, Mail, User, Sprout, AlertCircle } from 'lucide-react';

export function AuthModal({ isOpen, onClose, defaultMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(defaultMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup({ name, email, password });
        // After signup, automatically login
        await login(email, password);
      }
      onClose();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials or try demo mode.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog-card auth-dialog-card" role="dialog" aria-modal="true">
        <div className="dialog-heading">
          <div className="auth-brand-head">
            <span className="auth-logo-badge"><Leaf size={20} /></span>
            <div>
              <span className="section-kicker">INFYRO FARM CONNECT</span>
              <h2>{mode === 'login' ? 'Sign in to your farm' : 'Create farm account'}</h2>
            </div>
          </div>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label className="form-label">
              Full Name
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </label>
          )}

          <label className="form-label">
            Email address
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                required
                autoFocus
                placeholder="name@farm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="form-label">
            Password
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          <div className="dialog-actions auth-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Create new account' : 'Already registered? Sign in'}
            </button>
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <div className="auth-footer-note">
          <Sprout size={14} />
          <span>Connected directly with the IFC Backend Service.</span>
        </div>
      </div>
    </div>
  );
}

