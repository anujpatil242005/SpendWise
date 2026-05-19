import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import ExpenseModal from '../components/ExpenseModal';
import { TransactionRowSkeleton } from '../components/SkeletonLoader';
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  CreditCard,
  Edit2, 
  Trash2, 
  Sparkles,
  Coffee, 
  Car, 
  ShoppingBag, 
  Film, 
  FileText, 
  Heart, 
  Layers, 
  Activity,
  AlertCircle,
  Download,
  FileDown
} from 'lucide-react';

// Exact HSL color configurations matching the 7 requested categories
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

const Expenses = () => {
  const { authenticated } = useAuth();
  const { showToast } = useToast();
  const { formatCurrency } = useCurrency();

  // Data states
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchVal, setSearchVal] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('latest'); // latest | highest

  // Modal triggers
  const [modalOpen, setModalOpen] = useState(false);
  const [activeExpense, setActiveExpense] = useState(null); // holds expense in Edit Mode; null in Add Mode

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`[Expenses Page] Loading with search: "${searchVal}", category: "${categoryFilter}", sort: "${sortOrder}"...`);

      const res = await api.get('/expenses', {
        params: {
          search: searchVal || undefined,
          category: categoryFilter || undefined,
          sort: sortOrder
        }
      });

      if (res.success) {
        setExpenses(res.data);
      }
    } catch (err) {
      console.error('[Expenses Load Error] Failed to get expenses:', err.message);
      setError('Unable to sync with database node. Make sure MongoDB is active.');
      showToast('Synchronization failure: database offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger load when filter dependencies alter (with 300ms debounce for instant search)
  useEffect(() => {
    if (authenticated) {
      const delayDebounceFn = setTimeout(() => {
        fetchExpenses();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [authenticated, searchVal, categoryFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };


  const exportToPDF = () => {
    if (expenses.length === 0) {
      showToast('No logged outflows available to print.', 'warning');
      return;
    }
    showToast('Generating print preview...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleOpenAddModal = () => {
    setActiveExpense(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setActiveExpense(expense);
    setModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this expense log?')) {
      try {
        console.log(`[Expenses Page] Deleting record ${id}...`);
        const res = await api.delete(`/expenses/${id}`);
        
        if (res.success) {
          showToast('Expense record deleted successfully.', 'warning');
          fetchExpenses(); // Refresh page ledger
        }
      } catch (err) {
        console.error('[Expenses Page] Delete failed:', err.message);
        showToast('Delete operation failed.', 'error');
      }
    }
  };

  // Summarize filtered expenses
  const totalFilteredExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans animate-fade-in text-left">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="space-y-1.5 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
            Expense Manager
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Detailed <span className="text-gradient-orchid">Outflow Ledger</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Track, audit, and organize cash flows across categories. Real-time encryption secures details.
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
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 shadow-orchid-glow transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record Expense</span>
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

      {/* 2. Stats Dashboard & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Statistics Metric Card */}
        <div className="lg:col-span-1 p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow-sm relative overflow-hidden space-y-4">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <Filter className="h-16 w-16 text-primary" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filtered Spends</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono mt-1">
              {formatCurrency(totalFilteredExpense)}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              Active tally for {expenses.length} listed logs
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="lg:col-span-3 p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Query Filter Framework</span>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search vendor or notes..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
              />
              <button 
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-primary hover:bg-primary/95 text-white transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Selector Grid: Category & Sort */}
            <div className="flex items-center gap-4 self-stretch md:self-auto">
              
              {/* Category selector */}
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/5 focus:border-primary/40 text-white outline-none cursor-pointer"
                >
                  <option value="All" className="bg-background text-white">All Categories</option>
                  <option value="Food" className="bg-background text-white">Food</option>
                  <option value="Travel" className="bg-background text-white">Travel</option>
                  <option value="Shopping" className="bg-background text-white">Shopping</option>
                  <option value="Entertainment" className="bg-background text-white">Entertainment</option>
                  <option value="Bills" className="bg-background text-white">Bills</option>
                  <option value="Health" className="bg-background text-white">Health</option>
                  <option value="Other" className="bg-background text-white">Other</option>
                </select>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/5 focus:border-primary/40 text-white outline-none cursor-pointer"
                >
                  <option value="latest" className="bg-background text-white">Latest Date</option>
                  <option value="highest" className="bg-background text-white">Highest Amount</option>
                  <option value="lowest" className="bg-background text-white">Lowest Amount</option>
                </select>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* 3. Expense Table List */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5">
        {loading ? (
          <table className="w-full">
            <tbody>
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
            </tbody>
          </table>
        ) : expenses.length === 0 ? (
          /* Premium empty state */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 rounded-2xl border border-dashed border-white/10 bg-white/2 animate-scale-up">
            <div className="p-3.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">Ledger Is Clear</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No expense entries found matching current parameters. Record a new outflow or adjust filters!
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground font-semibold">
                  <th className="pb-3 pl-2 text-left">Expense Item</th>
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-left">Payment Method</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center pr-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((item) => {
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
                          <div className="text-left space-y-0.5 max-w-[200px]">
                            <span className="block font-semibold text-white group-hover:text-primary transition-colors truncate">
                              {item.title}
                            </span>
                            {item.notes && (
                              <span className="block text-[10px] text-muted-foreground truncate max-w-[180px]">
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

                      {/* Expense Date */}
                      <td className="py-4 text-left text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 text-left text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 text-right font-semibold font-mono text-purple-300">
                        -{formatCurrency(item.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-center pr-2">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-primary transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteExpense(item._id)}
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
      <ExpenseModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        expense={activeExpense}
        onSuccess={fetchExpenses}
      />

    </div>
  );
};

export default Expenses;
