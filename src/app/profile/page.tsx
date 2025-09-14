// app/profile/page.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Calendar, MapPin, LogOut, Settings, Users, UserCheck, UserX, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import TeamFooter from '../../components/TeamFooter';
import AppHeader from '../../components/AppHeader';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: string;
  memberSince?: string;
  profilePrivacy?: 'public' | 'private';
}

interface UserRegistration {
  eventId: string
  eventTitle?: string
  registeredAt: string
  name: string
  email: string
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

interface PendingRequest {
  requestId: string;
  requesterId: string;
  requestedAt: string;
  status: string;
  user: ConnectionUser;
}

interface PendingOutgoingRequest {
  requestId: string;
  recipientId: string;
  requestedAt: string;
  status: string;
  user: ConnectionUser;
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [registrations, setRegistrations] = useState<UserRegistration[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<PendingOutgoingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [connectionsLoading, setConnectionsLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [outgoingLoading, setOutgoingLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Only fetch data once when component mounts and session is ready
    fetchUserProfile()
    fetchUserRegistrations()
    fetchConnections()
    fetchPendingRequests()
    fetchOutgoingRequests()
  }, [status])

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true)
      if (session?.user?.id) {
        const response = await fetch(`/api/users/${session.user.id}`)
        
        if (response.ok) {
          const userData = await response.json()
          setUserProfile(userData)
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchUserRegistrations = async () => {
    try {
      const response = await fetch('/api/user/registrations')
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      setConnectionsLoading(true)
      if (session?.user?.id) {
        const response = await fetch(`/api/connections/${session.user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setConnections(data.connections || [])
        }
      }
    } catch (err) {
      console.error('Error fetching connections:', err)
    } finally {
      setConnectionsLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      setPendingLoading(true)
      const response = await fetch('/api/connections/pending')
      
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests || [])
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err)
    } finally {
      setPendingLoading(false)
    }
  }

  const fetchOutgoingRequests = async () => {
    try {
      setOutgoingLoading(true)
      if (session?.user?.id) {
        const response = await fetch(`/api/connections/outgoing`)
        
        if (response.ok) {
          const data = await response.json()
          setOutgoingRequests(data.requests || [])
        }
      }
    } catch (err) {
      console.error('Error fetching outgoing requests:', err)
    } finally {
      setOutgoingLoading(false)
    }
  }

  const handleAcceptRequest = async (requesterId: string) => {
    try {
      const response = await fetch('/api/connections/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: requesterId }),
      })
      
      if (response.ok) {
        setPendingRequests(prev => prev.filter(req => req.requesterId !== requesterId))
        fetchConnections()
      }
    } catch (err) {
      console.error('Failed to accept request:', err)
    }
  }

  const handleIgnoreRequest = async (requesterId: string) => {
    try {
      const response = await fetch('/api/connections/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: requesterId }),
      })
      
      if (response.ok) {
        setPendingRequests(prev => prev.filter(req => req.requesterId !== requesterId))
      }
    } catch (err) {
      console.error('Failed to ignore request:', err)
    }
  }

  const handlePrivacyToggle = async () => {
    if (!userProfile?.id) return
    
    const newPrivacySetting = userProfile.profilePrivacy === 'private' ? 'public' : 'private'
    
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy: newPrivacySetting }),
      })
      
      if (response.ok) {
        setUserProfile(prev => prev ? { ...prev, profilePrivacy: newPrivacySetting } : null)
      } else {
        console.error('Failed to update privacy setting')
      }
    } catch (err) {
      console.error('Error updating privacy:', err)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />

      <header className="w-full py-8 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              My Profile
            </h1>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="w-full py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Info */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name || 'User'}
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
                  {userProfile?.name || session?.user?.name}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{userProfile?.email || session?.user?.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Member since {userProfile?.memberSince}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{userProfile?.location || 'Earth'}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button and Privacy Toggle */}
              <div className="flex flex-col justify-center md:justify-end space-y-3">
                {/* Privacy Toggle */}
                <div className="flex flex-col items-center md:items-end space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {userProfile?.profilePrivacy === 'private' ? 'Private' : 'Public'} Profile
                      </span>
                      
                      {/* Info Icon with Tooltip */}
                      <div className="relative group">
                        <Info className="w-4 h-4 text-blue-400 cursor-help" />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                          <div className="text-center">
                            Other users won&apos;t be able to view the events you are attending if your profile is &quot;private&quot;.
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handlePrivacyToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        userProfile?.profilePrivacy === 'private' 
                          ? 'bg-orange-600' 
                          : 'bg-green-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          userProfile?.profilePrivacy === 'private' 
                            ? 'translate-x-1' 
                            : 'translate-x-6'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Edit Button */}
                <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full md:w-auto justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Pending Incoming Connection Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Pending Connection Requests
                <span className="ml-2 text-sm font-normal text-orange-400">
                  ({pendingRequests.length})
                </span>
              </h3>
              
              {pendingLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-20 h-8 bg-gray-700 rounded"></div>
                        <div className="w-20 h-8 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium text-sm">
                              {request.user.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-white truncate">
                                {request.user.name}
                              </h4>
                              <span className="ml-2 text-xs text-orange-400">
                                wants to connect
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-1">
                              {request.user.email}
                            </p>
                            
                            {request.user.location && (
                              <div className="flex items-center mt-1">
                                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-400">
                                  {request.user.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleAcceptRequest(request.requesterId)}
                            className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md transition-colors text-sm"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleIgnoreRequest(request.requesterId)}
                            className="flex items-center px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors text-sm"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Ignore
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outgoing Connection Requests */}
          {outgoingRequests.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-blue-300 mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Sent Connection Requests
                <span className="ml-2 text-sm font-normal text-blue-400">
                  ({outgoingRequests.length})
                </span>
              </h3>
              
              {outgoingLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {request.user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-white truncate">
                              {request.user.name}
                            </h4>
                            <span className="ml-2 text-xs text-blue-400">
                              request sent
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {request.user.email}
                          </p>
                          
                          {request.user.location && (
                            <div className="flex items-center mt-1">
                              <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-400">
                                {request.user.location}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          Sent {new Date(request.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Two Column Layout for Events and Connections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Event Registrations */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">My Event Registrations</h3>
              
              {registrations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 mb-4">You haven&apos;t registered for any events yet.</p>
                  <Link 
                    href="/events"
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm"
                  >
                    Browse Events
                  </Link>
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
                            Registered on {new Date(registration.registeredAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Registered as: {registration.name} ({registration.email})
                          </p>
                        </div>
                        <div className="text-green-400 text-sm font-medium">
                          ✓ Registered
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {registrations.length > 5 && (
                    <div className="text-center pt-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View all {registrations.length} registrations
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* My Connections */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">
                My Connections
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
                  <p className="text-gray-400 mb-4">You haven&apos;t made any connections yet.</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Use the search bar to find people and start connecting!
                  </p>
                  <Link 
                    href="/events"
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm"
                  >
                    Meet People at Events
                  </Link>
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {registrations.length}
              </div>
              <div className="text-gray-400">Events Joined</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {connections.length}
              </div>
              <div className="text-gray-400">Connections</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {new Set(registrations.map(r => new Date(r.registeredAt).getMonth())).size}
              </div>
              <div className="text-gray-400">Active Months</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                Seattle
              </div>
              <div className="text-gray-400">Location</div>
            </div>
          </div>
        </div>
      </main>

      <TeamFooter />
    </div>
  )
}