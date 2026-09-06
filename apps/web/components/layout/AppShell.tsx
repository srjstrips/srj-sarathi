'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar }  from './Topbar';
import { cn } from '@/lib/utils';

// Mobile sidebar drawer overlay
function MobileDrawer({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={cn(
        'fixed left-0 top-0 bottom-0 z-50 lg:hidden transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {children}
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  const handleToggle = () => {
    setCollapsed(v => {
      localStorage.setItem('sidebar-collapsed', String(!v));
      return !v;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sidebar collapsed={collapsed} onToggle={handleToggle} />
        </div>
      </div>

      {/* Mobile sidebar */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </MobileDrawer>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenuClick={() => setMobileOpen(v => !v)}
          sidebarCollapsed={collapsed}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
