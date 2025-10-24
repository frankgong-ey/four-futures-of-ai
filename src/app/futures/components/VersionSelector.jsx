"use client";

import React, { useState } from "react";

export default function VersionSelector({ versions, selectedVersion, onVersionChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVersionData = versions[selectedVersion];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
      >
        <span className="text-white">{selectedVersionData.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50">
          <div className="p-2">
            {Object.values(versions).map((version) => (
              <button
                key={version.id}
                onClick={() => {
                  onVersionChange(version.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedVersion === version.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {version.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
