// components/PaymentCheckout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventPrice: number; // in cents
  onSuccess: () => void;
}

interface CheckoutFormProps {
  eventId: string;
  eventTitle: string;
  eventPrice: number;
  onSuccess: () => void;
  onClose: () => void;
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

function CheckoutForm({ eventId, eventTitle, eventPrice, onSuccess, onClose }: CheckoutFormProps) {
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
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        setError('Failed to initialize payment. Please try again.');
      }
    };

    if (eventId) {
      createPaymentIntent();
    }
  }, [eventId]);

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

    // Confirm payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
      },
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
      setIsLoading(false);
    } else {
      // Payment succeeded
      setIsSuccess(true);
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Card Information
          </label>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

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
      </form>
    </div>
  );
}

export default function PaymentCheckout({ isOpen, onClose, eventId, eventTitle, eventPrice, onSuccess }: PaymentCheckoutProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Event Registration</h2>
          <button
            onClick={onClose}
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
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>
  );
}