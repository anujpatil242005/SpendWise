import React from 'react';

const StatCard = ({ title, value, icon: Icon, themeColor, changeText, progressPercent }) => {
  // Theme styling declarations
  const themeMap = {
    orchid: {
      text: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      shadow: 'hover:border-primary/30 shadow-orchid-glow-sm',
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      shadow: 'hover:border-emerald-500/30',
    },
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      shadow: 'hover:border-purple-500/30',
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      shadow: 'hover:border-amber-500/30',
    },
  };

  const currentTheme = themeMap[themeColor] || themeMap.orchid;

  return (
    <div className={`p-6 rounded-2xl glass-panel relative overflow-hidden group border transition-all duration-300 transform hover:-translate-y-1 ${currentTheme.border} ${currentTheme.shadow}`}>
      
      {/* Decorative large backdrop outline icon */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
        <Icon className={`h-16 w-16 ${currentTheme.text}`} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl border border-white/5 ${currentTheme.bg} ${currentTheme.text}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="space-y-1.5 relative z-10">
        <h3 className="text-2xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </h3>
        
        {/* Render indicator label or threshold progress bar */}
        {progressPercent !== undefined ? (
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out`}
                style={{ 
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: progressPercent > 90 ? '#ef4444' : progressPercent > 70 ? '#f59e0b' : '#a855f7'
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold flex justify-between">
              <span>{changeText}</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </p>
          </div>
        ) : (
          <p className={`text-[10px] font-semibold ${currentTheme.text}`}>
            {changeText}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
