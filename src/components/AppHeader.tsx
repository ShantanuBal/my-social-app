'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Search, User, LogOut, Home, Calendar, UserPlus, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isConnected?: boolean;
}

export default function AppHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real search function - calls your API
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(true);
    searchUsers(query);
  };

  const handleConnectUser = async (userId: string) => {
    try {
      const response = await fetch('/api/connections/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Update the search results to show connected status
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, isConnected: true }
              : user
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to connect:', error.error);
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleInviteUser = async (userId: string) => {
    // TODO: Implement invite logic
    console.log('Inviting user:', userId);
  };

  const isActivePage = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* Just a clickable area to go home - no icon */}
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePage('/') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            
            <Link 
              href="/events"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePage('/events') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (searchQuery.length > 0 || searchResults.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((user) => (
                      <Link 
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={() => setShowSearchResults(false)}
                        className="block px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No users found
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors"
                  title={`Logged in as ${session.user?.email}`}
                >
                  <User className="w-4 h-4" />
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-600 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
                      <p className="font-medium">Signed in as:</p>
                      <p className="text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link 
                      href="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sign In
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            {/* TODO: Add mobile menu toggle */}
          </div>
        </div>

        {/* Mobile Navigation (hidden by default) */}
        <div className="md:hidden border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActivePage('/') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/events"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActivePage('/events') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Events
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}