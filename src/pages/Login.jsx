import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Mail, Key, ArrowRight, Sparkles, Loader } from 'lucide-react';

export const Login = () => {
  const { loginUser, apiBase, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Detect if running inside a Capacitor native WebView
  const isNativeApp = () => {
    return (
      !!window.Capacitor ||
      window.location.origin.startsWith('capacitor://') ||
      window.location.origin === 'http://localhost' ||
      window.location.origin === 'https://localhost'
    );
  };

  const mockGoogleUsers = [
    { name: 'Rohan Sharma', email: 'rohan.sharma@fittrack.in', color: 'emerald', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80' },
    { name: 'Priya Patel', email: 'priya.patel@fittrack.in', color: 'purple', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=120&h=120&q=80' },
    { name: 'Amit Verma', email: 'amit.verma@fittrack.in', color: 'blue', picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=120&h=120&q=80' }
  ];

  // Fetch Google Client ID from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${apiBase}/config`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.googleClientId && data.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
          setGoogleClientId(data.googleClientId);
        }
      } catch (err) {
        console.warn('Could not fetch google config:', err.message);
      }
    };
    fetchConfig();
  }, [apiBase]);

  // Wait for GSI script to load, then initialize
  useEffect(() => {
    if (!googleClientId) return;
    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleIdTokenCallback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    };
    if (window.google?.accounts?.id) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          init();
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  // Callback for ID token flow (from renderButton)
  const handleIdTokenCallback = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        decodeURIComponent(
          window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        )
      );
      const user = {
        id: 'google-' + payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture || '',
        phone: localStorage.getItem('fittrack_phone') || '',
        color: 'emerald'
      };
      loginUser(user);
      showToast(`Welcome, ${payload.name}!`, 'success');
    } catch (e) {
      showToast('Google Sign-In failed. Please try again.', 'error');
    }
  };

  // Callback for OAuth2 token flow (from popup button)
  const handleOAuth2Token = async (accessToken) => {
    try {
      setGoogleLoading(true);
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const info = await res.json();
      if (!info.email) throw new Error('No email returned');
      const user = {
        id: 'google-' + (info.sub || btoa(info.email).substring(0, 12)),
        name: info.name || info.email.split('@')[0],
        email: info.email,
        picture: info.picture || '',
        phone: localStorage.getItem('fittrack_phone') || '',
        color: 'emerald'
      };
      loginUser(user);
      showToast(`Welcome, ${user.name}!`, 'success');
    } catch (e) {
      showToast('Failed to retrieve Google profile. Please try again.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Main Google button click handler
  const handleGoogleButtonClick = () => {
    // On native app: always use simulated picker
    if (isNativeApp()) {
      setIsSimModalOpen(true);
      return;
    }

    // On web: use OAuth2 popup token flow (most reliable)
    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: (response) => {
            if (response.error) {
              showToast('Google Sign-In was cancelled.', 'error');
              return;
            }
            handleOAuth2Token(response.access_token);
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth2 popup failed:', err);
      }
    }

    // Final fallback: simulated picker
    setIsSimModalOpen(true);
  };

  const handleCredentialsLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const user = {
      id: 'user-' + btoa(email).substring(0, 12),
      name: email.split('@')[0],
      email: email,
      phone: localStorage.getItem('fittrack_phone') || '',
      color: 'emerald',
      picture: ''
    };
    loginUser(user);
    showToast('Logged in successfully!', 'success');
  };

  const handleSignUpCredentials = (e) => {
    e.preventDefault();
    const mail = signUpEmail.trim();
    const pass = signUpPassword.trim();
    if (!mail || !pass) return;
    if (pass.length < 4) {
      showToast('Password must be at least 4 characters long', 'error');
      return;
    }
    const name = mail.split('@')[0];
    const user = {
      id: 'user-' + btoa(mail).substring(0, 12),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: mail,
      phone: '',
      color: 'emerald',
      picture: ''
    };
    loginUser(user);
    showToast(`Account created for ${name}!`, 'success');
  };

  const handleMockGoogleLogin = (mockUser) => {
    const user = {
      id: 'user-' + btoa(mockUser.email).substring(0, 12),
      name: mockUser.name,
      email: mockUser.email,
      phone: '',
      color: mockUser.color,
      picture: mockUser.picture
    };
    loginUser(user);
    setIsSimModalOpen(false);
    showToast(`Signed in as ${mockUser.name}`, 'success');
  };

  const handleGuestLogin = () => {
    const user = {
      id: 'guest-' + Math.random().toString(36).substring(2, 11),
      name: 'Guest User',
      email: 'guest@domain.com',
      phone: '',
      color: 'blue',
      picture: ''
    };
    loginUser(user);
    showToast('Signed in as Guest', 'success');
  };

  // Reusable Google button — always visible, always works
  const GoogleButton = ({ label }) => (
    <button
      type="button"
      onClick={handleGoogleButtonClick}
      disabled={googleLoading}
      className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 px-5 py-3.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] mb-4 disabled:opacity-60"
    >
      {googleLoading ? (
        <Loader className="w-5 h-5 text-emerald-500 animate-spin" />
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
        {googleLoading ? 'Signing in...' : label}
      </span>
    </button>
  );

  return (
    <section id="loginPage" className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none z-0"></div>

      <div className="w-full max-w-[420px] glass p-8 sm:p-10 slide-up text-center relative z-10">
        
        {/* Brand Header */}
        <div className="mb-8">
          <div className="w-14 h-14 mx-auto rounded-[20px] bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(204,255,0,0.1)]">
            <Activity className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-emerald-500 font-brand-serif italic tracking-widest text-[11px] uppercase mb-2">FitTrack Pro</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Simply, Snap a pic.</h1>
          <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto">AI-powered macro tracking and nutritional insight built for high performance.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-850 mb-6">
          <button onClick={() => setActiveTab('signin')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'signin' ? 'bg-emerald-500 text-slate-950 neon' : 'text-slate-500 hover:text-slate-350'}`}>
            Sign In
          </button>
          <button onClick={() => setActiveTab('signup')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'signup' ? 'bg-emerald-500 text-slate-950 neon' : 'text-slate-500 hover:text-slate-350'}`}>
            Sign Up
          </button>
        </div>

        {/* Sign In panel */}
        {activeTab === 'signin' ? (
          <div id="panelSignIn" className="space-y-4">
            <GoogleButton label="Sign in with Google" />
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-900"></div>
              <span className="flex-shrink mx-4 text-slate-650 text-[10px] uppercase font-black tracking-widest">or email</span>
              <div className="flex-grow border-t border-slate-900"></div>
            </div>
            <form onSubmit={handleCredentialsLogin} className="space-y-4 text-left">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Email Address</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Password</span>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter any password" className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed text-center py-1">Your email identifies your profile. Data syncs to Supabase instantly.</p>
              <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-black uppercase tracking-wider text-slate-950 neon hover:bg-emerald-450 transition duration-300 text-xs">
                <span>Access FitTrack</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div id="panelSignUp" className="space-y-4">
            <GoogleButton label="Sign up with Google" />
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-900"></div>
              <span className="flex-shrink mx-4 text-slate-650 text-[10px] uppercase font-black tracking-widest">or register</span>
              <div className="flex-grow border-t border-slate-900"></div>
            </div>
            <form onSubmit={handleSignUpCredentials} className="space-y-4 text-left">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Email Address</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input type="email" required value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Create Password</span>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input type="password" required value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="Min. 4 characters" className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" />
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-black uppercase tracking-wider text-slate-950 neon hover:bg-emerald-450 transition duration-300 text-xs">
                <span>Register Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Guest Login */}
        <div className="mt-8 border-t border-slate-900 pt-5">
          <button onClick={handleGuestLogin} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-black tracking-widest uppercase transition-colors">
            Sign in as Guest (Offline Mode)
          </button>
        </div>
      </div>

      {/* Google Account Picker Modal (mobile fallback) */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-wider">Choose Google Account</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-5">Select a profile to sign in and sync your fitness data.</p>
            <div className="space-y-2 mb-6">
              {mockGoogleUsers.map((mockUser) => (
                <button key={mockUser.email} onClick={() => handleMockGoogleLogin(mockUser)} className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition duration-300 text-left">
                  <img src={mockUser.picture} className="w-10 h-10 rounded-full object-cover border border-slate-800 flex-shrink-0" alt={mockUser.name} />
                  <div>
                    <p className="font-bold text-xs text-slate-200">{mockUser.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{mockUser.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setIsSimModalOpen(false)} className="w-full rounded-2xl border border-slate-850 bg-slate-900/80 py-3 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
