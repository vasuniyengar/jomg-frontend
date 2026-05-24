"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchHostTournaments } from "@/lib/tournaments";

export default function TournamentPicker({ label = "Select tournament" }) {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchHostTournaments();
        if (!cancelled) setTournaments(data);
      } catch {
        if (!cancelled) setTournaments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading tournaments…</div>;
  }

  if (!tournaments.length) {
    return (
      <div className="screen active">
        <div className="content" style={{ padding: 24 }}>
          <p style={{ color: "var(--text-sec)", marginBottom: 16 }}>
            No tournaments found. Create one first.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => router.push("/admin/tournaments")}
          >
            My Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title">{label}</div>
        </div>
      </div>
      <div className="content" style={{ padding: "0 28px 40px", maxWidth: 480 }}>
        <div className="form-group">
          <label className="form-label">Tournament</label>
          <select
            className="form-select"
            defaultValue=""
            onChange={(e) => {
              const id = e.target.value;
              if (id) {
                router.push(`${window.location.pathname}?tournamentId=${id}`);
              }
            }}
          >
            <option value="" disabled>
              Choose a tournament…
            </option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
