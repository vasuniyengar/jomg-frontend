"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchHostTournaments } from "@/lib/tournaments";

export default function TournamentSwitcher({ tournamentId }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchHostTournaments();
        if (!cancelled) setTournaments(data);
      } catch {
        if (!cancelled) setTournaments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!tournamentId || tournaments.length < 2) {
    return null;
  }

  return (
    <select
      className="form-select"
      aria-label="Switch tournament"
      value={String(tournamentId)}
      onChange={(e) => {
        const id = e.target.value;
        if (id) router.push(`${pathname}?tournamentId=${id}`);
      }}
      style={{ padding: "8px 12px", fontSize: 13, maxWidth: 240 }}
    >
      {tournaments.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
