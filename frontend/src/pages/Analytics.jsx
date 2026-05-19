import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  ComposedChart,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Sparkles,
  PieChart as PieIcon,
  BarChart2,
  Activity,
  Layers,
  Percent,
  PiggyBank,
  AlertTriangle
} from 'lucide-react';

// Unified Orchid Category HSL Palette
const CATEGORY_COLORS = {
  'Food & Drink': '#f59e0b', // Amber
  'Food': '#f59e0b',
  'Housing': '#f97316', // Orange
  'Bills': '#f97316',
  'Entertainment': '#a855f7', // Purple
  'Shopping': '#ec4899', // Rose
  'Travel': '#06b6d4', // Cyan
  'Health & Wellness': '#10b981', // Emerald
  'Health': '#10b981',
  'Others': '#64748b', // Slate
  'Other': '#64748b',
  'default': '#8b5cf6' // Violet
};

// Render custom premium tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  const { formatCurrency } = useCurrency();

  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-2xl glass-panel border border-white/10 shadow-orchid-glow text-left text-xs font-sans space-y-1">
        {label && <p className="font-bold text-white border-b border-white/5 pb-1 mb-1">{label}</p>}
        {payload.map((p, idx) => (
          <p key={idx} className="font-mono" style={{ color: p.color || p.fill || '#fff' }}>
            {p.name}: <span className="font-bold">{formatCurrency(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { authenticated } = useAuth();
  const { showToast } = useToast();
  const { formatCurrency } = useCurrency();

  // Range and Aggregation States
  const [range, setRange] = useState('6months'); // '30days' | '6months' | '12months'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`[Analytics Page] Querying server aggregate stats (range: ${range})...`);
      
      const res = await api.get('/analytics/overview', { params: { range } });
      if (res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('[Analytics Fetch Error]:', err.message);
      setError('Failed to connect to the ledger server. Verify database connectivity.');
      showToast('Synchronization error: ledger unavailable.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAnalytics();
    }
  }, [authenticated, range]);

  if (loading && !analyticsData) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto p-4 animate-pulse text-left font-sans">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white/5 rounded-3xl" />
          <div className="h-96 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Fallbacks if data fails or is empty
  const summary = analyticsData?.summary || { totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0 };
  const pieData = (analyticsData?.categoryBreakdown || []).map(item => ({
    name: item._id || 'Unclassified',
    value: item.value,
  }));
  const barData = analyticsData?.monthlyExpenses || [];
  const areaData = analyticsData?.spendingTrends || [];
  const composedData = analyticsData?.incomeVsExpense || [];

  const hasData = pieData.length > 0 || composedData.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans animate-fade-in text-left">
      
      {/* 1. Header with Range Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="space-y-1.5 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
            Financial Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Predictive <span className="text-gradient-orchid">Cash Analytics</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Aggregate historical revenues, visualize category allocation weightings, and chart cash burn ratios.
          </p>
        </div>

        {/* Dynamic Range Switchers */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 relative z-10 self-start md:self-center">
          {[
            { id: '30days', label: 'Last 30 Days' },
            { id: '6months', label: '6 Months' },
            { id: '12months', label: '12 Months' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${range === opt.id 
                  ? 'bg-primary text-white shadow-orchid-glow' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/2'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Connection Failure banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-3 items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <span className="block font-bold">Workspace Connection Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. Analytical KPI Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* cash in card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp className="h-16 w-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Inflow (Cash In)</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(summary.totalIncome)}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Aggregate revenue received in range
          </p>
        </div>

        {/* cash out card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <TrendingDown className="h-16 w-16 text-red-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Outflows (Burn)</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(summary.totalExpenses)}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Aggregate debit expenditures
          </p>
        </div>

        {/* net cash growth card */}
        <div className={`p-6 rounded-3xl glass-panel border relative overflow-hidden space-y-3
          ${summary.netSavings < 0 ? 'border-red-500/25 bg-red-950/5' : 'border-emerald-500/20'}
        `}>
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <PiggyBank className="h-16 w-16 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Net Profit / Savings</span>
          <h3 className={`text-3xl font-extrabold tracking-tight font-mono
            ${summary.netSavings < 0 ? 'text-red-400' : 'text-emerald-400'}
          `}>
            {formatCurrency(summary.netSavings)}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {summary.netSavings < 0 ? 'Negative cash flow buffer' : 'Retained capital accretion'}
          </p>
        </div>

        {/* savings rate card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden space-y-3">
          <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
            <Percent className="h-16 w-16 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Savings Rate (%)</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {summary.savingsRate.toFixed(1)}%
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Inflow percentage preserved
          </p>
        </div>

      </div>

      {/* 3. Aggregated Visual Dashboards */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-5 rounded-3xl border border-dashed border-white/10 bg-white/2 animate-scale-up">
          <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Activity className="h-9 w-9 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">No Aggregated Logs Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              We require at least one income and expense transaction in the active range to compile trends. Set up logs on the dashboard to trigger charting dashboards.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Composed Income vs Outflow */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart2 className="h-4.5 w-4.5 text-primary" />
                <span>Inflow vs Outflow Contrast</span>
              </h2>
              <p className="text-xs text-muted-foreground">Historical comparisons of revenues side-by-side with debits</p>
            </div>
            
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={composedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} 
                    verticalAlign="bottom"
                  />
                  <Bar name="Total Inflow" dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar name="Total Outflows" dataKey="expense" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={16} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Allocation Weights (Pie Chart) */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <PieIcon className="h-4.5 w-4.5 text-pink-500" />
                <span>Outflow Category Weightings</span>
              </h2>
              <p className="text-xs text-muted-foreground">Distribution of debit allocations by transaction type</p>
            </div>
            
            <div className="h-72 w-full mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="h-56 w-56 sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => {
                        const col = CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.default;
                        return <Cell key={`cell-${index}`} fill={col} />;
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends Custom Grid list */}
              <div className="grid grid-cols-2 gap-3 w-full sm:w-1/2 max-h-56 overflow-y-auto pr-1">
                {pieData.map((item, idx) => {
                  const col = CATEGORY_COLORS[item.name] || CATEGORY_COLORS.default;
                  const totalSpent = summary.totalExpenses || 1;
                  const ratio = (item.value / totalSpent) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-[10px]">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
                      <div className="truncate text-left">
                        <span className="block font-semibold text-white truncate">{item.name}</span>
                        <span className="text-muted-foreground">{ratio.toFixed(0)}% ({formatCurrency(item.value)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 3: Spending Burn Rate over 30 days (Area Chart) */}
          {range === '30days' && areaData.length > 0 && (
            <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6 flex flex-col justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                  <span>30-Day Outflow Burn Rate</span>
                </h2>
                <p className="text-xs text-muted-foreground">Daily progression logs mapping cash burn trends over the last month</p>
              </div>

              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      name="Daily Spends" 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 4: Monthly Outflow Totals (Bar Chart) */}
          {range !== '30days' && barData.length > 0 && (
            <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6 flex flex-col justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-amber-500" />
                  <span>Monthly Outflow Trendlines</span>
                </h2>
                <p className="text-xs text-muted-foreground">Historical volume records tracking seasonal shifts</p>
              </div>

              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar name="Outflow Amount" dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Analytics;
