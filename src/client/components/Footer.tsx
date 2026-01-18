import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center text-gray-600">
          <span className="text-sm">© {new Date().getFullYear()} JITS Coding Portal</span>
        </div>
      </div>
    </footer>
  );
}

