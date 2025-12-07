import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span className="text-sm">Built by</span>
          <a 
            href="https://www.aideveloperindia.store" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/assets/A-logo-transparent.png" 
              alt="A Logo" 
              className="h-6 w-6 object-contain cursor-pointer"
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
          <span className="text-sm font-medium">AI Developer India</span>
        </div>
      </div>
    </footer>
  );
}

