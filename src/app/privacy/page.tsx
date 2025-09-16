// app/privacy/page.tsx
'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import TeamFooter from '../../components/TeamFooter';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-lg">
              How we protect and handle your personal information
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Last updated: September 2025
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What Information We Collect</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We collect information you provide directly to us when you:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create an account and set up your profile</li>
                  <li>Register for events (both free and paid)</li>
                  <li>Upload profile pictures</li>
                  <li>Contact us for support</li>
                </ul>
                
                <p>This information may include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and email address</li>
                  <li>Profile information (age, gender, phone number)</li>
                  <li>Profile pictures you upload</li>
                  <li>Event registration details</li>
                  <li>Payment information (processed securely through Stripe)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our event platform services</li>
                  <li>Process event registrations and payments</li>
                  <li>Send you confirmation emails and event updates</li>
                  <li>Enable connections with other users at events</li>
                  <li>Improve our services and user experience</li>
                  <li>Communicate with you about your account or our services</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
              <div className="text-gray-300 space-y-4">
                <p className="font-semibold text-blue-400">
                  We do not sell, rent, or share your personal information with third parties for their marketing purposes.
                </p>
                
                <p>We may share your information only in these limited circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Payment Processing:</strong> Payment information is processed securely through Stripe. We never store your credit card details on our servers.</li>
                  <li><strong>Service Providers:</strong> We work with trusted service providers (like email delivery services) who help us operate our platform.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect the rights and safety of our users.</li>
                  <li><strong>Event Participants:</strong> Your name and basic profile information may be visible to other attendees of events you register for.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Security</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  All payment processing is handled by <strong>Stripe</strong>, a PCI-compliant payment processor trusted by millions of businesses worldwide. 
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We never store your credit card information on our servers</li>
                  <li>All payment data is encrypted and transmitted securely</li>
                  <li>Stripe maintains the highest level of payment security standards</li>
                  <li>We only store basic payment metadata (amount, date, event) for record-keeping</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Storage and Security</h2>
              <div className="text-gray-300 space-y-4">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Data is stored on secure cloud infrastructure (AWS)</li>
                  <li>All data transmission is encrypted using industry-standard protocols</li>
                  <li>Access to your information is limited to authorized personnel only</li>
                  <li>Profile pictures are stored securely with access-controlled URLs</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights and Choices</h2>
              <div className="text-gray-300 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and update your profile information at any time</li>
                  <li>Delete your profile picture or change your profile settings</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Contact us with questions about your data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cookies and Analytics</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We use essential cookies to maintain your login session and provide our services. 
                  We do not use tracking cookies or share data with advertising networks.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Children&apos;s Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our service is intended for users 18 years and older. We do not knowingly collect 
                  personal information from children under 18.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any 
                  significant changes by email or through our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have questions about this privacy policy or how we handle your information, 
                  please contact us through our contact page or email us directly.
                </p>
                <p>
                  We&apos;re committed to protecting your privacy and will respond to your inquiries promptly.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <TeamFooter />
    </main>
  );
}