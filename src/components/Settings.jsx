"use client";

import React, { useState, useEffect } from "react";

// Version options - same as in HeroSection
const VERSION_OPTIONS = [
  {
    id: "all-industries",
    name: "All Industries",
    required: true,
  },
  {
    id: "consumer-products",
    name: "Consumer Products",
    required: false,
  },
  {
    id: "industrial-products",
    name: "Industrial Products",
    required: false,
  },
  {
    id: "oil-gas",
    name: "Oil & Gas",
    required: false,
  },
  {
    id: "defense",
    name: "Defense",
    required: false,
  },
  {
    id: "banking-capital-markets",
    name: "Banking & Capital Markets",
    required: false,
  },
  {
    id: "retail",
    name: "Retail",
    required: false,
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    required: false,
  },
];

// Get default enabled versions (all enabled by default)
const getDefaultEnabledVersions = () => {
  return VERSION_OPTIONS.reduce((acc, version) => {
    acc[version.id] = true;
    return acc;
  }, {});
};

// Load settings from localStorage
export const loadVersionSettings = () => {
  if (typeof window === "undefined") {
    return getDefaultEnabledVersions();
  }
  
  try {
    const stored = localStorage.getItem("versionSettings");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all-industries is always enabled
      parsed["all-industries"] = true;
      return parsed;
    }
  } catch (error) {
    console.error("Error loading version settings:", error);
  }
  
  return getDefaultEnabledVersions();
};

// Save settings to localStorage
export const saveVersionSettings = (settings) => {
  if (typeof window === "undefined") return;
  
  try {
    // Ensure all-industries is always enabled
    const settingsToSave = { ...settings };
    settingsToSave["all-industries"] = true;
    localStorage.setItem("versionSettings", JSON.stringify(settingsToSave));
  } catch (error) {
    console.error("Error saving version settings:", error);
  }
};

// Poll ID configuration
const DEFAULT_POLL_ID = "poll-id-default";
const POLL_ID_KEY = "votingPollId";

// Load poll ID from localStorage
export const loadPollId = () => {
  if (typeof window === "undefined") {
    return DEFAULT_POLL_ID;
  }
  
  try {
    const stored = localStorage.getItem(POLL_ID_KEY);
    return stored || DEFAULT_POLL_ID;
  } catch (error) {
    console.error("Error loading poll ID:", error);
    return DEFAULT_POLL_ID;
  }
};

// Save poll ID to localStorage
export const savePollId = (pollId) => {
  if (typeof window === "undefined") return;
  
  try {
    const pollIdToSave = (pollId && pollId.trim()) || DEFAULT_POLL_ID;
    localStorage.setItem(POLL_ID_KEY, pollIdToSave.trim());
  } catch (error) {
    console.error("Error saving poll ID:", error);
  }
};

// Dashboard show all votes configuration
const DASHBOARD_SHOW_ALL_KEY = "dashboardShowAll";

// Load dashboard show all setting from localStorage
export const loadDashboardShowAll = () => {
  if (typeof window === "undefined") {
    return true; // Default to true (show all votes)
  }
  
  try {
    const stored = localStorage.getItem(DASHBOARD_SHOW_ALL_KEY);
    // If no value is stored, return true (default)
    if (stored === null) {
      return true;
    }
    return stored === "true";
  } catch (error) {
    console.error("Error loading dashboard show all setting:", error);
    return true; // Default to true (show all votes)
  }
};

// Save dashboard show all setting to localStorage
export const saveDashboardShowAll = (showAll) => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(DASHBOARD_SHOW_ALL_KEY, showAll ? "true" : "false");
  } catch (error) {
    console.error("Error saving dashboard show all setting:", error);
  }
};

