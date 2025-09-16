// components/TeamFooter.tsx
import React from 'react';
import Link from 'next/link';

export default function TeamFooter() {
  return (
    <footer className="w-full py-8 px-4 border-t border-gray-800 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4">
          
          {/* Links Section */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              href="/contact"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Contact
            </Link>
            <Link 
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Questions or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              © 2025 Seattle Anti-Freeze team. All rights reserved. Unauthorized freezing prohibited.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}