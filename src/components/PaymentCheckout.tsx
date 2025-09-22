// components/PaymentCheckout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, CheckCircle, User, Mail, Calendar, Phone } from 'lucide-react';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventPrice: number; // in cents
  onSuccess: () => void;
  onOptimisticSuccess: (eventId: string) => void;
}

interface CheckoutFormProps {
  eventId: string;
  eventTitle: string;
  eventPrice: number;
  onSuccess: () => void;
  onClose: () => void;
  onOptimisticSuccess: (eventId: string) => void;
  guestInfo: {
    name: string;
    email: string;
    age: string;
    gender: string;
    phoneNumber: string;
  };
}

// Card styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#9ca3af',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

function CheckoutForm({ eventId, eventTitle, eventPrice, onSuccess, onClose, onOptimisticSuccess, guestInfo }: CheckoutFormProps) {
  const { data: session } = useSession();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const payload: any = { eventId };
        
        // If not logged in, include guest info
        if (!session?.user?.id) {
          payload.guestEmail = guestInfo.email;
          payload.guestName = guestInfo.name;
          payload.guestAge = guestInfo.age;
          payload.guestGender = guestInfo.gender;
          payload.guestPhoneNumber = guestInfo.phoneNumber;
        }

        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [eventId, session?.user?.id, guestInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsLoading(false);
      return;
    }

    // Use guest info or session info for billing details
    const billingName = session?.user?.name || guestInfo.name;
    const billingEmail = session?.user?.email || guestInfo.email;

    // Confirm payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: billingName,
          email: billingEmail,
        },
      },
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
      setIsLoading(false);
    } else {
      // Payment succeeded - immediately update UI optimistically
      onOptimisticSuccess(eventId);
      
      // Show success state
      setIsSuccess(true);
      
      // Also call regular success callback for any other cleanup
      onSuccess();
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-300 mb-4">
          You have successfully registered for <span className="text-blue-400 font-semibold">{eventTitle}</span>
        </p>
        <p className="text-gray-400 text-sm mb-6">
          A confirmation email has been sent to your inbox with event details.
        </p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Complete Payment</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Event:</span>
            <span className="text-white font-medium">{eventTitle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Amount:</span>
            <span className="text-green-400 font-bold text-lg">{formatPrice(eventPrice)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Show registration info summary */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Registration Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">{session?.user?.name || guestInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{session?.user?.email || guestInfo.email}</span>
            </div>
            {!session?.user?.id && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white">{guestInfo.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gender:</span>
                  <span className="text-white">{guestInfo.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{guestInfo.phoneNumber}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Show loading state while payment intent is being created */}
        {!clientSecret && !error && (
          <div className="text-center py-4">
            <div className="text-gray-400">Preparing payment...</div>
          </div>
        )}

        {/* Card Information - only show when payment intent is ready */}
        {clientSecret && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Card Information
            </label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {clientSecret && (
          <>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <Lock className="w-4 h-4 mr-2" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <button
              type="submit"
              disabled={!stripe || isLoading || !clientSecret}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
            >
              {isLoading ? 'Processing...' : `Pay ${formatPrice(eventPrice)}`}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default function PaymentCheckout({ isOpen, onClose, eventId, eventTitle, eventPrice, onSuccess, onOptimisticSuccess }: PaymentCheckoutProps) {
  const { data: session, status } = useSession();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    phoneNumber: ''
  });

  const handleGuestInfoChange = (field: keyof typeof guestInfo, value: string) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    setShowGuestForm(false);
    setGuestInfo({
      name: '',
      email: '',
      age: '',
      gender: '',
      phoneNumber: ''
    });
    onClose();
  };

  const isGuestFormComplete = guestInfo.name && guestInfo.email && guestInfo.age && guestInfo.gender && guestInfo.phoneNumber;

  if (!isOpen) return null;

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
    // Show guest payment form
    if (showGuestForm) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Guest Payment</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 text-sm">Purchasing ticket for:</p>
              <p className="text-blue-400 font-semibold">{eventTitle}</p>
              <p className="text-green-400 font-bold text-lg">${(eventPrice / 100).toFixed(2)}</p>
            </div>

            {!isGuestFormComplete ? (
              <div className="space-y-4">
                <h4 className="text-white font-medium mb-3">Your Information</h4>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestInfo.name}
                    onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your full name"
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
                    value={guestInfo.email}
                    onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-4">
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
                      value={guestInfo.age}
                      onChange={(e) => handleGuestInfoChange('age', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      required
                      value={guestInfo.gender}
                      onChange={(e) => handleGuestInfoChange('gender', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
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
                    value={guestInfo.phoneNumber}
                    onChange={(e) => handleGuestInfoChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

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
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  eventId={eventId}
                  eventTitle={eventTitle}
                  eventPrice={eventPrice}
                  onSuccess={onSuccess}
                  onClose={handleClose}
                  onOptimisticSuccess={onOptimisticSuccess}
                  guestInfo={guestInfo}
                />
              </Elements>
            )}
          </div>
        </div>
      );
    }

    // Show sign in prompt with guest option
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Purchase Ticket</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{eventTitle}</h3>
            <p className="text-green-400 font-bold text-xl mb-2">${(eventPrice / 100).toFixed(2)}</p>
            <p className="text-gray-400 mb-6">
              Sign in for faster checkout, or continue as a guest.
            </p>
            
            <div className="space-y-8">
              <Link href="/auth/signin?callbackUrl=/events" onClick={handleClose}>
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300">
                  Sign In to Register
                </button>
              </Link>
              
              <button
                onClick={() => setShowGuestForm(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 mt-2"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - proceed directly to payment
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Purchase Ticket</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            eventId={eventId}
            eventTitle={eventTitle}
            eventPrice={eventPrice}
            onSuccess={onSuccess}
            onClose={handleClose}
            onOptimisticSuccess={onOptimisticSuccess}
            guestInfo={guestInfo} // Empty for logged-in users
          />
        </Elements>
      </div>
    </div>
  );
}