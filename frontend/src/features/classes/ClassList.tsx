import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SchoolClass } from '@/types';
import { api } from '@/services/api';
import { useStudent } from '@/hooks/useStudent';
import { ClassCard } from './ClassCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  RotateCw,
  Search,
  Filter,
  Layers,
  Armchair,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

interface ClassListProps {
  onViewMyApplications: () => void;
  onNavigateToAdmin: () => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  onViewMyApplications,
  onNavigateToAdmin,
}) => {
  const { refreshMyHolds } = useStudent();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'available' | 'full'>('all');

  const fetchClasses = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      setErrorMsg(null);
      const data = await api.getClasses();
      setClasses(data || []);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to connect to backend server. Make sure the API is running on port 8080.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    api.getClasses()
      .then((data) => {
        if (isCurrent) setClasses(data || []);
      })
      .catch((err) => {
        if (isCurrent) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend server. Make sure the API is running on port 8080.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    // Auto-polling every 6 seconds to update real-time seat numbers
    const interval = setInterval(() => {
      fetchClasses();
      refreshMyHolds();
    }, 6000);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [fetchClasses, refreshMyHolds]);

  const handleHoldCreated = () => {
    fetchClasses();
    refreshMyHolds();
  };

  // Metrics summary
  const stats = useMemo(() => {
    return classes.reduce(
      (acc, c) => ({
        totalSeats: acc.totalSeats + c.totalSeats,
        availableSeats: acc.availableSeats + c.availableSeats,
        heldSeats: acc.heldSeats + c.heldSeats,
        confirmedSeats: acc.confirmedSeats + c.confirmedSeats,
      }),
      { totalSeats: 0, availableSeats: 0, heldSeats: 0, confirmedSeats: 0 }
    );
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'available') return c.availableSeats > 0;
      if (filterType === 'full') return c.availableSeats <= 0;
      return true;
    });
  }, [classes, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-800 text-xs font-medium border border-orange-200/80">
              <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
              <span>Academic Admission Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Grade Admission & Seat Allocation
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Explore available classes and reserve your admission seat in real-time. Once reserved,
              your seat is held for 10 minutes to allow you to confirm enrollment.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchClasses(true)}
              isLoading={isRefreshing}
              leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh Seats
            </Button>
            <Button variant="default" size="sm" onClick={onViewMyApplications}>
              My Applications
            </Button>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7 pt-6 border-t border-zinc-100">
          <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Grade Divisions</span>
              <Layers className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 mt-1.5 tracking-tight">{classes.length}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Active class sections</p>
          </div>

          <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Open Seats</span>
              <Armchair className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-extrabold text-orange-600 mt-1.5 tracking-tight">
              {stats.availableSeats}{' '}
              <span className="text-xs font-normal text-zinc-400">/ {stats.totalSeats}</span>
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Available for reservation</p>
          </div>

          <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Active Holds</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-700 mt-1.5 tracking-tight">{stats.heldSeats}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Temporary 10m holds</p>
          </div>

          <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Confirmed Admissions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1.5 tracking-tight">{stats.confirmedSeats}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Officially enrolled</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grade or section (e.g. Class 6, Class 9)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/15 shadow-2xs transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 pl-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <div className="flex bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/60">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-orange-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              All ({classes.length})
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'available'
                  ? 'bg-orange-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilterType('full')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'full'
                  ? 'bg-orange-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-900">Unable to Fetch Class Data</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => fetchClasses(true)}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white border-zinc-200/80 animate-pulse p-6 h-64 flex flex-col justify-between rounded-2xl">
              <div className="space-y-3">
                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                <div className="h-6 bg-zinc-200 rounded w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-zinc-100 rounded-xl" />
                <div className="h-16 bg-zinc-100 rounded-xl" />
              </div>
              <div className="h-10 bg-zinc-200 rounded-xl" />
            </Card>
          ))}
        </div>
      )}

      {/* Class Cards Grid */}
      {!isLoading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              schoolClass={item}
              onHoldCreated={handleHoldCreated}
              onViewMyApplications={onViewMyApplications}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && filteredClasses.length === 0 && (
        <Card className="text-center py-16 px-4 bg-white border-zinc-200/90 rounded-2xl shadow-2xs">
          <CardContent>
            <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No Admission Classes Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? `No classes matching "${searchQuery}". Try a different keyword.`
                : 'No admission classes are currently active. Head over to the Admin Portal to set up new classes.'}
            </p>
            {!searchQuery && (
              <Button
                variant="default"
                size="sm"
                className="mt-5"
                onClick={onNavigateToAdmin}
              >
                Go to Admin Portal
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
