"use client";

import { useEffect, useState } from "react";
import { loadPollId } from "../components/Settings";

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

export default function useLiveCounts({ pollMs = 5000, pollId = null, showAll = false }) {
  const [counts, setCounts] = useState({ constraint: 0, growth: 0, transform: 0, collapse: 0 });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    // Use provided pollId or load from localStorage (only if showAll is false)
    const activePollId = showAll ? null : (pollId || loadPollId());

    const load = async () => {
      try {
        const rows = await fetchVoteCounts(controller.signal, activePollId, showAll);
        if (!mounted || !Array.isArray(rows)) return;
        const next = { constraint: 0, growth: 0, transform: 0, collapse: 0 };
        for (const r of rows) {
          const key = (r.choice || "").toLowerCase();
          if (key in next) next[key] += Number(r.total || 0);
        }
        setCounts(next);
      } catch (e) {
        // ignore
      }
    };

    load();
    const id = setInterval(load, pollMs);
    
    // Listen for poll_id changes and dashboard show all changes
    const handlePollIdChange = () => {
      load();
    };
    const handleDashboardShowAllChange = () => {
      load();
    };
    window.addEventListener("pollIdChanged", handlePollIdChange);
    window.addEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
      window.removeEventListener("pollIdChanged", handlePollIdChange);
      window.removeEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);
    };
  }, [pollMs, pollId, showAll]);

  return counts;
}

