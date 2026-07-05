"use client";

import { useEffect, useMemo, useState } from "react";
import TournamentPicker from "../../_components/TournamentPicker";
import styles from "../teams.module.css";
import TeamsDivisionPicker from "./TeamsDivisionPicker";
import TeamsSummaryBanner from "./TeamsSummaryBanner";
import TeamsPageActions from "./TeamsPageActions";
import TeamsRosterList from "./TeamsRosterList";
import AddTeamModal from "./AddTeamModal";
import RosterEditModal from "./RosterEditModal";
import TeamStatusModal from "./TeamStatusModal";
import CustomNameModal from "./CustomNameModal";
import ForfeitModal from "./ForfeitModal";
import MoveSeedModal from "./MoveSeedModal";
import { useTeamsState } from "./useTeamsState";

export default function ManageTeamsScreen({ tournamentId }) {
  const {
    divisionRows,
    loading,
    error,
    actionMessage,
    setActionMessage,
    isRowBusy,
    generateFromRegistrations,
    applyAutoSuggestPools,
    applyRandomize,
    applyReseedDupr,
    setTeamPool,
    setTeamStatus,
    setTeamCustomName,
    moveTeamToSeed,
    removeTeam,
    addTeamFromPlayers,
    replaceTeamPlayers,
    moveOverflowToWaitlist,
  } = useTeamsState(tournamentId);

  const [selectedId, setSelectedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [rosterEdit, setRosterEdit] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [customNameModal, setCustomNameModal] = useState(null);
  const [forfeitModal, setForfeitModal] = useState(null);
  const [moveSeedModal, setMoveSeedModal] = useState(null);

  useEffect(() => {
    if (divisionRows.length && !selectedId) {
      setSelectedId(divisionRows[0].id);
    }
  }, [divisionRows, selectedId]);

  const selected = useMemo(
    () => divisionRows.find((r) => String(r.id) === String(selectedId)),
    [divisionRows, selectedId]
  );

  const locked = Boolean(selected?.poolStarted || selected?.drawStatus === "published");

  if (!tournamentId) {
    return <TournamentPicker label="Manage Teams" />;
  }

  const handleUnpublish = () => {
    setActionMessage("Unpublish API coming soon — roster stays locked until unpublish is wired.");
  };

  const buildMenuHandlers = (team) => ({
    onMoveSeed: () => setMoveSeedModal({ team }),
    onMovePool: () => setActionMessage("Use the Pool dropdown on each row to assign pools."),
    onEditRoster: () => setRosterEdit(team),
    onSetStatus: (mode) => {
      if (mode === "partner") setAddOpen(true);
      else setStatusModal(team);
    },
    onWithdraw: async () => {
      try {
        await setTeamStatus(selected, team.id, "withdrawn");
      } catch {
        // error surfaced via actionMessage
      }
    },
    onForfeit: () => setForfeitModal(team),
    onReactivate: async () => {
      try {
        await setTeamStatus(selected, team.id, "confirmed", { forfeitReason: "" });
      } catch {
        // error surfaced via actionMessage
      }
    },
    onCustomName: () => setCustomNameModal(team),
    onRemove: () => removeTeam(selected, team.id),
    onUnpublish: handleUnpublish,
  });

  return (
    <div className={`screen active ${styles.teamsPage}`} id="screen-teams">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 2 · Registrations</div>
          <div className="page-title">Manage Teams</div>
          <div className="page-sub">Curate & seed each division before generating the draw</div>
        </div>
        <TeamsPageActions
          row={selected}
          tournamentId={tournamentId}
          locked={locked}
          onAutoSuggestPools={() => selected && applyAutoSuggestPools(selected)}
          onRandomize={() => selected && applyRandomize(selected)}
          onReseed={() => selected && applyReseedDupr(selected)}
          onAddTeam={() => setAddOpen(true)}
          onUnpublish={handleUnpublish}
        />
      </div>

      {divisionRows.length > 0 ? (
        <TeamsDivisionPicker
          rows={divisionRows}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      ) : null}

      <div className="content">
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        {actionMessage ? <div className={styles.infoBanner}>{actionMessage}</div> : null}

        {loading ? (
          <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading teams…</div>
        ) : !selected ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>No divisions found</div>
            <div className={styles.emptySub}>Create divisions first, then return here to build teams.</div>
          </div>
        ) : (
          <>
            <TeamsSummaryBanner
              row={selected}
              tournamentId={tournamentId}
              locked={locked}
              busy={isRowBusy(selected.id)}
              onUnpublish={handleUnpublish}
              onMoveOverflow={() => {
                if (
                  !selected ||
                  !window.confirm(
                    `Move the lowest-seeded overflow team(s) to waitlist? They will be excluded from the draw.`
                  )
                ) {
                  return;
                }
                moveOverflowToWaitlist(selected);
              }}
            />

            {locked ? (
              <div className={styles.lockBanner}>
                <div style={{ fontSize: 20 }}>🔒</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#5b8cff" }}>
                    Bracket is published — roster locked
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-sec)", marginTop: 2 }}>
                    Add, remove, partner changes, status changes, and re-seeding are disabled until
                    you unpublish.
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleUnpublish}>
                  Unpublish to edit
                </button>
              </div>
            ) : null}

            <TeamsRosterList
              row={selected}
              locked={locked}
              busy={isRowBusy(selected.id)}
              onGenerate={() => generateFromRegistrations(selected)}
              onAddTeam={() => setAddOpen(true)}
              onPoolChange={(teamId, val) => setTeamPool(selected, teamId, val)}
              getMenuHandlers={buildMenuHandlers}
            />
          </>
        )}
      </div>

      <AddTeamModal
        open={addOpen}
        row={selected}
        tournamentId={tournamentId}
        existingTeams={selected?.teams}
        onClose={() => setAddOpen(false)}
        onAdd={(payload) => selected && addTeamFromPlayers(selected, payload)}
      />

      <RosterEditModal
        open={Boolean(rosterEdit)}
        team={rosterEdit}
        row={selected}
        tournamentId={tournamentId}
        onClose={() => setRosterEdit(null)}
        onSave={(teamId, players, subs) =>
          selected && replaceTeamPlayers(selected, teamId, players, subs)
        }
      />

      <TeamStatusModal
        open={Boolean(statusModal)}
        teamName={statusModal?.customName || statusModal?.teamName}
        current={statusModal?.status}
        onCancel={() => setStatusModal(null)}
        onConfirm={async (status) => {
          if (selected && statusModal) {
            try {
              await setTeamStatus(selected, statusModal.id, status);
            } catch {
              // error surfaced via actionMessage
            }
          }
          setStatusModal(null);
        }}
      />

      <CustomNameModal
        open={Boolean(customNameModal)}
        teamName={customNameModal?.teamName}
        current={customNameModal?.customName}
        onCancel={() => setCustomNameModal(null)}
        onConfirm={(name) => {
          if (selected && customNameModal) setTeamCustomName(selected, customNameModal.id, name);
          setCustomNameModal(null);
        }}
      />

      <ForfeitModal
        open={Boolean(forfeitModal)}
        teamName={forfeitModal?.customName || forfeitModal?.teamName}
        onCancel={() => setForfeitModal(null)}
        onConfirm={async (reason) => {
          if (selected && forfeitModal) {
            try {
              await setTeamStatus(selected, forfeitModal.id, "forfeited", {
                forfeitReason: reason,
              });
            } catch {
              // error surfaced via actionMessage
            }
          }
          setForfeitModal(null);
        }}
      />

      <MoveSeedModal
        open={Boolean(moveSeedModal)}
        team={moveSeedModal?.team}
        maxSeed={selected?.teams?.length || 1}
        onCancel={() => setMoveSeedModal(null)}
        onConfirm={(seed) => {
          if (selected && moveSeedModal?.team) {
            moveTeamToSeed(selected, moveSeedModal.team.id, seed);
          }
          setMoveSeedModal(null);
        }}
      />
    </div>
  );
}
