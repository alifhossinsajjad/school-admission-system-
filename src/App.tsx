import React, { useState, useEffect, useCallback } from 'react';
import type { ViewType } from '@/types';
import { ToastProvider } from '@/context/ToastContext';
import { StudentProvider } from '@/context/StudentContext';
import { Navbar } from '@/components/navigation/Navbar';
import { ClassList } from '@/features/classes/ClassList';
import { MyApplications } from '@/features/holds/MyApplications';
import { AdminPortal } from '@/features/admin/AdminPortal';
import { GraduationCap, Phone, Mail } from 'lucide-react';

export const AppContent: React.FC = () => {
  // Manual URL hash-based routing for full control, zero reload, and back/forward browser support
  const getInitialView = (): ViewType => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash === 'my-applications' || hash === 'applications') return 'my-applications';
    if (hash === 'admin' || hash === 'admin-portal') return 'admin';
    return 'classes';
  };

  const [currentView, setCurrentView] = useState<ViewType>(getInitialView);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'classes' && (
          <ClassList
            onViewMyApplications={() => handleViewChange('my-applications')}
            onNavigateToAdmin={() => handleViewChange('admin')}
          />
        )}

        {currentView === 'my-applications' && (
          <MyApplications onBrowseClasses={() => handleViewChange('classes')} />
        )}

        {currentView === 'admin' && <AdminPortal />}
      </main>

      {/* Real-world Professional Educational SaaS Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-zinc-500 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-zinc-900">EduAdmit Systems</span>
            </div>
            <p className="text-zinc-500 text-xs">
              School Admission & Real-Time Seat Allocation Platform.
            </p>
            <p className="text-[11px] text-zinc-400">
              © 2026 EduAdmit Inc. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600 font-medium">
            <a href="#/classes" onClick={() => handleViewChange('classes')} className="hover:text-orange-600 transition-colors">
              Admission Guidelines
            </a>
            <span className="text-zinc-300">•</span>
            <a href="#/classes" onClick={() => handleViewChange('classes')} className="hover:text-orange-600 transition-colors">
              Seat Quota Policies
            </a>
            <span className="text-zinc-300">•</span>
            <a href="#/classes" onClick={() => handleViewChange('classes')} className="hover:text-orange-600 transition-colors">
              Terms & Privacy
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-zinc-600 bg-zinc-50 px-3.5 py-2 rounded-xl border border-zinc-200/80">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-medium text-xs">+880 9612-000000</span>
            </div>
            <span className="hidden sm:inline text-zinc-300">|</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs">admissions@eduadmit.edu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <StudentProvider>
        <AppContent />
      </StudentProvider>
    </ToastProvider>
  );
}
