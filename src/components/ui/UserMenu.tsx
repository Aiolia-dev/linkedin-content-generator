import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/auth';

interface UserMenuProps {
  user: User | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { setUser: setAuthUser } = useAuthStore();

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
      
      // Delete session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setAuthUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span className="sr-only">Open user menu</span>
        <Avatar user={user} size="md" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm text-white">Signed in as</p>
            <p className="truncate text-sm font-medium text-white">
              {user?.email}
            </p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleSignOut}
                className={`${
                  active ? 'bg-gray-700' : ''
                } block w-full px-4 py-2 text-left text-sm text-white`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
