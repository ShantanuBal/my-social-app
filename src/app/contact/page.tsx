// app/contact/page.tsx
'use client';

import { Mail, Instagram, MapPin, Users, Heart, Target } from 'lucide-react';
import Link from 'next/link';
import AppHeader from '../../components/AppHeader';
import TeamFooter from '../../components/TeamFooter';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />
      
      <main className="w-full py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Contact Us
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Have questions, feedback, or want to get involved? We&apos;d love to hear from you!
            </p>
          </div>

          {/* Mission & Vision Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Mission */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To break down the barriers of the &quot;Seattle Freeze&quot; by creating meaningful, 
                authentic connections between people in our community. We believe that everyone 
                deserves to feel welcomed, valued, and connected in the place they call home.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                A Seattle where genuine friendships flourish, where newcomers feel instantly 
                welcomed, and where the richness of human connection transforms our city into 
                the warmest, most inclusive community in the Pacific Northwest.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">What We Do</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Curated Events</h3>
                <p className="text-gray-300 text-sm">
                  We organize thoughtfully designed social events that encourage genuine conversations 
                  and lasting friendships.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Smart Connections</h3>
                <p className="text-gray-300 text-sm">
                  Our platform helps you discover like-minded individuals and build your social 
                  network organically.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Community Building</h3>
                <p className="text-gray-300 text-sm">
                  We foster an inclusive environment where everyone feels comfortable being 
                  themselves and making new friends.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Local Impact</h3>
                <p className="text-gray-300 text-sm">
                  By strengthening social bonds, we&apos;re building a more connected, supportive, 
                  and vibrant Seattle community.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Get in Touch */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Direct Contact</h3>
                    <p className="text-gray-300 text-sm mb-2">
                      Have questions or want to chat? Reach out directly:
                    </p>
                    <a 
                      href="mailto:shantanu.r.bal@gmail.com"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      shantanu.r.bal@gmail.com
                    </a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start space-x-3">
                  <Instagram className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Follow Our Journey</h3>
                    <p className="text-gray-300 text-sm mb-2">
                      Stay updated with our latest events and community highlights:
                    </p>
                    <a 
                      href="https://www.instagram.com/seattle.anti.freeze/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      @seattle.anti.freeze
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Location</h3>
                    <p className="text-gray-300 text-sm">
                      Based in Seattle, WA<br />
                      Serving the greater Seattle metropolitan area
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Involved */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Get Involved</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Join Our Community</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Sign up, attend events, and start building meaningful connections today.
                  </p>
                  <Link 
                    href="/events"
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm"
                  >
                    Browse Events
                  </Link>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Suggest an Event</h3>
                  <p className="text-gray-300 text-sm">
                    Have an idea for a social event or activity? We&apos;d love to hear your suggestions 
                    and potentially feature them in our community calendar.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Partner With Us</h3>
                  <p className="text-gray-300 text-sm">
                    Local businesses, organizations, or community leaders interested in supporting 
                    social connection in Seattle? Let&apos;s collaborate!
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Share Your Story</h3>
                  <p className="text-gray-300 text-sm">
                    Made a great connection through our platform? We&apos;d love to hear about your 
                    experience and how it&apos;s impacted your life in Seattle.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-600/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Thaw the Seattle Freeze?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of Seattleites who are building genuine friendships and creating 
              a more connected community. Your next great friendship is just one event away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/events"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                Find Events Near You
              </Link>
              <a 
                href="mailto:the.seattle.anti.freeze@gmail.com"
                className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-gray-600"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </main>

      <TeamFooter />
    </div>
  );
}