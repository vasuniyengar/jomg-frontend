// "use client";

// import { useEffect, useState } from "react";
// import { apiRequest } from "@/lib/api";

// export default function RoundRobinPage({ tournamentId }) {
//   const [brackets, setBrackets] = useState([]);
//   const [selectedBracketId, setSelectedBracketId] = useState("");
//   const [teamsPerPool, setTeamsPerPool] = useState(4);

//   const [pools, setPools] = useState([]);

//   const [loadingBrackets, setLoadingBrackets] = useState(true);
//   const [loadingPools, setLoadingPools] = useState(false);
//   const [generating, setGenerating] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // -----------------------------
//   // Load brackets
//   // -----------------------------
//   useEffect(() => {
//     if (!tournamentId) return;

//     const loadBrackets = async () => {
//       try {
//         setLoadingBrackets(true);

//         const data = await apiRequest(
//           `/api/host/${tournamentId}/brackets`
//         );

//         const { men = [], women = [], mixed = [] } =
//           data.data || {};

//         setBrackets([
//           ...men,
//           ...women,
//           ...mixed,
//         ]);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoadingBrackets(false);
//       }
//     };

//     loadBrackets();
//   }, [tournamentId]);

//   // -----------------------------
//   // Load pools
//   // -----------------------------
//   const loadPools = async (bracketId) => {
//     if (!bracketId) {
//       setPools([]);
//       return;
//     }

//     try {
//       setLoadingPools(true);

//       const data = await apiRequest(
//         `/api/round-robin/${tournamentId}/brackets/${bracketId}/pools`
//       );

//       setPools(data.data?.pools || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoadingPools(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedBracketId) {
//       loadPools(selectedBracketId);
//     }
//   }, [selectedBracketId]);

//   // -----------------------------
//   // Generate Round Robin
//   // -----------------------------
//   const generateRoundRobin = async () => {
//     try {
//       setGenerating(true);
//       setError("");
//       setSuccess("");

//       await apiRequest("/api/round-robin/roundrobin", {
//         method: "POST",
//         body: JSON.stringify({
//           tournamentId,
//           bracketId: Number(selectedBracketId),
//           teamsPerPool: Number(teamsPerPool),
//         }),
//       });

//       setSuccess("Round robin generated successfully.");

//       await loadPools(selectedBracketId);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setGenerating(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         Round Robin Generator
//       </h1>

//       {loadingBrackets ? (
//         <p>Loading brackets...</p>
//       ) : (
//         <div className="flex gap-3 mb-6">
//           <select
//             value={selectedBracketId}
//             onChange={(e) =>
//               setSelectedBracketId(e.target.value)
//             }
//             className="border rounded p-2"
//           >
//             <option value="">
//               Select Bracket
//             </option>

//             {brackets.map((bracket) => (
//               <option
//                 key={bracket.id}
//                 value={bracket.id}
//               >
//                 {bracket.name}
//               </option>
//             ))}
//           </select>

//           <input
//             type="number"
//             min="2"
//             value={teamsPerPool}
//             onChange={(e) =>
//               setTeamsPerPool(e.target.value)
//             }
//             className="border rounded p-2 w-32"
//             placeholder="Teams/Pool"
//           />

//           <button
//             disabled={
//               !selectedBracketId || generating
//             }
//             onClick={generateRoundRobin}
//             className="bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             {generating
//               ? "Generating..."
//               : "Generate Round Robin"}
//           </button>
//         </div>
//       )}

//       {error && (
//         <div className="text-red-600 mb-4">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="text-green-600 mb-4">
//           {success}
//         </div>
//       )}

//       {loadingPools && (
//         <p>Loading pools...</p>
//       )}

//       {!loadingPools &&
//         pools.map((poolData) => (
//           <div
//             key={poolData.pool.id}
//             className="border rounded p-4 mb-6"
//           >
//             <h2 className="text-xl font-bold mb-3">
//               {poolData.pool.poolName}
//             </h2>

//             {poolData.rounds.map((round) => (
//               <div
//                 key={round.id}
//                 className="mb-4"
//               >
//                 <h3 className="font-semibold">
//                   Round {round.roundNumber}
//                 </h3>

//                 {round.matches.map((match) => (
//                   <div
//                     key={match.id}
//                     className="flex gap-2 ml-4"
//                   >
//                     <span>
//                       {match.team1?.teamName}
//                     </span>

//                     <span>vs</span>

