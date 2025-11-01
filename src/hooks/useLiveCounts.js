"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = "https://rmgvfgjsqswwumheewho.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZ3ZmZ2pzcXN3d3VtaGVld2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTk2NzYsImV4cCI6MjA3MDI3NTY3Nn0.xm2Tn9fgBDvoM4zSuc4naQHBCoQaAxvRbUyht_LBLFs";

function fetchVoteCounts(signal) {
  const url = `${SUPABASE_URL}/rest/v1/vote_counts?select=*`;
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

export default function useLiveCounts({ pollMs = 5000 }) {
  const [counts, setCounts] = useState({ constraint: 0, growth: 0, transform: 0, collapse: 0 });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const rows = await fetchVoteCounts(controller.signal);
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
    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, [pollMs]);

  return counts;
}

