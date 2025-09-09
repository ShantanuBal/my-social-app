'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Seattle Anti-Freeze
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
              Whether you're new to the city, looking to expand your social circle, or wanting to build meaningful relationships with 
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

      {/* Generated Image Section */}
      <section className="w-full py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* SVG Illustration */}
            <svg
              viewBox="0 0 800 400"
              className="w-full h-auto max-w-3xl mx-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background gradient */}
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1f2937" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>
                <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Background */}
              <rect width="800" height="400" fill="url(#bgGradient)" rx="20" />

              {/* Connection lines */}
              <g stroke="url(#connectionGradient)" strokeWidth="2" opacity="0.6">
                <line x1="150" y1="150" x2="350" y2="200" />
                <line x1="350" y1="200" x2="650" y2="150" />
                <line x1="150" y1="150" x2="400" y2="300" />
                <line x1="650" y1="150" x2="400" y2="300" />
                <line x1="250" y1="80" x2="550" y2="80" />
                <line x1="250" y1="80" x2="150" y2="150" />
                <line x1="550" y1="80" x2="650" y2="150" />
              </g>

              {/* People (circles) */}
              <g fill="url(#personGradient)">
                {/* Person 1 */}
                <circle cx="150" cy="150" r="25" />
                <circle cx="150" cy="140" r="8" fill="#fbbf24" />
                
                {/* Person 2 */}
                <circle cx="350" cy="200" r="25" />
                <circle cx="350" cy="190" r="8" fill="#fbbf24" />
                
                {/* Person 3 */}
                <circle cx="650" cy="150" r="25" />
                <circle cx="650" cy="140" r="8" fill="#fbbf24" />
                
                {/* Person 4 */}
                <circle cx="400" cy="300" r="25" />
                <circle cx="400" cy="290" r="8" fill="#fbbf24" />
                
                {/* Person 5 */}
                <circle cx="250" cy="80" r="25" />
                <circle cx="250" cy="70" r="8" fill="#fbbf24" />
                
                {/* Person 6 */}
                <circle cx="550" cy="80" r="25" />
                <circle cx="550" cy="70" r="8" fill="#fbbf24" />
              </g>

              {/* Connection nodes (smaller circles) */}
              <g fill="#06b6d4" opacity="0.8">
                <circle cx="300" cy="120" r="4" />
                <circle cx="500" cy="180" r="4" />
                <circle cx="200" cy="250" r="4" />
                <circle cx="600" cy="250" r="4" />
              </g>

              {/* Text */}
              <text x="400" y="50" textAnchor="middle" fill="#e5e7eb" fontSize="24" fontWeight="bold">
                Connect • Share • Grow
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Building meaningful connections, one conversation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}