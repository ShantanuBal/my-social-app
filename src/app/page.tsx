'use client';

import React from 'react';
import TeamFooter from '../components/TeamFooter';
import AppHeader from '../components/AppHeader';

export default function Home() {

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      <div className="min-h-screen bg-black text-white flex flex-col">
        <header className="w-full py-6 px-4 pt-16 md:pt-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              Seattle<br className="block md:hidden" /> Anti-Freeze
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Tagline */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-300 leading-relaxed">
              Thawing the freeze one snowflake at a time
            </h2>

            {/* Description */}
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                In a world where digital connections often feel shallow, Seattle Anti-Freeze brings authenticity back to meeting people. 
                Whether you&apos;re new to the city, looking to expand your social circle, or wanting to build meaningful relationships with 
                like-minded individuals nearby, we make it easy to discover and connect with amazing people in your community.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                From coffee meetups and hobby groups to community events and spontaneous hangouts - real connections start here.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button 
                onClick={() => window.location.href = '/events'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
              >
                View Events
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <TeamFooter />

      </div>
    </main>
  );
}