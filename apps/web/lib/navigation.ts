import {
  LayoutDashboard, Users, CheckSquare, FolderKanban,
  Lightbulb, Target, Megaphone, MessageSquare, BarChart3,
  Shield, Settings, Building2, Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label:       string;
  href:        string;
  icon:        LucideIcon;
  permission?: string;       // if set, user must have this permission
  badge?:      string;       // e.g. "NEW"
  children?:   NavItem[];
}

export interface NavSection {
  title?:  string;
  items:   NavItem[];
}

// Permission-driven nav — rendered items depend on user.permissions at runtime
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
    ],
  },
  {
    title: 'WORK',
    items: [
      { label: 'Tasks',         href: '/tasks',         icon: CheckSquare,    permission: 'tasks.view' },
      { label: 'Projects',      href: '/projects',      icon: FolderKanban },
      { label: 'KRA',           href: '/kra',           icon: Target,         permission: 'kra.view' },
      { label: 'Kaizen',        href: '/kaizen',        icon: Lightbulb,      permission: 'kaizen.view' },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      { label: 'Employees',     href: '/employees',     icon: Users,          permission: 'employees.view' },
      { label: 'Organization',  href: '/organization',  icon: Building2,      permission: 'organization.view' },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { label: 'Announcements', href: '/announcements', icon: Megaphone,      permission: 'notices.view' },
      { label: 'Chat',          href: '/chat',          icon: MessageSquare },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Reports',       href: '/reports',       icon: BarChart3,      permission: 'reports.view' },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Security',      href: '/security',      icon: Shield,         permission: 'security.dashboard.view' },
      { label: 'Access Control',href: '/access',        icon: Lock,           permission: 'roles.view' },
      { label: 'Settings',      href: '/settings',      icon: Settings,       permission: 'settings.view' },
    ],
  },
];

export function filterNavForUser(permissions: string[]): NavSection[] {
  const permSet = new Set(permissions);
  return NAV_SECTIONS
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        !item.permission || permSet.has(item.permission)
      ),
    }))
    .filter(section => section.items.length > 0);
}
