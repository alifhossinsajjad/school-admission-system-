import React, { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { formatBRN, isValidBRN } from '@/utils';
import { UserCheck, Users, ChevronDown, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const StudentIdentityBar: React.FC = () => {
  const { student, setStudent, setCustomStudent, demoStudents } = useStudent();
  const { success, error } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customBRN, setCustomBRN] = useState('');
  const [customName, setCustomName] = useState('');
  const [brnError, setBrnError] = useState('');

  const handleSelectDemo = (demo: typeof student) => {
    setStudent(demo);
    setIsDialogOpen(false);
    success('Applicant Switched', `Active student is now: ${demo.name}`);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customBRN.trim();
    if (!clean) {
      setBrnError('Please enter a 17-digit birth registration number.');
      return;
    }
    if (!isValidBRN(clean)) {
      setBrnError('BRN must be exactly 17 digits (e.g. 20051234567890123).');
      return;
    }

    setBrnError('');
    const ok = setCustomStudent(clean, customName.trim() || undefined);
    if (ok) {
      setIsDialogOpen(false);
      setCustomBRN('');
      setCustomName('');
      success('Custom Applicant Set', `Student ID: ${clean}`);
    } else {
      error('Invalid Student ID', 'Please check the 17-digit number format.');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 bg-white border border-zinc-200/90 rounded-xl p-1.5 sm:px-3 sm:py-1.5 shadow-2xs">
        <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
          <UserCheck className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 font-normal">Active Student:</span>
            <span className="text-[10px] font-medium text-orange-800 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200/60">
              Applicant
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <h4 className="text-xs font-semibold text-zinc-900 truncate">{student.name}</h4>
            <span className="text-xs text-zinc-400 hidden sm:inline-block">
              ({formatBRN(student.id)})
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium border border-zinc-200/60 transition-colors cursor-pointer shrink-0"
        >
          <Users className="w-3.5 h-3.5 text-zinc-600" />
          <span className="hidden sm:inline">Switch</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>
      </div>

      {/* Official Radix shadcn Dialog with Compact Tabs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-1">
            <DialogTitle>Switch Student Identity</DialogTitle>
            <DialogDescription>
              Choose a demo applicant profile or enter a custom 17-digit BRN.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preset" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-xl">
              <TabsTrigger value="preset" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs">
                Demo Applicants
              </TabsTrigger>
              <TabsTrigger value="custom" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs">
                Custom 17-Digit BRN
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="space-y-2 mt-3">
              {demoStudents.map((demo) => {
                const isSelected = demo.id === student.id;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleSelectDemo(demo)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/70 border-orange-500 text-zinc-900 shadow-2xs'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 text-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs sm:text-sm text-zinc-900 flex items-center gap-2">
                        {demo.name}
                        {isSelected && (
                          <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-md font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        BRN: {formatBRN(demo.id)}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent value="custom" className="mt-3">
              <form onSubmit={handleSaveCustom} className="space-y-3">
                <Input
                  label="Student Name (Optional)"
                  placeholder="e.g. Maria Sultana"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <Input
                  label="17-Digit Birth Registration Number (BRN)"
                  placeholder="e.g. 20051234567890123"
                  value={customBRN}
                  onChange={(e) => {
                    setCustomBRN(e.target.value.replace(/\D/g, '').slice(0, 17));
                    if (brnError) setBrnError('');
                  }}
                  error={brnError}
                  helperText={`${customBRN.length}/17 digits entered`}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm">
                    Set Active Student
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
