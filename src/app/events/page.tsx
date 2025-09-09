'use client';

import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Coffee & Connections at Pike Place",
      description: "Join fellow coffee enthusiasts for morning conversations and networking in the heart of Seattle.",
      date: "2025-09-15",
      time: "9:00 AM",
      location: "Pike Place Market, Seattle",
      attendees: 12,
      maxAttendees: 20,
      category: "Networking",
      image: "☕"
    },
    {
      id: 2,
      title: "Capitol Hill Art Walk & Meet",
      description: "Explore local galleries and street art while meeting creative minds in Capitol Hill.",
      date: "2025-09-18",
      time: "6:00 PM",
      location: "Capitol Hill, Seattle",
      attendees: 8,
      maxAttendees: 15,
      category: "Arts & Culture",
      image: "🎨"
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Networking': 'bg-blue-500',
      'Arts & Culture': 'bg-purple-500',
      'Community': 'bg-green-500',
      'Fitness': 'bg-orange-500',
      'Social': 'bg-pink-500',
      'Outdoor': 'bg-teal-500'
    };
    return colors[category] || 'bg-gray-500';
  };

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
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors duration-300 border border-gray-800 hover:border-gray-600"
              >
                {/* Event Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-6xl">{event.image}</span>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{event.attendees}/{event.maxAttendees} attending</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-4 border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">
            More events added regularly. Follow us for updates!
          </p>
        </div>
      </footer>
    </div>
  );
}