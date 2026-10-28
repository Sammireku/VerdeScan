// AuthModal: Robust Sign In and Sign Up system for VerdeScan users
import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, DEMO_USERS, type UserAccount } from '../lib/auth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { currentUser, signIn, signUp, signOut, switchUser, availableUsers } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'profiles'>('signin');

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpLocation, setSignUpLocation] = useState('Greater Accra, Ghana');
  const [signUpRole, setSignUpRole] = useState<'grower' | 'agronomist' | 'hobbyist'>('grower');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!signInEmail) {
      setError('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(signInEmail, signInPassword);
      setSuccess('Signed in successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 700);
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!signUpName || !signUpEmail) {
      setError('Please provide your name and email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp({
        name: signUpName,
        email: signUpEmail,
        location: signUpLocation,
        role: signUpRole,
      });
      setSuccess('Account created successfully! Welcome to VerdeScan.');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 700);
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-[#E6EBE4] max-h-[92vh] overflow-y-auto">
        {/* Header with App Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_qaoaufqaoaufqaoa_7088432d.jpeg"
              alt="VerdeScan Logo"
              className="w-10 h-10 object-contain rounded-xl border border-[#E6EBE4] p-0.5"
            />
            <div>
              <h3 className="font-extrabold text-base text-[#19201D] leading-tight">
                VerdeScan Account
              </h3>
              <p className="text-[11px] text-[#5E6D65]">
                Sync crop health, garden plots, and diagnosis history
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-black flex items-center justify-center text-xs font-bold touch-target"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Pill if logged in */}
        {currentUser && (
          <div className="bg-[#F6F8F5] p-3 rounded-2xl border border-[#E6EBE4] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1A3B29] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-[#19201D]">{currentUser.name}</p>
                <p className="text-[10px] text-[#5E6D65]">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('profiles')}
                className="text-[11px] font-bold text-[#1A3B29] hover:underline"
              >
                Switch
              </button>
              <button
                type="button"
                onClick={signOut}
                className="text-stone-400 hover:text-[#BC4749] p-1"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="bg-[#EBF0E9] p-1 rounded-2xl flex items-center">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all touch-target ${
              tab === 'signin'
                ? 'bg-[#182635] text-white shadow-xs'
                : 'text-[#5E6D65] hover:text-[#19201D]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all touch-target ${
              tab === 'signup'
                ? 'bg-[#182635] text-white shadow-xs'
                : 'text-[#5E6D65] hover:text-[#19201D]'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('profiles');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all touch-target ${
              tab === 'profiles'
                ? 'bg-[#182635] text-white shadow-xs'
                : 'text-[#5E6D65] hover:text-[#19201D]'
            }`}
          >
            Profiles
          </button>
        </div>

        {/* Error / Success banners */}
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs text-[#BC4749] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-[#D8F3DC] border border-[#B7E4C7] rounded-xl text-xs text-[#1A3B29] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {tab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="e.g. ryan@verdescan.org"
                  className="w-full text-xs font-medium bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl pl-9 pr-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#5E6D65]">Password</label>
                <span className="text-[10px] text-[#78C441] hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-medium bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl pl-9 pr-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="touch-target w-full bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px] mt-2"
            >
              <span>Sign In to VerdeScan</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-[#E6EBE4]">
              <span className="text-[11px] font-bold text-[#5E6D65] block mb-2">
                Quick Demo Logins:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSignInEmail(user.email);
                      signIn(user.email);
                      setSuccess(`Welcome, ${user.name}!`);
                      setTimeout(() => {
                        setSuccess(null);
                        onClose();
                      }, 600);
                    }}
                    className="p-2 rounded-xl bg-[#F6F8F5] border border-[#E6EBE4] hover:border-[#78C441] text-left transition-all"
                  >
                    <p className="text-[11px] font-bold text-[#19201D] truncate">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[9px] text-[#5E6D65] capitalize truncate">{user.role}</p>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Ama Darko"
                  className="w-full text-xs font-medium bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl pl-9 pr-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="e.g. ama@farm.org"
                  className="w-full text-xs font-medium bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl pl-9 pr-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs font-medium bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl pl-9 pr-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5E6D65]">Role</label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value as typeof signUpRole)}
                  className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-2.5 py-2.5 min-h-[44px]"
                >
                  <option value="grower">Smallholder Grower</option>
                  <option value="agronomist">Extension Officer</option>
                  <option value="hobbyist">Urban / Indoor Hobbyist</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5E6D65]">Farm Region</label>
                <input
                  type="text"
                  value={signUpLocation}
                  onChange={(e) => setSignUpLocation(e.target.value)}
                  placeholder="e.g. Kumasi, Ghana"
                  className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-2.5 py-2.5 min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="touch-target w-full bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px] mt-2"
            >
              <span>Create Account</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: PROFILES SWITCHER */}
        {tab === 'profiles' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#5E6D65]">Available Profiles:</span>
            <div className="space-y-2">
              {availableUsers.map((user) => {
                const isActive = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setSuccess(`Switched to ${user.name}`);
                      setTimeout(() => {
                        setSuccess(null);
                        onClose();
                      }, 500);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-[#D8F3DC]/60 border-[#78C441]'
                        : 'bg-[#F6F8F5] border-[#E6EBE4] hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A3B29] text-white font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#19201D] leading-tight">
                          {user.name}
                        </h4>
                        <p className="text-[10px] text-[#5E6D65]">{user.email}</p>
                        <p className="text-[9px] text-[#78C441] font-semibold capitalize mt-0.5">
                          {user.role} • {user.location}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-bold text-[#78C441] bg-white px-2 py-0.5 rounded-full border border-[#B7E4C7]">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
