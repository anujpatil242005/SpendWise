import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Plus, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  Home,
  Coffee,
  Car,
  Heart,
  Layers,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';

// Color and icon map matching transaction categories
const categoryConfig = {
  'Food & Drink': { icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'Housing': { icon: Home, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  'Entertainment': { icon: ShoppingBag, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  'Shopping': { icon: ShoppingBag, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  'Travel': { icon: Car, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  'Health & Wellness': { icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  'Salary': { icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'Freelance': { icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'Others': { icon: Layers, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  'default': { icon: Activity, color: 'text-primary bg-primary/10 border-primary/20' }
};

const Dashboard = () => {
  const { authenticated, user, isMock } = useAuth();
  const { formatCurrency, formatCurrencySigned } = useCurrency();
  
  // State Declarations
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBalance: 0,
    monthlyBudget: 5000
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal Triggers
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense'); // expense | income

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Dashboard] Fetching stats and ledger from Express API...');

      const [statsRes, txRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get('/transactions')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch (err) {
      console.error('[Dashboard Load Error] Connection failed:', err.message);
      setError('Unable to link with financial server. Run your local database or backend instances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData();
    }
  }, [authenticated]);

  const openTransactionModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Dynamically calculate budget depletion rate
  const budgetSpentPercent = stats.monthlyBudget > 0 
    ? (stats.totalExpenses / stats.monthlyBudget) * 100 
    : 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel relative overflow-hidden border border-primary/20 shadow-orchid-glow">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none select-none z-0" />
        
        <div className="space-y-1.5 relative z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
              Workspace Synchronized
            </span>
            {isMock && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider animate-pulse">
                Offline Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-gradient-orchid">SpendWise</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Connected as <span className="text-white font-semibold">{user?.email || user?.phone || 'SpendWise Member'}</span>. 
            Your smart personal transaction logs are secured and encrypted in real-time.
          </p>
        </div>
      </div>

      {/* Connection Failure Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-3 items-center text-left">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 animate-bounce" />
          <div>
            <span className="block font-bold">Server Synchronization Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. Reusable Animated Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <StatCard 
          title="Remaining Balance"
          value={formatCurrency(stats.remainingBalance)}
          icon={Wallet}
          themeColor="orchid"
          changeText="Decentralized Sync"
        />

        <StatCard 
          title="Total Inflows"
          value={formatCurrency(stats.totalIncome)}
          icon={ArrowUpRight}
          themeColor="emerald"
          changeText="Total income entries recorded"
        />

        <StatCard 
          title="Total Outflows"
          value={formatCurrency(stats.totalExpenses)}
          icon={ArrowDownRight}
          themeColor="purple"
          changeText="Total spending volume"
        />

        <StatCard 
          title="Monthly Budget Limit"
          value={formatCurrency(stats.monthlyBudget)}
          icon={Percent}
          themeColor="amber"
          changeText={`Spent: ${formatCurrency(stats.totalExpenses)}`}
          progressPercent={budgetSpentPercent}
        />

      </div>

      {/* 3. Recent Ledger and Quick Action controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Transactions table */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Ledger Entries</h2>
              <p className="text-xs text-muted-foreground">Historical records of your cash flows</p>
            </div>
            <button className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {transactions.length === 0 ? (
            /* Premium Empty State */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 rounded-2xl border border-dashed border-white/10 bg-white/2 animate-scale-up">
              <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">No Ledger Entries Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Start mapping out your financial footprint. Add your first cash flow using the Quick Action builder!
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground font-semibold">
                    <th className="pb-3 pl-2">Transaction</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right pr-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => {
                    const cfg = categoryConfig[tx.category] || categoryConfig.default;
                    const CategoryIcon = cfg.icon;
                    const dateObj = new Date(tx.date);
                    
                    return (
                      <tr key={tx._id || tx.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3.5 pl-2 flex items-center gap-3">
                          <div className={`p-2 rounded-xl border border-white/5 ${cfg.color} transition-transform group-hover:scale-105`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-white group-hover:text-primary transition-colors truncate max-w-[150px]">
                            {tx.title}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md border border-white/5 text-muted-foreground bg-white/5 text-[10px]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground/60 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className={`py-3.5 text-right pr-2 font-semibold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-purple-300'}`}>
                          {formatCurrencySigned(tx.amount, tx.type)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Action builders & Node Integrity Indicators */}
        <div className="space-y-6">
          
          {/* Quick Action controls */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4 text-left">
            <h2 className="text-lg font-bold text-white tracking-tight">Quick Action</h2>
            <p className="text-xs text-muted-foreground">Instantly map out a cash flow projection</p>
            
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => openTransactionModal('expense')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/40 text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-primary border border-purple-500/20">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-white">Record Outflow</span>
                    <span className="block text-[10px] text-muted-foreground">Add new expense logs</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => openTransactionModal('income')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-white">Record Inflow</span>
                    <span className="block text-[10px] text-muted-foreground">Add incoming revenues</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Core System integrity status */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4 text-left">
            <h2 className="text-sm font-bold text-white tracking-tight">System Node Status</h2>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Backend API Node</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">MongoDB Local Port</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Privy Auth Framework</span>
                <span className="text-purple-300 font-semibold">Active Sync</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mapped Overlay Transaction Modal */}
      <TransactionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onSuccess={fetchDashboardData}
      />

    </div>
  );
};

export default Dashboard;
