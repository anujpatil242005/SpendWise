import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { TransactionRowSkeleton } from '../components/SkeletonLoader';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Sparkles,
  Wallet,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  PiggyBank,
  TrendingDown,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  DollarSign,
  Coffee,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Heart,
  Layers,
  Activity
} from 'lucide-react';

// HSL color configurations matching expense categories
const categoryMap = {
  'Food': { icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'Travel': { icon: Car, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  'Shopping': { icon: ShoppingBag, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  'Entertainment': { icon: Film, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  'Bills': { icon: FileText, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  'Health': { icon: Heart, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'Other': { icon: Layers, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  'default': { icon: Activity, color: 'text-primary bg-primary/10 border-primary/20' }
};

const Budget = () => {
  const { authenticated } = useAuth();
  const { showToast } = useToast();
  const { formatCurrency, formatCurrencyCompact, currencySymbol } = useCurrency();

  // Core Data States
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState('');
  const [categoryLimitsInput, setCategoryLimitsInput] = useState({
    Food: '',
    Travel: '',
    Shopping: '',
    Entertainment: '',
    Bills: '',
    Health: '',
    Other: ''
  });
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Budget Page] Fetching monthly budget analytics...');
      
      const res = await api.get('/budget');
      if (res.success) {
        setBudgetData(res.data);
        
        // Pre-fill form values
        if (res.data.budget) {
          setMonthlyLimitInput(res.data.budget.monthlyLimit.toString());
          
          const existingLimits = res.data.budget.categoryLimits || {};
          const newLimits = { ...categoryLimitsInput };
          Object.keys(newLimits).forEach(cat => {
            newLimits[cat] = existingLimits[cat] !== undefined ? existingLimits[cat].toString() : '';
          });
          setCategoryLimitsInput(newLimits);
        }
      }
    } catch (err) {
      console.error('[Budget Page Error] Sync failed:', err.message);
      setError('Unable to link with financial server. Run your local database or backend instances.');
      showToast('Synchronization failure: database offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchBudgetData();
    }
  }, [authenticated]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setError('');
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setError('');

    if (!monthlyLimitInput || Number(monthlyLimitInput) < 1) {
      return setError('Please enter a valid monthly budget limit (minimum ₹1).');
    }

    try {
      setIsSubmitting(true);
      console.log('[Budget Page] Dispatching postBudget upsert request...');

      // Build category limit payload, filtering out empty inputs
      const formattedCategoryLimits = {};
      Object.keys(categoryLimitsInput).forEach(cat => {
        const val = categoryLimitsInput[cat];
        if (val && Number(val) > 0) {
          formattedCategoryLimits[cat] = Number(val);
        }
      });

      const payload = {
        monthlyLimit: Number(monthlyLimitInput),
        categoryLimits: formattedCategoryLimits
      };

      const res = await api.post('/budget', payload);
      if (res.success) {
        showToast('Monthly budget successfully configured', 'success');
        fetchBudgetData();
        handleCloseModal();
      }
    } catch (err) {
      console.error('[Budget Save Error]:', err.message);
      setError(err.message || 'Failed to save budget settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (window.confirm('Are you sure you want to permanently delete your monthly budget settings? This will clear all category targets.')) {
      try {
        console.log('[Budget Page] Deleting budget configuration...');
        const res = await api.delete('/budget');
        if (res.success) {
          showToast('Budget configuration removed', 'warning');
          setMonthlyLimitInput('');
          setCategoryLimitsInput({
            Food: '',
            Travel: '',
            Shopping: '',
            Entertainment: '',
            Bills: '',
            Health: '',
            Other: ''
          });
          fetchBudgetData();
        }
      } catch (err) {
        console.error('[Budget Delete Error]:', err.message);
        showToast('Failed to delete budget configuration.', 'error');
      }
    }
  };

  const handleCategoryLimitChange = (cat, val) => {
    setCategoryLimitsInput(prev => ({
      ...prev,
      [cat]: val
    }));
  };

  // Helper colors and statuses based on usage
  const getProgressStyles = (percent) => {
    if (percent >= 100) return { barColor: 'bg-gradient-to-r from-red-500 to-rose-600', textColor: 'text-red-400', glow: 'shadow-red-500/20' };
    if (percent >= 90) return { barColor: 'bg-rose-500', textColor: 'text-rose-400', glow: 'shadow-rose-500/20' };
    if (percent >= 70) return { barColor: 'bg-amber-500', textColor: 'text-amber-400', glow: 'shadow-amber-500/20' };
    return { barColor: 'bg-emerald-500', textColor: 'text-emerald-400', glow: 'shadow-emerald-500/20' };
  };

  if (loading && !budgetData) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto p-4 animate-pulse">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-white/5 rounded-3xl" />
          <div className="h-28 bg-white/5 rounded-3xl" />
          <div className="h-28 bg-white/5 rounded-3xl" />
          <div className="h-28 bg-white/5 rounded-3xl" />
        </div>
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  const hasBudget = budgetData?.budget && budgetData.monthlyLimit > 0;
  const limit = budgetData?.monthlyLimit || 0;
  const spent = budgetData?.monthlySpent || 0;
  const remaining = budgetData?.remaining ?? 0;
  const percent = budgetData?.usagePercent || 0;
  const alertLevel = budgetData?.alertLevel || 'safe';
  
  // Resolve category spending matching active items
  const categoryBreakdown = budgetData?.categoryBreakdown || [];
  const activeBudgetCategoryLimits = budgetData?.budget?.categoryLimits || {};

  const progress = getProgressStyles(percent);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans animate-fade-in text-left">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="space-y-1.5 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
            Budget Management
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Financial <span className="text-gradient-orchid">Command Center</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Configure monthly targets, allocate sub-budgets per category, and trigger early warning safety parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 self-start sm:self-center">
          <button 
            onClick={handleOpenModal}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 shadow-orchid-glow transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            {hasBudget ? <Sliders className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{hasBudget ? 'Modify Budget' : 'Configure Budget'}</span>
          </button>
          
          {hasBudget && (
            <button 
              onClick={handleDeleteBudget}
              className="p-2.5 rounded-2xl text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              title="Remove Budget Plan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Connection Failure banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-3 items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 animate-bounce" />
          <div>
            <span className="block font-bold">Workspace Connection Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. Active Alert Warnings */}
      {hasBudget && (
        <div className="animate-scale-up">
          {percent >= 100 ? (
            <div className="p-5 rounded-3xl bg-red-950/30 border border-red-500/40 text-left flex gap-4 items-center">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Monthly Allocation Exceeded!</h3>
                <p className="text-xs text-muted-foreground">
                  Your monthly outflow tally of <span className="text-red-400 font-semibold">{formatCurrency(spent)}</span> has breached the defined limit of <span className="text-white font-semibold">{formatCurrency(limit)}</span> by <span className="text-red-400 font-bold">{formatCurrency(Math.abs(remaining))}</span>. Consolidate expenditures.
                </p>
              </div>
            </div>
          ) : percent >= 90 ? (
            <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-left flex gap-4 items-center">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Critical Budget Warning (Danger Zone)</h3>
                <p className="text-xs text-muted-foreground">
                  Expenditures have depleted <span className="text-rose-400 font-semibold">{percent.toFixed(1)}%</span> of your monthly limit. You only have <span className="text-white font-semibold">{formatCurrency(remaining)}</span> remaining before over-allocation triggers.
                </p>
              </div>
            </div>
          ) : percent >= 70 ? (
            <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 text-left flex gap-4 items-center">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Budget Threshold Alert (Warning)</h3>
                <p className="text-xs text-muted-foreground">
                  You have utilized <span className="text-amber-400 font-semibold">{percent.toFixed(1)}%</span> of your active budget. Try to limit non-essential purchases for the remainder of this cycle.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-emerald-950/10 border border-emerald-500/20 text-left flex gap-4 items-center">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Financial Footprint Stabilized</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Outflows remain well within boundaries. You have used <span className="text-emerald-400 font-semibold">{percent.toFixed(1)}%</span> of your monthly budget. Great work maintaining balance!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Analytics Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Monthly Limit Card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <Wallet className="h-16 w-16 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Monthly Budget Limit</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {hasBudget ? formatCurrency(limit) : '₹0.00'}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {hasBudget ? 'Configured monthly limit' : 'Set a limit to start tracking'}
          </p>
        </div>

        {/* Total Spent Card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <TrendingDown className="h-16 w-16 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Accumulated Outflows</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(spent)}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Current calendar month spends
          </p>
        </div>

        {/* Remaining Budget Card */}
        <div className={`p-6 rounded-3xl glass-panel border relative overflow-hidden space-y-3
          ${hasBudget ? (remaining < 0 ? 'border-red-500/35 bg-red-950/5' : 'border-emerald-500/20') : 'border-white/5'}
        `}>
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <PiggyBank className="h-16 w-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Remaining Balance</span>
          <h3 className={`text-3xl font-extrabold tracking-tight font-mono
            ${hasBudget ? (remaining < 0 ? 'text-red-400' : 'text-emerald-400') : 'text-white'}
          `}>
            {formatCurrency(remaining)}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {remaining < 0 ? 'Exceeded by absolute total' : 'Available cushion limit'}
          </p>
        </div>

        {/* Cycle Progression Card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <Calendar className="h-16 w-16 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Billing cycle</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight truncate font-sans">
            {budgetData?.month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Resets automatically on 1st of month
          </p>
        </div>

      </div>

      {/* Empty State / Main Content Section */}
      {!hasBudget ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-5 rounded-3xl border border-dashed border-white/10 bg-white/2 animate-scale-up">
          <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
            <Wallet className="h-9 w-9 animate-bounce" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">No Active Budget Plan</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Mapping out budgets is the first step in taking control of your financial freedom. Configure your monthly target limit and let the Orchid engine guide your spending.
            </p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="px-6 py-3 rounded-2xl text-xs font-bold bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 shadow-orchid-glow transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Overall Progress Bar Display (Circular & Linear metrics) */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-8 flex flex-col justify-between">
            <div className="space-y-1 text-left">
              <h2 className="text-lg font-bold text-white tracking-tight">Allocation Metrics</h2>
              <p className="text-xs text-muted-foreground">Detailed visual depletion rates of overall parameters</p>
            </div>

            {/* Linear Gauge representation with beautiful labels */}
            <div className="space-y-6 py-6">
              <div className="flex justify-between items-end text-xs font-semibold">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className={`${progress.textColor} font-mono font-bold text-sm`}>
                  {percent.toFixed(1)}% Used
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className={`h-full transition-all duration-700 ease-out rounded-full ${progress.barColor} ${progress.glow} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>₹0.00 spent</span>
                <span>{formatCurrencyCompact(limit)} limit</span>
              </div>
            </div>

            {/* Small Quick stats cards */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 text-left">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Daily burn rate</span>
                <span className="text-sm font-semibold text-white font-mono block mt-1">
                  ₹{(spent / new Date().getDate()).toFixed(2)} / day
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 text-left">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Remaining buffer</span>
                <span className={`text-sm font-semibold font-mono block mt-1 ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {remaining < 0 ? '₹0.00' : formatCurrencyCompact(remaining)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 text-left">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Safe zone target</span>
                <span className="text-sm font-semibold text-white font-mono block mt-1">
                  {formatCurrencyCompact(limit * 0.7)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Category Sub-budgets and progress Matrix */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-6 text-left">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Category Breakdown</h2>
              <p className="text-xs text-muted-foreground">Allocation tracking across expense classifications</p>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'].map(category => {
                const cfg = categoryMap[category] || categoryMap.default;
                const CategoryIcon = cfg.icon;
                
                // Fetch actual spent for this category
                const actualSpentRecord = categoryBreakdown.find(item => item._id === category);
                const actualSpent = actualSpentRecord ? actualSpentRecord.total : 0;
                
                // Fetch optional configured category limit
                const catLimit = activeBudgetCategoryLimits[category] || 0;
                
                // Calculate category percent
                const catPercent = catLimit > 0 ? (actualSpent / catLimit) * 100 : 0;
                const catProgress = getProgressStyles(catPercent);

                return (
                  <div key={category} className="p-3 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all group space-y-2.5">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-center text-xs">
                      
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl border ${cfg.color} transition-transform group-hover:scale-105`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-white group-hover:text-primary transition-colors">
                          {category}
                        </span>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="block font-semibold text-white font-mono">
                          {formatCurrencyCompact(actualSpent)}
                          {catLimit > 0 && <span className="text-[10px] text-muted-foreground font-normal"> / {formatCurrencyCompact(catLimit)}</span>}
                        </span>
                        {catLimit > 0 ? (
                          <span className={`block text-[9px] font-mono font-semibold ${catProgress.textColor}`}>
                            {catPercent.toFixed(0)}% allocated
                          </span>
                        ) : (
                          <span className="block text-[9px] text-muted-foreground italic">
                            No limit set
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Progress track */}
                    {catLimit > 0 ? (
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${catProgress.barColor}`}
                          style={{ width: `${Math.min(catPercent, 100)}%` }}
                        />
                      </div>
                    ) : (
                      // Basic aesthetic accent indicator
                      <div className="w-full h-0.5 bg-white/2 rounded-full" />
                    )}

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Elegant Modal Panel sheet */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          
          <div className="absolute inset-0 cursor-default" onClick={handleCloseModal} />

          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative z-10 space-y-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-white/5 bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {hasBudget ? 'Modify Budget Configuration' : 'Setup Monthly Budget'}
                </h2>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-1 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error alerts inside modal */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-2.5 items-start">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4 text-left">
              
              {/* Monthly target limit */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overall Monthly Budget Limit ({currencySymbol})</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-muted-foreground select-none">{currencySymbol}</span>
                  <input 
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={monthlyLimitInput}
                    onChange={(e) => setMonthlyLimitInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Collapsible Section: Category limits */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategorySettings(!showCategorySettings)}
                  className="w-full flex items-center justify-between py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-white transition-colors"
                >
                  <span>Category limits (Optional)</span>
                  {showCategorySettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showCategorySettings && (
                  <div className="space-y-3 pt-2 max-h-60 overflow-y-auto pr-1 animate-scale-up">
                    {['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'].map(category => (
                      <div key={category} className="grid grid-cols-2 gap-4 items-center">
                        <span className="text-xs text-white">{category} Sub-limit</span>
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-[10px] font-bold text-muted-foreground select-none">{currencySymbol}</span>
                          <input
                            type="number"
                            placeholder="No limit"
                            value={categoryLimitsInput[category]}
                            onChange={(e) => handleCategoryLimitChange(category, e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 shadow-orchid-glow disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-t-2 border-white rounded-full animate-spin" />
                      <span>Configuring budget...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Budget;
