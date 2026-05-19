import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

const IncomeModal = ({ isOpen, onClose, income, onSuccess }) => {
  const { showToast } = useToast();
  
  // Form State variables
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currencySymbol } = useCurrency();

  const isEditMode = !!income;

  // Sync state if editing an existing record
  useEffect(() => {
    if (isOpen) {
      if (income) {
        setTitle(income.title || '');
        setAmount(income.amount || '');
        setCategory(income.category || '');
        setDate(income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setNotes(income.notes || '');
      } else {
        // Clear forms on clean Addition mount
        setTitle('');
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, income]);

  if (!isOpen) return null;

  // Exact categories requested by user
  const categories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side field validators
    if (!title.trim()) return setError('Please enter a description or employer name.');
    if (!amount || Number(amount) <= 0) return setError('Please provide a valid amount greater than 0.');
    if (!category) return setError('Please select a revenue category.');

    try {
      setLoading(true);
      
      const payload = {
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
        notes: notes.trim() || undefined,
      };

      if (isEditMode) {
        console.log(`[Income Modal] Updating income ${income._id}...`);
        await api.put(`/incomes/${income._id}`, payload);
        showToast('Income record successfully updated!', 'success');
      } else {
        console.log('[Income Modal] Creating new income log...');
        await api.post('/incomes', payload);
        showToast('New revenue stream successfully logged!', 'success');
      }

      onSuccess(); // Refreshes parent statistics and table
      onClose();
    } catch (err) {
      console.error('[Income Modal Error] Operation failed:', err.message);
      setError(err.message || 'Server rejected transaction. Check database connectivity.');
      showToast('Action failed: check connection parameters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Card wrapper */}
      <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-primary/20 shadow-orchid-glow relative z-10 space-y-5 animate-scale-up">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isEditMode ? 'Modify Income Log' : 'Record Revenue Inflow'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 flex gap-2.5 items-start text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Source Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Source / Title</label>
            <input 
              type="text"
              placeholder="e.g. Acme Corp Contract or Monthly Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-emerald-500/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
              maxLength={60}
            />
          </div>

          {/* Grid Amount & Date */}
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
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-emerald-500/40 text-white placeholder-muted-foreground outline-none transition-all duration-200"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-emerald-500/40 text-white outline-none transition-all duration-200"
              />
            </div>

          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-emerald-500/40 text-white outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="" disabled className="bg-background text-muted-foreground">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-background text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notes / Notes description</label>
            <textarea
              placeholder="e.g. Wire transfer, freelance design milestone..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-emerald-500/40 text-white placeholder-muted-foreground outline-none transition-all duration-200 h-16 resize-none"
              maxLength={200}
            />
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 shadow-emerald-500/10
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-t-2 border-white rounded-full animate-spin" />
                  <span>Saving to Mongoose...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isEditMode ? 'Save Modifications' : 'Create Income Log'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default IncomeModal;
