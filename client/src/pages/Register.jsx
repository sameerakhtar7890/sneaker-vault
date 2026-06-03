import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      addToast('Account created successfully!', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <p className="text-gold tracking-[0.3em] text-xs mb-2">JOIN THE VAULT</p>
          <h1 className="font-display text-4xl">Create Account</h1>
          <p className="text-zinc-400 mt-2 text-sm">Start your sneaker journey today</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-name"
                  type="text" name="name" value={form.name} onChange={handle} required
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm
                             focus:outline-none focus:border-gold/50 transition placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-email"
                  type="email" name="email" value={form.email} onChange={handle} required
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm
                             focus:outline-none focus:border-gold/50 transition placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-password"
                  type={show ? 'text' : 'password'} name="password" value={form.password} onChange={handle} required
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-sm
                             focus:outline-none focus:border-gold/50 transition placeholder-zinc-600"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-confirm"
                  type={show ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handle} required
                  placeholder="Repeat password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm
                             focus:outline-none focus:border-gold/50 transition placeholder-zinc-600"
                />
              </div>
            </div>

            <button id="reg-submit" type="submit" disabled={loading}
              className="btn-gold w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-soft transition">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
