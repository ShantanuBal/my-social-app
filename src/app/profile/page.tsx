'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Calendar, MapPin, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import TeamFooter from '../../components/TeamFooter';
import AppHeader from '../../components/AppHeader';

interface UserRegistration {
  eventId: string
  eventTitle?: string
  registeredAt: string
  name: string
  email: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<UserRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Fetch user's event registrations
    fetchUserRegistrations()
  }, [session, status, router])

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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
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
      {/* Header */}
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
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
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
                  {session.user?.name || 'Anonymous User'}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{session.user?.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Member since {new Date().getFullYear()}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-gray-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Seattle, WA</span>
                  </div>
                </div>
              </div>

              {/* Edit Button - Mobile responsive */}
              <div className="flex justify-center md:justify-end">
                <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full md:w-auto justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

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
                  className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration, index) => (
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
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {registrations.length}
              </div>
              <div className="text-gray-400">Events Joined</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {new Set(registrations.map(r => new Date(r.registeredAt).getMonth())).size}
              </div>
              <div className="text-gray-400">Active Months</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                Seattle
              </div>
              <div className="text-gray-400">Location</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <TeamFooter />
    </div>
  )
}