import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../lib/api';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  Coins, 
  Lock, 
  Shield, 
  Save, 
  Moon,
  Sparkles,
  Mail,
  Smartphone,
  CheckCircle,
  HelpCircle,
  KeyRound
} from 'lucide-react';

const Settings = () => {
  const { user, authenticated } = useAuth();
  const { showToast } = useToast();
  const { currency, setCurrency } = useCurrency();

  // State bindings
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    walletAddress: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('[Fetch Profile Error]', err.message);
      showToast('Synchronization error: failed to load user profiles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchProfile();
    }
  }, [authenticated]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', {
        displayName: profile.displayName,
        currency: currency
      });

      if (res.success) {
        setProfile(res.data);
        showToast('Profile configuration updated successfully!', 'success');
        
        // Context handles local storage and events internally now.
      }
    } catch (err) {
      console.error('[Update Profile Error]', err.message);
      showToast('Failed to save configuration settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto p-4 animate-pulse text-left font-sans">
        <div className="h-28 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 bg-white/5 rounded-3xl md:col-span-1" />
          <div className="h-64 bg-white/5 rounded-3xl md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans text-left pb-16">
      
      {/* 1. Glassmorphic Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-8 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="space-y-2 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
            User Control Center
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Account <span className="text-gradient-orchid">Preferences</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Control display preferences, configure local reporting currency options, and verify decentralized Privy session keys.
          </p>
        </div>

        {/* Dynamic Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-purple-500/20 px-4 py-2.5 rounded-2xl border border-amber-500/30 relative z-10 self-start md:self-center animate-pulse">
          <Sparkles className="h-4.5 w-4.5 text-amber-400" />
          <div className="text-xs text-left">
            <span className="block font-bold text-amber-300">SpendWise Premium</span>
            <span className="text-[10px] text-muted-foreground">Pro Account Active</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Grid Dashboard Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Decentralized Session Attributes */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6 lg:col-span-1"
        >
          {/* Auth Keys Info Panel */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Privy Security Keys</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground block">Session User UID</span>
                <code className="block text-[10px] font-mono text-white p-2 rounded-xl bg-white/5 truncate border border-white/5 hover:bg-white/10 transition-colors" title={profile.privyId}>
                  {profile.privyId}
                </code>
              </div>

              {profile.email && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/2 border border-white/5">
                  <Mail className="h-4 w-4 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-semibold text-muted-foreground block">Linked Email</span>
                    <span className="text-xs text-white truncate block">{profile.email}</span>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/2 border border-white/5">
                  <Smartphone className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-semibold text-muted-foreground block">Linked Phone</span>
                    <span className="text-xs text-white truncate block">{profile.phone}</span>
                  </div>
                </div>
              )}

              {profile.walletAddress && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/2 border border-white/5">
                  <Wallet className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-semibold text-muted-foreground block">Secured Smart Wallet</span>
                    <span className="text-xs text-white truncate font-mono block">{profile.walletAddress}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 text-center space-y-4 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <KeyRound className="h-32 w-32 text-primary" />
            </div>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">End-to-End Cryptography</h3>
              <p className="text-[10px] text-muted-foreground px-2 leading-relaxed">
                Your financial ledgers are fully sealed using local keys in mock development mode. Your data is safe.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Configuration Inputs Form */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6"
        >
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              <span>Personalization & Settings</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Customize your general accounting interface preferences</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Display Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">Custom Display Name</label>
              <input
                type="text"
                placeholder="Enter customized account name (e.g. Satoshi Nakamoto)"
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <p className="text-[10px] text-muted-foreground">
                Appears on dynamic header banners and reports.
              </p>
            </div>

            {/* Currency Select Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">Reporting Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors font-sans appearance-none cursor-pointer"
                >
                  <option value="USD" className="bg-[#120822] text-white">USD ($) - United States Dollar</option>
                  <option value="EUR" className="bg-[#120822] text-white">EUR (€) - Euro</option>
                  <option value="GBP" className="bg-[#120822] text-white">GBP (£) - British Pound</option>
                  <option value="INR" className="bg-[#120822] text-white">INR (₹) - Indian Rupee</option>
                  <option value="CAD" className="bg-[#120822] text-white">CAD ($) - Canadian Dollar</option>
                  <option value="AUD" className="bg-[#120822] text-white">AUD ($) - Australian Dollar</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Determines visual currency prefixes throughout transaction ledgers and statistics.
              </p>
            </div>

            {/* Simulated Appearance Modes (Disabled placeholder) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block opacity-70">App Interface Theme</label>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/2 border border-white/5 opacity-60">
                <Moon className="h-4.5 w-4.5 text-primary" />
                <div className="flex-1 text-left">
                  <span className="block text-xs font-bold text-white">Dark SpendWise Glassmorphism</span>
                  <span className="text-[9px] text-muted-foreground block">System default lock mode (Tailwind configurations locked for visual excellence)</span>
                </div>
              </div>
            </div>

            {/* Save Form Actions */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-orchid-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>

          </form>

        </motion.div>

      </div>

    </div>
  );
};

export default Settings;
