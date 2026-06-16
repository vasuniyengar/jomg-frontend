"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDivisions } from "@/lib/divisions";
import {
  mapDivisionToDrawRow,
  mapPoolsApiToBracket,
  mergeDrawRow,
  validateDivisionForDraw,
} from "@/lib/drawUi";
import {
  createRoundRobin,
  deleteRoundRobin,
  fetchRoundRobinPools,
} from "@/lib/roundRobin";

async function loadPoolsForDivisions(tournamentId, divisions) {
  const entries = await Promise.all(
    divisions.map(async (division) => {
      try {
        const pools = await fetchRoundRobinPools(tournamentId, division.id);
        const bracket = mapPoolsApiToBracket(pools);
        return [division.id, { bracket, hasPools: Boolean(bracket) }];
      } catch {
        return [division.id, { bracket: null, hasPools: false }];
      }
    })
  );
  return Object.fromEntries(entries);
}

export function useDrawState(tournamentId) {
  const [divisions, setDivisions] = useState([]);
  const [poolDataById, setPoolDataById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [rowErrors, setRowErrors] = useState({});

  const setRowBusy = useCallback((id, busy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const setRowError = useCallback((id, message) => {
    setRowErrors((prev) => {
      if (!message) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: message };
    });
  }, []);

  const refreshPoolsForRow = useCallback(
    async (bracketId) => {
      const pools = await fetchRoundRobinPools(tournamentId, bracketId);
      const bracket = mapPoolsApiToBracket(pools);
      const patch = { bracket, hasPools: Boolean(bracket) };
      setPoolDataById((prev) => ({ ...prev, [bracketId]: patch }));
      return patch;
    },
    [tournamentId]
  );

  const load = useCallback(async () => {
    if (!tournamentId) {
      setDivisions([]);
      setPoolDataById({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setActionMessage("");
    try {
      const divs = await fetchDivisions(tournamentId);
      setDivisions(divs);
      const poolMap = await loadPoolsForDivisions(tournamentId, divs);
      setPoolDataById(poolMap);
      setRowErrors({});
    } catch (err) {
      setError(err.message || "Failed to load divisions");
      setDivisions([]);
      setPoolDataById({});
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    return divisions.map((d, i) => {
      const base = mapDivisionToDrawRow(d, i);
      return mergeDrawRow(base, poolDataById[d.id] || {});
    });
  }, [divisions, poolDataById]);

  const runGenerate = useCallback(
    async (row, { regenerate = false } = {}) => {
      if (!tournamentId || !row?.id) return;
      const id = row.id;
      setRowBusy(id, true);
      setRowError(id, "");
      setActionMessage("");
      try {
        if (regenerate) {
          try {
            await deleteRoundRobin(tournamentId, id);
          } catch (err) {
            if (err.status !== 404) throw err;
          }
        }
        await createRoundRobin({
          tournamentId,
          bracketId: id,
          teamsPerPool: row.teamsPerPool || 4,
        });
        await refreshPoolsForRow(id);
      } catch (err) {
        setRowError(id, err.message || "Failed to generate draw");
        throw err;
      } finally {
        setRowBusy(id, false);
      }
    },
    [tournamentId, refreshPoolsForRow, setRowBusy, setRowError]
  );

  const generateDraw = useCallback(
    async (row) => {
      await runGenerate(row, { regenerate: false });
    },
    [runGenerate]
  );

  const regenerateBracket = useCallback(
    async (row) => {
      await runGenerate(row, { regenerate: true });
    },
    [runGenerate]
  );

  const publishDraw = useCallback(async () => {
    setActionMessage("Publish API coming soon — draw stays in draft until published.");
  }, []);

  const unpublishDraw = useCallback(async () => {
    setActionMessage("Unpublish API coming soon.");
  }, []);

  const generateAllReady = useCallback(async () => {
    const ready = rows.filter((row) => {
      const v = validateDivisionForDraw(row);
      return row.drawStatus === "none" && v.ok;
    });
    if (!ready.length) return;

    setActionMessage("");
    const failures = [];
    for (const row of ready) {
      try {
        await runGenerate(row, { regenerate: false });
      } catch (err) {
        failures.push(`${row.name}: ${err.message}`);
      }
    }
    if (failures.length) {
      setActionMessage(failures.join(" · "));
    }
  }, [rows, runGenerate]);

  const publishAllDrafts = useCallback(async () => {
    setActionMessage("Publish API coming soon — cannot publish drafts yet.");
  }, []);

  const getRowById = useCallback(
    (id) => rows.find((r) => String(r.id) === String(id)),
    [rows]
  );

  const isRowBusy = useCallback((id) => busyIds.has(id), [busyIds]);

  return {
    rows,
    loading,
    error,
    actionMessage,
    rowErrors,
    isRowBusy,
    load,
    generateDraw,
    publishDraw,
    unpublishDraw,
    regenerateBracket,
    generateAllReady,
    publishAllDrafts,
    getRowById,
  };
}
