"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ResultsSummarySection from "./ResultsSummarySection";
import { useSearchParams } from "next/navigation";
import { loadPollId, loadDashboardShowAll } from "../../components/Settings";

// Disable SSR, only render on client (requires WebGL)
const LiveVotesGlobe = dynamic(() => import("./LiveVotesGlobe"), { ssr: false });

const SUPABASE_URL = "https://rmgvfgjsqswwumheewho.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZ3ZmZ2pzcXN3d3VtaGVld2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTk2NzYsImV4cCI6MjA3MDI3NTY3Nn0.xm2Tn9fgBDvoM4zSuc4naQHBCoQaAxvRbUyht_LBLFs";

function fetchVoteCounts(signal, pollId = null, showAll = false) {
  // If showAll is true, don't filter by poll_id
  let url = `${SUPABASE_URL}/rest/v1/vote_counts?select=*`;
  if (!showAll && pollId) {
    const encodedPollId = encodeURIComponent(pollId);
    url = `${SUPABASE_URL}/rest/v1/vote_counts?poll_id=eq.${encodedPollId}&select=*`;
  }
  return fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      Accept: "application/json",
    },
    signal,
  }).then((r) => r.json());
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const userVote = searchParams.get('future');
  const [counts, setCounts] = useState({ constraint: 0, growth: 0, transform: 0, collapse: 0 });
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pollId, setPollId] = useState(loadPollId());
  const [showAll, setShowAll] = useState(loadDashboardShowAll());

  useEffect(() => {
    // Load poll_id and showAll from localStorage
    const currentPollId = loadPollId();
    const currentShowAll = loadDashboardShowAll();
    setPollId(currentPollId);
    setShowAll(currentShowAll);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Use pollId only if showAll is false
        const activePollId = showAll ? null : pollId;
        const rows = await fetchVoteCounts(undefined, activePollId, showAll);
        if (!mounted) return;
        const next = { constraint: 0, growth: 0, transform: 0, collapse: 0 };
        for (const r of (rows || [])) {
          const key = (r.choice || '').toLowerCase();
          if (key in next) next[key] += Number(r.total || 0);
        }
        const total = Object.values(next).reduce((a,b)=>a+b,0);
        setCounts(next);
        setTotalParticipants(total);
        setLoading(false);
      } catch (e) {
        // ignore
      }
    };
    load();
    const id = setInterval(load, 5000);
    
    // Listen for poll_id and showAll changes
    const handlePollIdChange = () => {
      const newPollId = loadPollId();
      setPollId(newPollId);
      load();
    };
    const handleDashboardShowAllChange = () => {
      const newShowAll = loadDashboardShowAll();
      setShowAll(newShowAll);
      load();
    };
    window.addEventListener("pollIdChanged", handlePollIdChange);
    window.addEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);
    
    return () => { 
      mounted = false; 
      clearInterval(id);
      window.removeEventListener("pollIdChanged", handlePollIdChange);
      window.removeEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);
    };
  }, [pollId, showAll, userVote]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="bg-black relative min-h-screen">
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero_gradient.svg)', opacity: 0.5 }}
      />

      {/* Fullscreen 3D Canvas layer */}
      <LiveVotesGlobe counts={counts} userVote={userVote} />

      {/* Content layer */}
      <div className="relative z-10">
        <ResultsSummarySection 
          counts={counts}
          totalParticipants={totalParticipants}
          userVote={userVote}
        />
      </div>
    </div>
  );
}

