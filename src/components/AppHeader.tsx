// components/AppHeader.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Search, User, LogOut, Home, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Head from 'next/head';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarThumbnail?: string;
  isConnected?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarThumbnail?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    if (segments.length === 0) return [];

    if (segments[0] === 'events') {
      breadcrumbs.push({ label: 'Events', href: '/events' });
    } else if (segments[0] === 'profile') {
      breadcrumbs.push({ label: 'Profile', href: '/profile' });
      if (segments[1] && segments[1] !== session?.user?.id) {
        breadcrumbs.push({ label: 'User Profile' });
      }
    } else if (segments[0] === 'contact') {
      breadcrumbs.push({ label: 'Contact', href: '/contact' });
    } else if (segments[0] === 'privacy') {
      breadcrumbs.push({ label: 'Privacy Policy', href: '/privacy' });
    } else if (segments[0] === 'terms') {
      breadcrumbs.push({ label: 'Terms of Service', href: '/terms' });
    }

    return breadcrumbs;
  };

  // Fetch user profile data for the logged-in user
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session?.user?.id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

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

  const isActivePage = (path: string) => {
    return pathname === path;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      {/* Structured Data for Organization */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Seattle Anti-Freeze",
              "url": "https://seattle-anti-freeze.vercel.app",
              "description": "Seattle's premier social events platform fighting social isolation through genuine connections",
              "sameAs": ["https://www.instagram.com/seattle.anti.freeze/"],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Seattle",
                "addressRegion": "WA",
                "addressCountry": "US"
              },
              "areaServed": {
                "@type": "City",
                "name": "Seattle",
                "sameAs": "https://en.wikipedia.org/wiki/Seattle"
              }
            })
          }}
        />
      </Head>

      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo with SEO-friendly text */}
            <Link href="/" className="flex items-center" title="Seattle Anti-Freeze - Home">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Seattle Anti-Freeze
              </h1>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
              <Link 
                href="/"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage('/') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                aria-current={isActivePage('/') ? 'page' : undefined}
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
                aria-current={isActivePage('/events') ? 'page' : undefined}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </Link>
            </nav>

            {/* Mobile Navigation - Icon Only */}
            <nav className="md:hidden flex items-center space-x-4" role="navigation" aria-label="Mobile navigation">
              <Link 
                href="/"
                className={`p-2 rounded-md transition-colors ${
                  isActivePage('/') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Home"
                aria-current={isActivePage('/') ? 'page' : undefined}
              >
                <Home className="w-5 h-5" />
              </Link>
              
              <Link 
                href="/events"
                className={`p-2 rounded-md transition-colors ${
                  isActivePage('/events') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Events"
                aria-current={isActivePage('/events') ? 'page' : undefined}
              >
                <Calendar className="w-5 h-5" />
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 md:mx-8 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  aria-label="Search for users"
                  role="searchbox"
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
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              {user.avatarThumbnail ? (
                                <img
                                  src={user.avatarThumbnail}
                                  alt={`${user.name}'s profile picture`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                              )}
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
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-600 transition-colors"
                    title={`Logged in as ${session.user?.email}`}
                    aria-label="User menu"
                    aria-expanded={showProfileDropdown}
                  >
                    {userProfile?.avatarThumbnail ? (
                      <img
                        src={userProfile.avatarThumbnail}
                        alt={`${userProfile.name || 'Your'} profile picture`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                    )}
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
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-gray-800">
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500" />}
                  {crumb.href ? (
                    <Link 
                      href={crumb.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-300 font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}