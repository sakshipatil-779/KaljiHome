'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarDays, 
  Pill, 
  Stethoscope, 
  Users, 
  History, 
  Mail, 
  ShieldAlert 
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Today', href: '/', icon: CalendarDays },
    { label: 'Medications', href: '/medications', icon: Pill },
    { label: 'Appointments', href: '/appointments', icon: Stethoscope },
    { label: 'Care Circle', href: '/care-circle', icon: Users },
    { label: 'Care Timeline', href: '/timeline', icon: History },
    { label: 'Email Outbox', href: '/notifications', icon: Mail },
    { label: 'Safety & Trust', href: '/privacy', icon: ShieldAlert },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-touch inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm sm:text-base font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-kalji-50 text-kalji-800 border-b-2 border-kalji-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-kalji-700' : 'text-slate-500'}`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
