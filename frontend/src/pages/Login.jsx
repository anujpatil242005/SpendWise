import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { SignIn } from '@clerk/clerk-react';
import { Wallet, Sparkles, Mail, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const { authenticated, ready, login, syncing, isMock } = useAuth();
  const navigate = useNavigate();

  // If already authenticated and not syncing, redirect directly to dashboard
  useEffect(() => {
    if (ready && authenticated && !syncing) {
      navigate('/');
    }
  }, [ready, authenticated, syncing, navigate]);

  if (!ready || (authenticated && syncing)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative font-sans">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none select-none z-0" />
        <div className="text-center space-y-4 relative z-10">
          <div className="h-12 w-12 rounded-full border-t-2 border-primary border-r-2 border-primary/40 animate-spin mx-auto shadow-orchid-glow-sm" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider animate-pulse">
            Synchronizing financial node...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
      
      {/* Premium Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none select-none z-0 dark:block hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none select-none z-0 dark:block hidden" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center z-10 relative">
        
        {/* Left Side: Brand Value Props */}
        <div className="space-y-8 pr-0 md:pr-8 text-center md:text-left">
          <div className="space-y-4">
            <img src={logoImg} alt="SpendWise Logo" className="h-16 w-16 object-contain mx-auto md:mx-0 animate-pulse" />
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Spend<span className="text-gradient-orchid">Wise</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground tracking-wider uppercase font-semibold">
                Dynamic Global Currency Expense Intelligence
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto md:mx-0 text-left pt-6 border-t border-white/5">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/20 shrink-0 mt-0.5">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Passwordless Magic Links & OTP</span>
                <span className="block text-[11px] text-muted-foreground">Sign in instantly and securely without passwords using modern email confirmation links or codes.</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Enterprise-Grade Clerk Security</span>
                <span className="block text-[11px] text-muted-foreground">Your account authentication, session management, and verification states are fully protected by Clerk.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="flex justify-center">
          {isMock ? (
            /* Mock Login Box */
            <div className="w-full max-w-md p-8 rounded-3xl glass-panel relative border border-primary/20 shadow-orchid-glow text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Developer Sandbox</h2>
                <p className="text-xs text-muted-foreground">Clerk API Keys are unconfigured. Use our instant-connect emulator to test all ledger pages.</p>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-xs text-left text-muted-foreground space-y-2">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Mock Credentials Provisioned
                </p>
                <p>• Email: <code className="text-primary font-mono">spendwise.beginner@example.com</code></p>
                <p>• Environment: <code className="text-emerald-400 font-mono">Offline Local Sandbox</code></p>
              </div>

              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/95 text-white transition-all shadow-orchid-glow cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="h-4.5 w-4.5" />
                <span>Simulate Admin Sign-In</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Real Clerk Sign In */
            <div className="relative group w-full max-w-md">
              {/* Outer soft aura glow */}
              <div className="absolute inset-0 bg-primary/10 rounded-[28px] blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />
              <SignIn
                appearance={{
                  variables: {
                    colorPrimary: '#a855f7',
                    colorBackground: '#0d0d15',
                    colorInputBackground: '#171725',
                    colorInputText: '#ffffff',
                    colorText: '#ffffff',
                    colorTextSecondary: '#94a3b8',
                    colorTextOnPrimaryBackground: '#ffffff',
                  },
                  elements: {
                    card: 'bg-black/30 border border-primary/25 rounded-3xl shadow-2xl backdrop-blur-xl p-8 w-full font-sans',
                    headerTitle: 'text-2xl font-extrabold text-white tracking-tight',
                    headerSubtitle: 'text-xs text-muted-foreground',
                    socialButtonsBlockButton: 'border border-white/10 hover:bg-white/5 text-white bg-white/5 transition-all duration-200',
                    socialButtonsBlockButtonText: 'text-white font-medium text-xs',
                    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white font-extrabold text-sm py-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-orchid-glow-sm cursor-pointer',
                    formFieldLabel: 'text-[10px] font-bold text-muted-foreground uppercase tracking-wider',
                    formFieldInput: 'border border-white/10 text-white placeholder-white/20 bg-white/5 hover:border-white/20 focus:border-primary/50 text-sm py-2 rounded-xl transition-all',
                    footerActionLink: 'text-primary hover:text-primary/90 font-bold',
                    dividerLine: 'bg-white/10',
                    dividerText: 'text-muted-foreground/60 text-[10px] font-bold uppercase',
                  }
                }}
                signUpUrl="/login"
                afterSignInUrl="/"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;
