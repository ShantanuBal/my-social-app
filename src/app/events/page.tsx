'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, MapPin, Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import TeamFooter from '../../components/TeamFooter';
import RegistrationModal from '../../components/RegistrationModal';
import PaymentCheckout from '../../components/PaymentCheckout';
import AppHeader from '../../components/AppHeader';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  waitlistCount?: number;
  category: string;
  image: string;
  price: number;
  currency: string;
  isPaid: boolean;
}

interface RegistrationStatus {
  [eventId: string]: 'registered' | 'waitlisted';
}

export default function EventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!session?.user?.id) {
      setRegistrationStatus({});
      return;
    }

    try {
      const response = await fetch(`/api/users/${session.user.id}/registrations`);
      if (response.ok) {
        const registrations = await response.json();
        const statusMap: RegistrationStatus = {};

        registrations.forEach((registration: { eventId: string; isWaitlisted?: boolean }) => {
          statusMap[registration.eventId] = registration.isWaitlisted ? 'waitlisted' : 'registered';
        });
        
        setRegistrationStatus(statusMap);
      }
    } catch (err) {
      console.error('Error checking registration status:', err);
    }
  };

  const handleJoinEvent = (event: Event) => {
    setSelectedEvent(event);
    
    if (event.isPaid && event.price > 0) {
      setIsPaymentModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleRegistrationSuccess = () => {
    // Refresh events to show updated attendee count
    fetchEvents();
    // Refresh registration status
    checkRegistrationStatus();
  };

  const handleOptimisticRegistration = (eventId: string) => {
    setRegistrationStatus(prev => ({
      ...prev,
      [eventId]: 'registered' as const
    }));
    // Also refresh events to show updated attendee count
    fetchEvents();
  };

  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return 'Free';
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (session) {
      checkRegistrationStatus();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    // Parse as local date to avoid timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Los_Angeles' // Ensure consistent Pacific Time display
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Networking': 'bg-blue-500',
      'Arts & Culture': 'bg-purple-500',
      'Community': 'bg-green-500',
      'Fitness': 'bg-orange-500',
      'Social': 'bg-pink-500',
      'Outdoor': 'bg-teal-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const renderEventButton = (event: Event) => {
    const status = registrationStatus[event.id];
    const isAtCapacity = event.attendees >= event.maxAttendees;

    if (status === 'registered') {
      return (
        <div className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          You are registered for this event
        </div>
      );
    }

    if (status === 'waitlisted') {
      return (
        <div className="w-full bg-yellow-600/80 text-white py-3 px-4 rounded-lg font-semibold text-center">
          ⏳ You&apos;re on the waitlist
        </div>
      );
    }

    if (isAtCapacity) {
      return (
        <button
          onClick={() => handleJoinEvent(event)}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mt-auto"
        >
          Join Waitlist
        </button>
      );
    }

    return (
      <button
        onClick={() => handleJoinEvent(event)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mt-auto"
      >
        {event.isPaid ? `Register - ${formatPrice(event.price)}` : 'Join Event - Free'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
        <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="w-full py-8 px-4 border-b border-gray-800">
            <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Events in Seattle
            </h1>
            <p className="text-gray-400 text-lg mt-4">
                Discover amazing events and connect with like-minded people in the Emerald City
            </p>
            </div>
        </header>

        {/* Events Grid */}
        <main className="w-full py-12 px-4">
            <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event: Event) => (
                <div
                    key={event.id}
                    className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors duration-300 border border-gray-800 hover:border-gray-600 flex flex-col h-full"
                >
                    {/* Event Image/Icon */}
                    <div className="h-48 overflow-hidden relative">
                      {event.image.length <= 4 || /^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u.test(event.image) ? (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-6xl">{event.image}</span>
                        </div>
                      ) : (
                        <Image
                          src={`https://seattle-anti-freeze-static-files-production.s3.us-west-2.amazonaws.com/${event.image}`}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                        />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-6 flex flex-col flex-1">
                    {/* Category Badge and Price */}
                    <div className="mb-4 flex items-center justify-between">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(event.category)}`}>
                        {event.category}
                        </span>
                        <span className={`text-sm font-bold ${event.isPaid ? 'text-green-400' : 'text-blue-400'}`}>
                        {formatPrice(event.price)}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-4 text-white">
                        {event.title}
                    </h3>

                    {/* Description */}
                    <div className="mb-6">
                      <p className={`text-gray-400 text-sm leading-relaxed ${expandedEvents.has(event.id) ? '' : 'line-clamp-4'}`}>
                        {event.description.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < event.description.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                      <button
                        onClick={() => setExpandedEvents(prev => {
                          const next = new Set(prev);
                          next.has(event.id) ? next.delete(event.id) : next.add(event.id);
                          return next;
                        })}
                        className="text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
                      >
                        {expandedEvents.has(event.id) ? 'See less' : 'See more'}
                      </button>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-3" />
                        <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                        <Clock className="w-4 h-4 mr-3" />
                        <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                        <MapPin className="w-4 h-4 mr-3" />
                        <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                        <Users className="w-4 h-4 mr-3" />
                        <span>{event.attendees}/{event.maxAttendees} attending</span>
                        </div>
                        <div className="flex items-center text-sm font-semibold">
                        <DollarSign className="w-4 h-4 mr-3 text-green-400" />
                        <span className={event.isPaid ? 'text-green-400' : 'text-blue-400'}>
                            {formatPrice(event.price)}
                        </span>
                        </div>
                    </div>

                    {/* Registration Button or Status */}
                    {renderEventButton(event)}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </main>

        {/* Free Event Registration Modal */}
        {selectedEvent && !selectedEvent.isPaid && (
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                isWaitlist={selectedEvent.attendees >= selectedEvent.maxAttendees}
                onSuccess={handleRegistrationSuccess}
            />
        )}

        {/* Paid Event Payment Checkout */}
        {selectedEvent && selectedEvent.isPaid && (
            <PaymentCheckout
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                eventPrice={selectedEvent.price}
                onSuccess={handleRegistrationSuccess}
                onOptimisticSuccess={handleOptimisticRegistration}
            />
        )}

        {/* Footer */}
        <TeamFooter />

        </div>
      </main>
  );
}