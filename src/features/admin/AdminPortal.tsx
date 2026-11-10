import React, { useState, useEffect, useCallback } from 'react';
import type { SchoolClass } from '@/types';
import { api, ApiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck,
  PlusCircle,
  RotateCw,
  Layers,
  Clock,
  CheckCircle2,
  Users,
  FileCheck,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { success, error } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create Class Form
  const [className, setClassName] = useState('');
  const [totalSeats, setTotalSeats] = useState<number | ''>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchClasses = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await api.getClasses();
      setClasses(data || []);
    } catch (err) {
      error(
        'Backend Error',
        err instanceof Error ? err.message : 'Failed to fetch class list from backend.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    let isCurrent = true;

    api.getClasses()
      .then((data) => {
        if (isCurrent) setClasses(data || []);
      })
      .catch((err) => {
        if (isCurrent) {
          error(
            'Backend Error',
            err instanceof Error ? err.message : 'Failed to fetch class list from backend.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    const interval = setInterval(() => fetchClasses(), 6000);
    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [fetchClasses, error]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = className.trim();
    if (!name || name.length < 2) {
      setFormError('Class name must be at least 2 characters.');
      return;
    }
    if (typeof totalSeats !== 'number' || totalSeats <= 0) {
      setFormError('Total seats must be a positive integer greater than zero.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const newClass = await api.createClass({ name, totalSeats });
      success('Class Created Successfully', `Created "${newClass.name}" with ${newClass.totalSeats} seats.`);
      setClassName('');
      setTotalSeats(60);
      fetchClasses(true);
    } catch (err) {
      if (err instanceof ApiError) {
        error('Failed to Create Class', err.message);
      } else {
        error('Error', 'An unexpected error occurred while creating the class.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (name: string, seats: number) => {
    setClassName(name);
    setTotalSeats(seats);
    setFormError('');
  };

  const totalAvailable = classes.reduce((acc, c) => acc + c.availableSeats, 0);

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>School Authority Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Class Capacity & Admissions Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure seat quotas, monitor real-time admission numbers, and oversee school-wide enrollment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchClasses(true)}
          isLoading={isRefreshing || isLoading}
          leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Grid: Create Class & Admission Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Class Card */}
        <Card className="bg-white border-zinc-200/90 shadow-2xs rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <CardTitle className="text-base font-bold text-zinc-900">Create New Class</CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              Add a new grade division or shift with fixed seat capacity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <Input
                label="Class / Grade Name"
                placeholder="e.g. Class 6 - Morning Shift"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  if (formError) setFormError('');
                }}
                error={formError && !className.trim() ? formError : undefined}
                required
              />

              <Input
                label="Total Seat Capacity"
                type="number"
                min="1"
                max="5000"
                value={totalSeats}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setTotalSeats(isNaN(val as number) ? '' : val);
                  if (formError) setFormError('');
                }}
                error={formError && typeof totalSeats !== 'number' ? formError : undefined}
                required
              />

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-medium text-zinc-400 block">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('Class 6 - Morning Shift', 120)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/60 font-medium transition-colors cursor-pointer"
                  >
                    Class 6 Morning (120)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('Class 6 - Day Shift', 120)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/60 font-medium transition-colors cursor-pointer"
                  >
                    Class 6 Day (120)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('Class 9 - Science', 80)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/60 font-medium transition-colors cursor-pointer"
                  >
                    Class 9 Science (80)
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full mt-2"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create Admission Class
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Real-World School Admission Policy & Guidelines Card */}
        <Card className="lg:col-span-2 bg-white border-zinc-200/90 shadow-2xs rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-orange-600" />
              <CardTitle className="text-base font-bold text-zinc-900">Seat Allocation & Policies</CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              Operational rules governing student seat reservations and enrollment.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>10-Minute Hold Window</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  When a student reserves a seat, it is held for 10 minutes to allow fee payment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Single Hold Rule</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Each student is restricted to 1 active hold per class to eliminate seat hoarding.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
                  <RotateCw className="w-3.5 h-3.5 text-orange-600" />
                  <span>Auto Seat Recovery</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  If payment is not completed in 10 minutes, the seat returns to the public pool automatically.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs text-zinc-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span>
                  Total Open Seats Available Across All Grades: <strong className="text-zinc-900 font-bold">{totalAvailable}</strong>
                </span>
              </div>
              <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-700 font-medium">
                Live Status
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Capacity Table Card */}
      <Card className="bg-white border-zinc-200/90 overflow-hidden shadow-2xs rounded-2xl">
        <CardHeader className="border-b border-zinc-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-800" />
              <CardTitle className="text-sm font-bold text-zinc-900">Grade Divisions & Quota Breakdown</CardTitle>
            </div>
            <span className="text-[11px] text-zinc-400">Live Counters</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {classes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-200/70">
                  <tr>
                    <th className="px-5 py-3">Class / Section</th>
                    <th className="px-5 py-3">Total Capacity</th>
                    <th className="px-5 py-3">Available</th>
                    <th className="px-5 py-3">Pending Holds</th>
                    <th className="px-5 py-3">Confirmed</th>
                    <th className="px-5 py-3 min-w-[160px]">Fill Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {classes.map((cls) => {
                    const booked = cls.confirmedSeats + cls.heldSeats;
                    const fillPct = cls.totalSeats > 0 ? Math.round((booked / cls.totalSeats) * 100) : 0;
                    return (
                      <tr key={cls.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-zinc-900">
                          {cls.name}
                          <span className="block text-[10px] text-zinc-400">ID: {cls.id.slice(0, 8)}...</span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-zinc-800">{cls.totalSeats}</td>
                        <td className="px-5 py-3.5 font-bold text-zinc-900">{cls.availableSeats}</td>
                        <td className="px-5 py-3.5 font-bold text-amber-700">{cls.heldSeats}</td>
                        <td className="px-5 py-3.5 font-bold text-emerald-700">{cls.confirmedSeats}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Progress value={fillPct} className="h-1.5 bg-zinc-100" />
                            </div>
                            <span className="font-medium text-xs text-zinc-700 w-8 text-right">
                              {fillPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No classes created yet. Use the form above to add your first admission class.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
