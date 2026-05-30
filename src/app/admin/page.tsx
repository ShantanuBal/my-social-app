'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import AppHeader from '../../components/AppHeader';

const ADMIN_EMAIL = 'shantanu.r.bal@gmail.com';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  waitlistCount?: number;
  isActive: boolean;
}

interface Registration {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
  isWaitlisted?: boolean;
  waitlistPosition?: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, Registration[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.email !== ADMIN_EMAIL) {
      router.push('/');
      return;
    }

    fetch('/api/admin/events')
      .then(r => r.json())
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session, status, router]);

  const toggleEvent = async (eventId: string) => {
    const next = new Set(expanded);
    if (next.has(eventId)) {
      next.delete(eventId);
      setExpanded(next);
      return;
    }

    next.add(eventId);
    setExpanded(next);

    if (!registrations[eventId]) {
      const res = await fetch(`/api/admin/events/${eventId}/registrations`);
      const data = await res.json();
      setRegistrations(prev => ({ ...prev, [eventId]: data }));
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  };

  const todayString = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.date >= todayString);
  const pastEvents = events.filter(e => e.date < todayString);

  const totalAttendees = events.reduce((sum, e) => sum + (e.attendees || 0), 0);
  const totalWaitlisted = events.reduce((sum, e) => sum + (e.waitlistCount || 0), 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mb-10">Event registrations and attendance overview</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Events</p>
            <p className="text-3xl font-bold text-white">{events.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Attending</p>
            <p className="text-3xl font-bold text-green-400">{totalAttendees}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">On Waitlists</p>
            <p className="text-3xl font-bold text-yellow-400">{totalWaitlisted}</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <h2 className="text-lg font-semibold text-white mb-3">Upcoming Events</h2>
        <div className="space-y-4 mb-12">
          {upcomingEvents.length === 0 && (
            <p className="text-gray-500 text-sm">No upcoming events.</p>
          )}
          {upcomingEvents.map(event => {
            const isExpanded = expanded.has(event.id);
            const regs = registrations[event.id] || [];
            const confirmed = regs.filter(r => !r.isWaitlisted);
            const waitlisted = regs.filter(r => r.isWaitlisted);

            return (
              <div key={event.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                {/* Event header row */}
                <button
                  onClick={() => toggleEvent(event.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-white">{event.title}</h2>
                      {!event.isActive && (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{event.attendees}</p>
                      <p className="text-xs text-gray-500">/ {event.maxAttendees} spots</p>
                    </div>
                    {(event.waitlistCount || 0) > 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">{event.waitlistCount}</p>
                        <p className="text-xs text-gray-500">waitlisted</p>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Registrations */}
                {isExpanded && (
                  <div className="border-t border-gray-800 p-5">
                    {regs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No registrations yet.</p>
                    ) : (
                      <>
                        {/* Confirmed */}
                        {confirmed.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4" />
                              Confirmed ({confirmed.length})
                            </h3>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-500 border-b border-gray-800">
                                  <th className="text-left pb-2 font-medium">#</th>
                                  <th className="text-left pb-2 font-medium">Name</th>
                                  <th className="text-left pb-2 font-medium">Email</th>
                                  <th className="text-left pb-2 font-medium">Phone</th>
                                  <th className="text-left pb-2 font-medium">Registered</th>
                                </tr>
                              </thead>
                              <tbody>
                                {confirmed.map((r, i) => (
                                  <tr key={r.userId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                    <td className="py-2.5 text-gray-500">{i + 1}</td>
                                    <td className="py-2.5 text-white font-medium">{r.name || '—'}</td>
                                    <td className="py-2.5 text-gray-300">{r.email}</td>
                                    <td className="py-2.5 text-gray-300">{r.phoneNumber || '—'}</td>
                                    <td className="py-2.5 text-gray-500">
                                      {new Date(r.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Waitlist */}
                        {waitlisted.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                              ⏳ Waitlist ({waitlisted.length})
                            </h3>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-500 border-b border-gray-800">
                                  <th className="text-left pb-2 font-medium">Position</th>
                                  <th className="text-left pb-2 font-medium">Name</th>
                                  <th className="text-left pb-2 font-medium">Email</th>
                                  <th className="text-left pb-2 font-medium">Phone</th>
                                </tr>
                              </thead>
                              <tbody>
                                {waitlisted.map(r => (
                                  <tr key={r.userId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                    <td className="py-2.5 text-yellow-400 font-medium">#{r.waitlistPosition}</td>
                                    <td className="py-2.5 text-white font-medium">{r.name || '—'}</td>
                                    <td className="py-2.5 text-gray-300">{r.email}</td>
                                    <td className="py-2.5 text-gray-300">{r.phoneNumber || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-500 mb-3">Past Events</h2>
            <div className="space-y-4 opacity-60">
              {pastEvents.map(event => {
                const isExpanded = expanded.has(event.id);
                const regs = registrations[event.id] || [];
                const confirmed = regs.filter(r => !r.isWaitlisted);
                const waitlisted = regs.filter(r => r.isWaitlisted);

                return (
                  <div key={event.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <button
                      onClick={() => toggleEvent(event.id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-white mb-2">{event.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(event.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-400">{event.attendees}</p>
                          <p className="text-xs text-gray-500">/ {event.maxAttendees} spots</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-800 p-5">
                        {regs.length === 0 ? (
                          <p className="text-gray-500 text-sm">No registrations.</p>
                        ) : (
                          <>
                            {confirmed.length > 0 && (
                              <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2 mb-3">
                                  <Users className="w-4 h-4" /> Attended ({confirmed.length})
                                </h3>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-gray-500 border-b border-gray-800">
                                      <th className="text-left pb-2 font-medium">#</th>
                                      <th className="text-left pb-2 font-medium">Name</th>
                                      <th className="text-left pb-2 font-medium">Email</th>
                                      <th className="text-left pb-2 font-medium">Phone</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {confirmed.map((r, i) => (
                                      <tr key={r.userId} className="border-b border-gray-800/50">
                                        <td className="py-2.5 text-gray-500">{i + 1}</td>
                                        <td className="py-2.5 text-white font-medium">{r.name || '—'}</td>
                                        <td className="py-2.5 text-gray-300">{r.email}</td>
                                        <td className="py-2.5 text-gray-300">{r.phoneNumber || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {waitlisted.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-3">⏳ Waitlisted ({waitlisted.length})</h3>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-gray-500 border-b border-gray-800">
                                      <th className="text-left pb-2 font-medium">Position</th>
                                      <th className="text-left pb-2 font-medium">Name</th>
                                      <th className="text-left pb-2 font-medium">Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {waitlisted.map(r => (
                                      <tr key={r.userId} className="border-b border-gray-800/50">
                                        <td className="py-2.5 text-gray-400">#{r.waitlistPosition}</td>
                                        <td className="py-2.5 text-white">{r.name || '—'}</td>
                                        <td className="py-2.5 text-gray-300">{r.email}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
