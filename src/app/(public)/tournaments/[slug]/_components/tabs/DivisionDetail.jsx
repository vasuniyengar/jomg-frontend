"use client";

import { useState } from "react";
import Avatar from "../shared/Avatar";
import TeamRow from "../shared/TeamRow";

const SUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "teams", label: "Teams" },
  { id: "pools", label: "Pools" },
  { id: "matches", label: "Matches" },
  { id: "brackets", label: "Brackets" },
  { id: "playoffs", label: "Playoffs" },
  { id: "standings", label: "Final Standings" },
];

function BracketRound({ round }) {
  return (
    <div className="br-round">
      <div className="br-round-l">{round.round}</div>
      {round.matches.map((match, idx) => (
        <div className="br-match" key={idx}>
          {match.teams.map((team) => (
            <div className={`br-team${team.win ? " win" : ""}`} key={team.name}>
              <div className="br-team-n">
                <Avatar initials={team.initials} size={24} seed={team.win} />
                {team.name}
              </div>
              <span className="br-sc">{team.score}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DivisionDetail({ detail, onBack }) {
  const [subTab, setSubTab] = useState("overview");
  const [poolFilter, setPoolFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");

  const filteredPools =
    poolFilter === "all"
      ? detail.pools
      : detail.pools.filter((p) => p.id === poolFilter);

  const filteredMatches =
    matchFilter === "all"
      ? detail.matches
      : detail.matches.filter((m) => m.type === matchFilter);

  return (
    <div>
      <button type="button" className="dv-back" onClick={onBack}>
        ← Back to all divisions
      </button>
      <div className="dv-head">
        <div className="dv-title">{detail.title}</div>
        <div className="dv-sub">{detail.subtitle}</div>
      </div>

      <div className="dv-subtabs">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dv-subtab${subTab === tab.id ? " active" : ""}`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "overview" ? (
        <div className="dv-panel active">
          <div className="fmt-cards" style={{ marginBottom: 18 }}>
            {detail.overview.cards.map((card) => (
              <div className="fmt-card" key={card.label}>
                <div className="fmt-card-k">{card.label}</div>
                <div className="fmt-card-v">{card.value}</div>
              </div>
            ))}
          </div>
          <div className="vcard dsec">
            <div className="sh">
              <div className="sh-title" style={{ fontSize: 24 }}>
                HOW IT WORKS
              </div>
            </div>
            <div className="info-v">{detail.overview.howItWorks}</div>
          </div>
          <div className="info-grid">
            <div className="vcard">
              <div className="info-k">Status</div>
              <div className="info-v">
                <b>{detail.overview.status.split(" · ")[0]}</b>
                {detail.overview.status.includes(" · ")
                  ? ` · ${detail.overview.status.split(" · ").slice(1).join(" · ")}`
                  : null}
              </div>
            </div>
            <div className="vcard">
              <div className="info-k">Champion</div>
              <div className="info-v">
                <b>{detail.overview.champion.split(" def. ")[0]}</b>
                {detail.overview.champion.includes(" def. ")
                  ? ` def. ${detail.overview.champion.split(" def. ")[1]}`
                  : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {subTab === "teams" ? (
        <div className="dv-panel active">
          <div className="dv-empty" style={{ fontSize: 12, marginBottom: 6 }}>
            {detail.teams.length} teams · seeded by team DUPR
          </div>
          {detail.teams.map((team) => (
            <TeamRow key={`${team.seed}-${team.name}`} team={team} />
          ))}
        </div>
      ) : null}

      {subTab === "pools" ? (
        <div className="dv-panel active">
          <div className="dv-filter">
            <button
              type="button"
              className={`dv-chip${poolFilter === "all" ? " active" : ""}`}
              onClick={() => setPoolFilter("all")}
            >
              All Pools
            </button>
            {detail.pools.map((pool) => (
              <button
                key={pool.id}
                type="button"
                className={`dv-chip${poolFilter === pool.id ? " active" : ""}`}
                onClick={() => setPoolFilter(pool.id)}
              >
                {pool.name}
              </button>
            ))}
          </div>
          {filteredPools.map((pool) => (
            <div className="pool-card" key={pool.id} data-pool={pool.id}>
              <div className="pool-name">{pool.name}</div>
              <div className="tbl-scroll">
                <table className="stand-tbl">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>Games</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pool.rows.map((row) => (
                      <tr className={row.advance ? "adv" : ""} key={row.team}>
                        <td>
                          <div className="stand-team">
                            <span className="stand-seed">{row.seed}</span>
                            <Avatar
                              initials={row.initials}
                              size={24}
                              seed={row.advance}
                            />
                            {row.team}
                          </div>
                        </td>
                        <td>{row.w}</td>
                        <td>{row.l}</td>
                        <td>{row.games}</td>
                        <td>{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="dv-empty" style={{ fontSize: 12 }}>
            Shaded rows advance to the playoff bracket.
          </div>
        </div>
      ) : null}

      {subTab === "matches" ? (
        <div className="dv-panel active">
          <div className="dv-filter">
            {[
              { id: "all", label: "All" },
              { id: "pool", label: "Pool Play" },
              { id: "bracket", label: "Bracket" },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`dv-chip${matchFilter === chip.id ? " active" : ""}`}
                onClick={() => setMatchFilter(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
          {filteredMatches.map((match, idx) => (
            <div className="match-row" key={idx} data-mt={match.type}>
              <div className="match-time">
                {match.time}
                <div className="match-court">{match.court}</div>
              </div>
              <div className="match-teams">
                <div
                  className={`match-side${match.winner === 1 ? " win" : ""}`}
                >
                  <Avatar initials={match.team1.initials} size={24} />
                  {match.team1.name}
                </div>
                <div
                  className={`match-side${match.winner === 2 ? " win" : ""}`}
                >
                  <Avatar initials={match.team2.initials} size={24} />
                  {match.team2.name}
                </div>
              </div>
              <div className="match-result">
                <div className="match-sc">{match.score}</div>
                <div className="match-status final">{match.status}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {subTab === "brackets" ? (
        <div className="dv-panel active">
          <div className="bracket">
            {detail.brackets.map((round) => (
              <BracketRound round={round} key={round.round} />
            ))}
          </div>
        </div>
      ) : null}

      {subTab === "playoffs" ? (
        <div className="dv-panel active">
          <div className="bracket">
            {detail.playoffs.map((round) => (
              <BracketRound round={round} key={round.round} />
            ))}
          </div>
        </div>
      ) : null}

      {subTab === "standings" ? (
        <div className="dv-panel active">
          <div className="podium">
            {detail.standings.map((row) => (
              <div
                className={`podium-row${row.gold ? " gold" : ""}`}
                key={row.team}
              >
                <div className="podium-medal">{row.medal}</div>
                <div>
                  <div className="podium-place">{row.place}</div>
                  <div className="podium-team">{row.team}</div>
                  <div className="podium-loc">{row.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
