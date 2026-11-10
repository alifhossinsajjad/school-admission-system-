import React, { useState } from 'react';
import type { StudentHold } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { api, ApiError } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDateTime, getTimeRemaining } from '@/utils';
import { CheckCircle2, Trash2, CreditCard, AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

interface HoldDetailCardProps {
  hold: StudentHold;
  onRefresh: () => void;
}

export const HoldDetailCard: React.FC<HoldDetailCardProps> = ({ hold, onRefresh }) => {
  const { student } = useStudent();
  const { success, error } = useToast();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Live expiration state without requiring page reload
  const [hasTimerExpired, setHasTimerExpired] = useState(false);
  const isTimeUp = getTimeRemaining(hold.expiresAt).isExpired;
  const isExpired = hasTimerExpired || isTimeUp;

  const handleExpire = () => {
    setHasTimerExpired(true);
    onRefresh();
  };

  const isHeld = hold.status === 'HELD' && !isExpired;
  const isConfirmed = hold.status === 'CONFIRMED';
  const isEffectivelyExpired = hold.status === 'EXPIRED' || (hold.status === 'HELD' && isExpired);

  const handleConfirmAdmission = async () => {
    if (isEffectivelyExpired) {
      error('Hold Expired', 'The 10-minute seat hold has expired. Fee payment is no longer permitted.');
      return;
    }

    setIsConfirming(true);
    try {
      await api.confirmHold(hold.holdId, student.id);
      setIsConfirmDialogOpen(false);
      success(
        'Admission Confirmed!',
        `Your seat in ${hold.className} is now permanently booked.`
      );
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) {
        error('Confirmation Failed', err.message);
      } else {
        error('Server Error', 'An unexpected error occurred while confirming admission.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelHold = async () => {
    setIsCancelling(true);
    try {
      await api.cancelHold(hold.holdId, student.id);
      setIsCancelDialogOpen(false);
      success(
        'Hold Cancelled',
        `Seat reservation in ${hold.className} has been released.`
      );
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) {
        error('Cancellation Failed', err.message);
      } else {
        error('Server Error', 'Failed to cancel the application.');
      }
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
                  ID: {hold.holdId.slice(0, 8)}...
                </span>
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  {hold.className}
                </CardTitle>
              </div>
              <Badge status={isEffectivelyExpired ? 'EXPIRED' : hold.status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Metadata breakdown */}
            <div className="space-y-2 text-xs py-2 bg-zinc-50/70 rounded-xl p-3 border border-zinc-200/60">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Hold Tracking ID:</span>
                <span className="text-zinc-800 text-[11px] truncate max-w-[170px] sm:max-w-none">
                  {hold.holdId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Class ID:</span>
                <span className="text-zinc-800 text-[11px] truncate max-w-[170px] sm:max-w-none">
                  {hold.classId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">
                  {isHeld ? 'Expires At:' : 'Expired / Recorded:'}
                </span>
                <span className="text-zinc-700 text-[11px]">{formatDateTime(hold.expiresAt)}</span>
              </div>
            </div>

            {/* Live Countdown Timer (When Active HELD) */}
            {isHeld && (
              <div className="my-1">
                <CountdownTimer expiresAt={hold.expiresAt} onExpire={handleExpire} />
              </div>
            )}

            {/* Expired State Notice */}
            {isEffectivelyExpired && hold.status !== 'CANCELLED' && (
              <div className="p-3.5 rounded-xl bg-zinc-100/70 border border-zinc-200 flex items-start gap-3 text-zinc-700 text-xs">
                <AlertOctagon className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-zinc-800">Reservation Expired (EXPIRED)</strong>
                  <span className="text-zinc-500 leading-relaxed">
                    The 10-minute reservation window has ended. The seat was automatically restored to the open quota. Fee payment is disabled.
                  </span>
                </div>
              </div>
            )}

            {/* Confirmed State Banner */}
            {isConfirmed && (
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3 text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-emerald-800">Enrollment Confirmed</strong>
                  <span className="text-emerald-700 leading-relaxed">
                    Your seat is permanently allocated. No additional payments or verifications required.
                  </span>
                </div>
              </div>
            )}

            {/* Cancelled State Banner */}
            {hold.status === 'CANCELLED' && (
              <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/70 flex items-start gap-3 text-rose-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-rose-800">Application Cancelled</strong>
                  <span className="text-rose-700 leading-relaxed">
                    This reservation was released by the applicant. You may apply again if seats are available.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Action Controls */}
        <CardFooter className="pt-3 pb-3 border-t border-zinc-100 flex items-center gap-2">
          {isHeld ? (
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
          ) : isEffectivelyExpired && hold.status !== 'CANCELLED' && hold.status !== 'CONFIRMED' ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full opacity-60 cursor-not-allowed text-zinc-400 bg-zinc-50 border-zinc-200 text-xs"
              leftIcon={<AlertOctagon className="w-4 h-4" />}
            >
              Reservation Expired (Payment Closed)
            </Button>
          ) : isConfirmed ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official Student Enrollment Complete</span>
            </div>
          ) : null}
        </CardFooter>
      </Card>

      {/* Confirm Admission Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Student Admission</DialogTitle>
            <DialogDescription>
              Complete the admission fee payment to permanently secure the seat in {hold.className}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Simulated Fee Processing</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Confirming converts your temporary 10-minute hold into a permanently registered seat.
              </p>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Grade / Section:</span>
                <strong className="text-zinc-900 font-semibold">{hold.className}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Applicant BRN:</span>
                <span className="text-zinc-800">{student.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Admission Fee:</span>
                <span className="font-semibold text-emerald-700">Simulated / Verified</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isConfirming}
              >
                Back
              </Button>
              <Button
                type="button"
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
              Are you sure you want to release your reserved seat in {hold.className}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Immediate Seat Release Notice</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Cancelling this hold immediately releases the seat back into the public pool for other applicants. This action cannot be reversed.
              </p>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Class:</span>
                <span className="font-semibold text-zinc-800">{hold.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Hold Tracking ID:</span>
                <span className="text-zinc-800 text-[11px]">{hold.holdId}</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Reservation
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
