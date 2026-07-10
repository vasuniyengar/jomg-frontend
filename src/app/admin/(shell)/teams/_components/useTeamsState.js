"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDivisions } from "@/lib/divisions";
import { fetchBracketTeams, generateBracketTeams, createBracketTeam, updateBracketTeamStatus, deleteBracketTeam } from "@/lib/teams";
import {
  autoSuggestPools,
  getActiveTeamsForDraw,
  getOverflowTeamCount,
  mapApiTeamToUiTeam,
  mapDivisionToTeamsRow,
  mergeTeamsState,
  randomizeSeeding,
  reseedByDupr,
  renumberSeeds,
} from "@/lib/teamsUi";

function storageKey(tournamentId) {
  return `jomg_teams_state_${tournamentId}`;
}

function readStored(tournamentId) {
  if (!tournamentId || typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(tournamentId)) || "{}");
  } catch {
    return {};
  }
}

function writeStored(tournamentId, state) {
  if (!tournamentId || typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(tournamentId), JSON.stringify(state));
}

async function loadApiTeamsForDivisions(tournamentId, divisions) {
  const entries = await Promise.all(
    divisions.map(async (d) => {
      try {
        const api = await fetchBracketTeams(tournamentId, d.id);
        const teams = (api || []).map((t, i) => mapApiTeamToUiTeam(t, i));
        return [d.id, { teams, error: null }];
      } catch (err) {
        return [d.id, { teams: [], error: err.message || "Failed to load teams" }];
      }
    })
  );
  return Object.fromEntries(entries);
}

