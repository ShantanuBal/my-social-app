'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar, MapPin, Users, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AppHeader from '../../../components/AppHeader';
import TeamFooter from '../../../components/TeamFooter';
import RegistrationModal from '../../../components/RegistrationModal';

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
  isPaid: boolean;
}

type RegistrationStatus = 'registered' | 'waitlisted' | null;

const S3_BASE = 'https://seattle-anti-freeze-static-files-production.s3.us-west-2.amazonaws.com';

const CATEGORY_COLORS: Record<string, string> = {
  'Networking': 'bg-blue-500',
  'Arts & Culture': 'bg-purple-500',
  'Community': 'bg-green-500',
  'Fitness': 'bg-orange-500',
  'Social': 'bg-pink-500',
  'Outdoor': 'bg-teal-500',
};

const isEmoji = (str: string) =>
  str.length <= 4 || /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(str);

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then(r => r.json())
      .then(data => { setEvent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/users/${session.user.id}/registrations`)
      .then(r => r.json())
      .then((regs: { eventId: string; isWaitlisted?: boolean }[]) => {
        const match = regs.find(r => r.eventId === eventId);
        if (match) setRegistrationStatus(match.isWaitlisted ? 'waitlisted' : 'registered');
      })
      .catch(() => {});
  }, [session, eventId]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  };

  const handleRegistrationSuccess = () => {
    fetch(`/api/events/${eventId}`)
      .then(r => r.json())
      .then(setEvent);
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}/registrations`)
        .then(r => r.json())
        .then((regs: { eventId: string; isWaitlisted?: boolean }[]) => {
          const match = regs.find(r => r.eventId === eventId);
          if (match) setRegistrationStatus(match.isWaitlisted ? 'waitlisted' : 'registered');
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl text-gray-400">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event || (event as { error?: string }).error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-400 text-lg">Event not found.</p>
          <Link href="/events" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isAtCapacity = event.attendees >= event.maxAttendees;
  const spotsLeft = event.maxAttendees - event.attendees;

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Banner image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-blue-500 to-purple-600">
          {isEmoji(event.image) ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">{event.image}</span>
            </div>
          ) : (
            <Image
              src={`${S3_BASE}/${event.image}`}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          )}
        </div>

        {/* Title + category */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${CATEGORY_COLORS[event.category] || 'bg-gray-500'}`}>
            {event.category}
          </span>
          {event.isPaid && event.price > 0 && (
            <span className="text-green-400 font-semibold text-sm">
              ${(event.price / 100).toFixed(2)}
            </span>
          )}
          {!event.isPaid && (
            <span className="text-blue-400 font-semibold text-sm">Free</span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{event.title}</h1>

        {/* Event details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-5 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>
              {event.attendees}/{event.maxAttendees} attending
              {!isAtCapacity && (
                <span className="text-green-400 ml-2 text-sm">({spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left)</span>
              )}
              {isAtCapacity && (
                <span className="text-yellow-400 ml-2 text-sm">(Full{(event.waitlistCount || 0) > 0 ? ` · ${event.waitlistCount} waitlisted` : ''})</span>
              )}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">About this event</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</div>
        </div>

        {/* Registration */}
        <div className="sticky bottom-6">
          {registrationStatus === 'registered' ? (
            <div className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5" />
              You&apos;re registered for this event
            </div>
          ) : registrationStatus === 'waitlisted' ? (
            <div className="w-full bg-yellow-600/80 text-white py-4 px-6 rounded-xl font-semibold text-center text-lg">
              ⏳ You&apos;re on the waitlist
            </div>
          ) : !session ? (
            <Link href="/auth/signin">
              <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-center text-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all">
                Sign in to Register
              </div>
            </Link>
          ) : isAtCapacity ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all"
            >
              Join Waitlist
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all"
            >
              Join Event — Free
            </button>
          )}
        </div>
      </main>

      {isModalOpen && (
        <RegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventId={event.id}
          eventTitle={event.title}
          isWaitlist={isAtCapacity}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      <TeamFooter />
    </div>
  );
}
