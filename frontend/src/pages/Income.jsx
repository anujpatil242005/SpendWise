import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import IncomeModal from '../components/IncomeModal';
import { TransactionRowSkeleton } from '../components/SkeletonLoader';
import { 
  Plus, 
  SlidersHorizontal, 
  Calendar, 
  Edit2, 
  Trash2, 
  Sparkles,
  Banknote,
  Laptop,
  TrendingUp,
  Gift,
  Layers,
  Activity,
  AlertCircle,
  Download,
  FileDown
} from 'lucide-react';

// Color and icon mappings matching the 5 income categories
const categoryMap = {
  'Salary': { icon: Banknote, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'Freelance': { icon: Laptop, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  'Investments': { icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'Gifts': { icon: Gift, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  'Other': { icon: Layers, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  'default': { icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
};

const Income = () => {
  const { authenticated } = useAuth();
  const { showToast } = useToast();
  const { formatCurrency } = useCurrency();

  // Data states
  const [incomes, setIncomes] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, monthlyIncome: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [sortOrder, setSortOrder] = useState('latest'); // latest | highest

  // Modal triggers
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIncome, setActiveIncome] = useState(null); // null = Add Mode, object = Edit Mode

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`[Income Page] Querying entries. Sort: "${sortOrder}"...`);

      // Parallel requests for optimal speed
      const [listRes, statsRes] = await Promise.all([
        api.get('/incomes', { params: { sort: sortOrder } }),
        api.get('/incomes/stats')
      ]);

      if (listRes.success) {
        setIncomes(listRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('[Income Page Error] Synchronization failed:', err.message);
      setError('Unable to sync with database node. Make sure MongoDB is active.');
      showToast('Synchronization failure: database offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reload when sorting dependencies change
  useEffect(() => {
    if (authenticated) {
      fetchIncomeData();
    }
  }, [authenticated, sortOrder]);

  const handleOpenAddModal = () => {
    setActiveIncome(null);
    setModalOpen(true);
  };


  const exportToPDF = () => {
    if (incomes.length === 0) {
      showToast('No logged income streams available to print.', 'warning');
      return;
    }
    showToast('Generating print preview...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleOpenEditModal = (incomeItem) => {
    setActiveIncome(incomeItem);
    setModalOpen(true);
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this income stream entry?')) {
      try {
        console.log(`[Income Page] Deleting entry ${id}...`);
        const res = await api.delete(`/incomes/${id}`);
        
        if (res.success) {
          showToast('Income entry deleted successfully.', 'warning');
          fetchIncomeData(); // Refresh history list and stats
        }
      } catch (err) {
        console.error('[Income Page] Delete failed:', err.message);
        showToast('Delete operation failed.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans animate-fade-in text-left">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-emerald-500/20 shadow-emerald-500/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="space-y-1.5 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Revenue stream Manager
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Revenue <span className="text-gradient-orchid">Inflow Ledger</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Monitor and record salaries, dividends, contract work, and assets. Live aggregates reflect net earnings.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5 self-start sm:self-center">

          <button 
            onClick={exportToPDF}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FileDown className="h-4 w-4 text-cyan-400" />
            <span>Print PDF</span>
          </button>

          <button 
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record Inflow</span>
          </button>
        </div>
      </div>

      {/* Connection Failure banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-3 items-center">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 animate-bounce" />
          <div>
            <span className="block font-bold">Ledger Connection Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. Statistical Metric Cards & Sort Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Total Inflows Card */}
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 shadow-emerald-500/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp className="h-16 w-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Accumulated Revenue</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(stats.totalIncome)}
          </h3>
          <p className="text-[10px] text-emerald-400 font-medium">
            Cumulative net assets recorded
          </p>
        </div>

        {/* Current Month Inflows Card */}
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 shadow-emerald-500/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <Calendar className="h-16 w-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Monthly Net Inflow</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(stats.monthlyIncome)}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Current calendar month accumulations
          </p>
        </div>

        {/* Sorting Controller */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4 h-full flex flex-col justify-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-left">Sort Ledger Parameters</span>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-white/5 border border-white/5 focus:border-emerald-500/40 text-white outline-none cursor-pointer"
            >
              <option value="latest" className="bg-background text-white">Latest Date first</option>
              <option value="highest" className="bg-background text-white">Highest Inflow Amount</option>
              <option value="lowest" className="bg-background text-white">Lowest Inflow Amount</option>
            </select>
          </div>
        </div>

      </div>

      {/* 3. Incomes History Ledger */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5">
        {loading ? (
          <table className="w-full">
            <tbody>
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
            </tbody>
          </table>
        ) : incomes.length === 0 ? (
          /* Premium empty state */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 rounded-2xl border border-dashed border-white/10 bg-white/2 animate-scale-up">
            <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">Revenue Stream is Empty</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No active income entries logged in Mongoose database. Record a fresh revenue inflow!
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground font-semibold">
                  <th className="pb-3 pl-2 text-left">Revenue Inflow</th>
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center pr-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incomes.map((item) => {
                  const cfg = categoryMap[item.category] || categoryMap.default;
                  const CategoryIcon = cfg.icon;
                  const dateObj = new Date(item.date);

                  return (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                      
                      {/* Description & Notes */}
                      <td className="py-4 pl-2 text-left">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${cfg.color} transition-transform group-hover:scale-105`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div className="text-left space-y-0.5 max-w-[240px]">
                            <span className="block font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {item.title}
                            </span>
                            {item.notes && (
                              <span className="block text-[10px] text-muted-foreground truncate max-w-[220px]">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td className="py-4 text-left">
                        <span className="px-2 py-0.5 rounded-md border border-white/5 text-muted-foreground bg-white/5 text-[10px]">
                          {item.category}
                        </span>
                      </td>

                      {/* Inflow Date */}
                      <td className="py-4 text-left text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 text-right font-semibold font-mono text-emerald-400">
                        +{formatCurrency(item.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-center pr-2">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteIncome(item._id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic Modal Sheet */}
      <IncomeModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        income={activeIncome}
        onSuccess={fetchIncomeData}
      />

    </div>
  );
};

export default Income;
