'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router    = useRouter();
  const login     = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle industrial grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 text-center">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <Image src="/logo.png" alt="SRJ Sarathi" fill className="object-contain" />
          </div>
          <h1 className="text-white text-4xl font-black tracking-tight mb-2">SRJ Sarathi</h1>
          <p className="text-[#F97316] text-sm font-medium tracking-widest uppercase mb-6">
            Connect · Collaborate · Grow
          </p>
          <p className="text-[#757575] text-sm max-w-xs mx-auto leading-relaxed">
            The complete HRMS platform for SRJ Steel — built for the people who keep the steel moving.
          </p>
        </div>
        {/* Industrial silhouette strip */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10"
          style={{ background: 'linear-gradient(to top, #F97316, transparent)' }}
        />
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative w-20 h-20">
              <Image src="/logo.png" alt="SRJ Sarathi" fill className="object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Sign in</h2>
            <p className="text-[#757575] text-sm mt-1">Welcome back to SRJ Sarathi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Employee ID / Email */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Employee ID or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                placeholder="SRJ0001 or email@srjsteel.com"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0DC] bg-white text-[#1A1A1A] text-sm
                  placeholder:text-[#ABABAB] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                  transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#E2E0DC] bg-white text-[#1A1A1A] text-sm
                    placeholder:text-[#ABABAB] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                    transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#757575] transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !identifier || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                bg-orange-500 hover:bg-orange-600 active:bg-orange-700
                text-white font-semibold text-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                mt-6"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#ABABAB] mt-8">
            By signing in you agree to our{' '}
            <a href="/privacy" className="underline hover:text-[#757575]">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
