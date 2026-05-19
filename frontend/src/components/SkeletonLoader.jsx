import React from 'react';

// Reusable stat card loader card
export const StatCardSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl glass-panel relative border border-white/5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-white/10 rounded-full" />
        <div className="h-8 w-8 rounded-lg bg-white/10" />
      </div>
      <div className="space-y-2">
        <div className="h-7 w-32 bg-white/15 rounded-md" />
        <div className="h-3.5 w-20 bg-white/10 rounded-full" />
      </div>
    </div>
  );
};

// Reusable table row loader
export const TransactionRowSkeleton = () => {
  return (
    <tr className="animate-pulse border-b border-white/5">
      <td className="py-4 pl-2 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-white/10" />
        <div className="h-3.5 w-32 bg-white/15 rounded-full" />
      </td>
      <td className="py-4">
        <div className="h-3 w-16 bg-white/10 rounded-full" />
      </td>
      <td className="py-4">
        <div className="h-3 w-20 bg-white/5 rounded-full" />
      </td>
      <td className="py-4 text-right pr-2">
        <div className="h-3.5 w-16 bg-white/15 rounded-full ml-auto" />
      </td>
    </tr>
  );
};

// Full-screen loading modal
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner Skeleton */}
      <div className="h-32 rounded-3xl glass-panel border border-white/5 animate-pulse p-6 flex flex-col justify-center space-y-3">
        <div className="h-3.5 w-28 bg-white/10 rounded-full" />
        <div className="h-6 w-64 bg-white/15 rounded-md" />
        <div className="h-3.5 w-[80%] bg-white/10 rounded-full" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Table & Sidebar Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4.5 w-40 bg-white/15 rounded-md" />
              <div className="h-3 w-52 bg-white/10 rounded-full" />
            </div>
            <div className="h-6 w-12 bg-white/10 rounded-full" />
          </div>
          
          <table className="w-full">
            <tbody>
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
            </tbody>
          </table>
        </div>

        <div className="space-y-6 animate-pulse">
          <div className="h-44 rounded-3xl glass-panel border border-white/5" />
          <div className="h-36 rounded-3xl glass-panel border border-white/5" />
        </div>
      </div>
    </div>
  );
};
