import React, { useState } from 'react';
import type { SchoolClass } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { api, ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Armchair, Sparkles, CheckCircle2, Clock, Trash2, CreditCard, AlertTriangle } from 'lucide-react';

interface ClassCardProps {
  schoolClass: SchoolClass;
  onHoldCreated: () => void;
  onViewMyApplications: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  schoolClass,
  onHoldCreated,
  onViewMyApplications,
}) => {
  const { student, myHolds, refreshMyHolds } = useStudent();
  const { success, error, warning } = useToast();
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Check if current student has an active hold or confirmed seat in this class
  const existingHold = myHolds.find(
    (h) => h.classId === schoolClass.id && (h.status === 'HELD' || h.status === 'CONFIRMED')
  );

  const isFull = schoolClass.availableSeats <= 0;
  const bookedSeats = schoolClass.confirmedSeats + schoolClass.heldSeats;
  const fillPct = schoolClass.totalSeats > 0 ? Math.round((bookedSeats / schoolClass.totalSeats) * 100) : 0;

  const handleApplyHold = async () => {
    if (!student.id) {
      warning('Student ID Required', 'Please enter or select a 17-digit birth registration number (BRN).');
      return;
    }

    if (existingHold) {
      warning(
        'Application Already Active',
        existingHold.status === 'CONFIRMED'
          ? 'You are already enrolled in this class.'
          : 'You already hold an active reservation for this class. Complete payment or cancel to re-apply.'
      );
      onViewMyApplications();
      return;
    }

    setIsReserving(true);
    try {
      await api.createHold(schoolClass.id, student.id);
      success(
        'Seat Reserved (Held)!',
        `Your seat in ${schoolClass.name} is reserved for 10 minutes. Please confirm admission before expiry.`
      );
      onHoldCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          error('Application Conflict (409)', err.message);
        } else if (err.status === 400) {
          error('Invalid Request (400)', err.message);
        } else {
          error('Reservation Failed', err.message);
        }
      } else {
        error('Connection Error', 'Could not reach server. Please try again.');
      }
    } finally {
      setIsReserving(false);
    }
  };

  const handleConfirmAdmission = async () => {
    if (!existingHold) return;
    setIsConfirming(true);
    try {
      await api.confirmHold(existingHold.holdId, student.id);
      setIsConfirmDialogOpen(false);
      success('Admission Confirmed!', `Enrollment for ${schoolClass.name} is complete.`);
      await refreshMyHolds();
      onHoldCreated();
    } catch (err) {
      error('Confirmation Failed', err instanceof Error ? err.message : 'Error confirming hold');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelHold = async () => {
    if (!existingHold) return;
    setIsCancelling(true);
    try {
      await api.cancelHold(existingHold.holdId, student.id);
      setIsCancelDialogOpen(false);
      success('Reservation Released', `Hold for ${schoolClass.name} was cancelled and seat returned to pool.`);
      await refreshMyHolds();
      onHoldCreated();
    } catch (err) {
      error('Cancellation Failed', err instanceof Error ? err.message : 'Error cancelling hold');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Card className="bg-white border-zinc-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between rounded-2xl overflow-hidden">
        <div>
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-medium text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/70 inline-block mb-1.5">
                  Grade & Section
                </span>
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  {schoolClass.name}
                </CardTitle>
              </div>

              {/* Status Badge */}
              {existingHold ? (
                <Badge
                  variant={existingHold.status === 'CONFIRMED' ? 'emerald' : 'amber'}
                  className="gap-1.5"
                >
                  {existingHold.status === 'CONFIRMED' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" /> Hold Active
                    </>
                  )}
                </Badge>
              ) : isFull ? (
                <Badge variant="destructive">Class Full</Badge>
              ) : schoolClass.availableSeats <= 5 ? (
                <Badge variant="amber">Only {schoolClass.availableSeats} Left</Badge>
              ) : (
                <Badge variant="emerald">Seats Available</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Seat Counters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/70">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Armchair className="w-3.5 h-3.5 text-orange-600" />
                  <span>Available Seats</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                  {schoolClass.availableSeats}{' '}
                  <span className="text-xs font-normal text-zinc-400">/ {schoolClass.totalSeats}</span>
                </p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/70">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Confirmed</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1 tracking-tight">
                  {schoolClass.confirmedSeats}
                </p>
              </div>
            </div>

            {/* Seat Progress Gauge */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Capacity Filled</span>
                <span className="text-zinc-700 font-semibold">{fillPct}%</span>
              </div>
              <Progress value={fillPct} className="h-2 bg-zinc-100" />
              <div className="flex justify-between text-[11px] text-zinc-400 pt-0.5">
                <span>{schoolClass.heldSeats} in pending holds</span>
                <span>{schoolClass.availableSeats} open</span>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Action Buttons */}
        <CardFooter className="pt-3 pb-3 border-t border-zinc-100 flex items-center gap-2">
          {existingHold?.status === 'HELD' ? (
            <>
              <Button
                variant="emerald"
                size="sm"
                className="flex-1 font-medium text-xs"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                Confirm Admission
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 text-xs font-medium"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel Hold
              </Button>
            </>
          ) : existingHold?.status === 'CONFIRMED' ? (
            <Button
              variant="outline"
              className="w-full text-emerald-800 border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50 text-xs font-medium"
              onClick={onViewMyApplications}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            >
              Enrolled • View Application
            </Button>
          ) : (
            <Button
              variant={isFull ? 'secondary' : 'default'}
              disabled={isFull}
              isLoading={isReserving}
              onClick={handleApplyHold}
              className="w-full text-xs font-medium"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {isFull ? 'Class Fully Booked' : 'Reserve Seat (Hold)'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Confirm Admission Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Admission ({schoolClass.name})</DialogTitle>
            <DialogDescription>
              Submit simulated fee payment to permanently secure the student seat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-zinc-600 leading-relaxed">
              Confirming admission converts your 10-minute temporary reservation into a permanent student enrollment.
            </p>
            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsConfirmDialogOpen(false)}>
                Back
              </Button>
              <Button
                variant="emerald"
                size="sm"
                isLoading={isConfirming}
                onClick={handleConfirmAdmission}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Pay Fee & Confirm
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Hold Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Seat Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to release the held seat for {schoolClass.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Immediate Seat Release Notice</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Cancelling this hold immediately releases the seat back into the public pool for other applicants.
              </p>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Seat
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                isLoading={isCancelling}
                onClick={handleCancelHold}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
