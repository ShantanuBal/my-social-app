'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, User, Calendar, Phone, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onSuccess: () => void;
}

export default function RegistrationModal({ 
  isOpen, 
  onClose, 
  eventId, 
  eventTitle,
  onSuccess 
}: RegistrationModalProps) {
  const { data: session, status } = useSession();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phoneNumber: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-fill email from session when component loads
  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || '',
        name: session.user.name || ''
      }));
    }
  }, [session]);

  const handleQuickRegister = async () => {
    if (!session?.user?.email) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session.user.name,
          email: session.user.email,
          age: 0, // Use 0 for DynamoDB schema compatibility
          gender: '', // Send empty string instead of "Not specified"
          phoneNumber: '' // Send empty string instead of "Not specified"
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setIsSuccess(true);
      onSuccess();
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setIsSuccess(true);
      onSuccess();
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setShowGuestForm(false);
    setError('');
    setFormData({
      name: session?.user?.name || '',
      age: '',
      gender: '',
      phoneNumber: '',
      email: session?.user?.email || ''
    });
    onClose();
  };

  if (!isOpen) return null;

  // Success view
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-300 mb-2">You have successfully registered for</p>
            <p className="text-blue-400 font-semibold text-lg">{eventTitle}</p>
            <p className="text-gray-400 text-sm mt-4">
              We&apos;ll see you there! Check your email for event details.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700 text-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // Not logged in - show sign in prompt OR guest form
  if (!session) {
    // Show guest registration form
    if (showGuestForm) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Register as Guest</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 text-sm">Registering for:</p>
              <p className="text-blue-400 font-semibold">{eventTitle}</p>
            </div>

            <form onSubmit={handleDetailedRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Age
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Your age"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                {isSubmitting ? 'Registering...' : 'Register for Event'}
              </button>
            </form>

            {/* Back to Sign In Option */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowGuestForm(false)}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                ← Back to sign in options
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show sign in prompt with guest option
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Join Event</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Join {eventTitle}</h3>
            <p className="text-gray-400 mb-6">
              Sign in for faster registration, or register as a guest.
            </p>
            
            <div className="space-y-4">
              <Link href="/auth/signin?callbackUrl=/events" onClick={handleClose}>
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300">
                  Sign In to Register
                </button>
              </Link>
              
              <button
                onClick={() => setShowGuestForm(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Register as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show quick registration option
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Join Event</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Event Title */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm">Registering for:</p>
          <p className="text-blue-400 font-semibold">{eventTitle}</p>
        </div>

        {/* Quick Registration for Logged In Users */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Quick Registration
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Register instantly using your account information:
            </p>
            <div className="text-sm text-gray-300">
              <p><strong>Name:</strong> {session.user?.name || 'Your Name'}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleQuickRegister}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 mb-4"
          >
            {isSubmitting ? 'Registering...' : 'Register Now'}
          </button>
        </div>

        {/* Alternative: Detailed Registration */}
        <div className="border-t border-gray-700 pt-4">
          <details className="group">
            <summary className="text-gray-300 text-sm cursor-pointer hover:text-white transition-colors">
              Need to provide additional details? Click here
            </summary>
            
            <form onSubmit={handleDetailedRegister} className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Age
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Your age"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                {isSubmitting ? 'Registering...' : 'Register with Details'}
              </button>
            </form>
          </details>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm mt-4 text-center">{error}</div>
        )}
      </div>
    </div>
  );
}