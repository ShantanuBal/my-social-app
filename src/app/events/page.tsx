'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import TeamFooter from '../../components/TeamFooter';
import RegistrationModal from '../../components/RegistrationModal';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  category: string;
  image: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    }

  const handleJoinEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    // Refresh events to show updated attendee count
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full py-8 px-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            ← Back to Home
          </button>
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
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-6xl">{event.image}</span>
                </div>

                {/* Event Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4 text-white">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    {event.description}
                  </p>

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
                  </div>

                  {/* Join Button */}
                  <button onClick={() => handleJoinEvent(event)} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mt-auto">
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      {selectedEvent && (
        <RegistrationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            eventId={selectedEvent.id}
            eventTitle={selectedEvent.title}
            onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* Footer */}
      <TeamFooter />

    </div>
  );
}