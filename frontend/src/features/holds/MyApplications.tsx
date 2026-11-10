import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { HoldDetailCard } from './HoldDetailCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatBRN } from '@/utils';
import {
  Clock,
  RotateCw,
  BookOpen,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  Inbox,
} from 'lucide-react';

interface MyApplicationsProps {
  onBrowseClasses: () => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({ onBrowseClasses }) => {
  const { student, myHolds, isLoadingHolds, refreshMyHolds } = useStudent();
  const [filter, setFilter] = useState<'all' | 'HELD' | 'CONFIRMED' | 'HISTORY'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshMyHolds();

    // Poll every 5 seconds for live status updates on active holds
    const interval = setInterval(() => {
      refreshMyHolds();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshMyHolds]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshMyHolds();
    setIsRefreshing(false);
  };

  const filteredHolds = useMemo(() => {
    return myHolds.filter((h) => {
      if (filter === 'HELD') return h.status === 'HELD';
      if (filter === 'CONFIRMED') return h.status === 'CONFIRMED';
      if (filter === 'HISTORY') return h.status === 'EXPIRED' || h.status === 'CANCELLED';
      return true;
    });
  }, [myHolds, filter]);

  const activeCount = myHolds.filter((h) => h.status === 'HELD').length;
  const confirmedCount = myHolds.filter((h) => h.status === 'CONFIRMED').length;
  const historyCount = myHolds.filter((h) => h.status === 'EXPIRED' || h.status === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4 text-orange-600" />
            <span>Student Application Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            My Applications & Reservations
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tracking enrollment records for <strong className="text-zinc-900 font-semibold">{student.name}</strong> • BRN:{' '}
            <span className="text-orange-700 font-medium">{formatBRN(student.id)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing || isLoadingHolds}
            leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={onBrowseClasses} leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
            Browse Classes
          </Button>
        </div>
      </div>

      {/* Modern Orange Segmented Control */}
      <div className="bg-zinc-100/90 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/60 w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-orange-600 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>All Applications</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'all' ? 'bg-orange-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
            {myHolds.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('HELD')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            filter === 'HELD'
              ? 'bg-orange-600 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Active Holds</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'HELD' ? 'bg-orange-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('CONFIRMED')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            filter === 'CONFIRMED'
              ? 'bg-orange-600 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Confirmed</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'CONFIRMED' ? 'bg-orange-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
            {confirmedCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('HISTORY')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            filter === 'HISTORY'
              ? 'bg-orange-600 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-zinc-400" />
          <span>Expired / Cancelled</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'HISTORY' ? 'bg-orange-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
            {historyCount}
          </span>
        </button>
      </div>

      {/* Grid of Applications */}
      {filteredHolds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHolds.map((hold) => (
            <HoldDetailCard key={hold.holdId} hold={hold} onRefresh={refreshMyHolds} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 px-4 bg-white border-zinc-200/90 rounded-2xl shadow-2xs">
          <CardContent>
            <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No Applications Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {filter === 'all'
                ? "You haven't submitted any admission applications yet. Browse active classes to reserve a seat."
                : `No applications found matching the "${filter}" filter.`}
            </p>
            <Button variant="default" size="sm" className="mt-5" onClick={onBrowseClasses}>
              Explore Available Classes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
