'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import Link from 'next/link';
import UserMenu from '@/components/ui/UserMenu';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, setUser: setAuthUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuthUser]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Projects', href: '/projects', icon: DocumentDuplicateIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="text-xl font-bold text-white">Menu</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href
              : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`mt-1 group flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-150 ${
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-[30px]" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop header - now fixed */}
      <header className="fixed top-0 right-0 left-0 z-30 bg-[#196BF1] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 text-white lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-white">LinkedIn Content Generator</h1>
              </div>
            </div>
            <div className="flex items-center">
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main container with adjusted padding for fixed header */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Desktop sidebar - adjusted top position */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <nav className="mt-5 px-2 flex-1">
              {navigation.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`mt-1 group flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-150 ${
                      isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-[30px]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content - adjusted for fixed header */}
        <main className="flex-1 overflow-auto lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
