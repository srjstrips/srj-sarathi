'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Bell, Search, Menu, ChevronDown, User, Lock, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="h-14 bg-white border-b border-[#E2E0DC] flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-[#757575] hover:bg-[#F4F3F0] hover:text-[#1A1A1A] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#F4F3F0] text-[#757575] text-sm',
            'hover:bg-[#EBEBEB] transition-colors text-left',
          )}
        >
          <Search size={15} />
          <span className="flex-1 hidden sm:block">Search employees, tasks, projects...</span>
          <span className="hidden sm:flex items-center gap-1 text-xs text-[#ABABAB] bg-white border border-[#E2E0DC] px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-md text-[#757575] hover:bg-[#F4F3F0] hover:text-[#1A1A1A] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#F4F3F0] transition-colors outline-none">
            <span className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-[#1A1A1A] leading-tight">{user?.name ?? 'User'}</div>
                <div className="text-[11px] text-[#757575] leading-tight capitalize">{user?.role?.toLowerCase() ?? ''}</div>
              </div>
              <ChevronDown size={14} className="text-[#757575] hidden sm:block" />
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2 border-b border-[#E2E0DC]">
              <div className="font-medium text-sm text-[#1A1A1A]">{user?.name}</div>
              <div className="text-xs text-[#757575] truncate">{user?.email}</div>
            </div>
            <DropdownMenuItem onClick={() => router.push('/profile')} className="flex items-center gap-2 cursor-pointer">
              <User size={15} /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="flex items-center gap-2 cursor-pointer">
              <Settings size={15} /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/security')} className="flex items-center gap-2 cursor-pointer">
              <Lock size={15} /> Security
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut size={15} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