//                     <span>
//                       {match.team2?.teamName}
//                     </span>

//                     <span className="text-gray-500">
//                       ({match.status})
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         ))}
//     </div>
//   );
// }


"use client";
 
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { DIVISION_COLORS } from "@/lib/divisions";
import { getStageScoringLabel } from "@/lib/scoring";
 
function statusPillClass(status) {
  switch (status) {
    case "active":
    case "ongoing":
      return "pill-live";
    case "completed":
      return "pill-done";
    default:
      return "pill-wait";
  }
}
function toDateInput(value) {
  if (!value) return "";
  const s = typeof value === "string" ? value : new Date(value).toISOString();
  return s.slice(0, 10);
}
 
function MatchStatusPill({ status }) {
  const cls =
    status === "completed"
      ? "pill-success"
      : status === "in_progress"
      ? "pill-warning"
      : "pill-default";
  return (
    <span className={`pill ${cls}`}>{status.replace("_", " ")}</span>
  );
}
 
function DrawView({ pools, view, setView, divisionId, teamsPerPool, setTeamsPerPool, onGenerate, onDelete, generating }) {
  const hasPools = pools.length > 0;
 
  const maxRounds = pools.reduce((max, p) => Math.max(max, p.rounds.length), 0);
  const roundsView = Array.from({ length: maxRounds }, (_, i) => {
    const roundNumber = i + 1;
    const allMatches = [];
    pools.forEach((poolData) => {
      const round = poolData.rounds.find((r) => r.roundNumber === roundNumber);
      if (round) {
        round.matches.forEach((match, matchIndex) => {
          allMatches.push({
            ...match,
            poolName: poolData.pool.poolName,
            matchLabel: `Match ${matchIndex + 1}`,
          });
        });
      }
    });
    return { roundNumber, allMatches };
  });
 
  const totalMatches = roundsView.reduce((sum, r) => sum + r.allMatches.length, 0);
 
  return (
    <div>
      {/* Controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
          padding: "12px 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label
            htmlFor={`tpp-${divisionId}`}
            style={{ fontSize: 12, color: "var(--text-sec)" }}
          >
            Teams per pool
          </label>
          <input
            id={`tpp-${divisionId}`}
            type="number"
            min="2"
            value={teamsPerPool}
            onChange={(e) => setTeamsPerPool(e.target.value)}
            className="form-input"
            style={{ width: 70 }}
            disabled={hasPools}
          />
        </div>
 
        {hasPools && (
          <div
            style={{
              display: "flex",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setView("pool")}
              className="btn btn-sm"
              style={{
                borderRadius: 0,
                border: "none",
                background: view === "pool" ? "var(--primary)" : "transparent",
                color: view === "pool" ? "#fff" : "var(--text-sec)",
                padding: "5px 12px",
                fontSize: 12,
              }}
            >
              By pool
            </button>
            <button
              type="button"
              onClick={() => setView("round")}
              className="btn btn-sm"
              style={{
                borderRadius: 0,
                border: "none",
                borderLeft: "1px solid var(--border)",
                background: view === "round" ? "var(--primary)" : "transparent",
                color: view === "round" ? "#fff" : "var(--text-sec)",
                padding: "5px 12px",
                fontSize: 12,
              }}
            >
              By round
            </button>
          </div>
        )}
 
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {hasPools && (
            <button
              type="button"
              onClick={onDelete}
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--color-text-danger)" }}
            >
              Delete draw
            </button>
          )}
          <button
            type="button"
            disabled={generating || hasPools}
            onClick={onGenerate}
            className="btn btn-primary btn-sm"
          >
            {generating ? "Generating…" : hasPools ? "Already generated" : "Generate round robin"}
          </button>
        </div>
      </div>
 
      {/* Empty state */}
      {!hasPools && (
        <div style={{ padding: "20px 0", color: "var(--text-sec)", fontSize: 13 }}>
          No draw yet — set teams per pool and click <strong>Generate round robin</strong>.
        </div>
      )}
 
      {/* By Pool view */}
      {hasPools && view === "pool" &&
        pools.map((poolData) => (
          <div key={poolData.pool.id} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--text-sec)",
                marginBottom: 8,
                paddingBottom: 8,
                borderBottom: "1px solid var(--border)",
              }}
            >
              {poolData.pool.poolName} ·{" "}
              {poolData.rounds.length} round{poolData.rounds.length !== 1 ? "s" : ""}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Round</th>
                    <th>Team 1</th>
                    <th style={{ width: 30, textAlign: "center" }}>vs</th>
                    <th>Team 2</th>
                    <th style={{ width: 100 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {poolData.rounds.map((round) =>
                    round.matches.map((match, matchIndex) => (
                      <tr key={match.id}>
                        {matchIndex === 0 && (
                          <td
                            rowSpan={round.matches.length}
                            style={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: "var(--text-sec)",
                              verticalAlign: "top",
                              paddingTop: 14,
                            }}
                          >
                            Rd {round.roundNumber}
                          </td>
                        )}
                        <td style={{ fontWeight: 500 }}>{match.team1?.teamName}</td>
                        <td style={{ textAlign: "center", color: "var(--text-sec)", fontSize: 12 }}>
                          vs
                        </td>
                        <td style={{ fontWeight: 500 }}>{match.team2?.teamName}</td>
                        <td>
                          <MatchStatusPill status={match.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
 
      {/* By Round view */}
      {hasPools && view === "round" && (
        <>
          <div style={{ marginBottom: 16, fontSize: 13, color: "var(--text-sec)" }}>
            {totalMatches} total match{totalMatches !== 1 ? "es" : ""} across all pools
          </div>
          {roundsView.map(({ roundNumber, allMatches }) => (
            <div key={roundNumber} style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>Round {roundNumber}</span>
                <span style={{ fontSize: 12, color: "var(--text-sec)" }}>
                  {allMatches.length} simultaneous match{allMatches.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 10,
                }}
              >
                {allMatches.map((match) => (
                  <div
                    key={match.id}
                    className="card"
                    style={{ padding: "12px 14px" }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--text-sec)",
                        letterSpacing: "0.05em",
                        marginBottom: 8,
                        textTransform: "uppercase",
                      }}
                    >
                      {match.poolName} · {match.matchLabel}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                      {match.team1?.teamName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-sec)",
                        textAlign: "center",
                        margin: "3px 0",
                      }}
                    >
                      vs
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {match.team2?.teamName}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <MatchStatusPill status={match.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
 
export default function GenerateDrawScreen({ tournamentId }) {
  const [brackets, setBrackets] = useState([]);
  const [selectedBracketId, setSelectedBracketId] = useState(null);
  const [teamsPerPool, setTeamsPerPool] = useState(4);
  const [pools, setPools] = useState([]);
  const [loadingBrackets, setLoadingBrackets] = useState(true);
  const [loadingPools, setLoadingPools] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("pool");
 
  useEffect(() => {
    if (!tournamentId) return;
    const loadBrackets = async () => {
      try {
        setLoadingBrackets(true);
        const data = await apiRequest(`/api/host/${tournamentId}/brackets`);
        const { men = [], women = [], mixed = [] } = data.data || {};
        setBrackets([...men, ...women, ...mixed]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingBrackets(false);
      }
    };
    loadBrackets();
  }, [tournamentId]);
 
  const loadPools = async (bracketId) => {
    if (!bracketId) {
      setPools([]);
      return;
    }
    try {
      setLoadingPools(true);
      const data = await apiRequest(
        `/api/round-robin/${tournamentId}/brackets/${bracketId}/pools`
      );
      setPools(data.data?.pools || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPools(false);
    }
  };
 
  const handleToggle = (id) => {
    const newId = selectedBracketId === id ? null : id;
    setSelectedBracketId(newId);
    setPools([]);
    setError("");
    setSuccess("");
    if (newId) loadPools(newId);
  };
 
  const generateRoundRobin = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      await apiRequest("/api/round-robin/roundrobin", {
        method: "POST",
        body: JSON.stringify({
          tournamentId,
          bracketId: Number(selectedBracketId),
          teamsPerPool: Number(teamsPerPool),
        }),
      });
      setSuccess("Round robin generated.");
      await loadPools(selectedBracketId);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };
 
const deleteRoundRobin = async () => {
  if (!window.confirm("Delete this draw? This cannot be undone.")) return; 
  try {
    await apiRequest(
      `/api/round-robin/${tournamentId}/brackets/${selectedBracketId}`,
      { method: "DELETE" }
    );
    setPools([]);
    setSuccess("Draw deleted.");
  } catch (err) {
    setError(err.message);
  }
};
 
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Round Robin Generator</h1>
        </div>
      </div>
 
      <div className="content">
        {error && (
          <div className="bulk-upload-error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        {success && (
          <div className="bulk-upload-success" style={{ marginBottom: 12 }}>
            {success}
          </div>
        )}
 
        {loadingBrackets ? (
          <p style={{ color: "var(--text-sec)", padding: 12 }}>Loading brackets…</p>
        ) : brackets.length === 0 ? (
          <div className="card" style={{ padding: 24, color: "var(--text-sec)" }}>
            No brackets found for this tournament.
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--text-sec)",
                marginBottom: 10,
              }}
            >
              Select division
            </div>
 
            {brackets.map((bracket, i) => {
              const isOpen = String(bracket.id) === String(selectedBracketId);
              const pct = bracket.maxTeams
                ? Math.min(
                    100,
                    Math.round(
                      ((bracket.registeredCount || 0) / bracket.maxTeams) * 100
                    )
                  )
                : 0;
              const color = DIVISION_COLORS[i % DIVISION_COLORS.length];
 
              return (
                <div
                  key={bracket.id}
                  style={{
                    background: "var(--card-bg, var(--bg-elevated, #1a1d27))",
                    border: isOpen
                      ? "2px solid var(--primary)"
                      : "1.5px solid var(--border)",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 8,
                    boxShadow: isOpen
                      ? "0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)"
                      : "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* ── Header (click to toggle) ── */}
                  <button
                    type="button"
                    onClick={() => handleToggle(String(bracket.id))}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  >
                    {/* Color bar */}
                    <div style={{ width: 5, background: color, flexShrink: 0 }} />
 
                    <div style={{ padding: "14px 16px", flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 17,
                          fontWeight: 800,
                          color: "var(--text-primary, #fff)",
                        }}
                      >
                        {bracket.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
                        {bracket.formatLabel || bracket.Event?.eventName || "—"}
                        {bracket.registrationFee != null
                          ? ` · $${Number(bracket.registrationFee)}/entry`
                          : ""}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          maxWidth: 320,
                        }}
                      >
                        <div className="progress-bar" style={{ flex: 1, height: 5 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>
                          {bracket.registeredCount || 0}/{bracket.maxTeams}
                        </span>
                      </div>
                    </div>
 
                    {/* Status pill + chevron */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        paddingRight: 14,
                      }}
                    >
                      
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--text-sec)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                          transition: "transform 0.2s",
                          display: "inline-block",
                        }}
                      >
                        ▾
                      </span>
                    </div>
                  </button>
 
                  {/* ── Expanded draw body ── */}
                  {isOpen && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        padding: "16px",
                        background: "var(--bg-surface, var(--card-bg))",
                      }}
                    >
                      {/* Division meta — mirrors divisions screen */}
                      <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                        <div>
                          <span style={{ color: "var(--text-sec)" }}>DUPR range: </span>
                          <strong>
                            {bracket.minRating}–{bracket.maxRating || "∞"}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-sec)" }}>Dates: </span>
                          <strong>
                            {toDateInput(bracket.startDate)} – {toDateInput(bracket.endDate)}
                          </strong>
                        </div>
                        {(bracket.scoringLabels || bracket.scoringConfig) && (
                          <div
                            style={{
                              marginTop: 10,
                              paddingTop: 10,
                              borderTop: "1px solid var(--border)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                color: "var(--text-sec)",
                                marginBottom: 8,
                              }}
                            >
                              Match scoring (read-only)
                            </div>
                            {["pool", "playoff", "semi", "gold", "bronze"].map((stage) => (
                              <div key={stage} style={{ marginBottom: 4 }}>
                                <span style={{ color: "var(--text-sec)", textTransform: "capitalize" }}>
                                  {stage}:{" "}
                                </span>
                                <strong>
                                  {getStageScoringLabel(
                                    bracket,
                                    stage === "semi" ? "semifinal" : stage
                                  ) ||
                                    bracket.scoringLabels?.[stage] ||
                                    bracket.scoringConfig?.[stage]?.label ||
                                    "—"}
                                </strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {loadingPools ? (
                        <p style={{ color: "var(--text-sec)", fontSize: 13 }}>
                          Loading draw…
                        </p>
                      ) : (
                        <DrawView
                          pools={pools}
                          view={view}
                          setView={setView}
                          divisionId={bracket.id}
                          teamsPerPool={teamsPerPool}
                          setTeamsPerPool={setTeamsPerPool}
                          onGenerate={generateRoundRobin}
                          onDelete={deleteRoundRobin}
                          generating={generating}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}