export default function Settings({ isOpen, onClose }) {
  const [enabledVersions, setEnabledVersions] = useState(getDefaultEnabledVersions());
  const [pollId, setPollId] = useState(DEFAULT_POLL_ID);
  const [dashboardShowAll, setDashboardShowAll] = useState(true); // Default to true
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  // Load settings when component mounts or opens
  useEffect(() => {
    if (isOpen) {
      const loaded = loadVersionSettings();
      const loadedPollId = loadPollId();
      const loadedDashboardShowAll = loadDashboardShowAll();
      setEnabledVersions(loaded);
      setPollId(loadedPollId);
      setDashboardShowAll(loadedDashboardShowAll);
      // Trigger fade-in animation
      requestAnimationFrame(() => {
        setIsOverlayVisible(true);
      });
    } else {
      setIsOverlayVisible(false);
    }
  }, [isOpen]);

  const handleToggleVersion = (versionId) => {
    // Prevent disabling "all-industries"
    if (versionId === "all-industries") {
      return;
    }
    
    setEnabledVersions((prev) => ({
      ...prev,
      [versionId]: !prev[versionId],
    }));
  };

  const handleSave = () => {
    saveVersionSettings(enabledVersions);
    savePollId(pollId);
    saveDashboardShowAll(dashboardShowAll);
    // Trigger custom events to notify components to reload
    window.dispatchEvent(new CustomEvent("versionSettingsChanged"));
    window.dispatchEvent(new CustomEvent("pollIdChanged"));
    window.dispatchEvent(new CustomEvent("dashboardShowAllChanged"));
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = getDefaultEnabledVersions();
    setEnabledVersions(defaultSettings);
    setPollId(DEFAULT_POLL_ID);
    setDashboardShowAll(true); // Default to true
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-[9998] transition-opacity duration-500 ease-out ${
          isOverlayVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Settings panel */}
      <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-9 pb-9 pointer-events-none">
        <div
          className={`relative w-full max-w-4xl h-[calc(100vh-72px)] bg-black outline outline-1 outline-white/20 p-8 pointer-events-auto transition-opacity duration-500 ease-out flex flex-col ${
            isOverlayVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white hover:opacity-80 transition-opacity cursor-pointer z-10"
          >
            <div className="w-12 h-12 border border-white flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </button>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-4 pr-16">Settings</h2>

          {/* Description */}
          <p className="text-base text-white/80 mb-6 leading-relaxed">
            Configure the booth experience
          </p>

          {/* Poll ID Configuration */}
          <div className="mb-6 pb-6 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">Poll Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Poll ID
                </label>
                <input
                  type="text"
                  value={pollId}
                  onChange={(e) => setPollId(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-all duration-200"
                  placeholder="Enter poll ID"
                />
                <p className="text-xs text-white/60 mt-2">
                  Current: <span className="font-mono text-white/80">{pollId}</span>
                </p>
                <p className="text-xs text-white/40 mt-1">
                  All votes from this device will use this poll ID.
                </p>
              </div>
              
              {/* Dashboard Show All Option */}
              <div className="flex items-center justify-between p-3 border border-white/10 hover:border-white/30 transition-all duration-200">
                <label
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  htmlFor="dashboard-show-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div className="relative w-6 h-6 border border-white/50 flex items-center justify-center">
                      {dashboardShowAll && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-base text-white font-medium">Show All Votes</span>
                      <p className="text-xs text-white/60 mt-1">
                        Dashboard and results pages will display all votes regardless of poll ID. When disabled, only votes from the current poll ID will be shown.
                      </p>
                    </div>
                  </div>
                </label>
                <input
                  type="checkbox"
                  id="dashboard-show-all"
                  checked={dashboardShowAll}
                  onChange={(e) => setDashboardShowAll(e.target.checked)}
                  className="sr-only"
                />
              </div>
            </div>
          </div>

          {/* Version Configuration */}
          <div className="flex-1 flex flex-col mb-6 min-h-0">
            <h3 className="text-lg font-semibold text-white mb-3">Version Configuration</h3>
            <p className="text-base text-white/80 mb-4 leading-relaxed">
              Select which industry versions should be displayed. "All Industries" is always enabled.
            </p>
            
            {/* Version options - scrollable container */}
            <div 
              className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
              }}
            >
              <div className="space-y-3">
              {VERSION_OPTIONS.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 border border-white/10 hover:border-white/30 transition-all duration-200"
                >
                  <label
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    htmlFor={`version-${version.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div className="relative w-6 h-6 border border-white/50 flex items-center justify-center">
                        {enabledVersions[version.id] && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-base text-white font-medium">{version.name}</span>
                      {version.required && (
                        <span className="text-sm text-white/60">(Required)</span>
                      )}
                    </div>
                  </label>
                  <input
                    type="checkbox"
                    id={`version-${version.id}`}
                    checked={enabledVersions[version.id]}
                    onChange={() => handleToggleVersion(version.id)}
                    disabled={version.required}
                    className="sr-only"
                  />
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/20 flex-shrink-0">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-white/20 text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-all duration-200 font-medium cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

