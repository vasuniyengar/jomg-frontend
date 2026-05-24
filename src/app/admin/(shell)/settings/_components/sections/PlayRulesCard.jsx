"use client";

import { SCORING_OPTIONS, SEEDING_METHOD_OPTIONS } from "@/lib/tournamentSettings";
import styles from "../../settings.module.css";
import { SectionEyebrow, SectionPushHeader, ToggleRow, MiniToggle } from "../SettingsUi";

function ScoringSelect({ value, onChange, id }) {
  const options = SCORING_OPTIONS.includes(value)
    ? SCORING_OPTIONS
    : [value, ...SCORING_OPTIONS];
  return (
    <select
      id={id}
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default function PlayRulesCard({ settings, onSettingsChange }) {
  const playRules = settings.playRules;

  const patchPlayRules = (patch) => {
    onSettingsChange({ playRules: { ...playRules, ...patch } });
  };

  const patchMlp = (patch) => {
    patchPlayRules({ mlp: { ...playRules.mlp, ...patch } });
  };

  const onPoolScoringChange = (value) => {
    const next = { ...playRules.matchScoring, pool: value };
    if (playRules.matchScoring.playoff === playRules.matchScoring.pool) {
      next.playoff = value;
    }
    if (playRules.matchScoring.semi === playRules.matchScoring.pool) {
      next.semi = value;
    }
    patchPlayRules({ matchScoring: next });
  };

  return (
    <div className="card" id="play-rules-card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Tournament Play Rules</span>
          <div className={styles.cardSectionTitle}>
            Scoring, timing, seeding &amp; advancement defaults
          </div>
        </div>
        <SectionPushHeader sectionKey="playRules" settings={settings} onChange={onSettingsChange} />
      </div>

      <div className={styles.mlpPanel}>
        <div className={styles.mlpPanelHeader}>
          <div>
            <div className={styles.mlpTitle}>
              MLP Format <span className={styles.mlpBadge}>TEAM PLAY</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-sec)", lineHeight: 1.5, marginTop: 4 }}>
              Major League Pickleball team format with dream breaker tiebreaker.
            </div>
          </div>
          <MiniToggle
            checked={playRules.mlpFormat}
            onChange={(v) => patchPlayRules({ mlpFormat: v })}
            label="MLP format"
          />
        </div>

        {playRules.mlpFormat ? (
          <div className={styles.mlpFields}>
            <SectionEyebrow>MLP Game Scoring</SectionEyebrow>
            <div className={styles.grid2}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Men&apos;s Doubles</label>
                <ScoringSelect
                  value={playRules.mlp.mensDoubles}
                  onChange={(v) => patchMlp({ mensDoubles: v })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Women&apos;s Doubles</label>
                <ScoringSelect
                  value={playRules.mlp.womensDoubles}
                  onChange={(v) => patchMlp({ womensDoubles: v })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mixed Doubles 1</label>
                <ScoringSelect
                  value={playRules.mlp.mixed1}
                  onChange={(v) => patchMlp({ mixed1: v })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mixed Doubles 2</label>
                <ScoringSelect
                  value={playRules.mlp.mixed2}
                  onChange={(v) => patchMlp({ mixed2: v })}
                />
              </div>
            </div>
            <div className={styles.grid3}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Dream Breaker Scoring</label>
                <select
                  className="form-select"
                  value={playRules.mlp.dreamBreaker}
                  onChange={(e) => patchMlp({ dreamBreaker: e.target.value })}
                >
                  <option>1 game to 21, win by 1</option>
                  <option>1 game to 21, win by 2</option>
                  <option>1 game to 15, win by 1</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Rotation</label>
                <select
                  className="form-select"
                  value={playRules.mlp.rotation}
                  onChange={(e) => patchMlp({ rotation: e.target.value })}
                >
                  <option>Singles rally — 1 server switches every 4 pts</option>
                  <option>Singles rally — fixed server</option>
                  <option>Doubles rally</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Trigger</label>
                <select
                  className="form-select"
                  value={playRules.mlp.trigger}
                  onChange={(e) => patchMlp({ trigger: e.target.value })}
                >
                  <option>Only when games tied 2–2</option>
                  <option>Always played (final tiebreaker)</option>
                </select>
              </div>
            </div>
            <ToggleRow
              title="Substitutions"
              description="Allowed between matches"
              checked={playRules.mlp.substitutions}
              onChange={(v) => patchMlp({ substitutions: v })}
            />
            <ToggleRow
              title="Coach on Court"
              description="Non-playing coach during timeouts"
              checked={playRules.mlp.coachOnCourt}
              onChange={(v) => patchMlp({ coachOnCourt: v })}
            />
            <ToggleRow
              title="Team Timeouts"
              description="2 per game, 1 min each"
              checked={playRules.mlp.teamTimeouts}
              onChange={(v) => patchMlp({ teamTimeouts: v })}
            />
          </div>
        ) : null}
      </div>

      {!playRules.mlpFormat ? (
        <>
          <SectionEyebrow>Match Scoring by Stage</SectionEyebrow>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Pool Play Scoring</label>
              <ScoringSelect
                value={playRules.matchScoring.pool}
                onChange={onPoolScoringChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Playoff Scoring</label>
              <ScoringSelect
                value={playRules.matchScoring.playoff}
                onChange={(v) =>
                  patchPlayRules({
                    matchScoring: { ...playRules.matchScoring, playoff: v },
                  })
                }
              />
            </div>
          </div>
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Semifinal Scoring</label>
              <ScoringSelect
                value={playRules.matchScoring.semi}
                onChange={(v) =>
                  patchPlayRules({
                    matchScoring: { ...playRules.matchScoring, semi: v },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gold Medal Scoring</label>
              <ScoringSelect
                value={playRules.matchScoring.gold}
                onChange={(v) =>
                  patchPlayRules({
                    matchScoring: { ...playRules.matchScoring, gold: v },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bronze Medal Scoring</label>
              <ScoringSelect
                value={playRules.matchScoring.bronze}
                onChange={(v) =>
                  patchPlayRules({
                    matchScoring: { ...playRules.matchScoring, bronze: v },
                  })
                }
              />
            </div>
          </div>

          <SectionEyebrow>Scoring Type &amp; Sudden Death</SectionEyebrow>
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Scoring Type</label>
              <select
                className="form-select"
                value={playRules.scoringType}
                onChange={(e) => patchPlayRules({ scoringType: e.target.value })}
              >
                <option>Traditional (side-out)</option>
                <option>Rally Scoring</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sudden Death at</label>
              <input
                className="form-input"
                placeholder="e.g. 12"
                value={playRules.suddenDeathAt}
                onChange={(e) => patchPlayRules({ suddenDeathAt: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sudden Death Win at</label>
              <input
                className="form-input"
                placeholder="e.g. 13"
                value={playRules.suddenDeathWinAt}
                onChange={(e) => patchPlayRules({ suddenDeathWinAt: e.target.value })}
              />
            </div>
          </div>

          <SectionEyebrow>Timing</SectionEyebrow>
          <div className="form-group" style={{ maxWidth: 200 }}>
            <label className="form-label">Warm-Up Time (min)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={playRules.warmUpMinutes}
              onChange={(e) =>
                patchPlayRules({ warmUpMinutes: Number(e.target.value) || 0 })
              }
            />
          </div>
        </>
      ) : null}

      <SectionEyebrow>Rules &amp; Advancement</SectionEyebrow>
      <div className={styles.grid2}>
        <div className="form-group">
          <label className="form-label">Seeding Method</label>
          <select
            className="form-select"
            value={playRules.seedingMethod}
            onChange={(e) => patchPlayRules({ seedingMethod: e.target.value })}
          >
            {SEEDING_METHOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Auto-Generate Pools</label>
          <div style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <MiniToggle
              checked={playRules.autoGeneratePools}
              onChange={(v) => patchPlayRules({ autoGeneratePools: v })}
              label="Auto-generate pools"
            />
            <span style={{ fontSize: 12, color: "var(--text-sec)" }}>
              {playRules.autoGeneratePools
                ? "Auto — from max teams per division"
                : "Manual pool setup"}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.toggleGrid}>
        <ToggleRow
          title="Tiebreaker to 5"
          description="3rd game plays to 5 only"
          checked={playRules.tiebreakerTo5}
          onChange={(v) => patchPlayRules({ tiebreakerTo5: v })}
        />
        <ToggleRow
          title="Switch Sides at Half"
          description="Players switch at midpoint"
          checked={playRules.switchSidesAtHalf}
          onChange={(v) => patchPlayRules({ switchSidesAtHalf: v })}
        />
        <ToggleRow
          title="Top 1 Seed Gets Bye"
          description="1st seed skips first playoff round"
          checked={playRules.top1SeedBye}
          onChange={(v) => patchPlayRules({ top1SeedBye: v })}
        />
        <ToggleRow
          title="Top 1 & 2 Advance to Semis"
          description="Top two skip to semifinals"
          checked={playRules.top12AdvanceToSemis}
          onChange={(v) => patchPlayRules({ top12AdvanceToSemis: v })}
        />
        <ToggleRow
          title="Allow Referee Requests"
          description="Players can request line judge"
          checked={playRules.allowRefereeRequests}
          onChange={(v) => patchPlayRules({ allowRefereeRequests: v })}
        />
        <ToggleRow
          title="Bronze / 3rd Place Match"
          description="Play off for 3rd place"
          checked={playRules.bronzeMatch}
          onChange={(v) => patchPlayRules({ bronzeMatch: v })}
        />
      </div>
    </div>
  );
}
