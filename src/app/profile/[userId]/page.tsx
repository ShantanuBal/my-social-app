// app/profile/[userId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Mail, Calendar, MapPin, UserPlus, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import AppHeader from '../../../components/AppHeader';
import TeamFooter from '../../../components/TeamFooter';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: string;
  memberSince?: string;
  isConnected?: boolean;
}

interface UserRegistration {
  eventId: string;
  eventTitle?: string;
  registeredAt: string;
}

interface ConnectionUser {
  id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  memberSince: string;
}

interface Connection {
  userId: string;
  connectedAt: string;
  status: string;
  user: ConnectionUser;
}

export default function UserProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.userId as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if this is the current user's profile
  const isOwnProfile = session?.user?.id === userId || session?.user?.email === userId;

  useEffect(() => {
    if (isOwnProfile) {
      // Redirect to the regular profile page for own profile
      window.location.href = '/profile';
      return;
    }

    fetchUserProfile();
    fetchConnections();
  }, [userId, isOwnProfile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await fetch(`/api/users/${userId}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const userData = await userResponse.json();
      setUser(userData);

      // Fetch user's public registrations (optional)
      try {
        const registrationsResponse = await fetch(`/api/users/${userId}/registrations`);
        if (registrationsResponse.ok) {
          const registrationsData = await registrationsResponse.json();
          setRegistrations(registrationsData);
        }
      } catch (err) {
        // Registrations are optional, don't fail the whole page
        console.log('Could not load user registrations');
      }

    } catch (err) {
      setError('User not found or could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      setConnectionsLoading(true);
      const response = await fetch(`/api/connections/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch(`/api/connections/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        setUser(prev => prev ? { ...prev, isConnected: true } : null);
        // Refresh connections list to show the new connection
        fetchConnections();
      }
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Profile Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link href="/events" className="text-blue-400 hover:text-blue-300">
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />
      
      <main className="w-full py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/events" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>

          {/* Profile Info */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.name}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Member since {user.memberSince || new Date().getFullYear()}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{user.location || 'Seattle, WA'}</span>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <div className="flex justify-center md:justify-end">
                {user.isConnected ? (
                  <div className="text-green-400 font-medium flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connected
                  </div>
                ) : (
                  <button 
                    onClick={handleConnect}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full md:w-auto justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Two Column Layout for Events and Connections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Events */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">Recent Events</h3>
              
              {registrations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">No recent events to show.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.slice(0, 5).map((registration, index) => (
                    <div
                      key={`${registration.eventId}-${index}`}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            {registration.eventTitle || `Event ${registration.eventId}`}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Attended on {new Date(registration.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-green-400 text-sm font-medium">
                          ✓ Attended
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connections */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">
                Connections
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({connections.length})
                </span>
              </h3>

              {connectionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">No connections yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.slice(0, 6).map((connection) => (
                    <Link
                      key={connection.user.id}
                      href={`/profile/${connection.user.id}`}
                      className="block hover:bg-gray-800 rounded-lg p-3 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Profile Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {connection.user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {connection.user.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              Connected {new Date(connection.connectedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {connection.user.location && (
                            <div className="flex items-center mt-1">
                              <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-400">
                                {connection.user.location}
                              </span>
                            </div>
                          )}
                          
                          {connection.user.bio && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {connection.user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {connections.length > 6 && (
                    <div className="text-center pt-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View all {connections.length} connections
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <TeamFooter />
    </div>
  );
}