'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function UserStatusIcon() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  if (status === 'loading') {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    // User is logged in
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors"
            title={`Logged in as ${session.user?.email}`}
          >
            <User size={20} />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <p className="font-medium">Signed in as:</p>
                <p className="text-gray-500 truncate">{session.user?.email}</p>
              </div>
              <Link 
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <User size={16} />
                Profile
              </Link>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  signOut();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is not logged in
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link href="/auth/signin">
        <button
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
          title="Sign In"
        >
          <LogIn size={20} />
        </button>
      </Link>
    </div>
  );
}