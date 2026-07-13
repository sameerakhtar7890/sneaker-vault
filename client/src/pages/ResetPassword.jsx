import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid recovery link. The token is missing.');
    }
  }, [token]);

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Cannot reset password without a valid token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      addToast('Password reset successful!', 'success');
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to reset password. The link may have expired.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="section-eyebrow mb-2">SECURITY</p>
          <h1 className="font-display text-4xl">Reset Password</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Enter your new password below
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-card">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-2">
                <CheckCircle size={24} />
              </div>
              <h2 className="font-display text-xl text-zinc-100">Password Updated</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your password has been successfully reset. You can now use your new password to sign in.
              </p>
              <div className="pt-4">
                <Link to="/login" className="btn-gold w-full text-sm">
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Only show form if there's a token or we didn't start with a missing token error */}
              {token ? (
                <form onSubmit={submit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="input-premium pl-11 pr-11 py-3"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        id="reset-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="input-premium pl-11 pr-11 py-3"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="reset-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting password…' : 'Reset Password'}
                  </button>
                </form>
              ) : (
                <div className="text-center pt-2">
                  <Link to="/login" className="btn-gold w-full text-sm">
                    Back to Sign In
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