export function useTeamsState(tournamentId) {
  const [divisions, setDivisions] = useState([]);
  const [apiTeamsById, setApiTeamsById] = useState({});
  const [localById, setLocalById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());

  const setBusy = useCallback((id, on) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    if (!tournamentId) {
      setDivisions([]);
      setApiTeamsById({});
      setLocalById({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const divs = await fetchDivisions(tournamentId);
      setDivisions(divs);
      const apiMap = await loadApiTeamsForDivisions(tournamentId, divs);
      const teamsById = {};
      const loadErrors = [];
      for (const [bracketId, result] of Object.entries(apiMap)) {
        teamsById[bracketId] = result.teams;
        if (result.error) {
          const division = divs.find((d) => String(d.id) === String(bracketId));
          loadErrors.push(`${division?.name || bracketId}: ${result.error}`);
        }
      }
      setApiTeamsById(teamsById);
      if (loadErrors.length) {
        setError(loadErrors.join(" · "));
      }
      setLocalById(readStored(tournamentId));
    } catch (err) {
      setError(err.message || "Failed to load teams");
      setDivisions([]);
      setApiTeamsById({});
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();
  }, [load]);

  const persistLocal = useCallback(
    (bracketId, patch) => {
      setLocalById((prev) => {
        const next = { ...prev, [bracketId]: { ...(prev[bracketId] || {}), ...patch } };
        writeStored(tournamentId, next);
        return next;
      });
    },
    [tournamentId]
  );

  const getTeamsForBracket = useCallback(
    (bracketId) => {
      const key = String(bracketId);
      const api = apiTeamsById[key] || apiTeamsById[bracketId] || [];
      const local = localById[key] || localById[bracketId] || {};
      return mergeTeamsState(api, local);
    },
    [apiTeamsById, localById]
  );

  const divisionRows = useMemo(() => {
    return divisions.map((d, i) => {
      const row = mapDivisionToTeamsRow(d, i);
      const teams = getTeamsForBracket(d.id);
      const activeTeamCount = getActiveTeamsForDraw(teams).length;
      return { ...row, teams, teamCount: teams.length, activeTeamCount };
    });
  }, [divisions, getTeamsForBracket]);

  const updateTeams = useCallback(
    (bracketId, teams) => {
      persistLocal(bracketId, {
        teams,
        order: teams.map((t) => String(t.id)),
      });
    },
    [persistLocal]
  );

  const refreshBracketTeams = useCallback(
    async (bracketId) => {
      const api = await fetchBracketTeams(tournamentId, bracketId);
      const teams = (api || []).map((t, i) => mapApiTeamToUiTeam(t, i));
      setApiTeamsById((prev) => ({ ...prev, [bracketId]: teams }));
      return teams;
    },
    [tournamentId]
  );

  const generateFromRegistrations = useCallback(
    async (row) => {
      if (!tournamentId || !row?.id) return;
      const id = row.id;
      setBusy(id, true);
      setActionMessage("");
      try {
        const response = await generateBracketTeams(tournamentId, id);
        const teams = await refreshBracketTeams(id);
        setError("");
        setLocalById((prev) => {
          const next = { ...prev };
          delete next[id];
          writeStored(tournamentId, next);
          return next;
        });
        const count = response?.totalTeams ?? teams.length;
        setActionMessage(`Generated ${count} team(s) from registrations`);
      } catch (err) {
        setActionMessage(err.message || "Failed to generate teams");
        throw err;
      } finally {
        setBusy(id, false);
      }
    },
    [tournamentId, refreshBracketTeams, setBusy]
  );

  const addTeamFromPlayers = useCallback(
    async (row, { playerIds, partnerNeeded = false }) => {
      if (!tournamentId || !row?.id) return;
      const id = row.id;
      setBusy(id, true);
      setActionMessage("");
      try {
        await createBracketTeam(tournamentId, id, { playerIds, partnerNeeded });
        await refreshBracketTeams(id);
        setError("");
        setActionMessage(
          partnerNeeded ? "Team added — needs partner" : "Team added successfully"
        );
      } catch (err) {
        throw err;
      } finally {
        setBusy(id, false);
      }
    },
    [tournamentId, refreshBracketTeams, setBusy]
  );

  const applyAutoSuggestPools = useCallback(
    (row) => {
      const teams = autoSuggestPools(getTeamsForBracket(row.id), row.teamsPerPool || 4);
      updateTeams(row.id, teams);
    },
    [getTeamsForBracket, updateTeams]
  );

  const applyRandomize = useCallback(
    (row) => {
      updateTeams(row.id, randomizeSeeding(getTeamsForBracket(row.id)));
    },
    [getTeamsForBracket, updateTeams]
  );

  const applyReseedDupr = useCallback(
    (row) => {
      updateTeams(row.id, reseedByDupr(getTeamsForBracket(row.id)));
    },
    [getTeamsForBracket, updateTeams]
  );

  const setTeamPool = useCallback(
    (row, teamId, poolVal) => {
      const teams = getTeamsForBracket(row.id).map((t) =>
        String(t.id) === String(teamId) ? { ...t, pool: poolVal ? Number(poolVal) : null } : t
      );
      updateTeams(row.id, teams);
    },
    [getTeamsForBracket, updateTeams]
  );

  const setTeamStatus = useCallback(
    async (row, teamId, status, extra = {}) => {
      if (!tournamentId || !row?.id) return;
      const id = row.id;
      setBusy(id, true);
      setActionMessage("");
      try {
        await updateBracketTeamStatus(tournamentId, id, teamId, status);
        await refreshBracketTeams(id);
        if (extra.forfeitReason !== undefined) {
          const teams = getTeamsForBracket(id).map((t) =>
            String(t.id) === String(teamId) ? { ...t, forfeitReason: extra.forfeitReason } : t
          );
          updateTeams(id, teams);
        }
        setError("");
        setActionMessage("Team status updated");
      } catch (err) {
        setActionMessage(err.message || "Failed to update team status");
        throw err;
      } finally {
        setBusy(id, false);
      }
    },
    [tournamentId, refreshBracketTeams, getTeamsForBracket, updateTeams, setBusy]
  );

  const moveOverflowToWaitlist = useCallback(
    async (row) => {
      if (!tournamentId || !row?.id) return;
      const teams = getTeamsForBracket(row.id);
      const overflow = getOverflowTeamCount(row, teams);
      if (overflow <= 0) return;

      const toWaitlist = [...getActiveTeamsForDraw(teams)]
        .sort((a, b) => (b.seed || 0) - (a.seed || 0))
        .slice(0, overflow);

      const id = row.id;
      setBusy(id, true);
      setActionMessage("");
      try {
        for (const team of toWaitlist) {
          await updateBracketTeamStatus(tournamentId, id, team.id, "waitlist");
        }
        await refreshBracketTeams(id);
        setError("");
        setActionMessage(`Moved ${toWaitlist.length} team(s) to waitlist`);
      } catch (err) {
        setActionMessage(err.message || "Failed to move teams to waitlist");
        throw err;
      } finally {
        setBusy(id, false);
      }
    },
    [tournamentId, getTeamsForBracket, refreshBracketTeams, setBusy]
  );

  const setTeamCustomName = useCallback(
    (row, teamId, customName) => {
      const teams = getTeamsForBracket(row.id).map((t) =>
        String(t.id) === String(teamId) ? { ...t, customName: customName || null } : t
      );
      updateTeams(row.id, teams);
    },
    [getTeamsForBracket, updateTeams]
  );

  const moveTeamToSeed = useCallback(
    (row, teamId, newSeed) => {
      const teams = [...getTeamsForBracket(row.id)];
      const idx = teams.findIndex((t) => String(t.id) === String(teamId));
      if (idx < 0) return;
      const [team] = teams.splice(idx, 1);
      const target = Math.max(1, Math.min(newSeed, teams.length + 1)) - 1;
      teams.splice(target, 0, team);
      updateTeams(row.id, renumberSeeds(teams));
    },
    [getTeamsForBracket, updateTeams]
  );

  const removeTeam = useCallback(
    async (row, teamId) => {
      const team = getTeamsForBracket(row.id).find((t) => String(t.id) === String(teamId));
      if (!team) return;

      if (team.localOnly) {
        updateTeams(
          row.id,
          getTeamsForBracket(row.id).filter((t) => String(t.id) !== String(teamId))
        );
        return;
      }

      const bracketId = row.id;
      const apiTeamId = team.apiId ?? team.id;
      setBusy(bracketId, true);
      setActionMessage("");
      try {
        await deleteBracketTeam(tournamentId, bracketId, apiTeamId);
        await refreshBracketTeams(bracketId);
        setLocalById((prev) => {
          const local = prev[bracketId] || {};
          const removedApiIds = (local.removedApiIds || []).filter(
            (id) => String(id) !== String(apiTeamId)
          );
          const teams = (local.teams || []).filter((t) => String(t.id) !== String(teamId));
          const next = { ...prev };
          if (removedApiIds.length || teams.length || local.order?.length) {
            next[bracketId] = {
              ...local,
              removedApiIds,
              teams,
              order: teams.map((t) => t.id),
            };
          } else {
            delete next[bracketId];
          }
          writeStored(tournamentId, next);
          return next;
        });
        setError("");
        setActionMessage("Team removed");
      } catch (err) {
        setActionMessage(err.message || "Failed to remove team");
        throw err;
      } finally {
        setBusy(bracketId, false);
      }
    },
    [getTeamsForBracket, tournamentId, refreshBracketTeams, setBusy, updateTeams]
  );

  const replaceTeamPlayers = useCallback(
    (row, teamId, players, subs = []) => {
      const teams = getTeamsForBracket(row.id).map((t) => {
        if (String(t.id) !== String(teamId)) return t;
        const combinedDupr = players.reduce((s, p) => s + (p.dupr || 0), 0);
        return {
          ...t,
          players,
          subs,
          combinedDupr: +combinedDupr.toFixed(3),
          partnerNeeded: players.length < 2 && row.type !== "Singles",
        };
      });
      updateTeams(row.id, teams);
    },
    [getTeamsForBracket, updateTeams]
  );

  const isRowBusy = useCallback((id) => busyIds.has(id), [busyIds]);

  return {
    divisionRows,
    loading,
    error,
    actionMessage,
    setActionMessage,
    isRowBusy,
    load,
    getTeamsForBracket,
    generateFromRegistrations,
    applyAutoSuggestPools,
    applyRandomize,
    applyReseedDupr,
    setTeamPool,
    setTeamStatus,
    moveOverflowToWaitlist,
    setTeamCustomName,
    moveTeamToSeed,
    removeTeam,
    addTeamFromPlayers,
    replaceTeamPlayers,
    updateTeams,
  };
}
