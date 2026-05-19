import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';

const TransactionModal = ({ isOpen, onClose, type, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currencySymbol } = useCurrency();

  if (!isOpen) return null;

  // Adapt categories based on transaction type
  const expenseCategories = ['Food & Drink', 'Housing', 'Entertainment', 'Shopping', 'Travel', 'Health & Wellness', 'Others'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Others'];
  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (!title.trim()) return setError('Please enter a description or title.');
    if (!amount || Number(amount) <= 0) return setError('Please enter a valid amount greater than 0.');
    if (!category) return setError('Please select a category.');

    try {
      setLoading(true);
      console.log(`[Transaction Modal] Posting ${type} record...`);
      
      const payload = {
        title: title.trim(),
        amount: Number(amount),
        type,
        category,
        date,
        description: description.trim() || undefined,
      };

      await api.post('/transactions', payload);
      
      console.log('[Transaction Modal] Record submitted successfully!');
      
      // Reset inputs
      setTitle('');
      setAmount('');
      setCategory('');
      setDescription('');
      
      onSuccess(); // Triggers Dashboard state reloading
      onClose();
    } catch (err) {
      console.error('[Transaction Modal Error] Submission failed:', err.message);
      setError(err.message || 'Failed to submit transaction. Verify your local server is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      
      {/* Click Outside Backdrop Closer */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Main Panel */}
      <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative z-10 space-y-6 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border border-white/5 ${type === 'expense' ? 'bg-purple-500/10 text-primary' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {type === 'expense' ? 'Record Outflow' : 'Record Inflow'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-2.5 items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Title / Description</label>
            <input 
              type="text"
              placeholder="e.g. Netflix Subscription"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
              maxLength={60}
            />
          </div>

          {/* Grid: Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount ({currencySymbol})</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white outline-none transition-all duration-200"
              />
            </div>

          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="" disabled className="bg-background text-muted-foreground">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-background text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="Add optional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-primary/40 text-white placeholder-muted-foreground outline-none transition-all duration-200 h-16 resize-none"
              maxLength={200}
            />
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 shadow-orchid-glow
                ${type === 'expense' ? 'bg-primary hover:bg-primary/95' : 'bg-emerald-500 hover:bg-emerald-500/95'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-t-2 border-white rounded-full animate-spin" />
                  <span>Recording Ledger...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Submit Transaction</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
