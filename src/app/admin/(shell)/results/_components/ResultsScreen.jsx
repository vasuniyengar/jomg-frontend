"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import live from "../../_styles/livePlay.module.css";
import { fetchFinalStandings } from "@/lib/bracketProgression";
import { fetchDivisions } from "@/lib/divisions";
import { mergeTournamentSettings } from "@/lib/tournamentSettings";
import { fetchTournamentById } from "@/lib/tournaments";

const CHECKLIST_ITEMS = [
  { key: "scores", label: "All scores confirmed", hint: "No disputes outstanding" },
  { key: "prizes", label: "Prize payments sent", hint: "Wire / PayPal / check" },
  { key: "published", label: "Results published", hint: "Live on public page" },
  { key: "ratings", label: "Rating reports filed", hint: "DUPR updates submitted" },
  { key: "emails", label: "Thank-you emails sent", hint: "All participants notified" },
  { key: "photos", label: "Photos uploaded", hint: "Gallery live on page" },
];

export default function ResultsScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [divisions, setDivisions] = useState([]);
  const [bracketId, setBracketId] = useState("");
  const [standings, setStandings] = useState([]);
  const [prizes, setPrizes] = useState({ first: 0, second: 0, third: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState({});

  const divisionName = useMemo(
    () => divisions.find((d) => String(d.id) === String(bracketId))?.name || "Division",
    [divisions, bracketId]
  );

  const load = useCallback(async () => {
    if (!tournamentId || !bracketId) return;
    setLoading(true);
    setError("");
    try {
      const [tournament, list] = await Promise.all([
        fetchTournamentById(tournamentId),
        fetchFinalStandings(tournamentId, bracketId),
      ]);
      const { settings } = mergeTournamentSettings(tournament.organizerInfo);
      setPrizes(settings.pricing?.prizes || { first: 0, second: 0, third: 0 });
      setStandings(list);
    } catch (err) {
      setError(err.message || "Failed to load results");
      setStandings([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, bracketId]);

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      const divs = await fetchDivisions(tournamentId);
      setDivisions(divs);
      if (!bracketId && divs[0]) setBracketId(String(divs[0].id));
    })();
  }, [tournamentId, bracketId]);

  useEffect(() => {
    load();
  }, [load]);

  const podium = useMemo(() => {
    const gold = standings.find((s) => s.finalRank === 1 || s.medal === "Gold");
    const silver = standings.find((s) => s.finalRank === 2 || s.medal === "Silver");
    const bronze = standings.find((s) => s.finalRank === 3 || s.medal === "Bronze");
    return { gold, silver, bronze };
  }, [standings]);

  const totalPrizes = useMemo(
    () => Number(prizes.first || 0) + Number(prizes.second || 0) + Number(prizes.third || 0),
    [prizes]
  );

  const toggleChecklist = (key) => {
    setChecklist((c) => ({ ...c, [key]: !c[key] }));
  };

  if (!tournamentId) {
    return (
      <div className="screen active">
        <div className="page-title">Results & Prizes</div>
        <div className="content">
          <p>Select a tournament first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 5 · Wrap-Up</div>
          <div className="page-title">Results & Prizes</div>
          <div className="page-sub">Finalize winners & distribute payouts</div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-ghost btn-md" disabled title="Coming soon">
            📤 Export Results
          </button>
          <button type="button" className="btn btn-primary btn-md" disabled title="Coming soon">
            Finalize & Close Tournament
          </button>
          <TournamentPicker tournamentId={tournamentId} />
        </div>
      </div>

      <div className="content">
        {error ? <div className={live.errorBanner}>{error}</div> : null}

        {loading ? (
          <p>Loading standings…</p>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <span className="card-title">{divisionName} — Final Podium</span>
                <select
                  className="form-select"
                  style={{ padding: "6px 10px", fontSize: 12, width: 160 }}
                  value={bracketId}
                  onChange={(e) => setBracketId(e.target.value)}
                >
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={live.podium}>
                <div className={`${live.podiumPlace} ${live.podium2}`}>
                  <div className={live.podiumName} style={{ color: "#C0C0C0" }}>
                    {podium.silver?.teamName || "—"}
                  </div>
                  <div className={live.podiumBlock}>🥈</div>
                </div>
                <div className={`${live.podiumPlace} ${live.podium1}`}>
                  <div className={live.podiumName} style={{ color: "#FFD700" }}>
                    {podium.gold?.teamName || "—"}
                  </div>
                  <div className={live.podiumBlock}>🥇</div>
                </div>
                <div className={`${live.podiumPlace} ${live.podium3}`}>
                  <div className={live.podiumName} style={{ color: "#cd7f32" }}>
                    {podium.bronze?.teamName || "—"}
                  </div>
                  <div className={live.podiumBlock}>🥉</div>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Prize Distribution</span>
                </div>
                <table className={live.prizeTable}>
                  <thead>
                    <tr>
                      <th>Place</th>
                      <th>Player</th>
                      <th>Division</th>
                      <th>Prize</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>🥇</td>
                      <td>{podium.gold?.teamName || "TBD"}</td>
                      <td>{divisionName}</td>
                      <td style={{ color: "var(--primary-text)", fontWeight: 700 }}>
                        ${prizes.first}
                      </td>
                      <td>
                        <span className="pill pill-pending">Pending</span>
                      </td>
                    </tr>
                    <tr>
                      <td>🥈</td>
                      <td>{podium.silver?.teamName || "TBD"}</td>
                      <td>{divisionName}</td>
                      <td style={{ color: "var(--primary-text)", fontWeight: 700 }}>
                        ${prizes.second}
                      </td>
                      <td>
                        <span className="pill pill-pending">Pending</span>
                      </td>
                    </tr>
                    <tr>
                      <td>🥉</td>
                      <td>{podium.bronze?.teamName || "TBD"}</td>
                      <td>{divisionName}</td>
                      <td style={{ color: "var(--primary-text)", fontWeight: 700 }}>
                        ${prizes.third}
                      </td>
                      <td>
                        <span className="pill pill-pending">Pending</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-sec)" }}>Total Prizes</span>
                  <strong
                    style={{
                      color: "var(--primary-text)",
                      fontFamily: "var(--font-display)",
                      fontSize: 18,
                    }}
                  >
                    ${totalPrizes}
                  </strong>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Post-Event Checklist</span>
                </div>
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.key} className="toggle-row">
                    <div className="toggle-info">
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </div>
                    <label className="mini-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(checklist[item.key])}
                        onChange={() => toggleChecklist(item.key)}
                      />
                      <span className="mini-slider" />
                    </label>
                  </div>
                ))}
                <div className="divider" />
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled
                  title="Coming soon"
                >
                  🏁 Close Tournament
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
