'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { filterNavForUser } from '@/lib/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle:  () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname  = usePathname();
  const user      = useAuthStore(s => s.user);
  const sections  = filterNavForUser(user?.permissions ?? []);

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#1A1A1A] transition-all duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-white/8 flex-shrink-0',
        collapsed ? 'h-14 justify-center px-2' : 'h-14 px-4 gap-3',
      )}>
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image src="/logo.png" alt="SRJ Sarathi" fill className="object-contain" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">SRJ Sarathi</div>
            <div className="text-[#6B6B6B] text-[10px] leading-tight">HRMS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-5">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <div className="px-4 mb-1 text-[10px] font-semibold tracking-widest text-[#6B6B6B]">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon   = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors group',
                        active
                          ? 'bg-orange-500/15 text-orange-400 font-medium'
                          : 'text-[#D4D0C8] hover:bg-white/6 hover:text-white',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          'flex-shrink-0',
                          active ? 'text-orange-400' : 'text-[#757575] group-hover:text-white',
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/8 p-2">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-2 rounded-md text-[#6B6B6B] hover:text-white hover:bg-white/6 transition-colors text-sm',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <><ChevronLeft size={16} /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
