import React from 'react';
import type { ViewType } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { GraduationCap, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { StudentIdentityBar } from './StudentIdentityBar';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { myHolds } = useStudent();
  const activeHoldsCount = myHolds.filter((h) => h.status === 'HELD').length;

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'classes',
      label: 'Admission Classes',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'my-applications',
      label: 'My Applications',
      icon: <Clock className="w-4 h-4" />,
      badge: activeHoldsCount > 0 ? activeHoldsCount : undefined,
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onViewChange('classes')}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-zinc-900 tracking-tight block">EduAdmit</span>
              <p className="text-[11px] text-zinc-500 font-normal hidden sm:block -mt-0.5">
                School Admission System
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Sleek Orange Active Pill) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/60">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 text-[10px] font-medium rounded-full ${
                        isActive
                          ? 'bg-orange-700 text-white'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Student Identity Pill */}
          <div className="shrink-0">
            <StudentIdentityBar />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-zinc-200/60 gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-orange-700 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
