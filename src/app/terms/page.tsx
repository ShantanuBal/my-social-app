// app/terms/page.tsx
'use client';

import React from 'react';
import AppHeader from '../../components/AppHeader';
import TeamFooter from '../../components/TeamFooter';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-400 text-lg">
              Guidelines for using Seattle Anti-Freeze platform
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Last updated: September 2025
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to Seattle Anti-Freeze</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By using our platform, you agree to these terms of service. Seattle Anti-Freeze is 
                  a social events platform designed to help people in Seattle make genuine connections 
                  and build community.
                </p>
                <p>
                  These terms govern your access to and use of our website, mobile applications, and services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Eligibility and Account Requirements</h2>
              <div className="text-gray-300 space-y-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must be 18 years or older to use our platform</li>
                  <li>You must provide accurate and complete information when creating your account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>One person may only maintain one account on our platform</li>
                  <li>You must be a real person - fake accounts, bots, or impersonation are prohibited</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Acceptable Use</h2>
              <div className="text-gray-300 space-y-4">
                <p className="font-semibold text-blue-400">
                  Our platform is designed to foster genuine, respectful connections. We expect all users to contribute to a positive community environment.
                </p>
                
                <p>You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Treat all community members with respect and kindness</li>
                  <li>Provide accurate information in your profile and event registrations</li>
                  <li>Attend events you register for, or cancel in advance when possible</li>
                  <li>Respect event organizers, venues, and other attendees</li>
                  <li>Follow all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Prohibited Conduct</h2>
              <div className="text-gray-300 space-y-4">
                <p>The following behaviors are strictly prohibited:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Harassment, bullying, or discriminatory behavior toward any user</li>
                  <li>Sharing inappropriate, offensive, or explicit content</li>
                  <li>Promoting commercial activities without permission</li>
                  <li>Attempting to collect personal information from other users inappropriately</li>
                  <li>Creating fake accounts or impersonating others</li>
                  <li>Disrupting events or creating unsafe environments</li>
                  <li>Using the platform for dating or romantic pursuits as the primary purpose</li>
                  <li>Spamming, soliciting, or sending unsolicited messages</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Event Participation</h2>
              <div className="text-gray-300 space-y-4">
                <p><strong>Registration and Attendance:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Registration for events constitutes a commitment to attend</li>
                  <li>Please cancel your registration if you cannot attend to make space for others</li>
                  <li>Repeated no-shows may result in registration restrictions</li>
                </ul>
                
                <p><strong>Event Conduct:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Follow all event-specific rules and venue policies</li>
                  <li>Respect other attendees and create an inclusive environment</li>
                  <li>Event organizers may remove disruptive participants</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p><strong>Paid Events:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payment is required at the time of registration for paid events</li>
                  <li>All payments are processed securely through Stripe</li>
                  <li>Event fees help cover venue costs, materials, and platform maintenance</li>
                </ul>
                
                <p><strong>Refunds:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Refund policies vary by event and will be clearly stated during registration</li>
                  <li>Generally, refunds are available if you cancel at least 24 hours before an event</li>
                  <li>No-shows typically are not eligible for refunds</li>
                  <li>We reserve the right to cancel events and provide full refunds when necessary</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Content and Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p><strong>Your Content:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You retain ownership of content you upload (profile pictures, messages, etc.)</li>
                  <li>You grant us permission to use your content to provide our services</li>
                  <li>You are responsible for ensuring you have rights to any content you share</li>
                </ul>
                
                <p><strong>Platform Content:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Seattle Anti-Freeze platform, design, and features are our intellectual property</li>
                  <li>You may not copy, modify, or create derivative works of our platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Privacy and Data</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Please review our <strong>Privacy Policy</strong> to understand 
                  how we collect, use, and protect your information.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We collect only information necessary to provide our services</li>
                  <li>We do not sell your personal information to third parties</li>
                  <li>You can control your profile visibility and connection settings</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Account Suspension and Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>We reserve the right to suspend or terminate accounts that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate these terms of service</li>
                  <li>Engage in harmful or disruptive behavior</li>
                  <li>Create unsafe environments for other users</li>
                  <li>Remain inactive for extended periods</li>
                </ul>
                
                <p>
                  You may delete your account at any time through your profile settings. 
                  Upon account deletion, your personal information will be removed according to our Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  While we strive to provide a safe and enjoyable platform, you understand that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You attend events and interact with other users at your own risk</li>
                  <li>We are not responsible for the actions of other users</li>
                  <li>We cannot guarantee the accuracy of all user-provided information</li>
                  <li>Event organizers are responsible for the safety and management of their events</li>
                </ul>
                
                <p className="font-semibold text-orange-400">
                  Always use common sense and trust your instincts when meeting new people or attending events.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Platform Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We strive to maintain consistent platform availability, but cannot guarantee uninterrupted service. 
                  We may occasionally need to perform maintenance or updates that temporarily affect access.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update these terms of service from time to time to reflect changes in our platform 
                  or legal requirements. We will notify users of significant changes via email or platform announcement.
                </p>
                <p>
                  Continued use of our platform after changes constitute acceptance of the updated terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  These terms are governed by the laws of the State of Washington, United States. 
                  Any disputes will be resolved in the appropriate courts of King County, Washington.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact and Enforcement</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have questions about these terms or need to report a violation, please contact us 
                  through our <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors underline">contact page</Link> or email us directly.
                </p>
                <p>
                  We investigate all reported violations and take appropriate action to maintain a positive 
                  community environment.
                </p>
                
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mt-6">
                  <p className="text-blue-300 font-semibold">
                    Our Community Commitment:
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    Seattle Anti-Freeze exists to build genuine connections and combat social isolation. 
                    We are committed to maintaining a platform where everyone feels welcome, respected, 
                    and valued as they build meaningful relationships in our community.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      <TeamFooter />
    </main>
  );
}