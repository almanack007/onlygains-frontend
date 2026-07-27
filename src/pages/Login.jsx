import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const Login = () => {
  const { loginUser, apiBase, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  
  // Google configuration state
  const [isRealGoogle, setIsRealGoogle] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const googleSignInRef = useRef(null);
  const googleSignUpRef = useRef(null);

  const mockGoogleUsers = [
    { name: 'Rohan Sharma', email: 'rohan.sharma@fittrack.in', color: 'emerald', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80' },
    { name: 'Priya Patel', email: 'priya.patel@fittrack.in', color: 'purple', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=120&h=120&q=80' },
    { name: 'Amit Verma', email: 'amit.verma@fittrack.in', color: 'blue', picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=120&h=120&q=80' }
  ];

  // Helper to decode JWT token returned by Google
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleCallback = (response) => {
    const payload = decodeJwt(response.credential);
    if (!payload) {
      showToast('Google Sign-In failed: invalid credential token', 'error');
      return;
    }

    const user = {
      id: 'google-' + payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      phone: localStorage.getItem('fittrack_phone') || '',
      color: 'emerald'
    };
    loginUser(user);
    showToast(`Welcome back, ${payload.name}!`, 'success');
  };

  // Fetch Google configurations from server and check client availability
  useEffect(() => {
    const checkGoogleConfig = async () => {
      try {
        const res = await fetch(`${apiBase}/config`);
        if (!res.ok) throw new Error('API config call failed');
        const data = await res.json();
        
        if (data.googleClientId && data.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
          setGoogleClientId(data.googleClientId);
          setIsRealGoogle(true);
        }
      } catch (err) {
        console.warn('Google configuration config not available:', err.message);
      }
    };
    checkGoogleConfig();
  }, [apiBase]);

  // Initialize and render Google Identity Services buttons if client is ready
  useEffect(() => {
    if (isRealGoogle && googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback
        });

        if (googleSignInRef.current) {
          window.google.accounts.id.renderButton(googleSignInRef.current, {
            theme: 'outline',
            size: 'large',
            width: 280,
            text: 'signin_with'
          });
        }

        if (googleSignUpRef.current) {
          window.google.accounts.id.renderButton(googleSignUpRef.current, {
            theme: 'outline',
            size: 'large',
            width: 280,
            text: 'signup_with'
          });
        }
      } catch (err) {
        console.error('Google Sign-In render error:', err);
      }
    }
  }, [isRealGoogle, googleClientId, activeTab]);

  const handleCredentialsLogin = (e) => {
    e.preventDefault();
    if (!email) return;
    const namePart = email.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    const user = {
      id: 'user-' + btoa(email).substring(0, 12),
      name,
      email,
      phone: '',
      color: 'emerald',
      picture: ''
    };
    loginUser(user);
    showToast(`Welcome back, ${name}!`, 'success');
  };

  const handleSignUpCredentials = (e) => {
    e.preventDefault();
    if (!signUpEmail) return;
    const namePart = signUpEmail.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    const user = {
      id: 'user-' + btoa(signUpEmail).substring(0, 12),
      name,
      email: signUpEmail,
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
    showToast(`Signed in with Google as ${mockUser.name}`, 'success');
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
    showToast(`Signed in as Guest`, 'success');
  };

  return (
    <section id="loginPage" className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass rounded-2xl p-6 sm:p-8 slide-up text-center">
        <p className="text-emerald-400 font-bold tracking-[.25em] text-xs uppercase">muscle building nutrition</p>
        <h1 className="text-3xl sm:text-4xl font-black mt-3 mb-4 text-slate-100 font-serif-editorial italic">FitTrack Pro</h1>
        
        {/* Tab Buttons */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 mb-6">
          <button 
            onClick={() => setActiveTab('signin')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'signin' ? 'bg-emerald-500 text-slate-950 neon font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setActiveTab('signup')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'signup' ? 'bg-emerald-500 text-slate-950 neon font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In panel */}
        {activeTab === 'signin' ? (
          <div id="panelSignIn" className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">Track your macros, hit your goals</p>
            
            {/* Real Google Sign In container OR simulated Google Sign In button */}
            {isRealGoogle ? (
              <div className="flex justify-center min-h-[44px] mb-4">
                <div ref={googleSignInRef}></div>
              </div>
            ) : (
              <button 
                onClick={() => setIsSimModalOpen(true)} 
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 px-5 py-3 transition mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-sm text-slate-200">Sign in with Google</span>
              </button>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs">or sign in with email</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>
            
            {/* Credentials Login Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-3 text-left">
              <label className="block">
                <span className="text-sm text-slate-300 font-medium">Email</span>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="mt-1.5 w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300 font-medium">Password</span>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Any password works" 
                  className="mt-1.5 w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500" 
                />
              </label>
              <p className="text-[10px] text-slate-500 text-center">Your email becomes your user ID. Data is stored locally and synced to the cloud.</p>
              <button type="submit" className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 neon hover:bg-emerald-400 transition text-sm">Sign In</button>
            </form>
          </div>
        ) : (
          /* Sign Up panel */
          <div id="panelSignUp" className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">Create a new account to start tracking</p>
            
            {/* Real Google Sign Up container OR simulated Google Sign Up button */}
            {isRealGoogle ? (
              <div className="flex justify-center min-h-[44px] mb-4">
                <div ref={googleSignUpRef}></div>
              </div>
            ) : (
              <button 
                onClick={() => setIsSimModalOpen(true)} 
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 px-5 py-3 transition mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-sm text-slate-200">Sign up with Google</span>
              </button>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs">or create an email account</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>
            
            {/* Credentials Sign Up Form */}
            <form onSubmit={handleSignUpCredentials} className="space-y-3 text-left">
              <label className="block">
                <span className="text-sm text-slate-300 font-medium">Email</span>
                <input 
                  type="email" 
                  required 
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="mt-1.5 w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300 font-medium">Password</span>
                <input 
                  type="password" 
                  required 
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create a password" 
                  className="mt-1.5 w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500" 
                />
              </label>
              <button type="submit" className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 neon hover:bg-emerald-400 transition text-sm">Create Account</button>
            </form>
          </div>
        )}

        {/* Guest Login */}
        <div className="mt-6 border-t border-slate-800 pt-4">
          <button 
            onClick={handleGuestLogin} 
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold tracking-wider uppercase transition"
          >
            Sign in as Guest (Offline Mode)
          </button>
        </div>
      </div>

      {/* Google Sign In Simulator Modal */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-sm glass rounded-2xl p-6 slide-up text-left">
            <h3 className="text-base font-bold text-slate-200 mb-2">Simulate Google Account Picker</h3>
            <p className="text-xs text-slate-400 mb-5">Select a simulated user profile to test authentication and real-time database persistence.</p>
            
            <div className="space-y-2 mb-6">
              {mockGoogleUsers.map((mockUser) => (
                <button
                  key={mockUser.email}
                  onClick={() => handleMockGoogleLogin(mockUser)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition text-left"
                >
                  <img src={mockUser.picture} className="w-10 h-10 rounded-full object-cover border border-slate-700 flex-shrink-0" alt={mockUser.name} />
                  <div>
                    <p className="font-semibold text-xs text-slate-200">{mockUser.name}</p>
                    <p className="text-[10px] text-slate-500">{mockUser.email}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsSimModalOpen(false)} 
              className="w-full rounded-xl border border-slate-700 bg-slate-900/55 py-2.5 text-xs text-slate-300 font-bold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
