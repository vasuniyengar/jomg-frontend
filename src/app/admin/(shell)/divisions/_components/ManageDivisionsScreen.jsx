"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import DeleteDivisionConfirmModal from "./DeleteDivisionConfirmModal";
import DivisionFormModal from "./DivisionFormModal";
import styles from "../divisions.module.css";
import {
  createDivision,
  deleteDivision,
  DIVISION_COLORS,
  fetchBracketMeta,
  fetchDivisions,
  updateDivision,
} from "@/lib/divisions";
import {
  buildDivisionSavePayload,
  DEFAULT_DIVISION_FORM,
  divisionAccentColor,
  scoringConfigFromDivision,
} from "@/lib/divisionForm";
import { getStageScoringLabel } from "@/lib/scoring";
import { fetchTournamentById, tournamentAdminPath } from "@/lib/tournaments";

function toDateInput(value) {
  if (!value) return "";
  const s = typeof value === "string" ? value : new Date(value).toISOString();
  return s.slice(0, 10);
}

function deriveIdsFromEventName(eventName, meta, fallbacks) {
  if (!eventName || !meta?.groups?.length || !meta?.formats?.length) {
    return fallbacks;
  }
  const normalized = eventName.trim().toLowerCase();
  for (const g of meta.groups) {
    for (const f of meta.formats) {
      const combined = `${g.name} ${f.name}`.trim().toLowerCase();
      if (combined === normalized) {
        return { groupId: String(g.id), formatId: String(f.id) };
      }
    }
  }
  for (const g of meta.groups) {
    const prefix = g.name.trim().toLowerCase();
    if (normalized.startsWith(prefix)) {
      const rest = eventName.trim().slice(g.name.length).trim().toLowerCase();
      const f = meta.formats.find((x) => x.name.trim().toLowerCase() === rest);
      if (f) return { groupId: String(g.id), formatId: String(f.id) };
    }
  }
  return fallbacks;
}

function formatRating(value) {
  if (value == null || value === "" || Number(value) === 0) return "0";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2).replace(/\.?0+$/, "") : String(value);
}

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

export default function ManageDivisionsScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [tournament, setTournament] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_DIVISION_FORM);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError("");
    try {
      const [t, divs, m] = await Promise.all([
        fetchTournamentById(tournamentId),
        fetchDivisions(tournamentId),
        fetchBracketMeta(),
      ]);
      setTournament(t);
      setDivisions(divs);
      setMeta(m);
    } catch (err) {
      setError(err.message || "Failed to load divisions");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalRegistered = useMemo(
    () => divisions.reduce((s, d) => s + (d.registeredCount || 0), 0),
    [divisions]
  );

  const defaultGroupId = () => {
    const mixed = meta?.groups?.find((g) => /mixed/i.test(g.name));
    return String(mixed?.id || meta?.groups?.[0]?.id || "");
  };

  const defaultFormatId = () => {
    const doubles = meta?.formats?.find((f) => /double/i.test(f.name));
    return String(doubles?.id || meta?.formats?.[0]?.id || "");
  };

  const defaultBracketFormatId = () => {
    const rr = meta?.bracketFormats?.find((b) => /round robin/i.test(b.name));
    return String(rr?.id || meta?.bracketFormats?.[0]?.id || "");
  };

  const openCreate = () => {
    setEditing(null);
    const paletteColor =
      DIVISION_COLORS[divisions.length % DIVISION_COLORS.length];
    setForm({
      ...DEFAULT_DIVISION_FORM,
      registrationFee: String(tournament?.entryFee ?? 0),
      startDate: toDateInput(tournament?.startDate),
      endDate: toDateInput(tournament?.endDate),
      groupId: "",
      formatId: "",
      bracketFormatId: "",
      accentColor: paletteColor,
      duprRecorded: Boolean(tournament?.duprRecorded ?? true),
      duprEnforced: Boolean(tournament?.duprEnforced ?? false),
    });
    setModalOpen(true);
  };

  const openEdit = (div) => {
    const fallbacks = {
      groupId: defaultGroupId(),
      formatId: defaultFormatId(),
    };
    const derived = deriveIdsFromEventName(
      div.Event?.eventName || div.formatLabel,
      meta,
      fallbacks
    );
    setEditing(div);
    const idx = divisions.findIndex((d) => d.id === div.id);
    setForm({
      bracketName: div.name || "",
      groupId: derived.groupId,
      formatId: derived.formatId,
      bracketFormatId: String(div.bracketFormatId || defaultBracketFormatId()),
      maxTeams: String(div.maxTeams ?? 16),
      registrationFee: String(div.registrationFee ?? 0),
      minAge: div.minAge ? String(div.minAge) : "",
      maxAge: div.maxAge ? String(div.maxAge) : "",
      minRating: div.minRating ? String(div.minRating) : "",
      maxRating: div.maxRating ? String(div.maxRating) : "",
      startDate: toDateInput(div.startDate),
      endDate: toDateInput(div.endDate),
      startTime: div.startTime ? String(div.startTime).slice(0, 5) : "",
      ...scoringConfigFromDivision(div, tournament),
      accentColor:
        div.scoringConfig?.accentColor ||
        DIVISION_COLORS[(idx >= 0 ? idx : 0) % DIVISION_COLORS.length],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!tournamentId || !form.bracketName.trim()) return;
    if (!form.groupId || !form.formatId || !form.bracketFormatId) {
      setError("Please select group, format, and bracket format.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = buildDivisionSavePayload(form, { tournament });

      if (editing?.id) {
        await updateDivision(tournamentId, editing.id, payload);
      } else {
        await createDivision(tournamentId, payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message || "Failed to save division");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tournamentId || !pendingDelete?.id) return;
    setDeleting(true);
    setError("");
    try {
      await deleteDivision(tournamentId, pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete division");
    } finally {
      setDeleting(false);
    }
  };

  if (!tournamentId) {
    return <TournamentPicker label="Manage Divisions" />;
  }

  if (loading && !tournament) {
    return <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading…</div>;
  }

  return (
    <div className={`screen active ${styles.divPage}`} id="screen-divisions">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 1 · Setup</div>
          <div className="page-title">Manage Divisions</div>
          <div className="page-sub">
            {tournament?.name || "Tournament"} — add, edit & configure division formats
          </div>
        </div>
        <div className="page-actions">
          <Link
            href={tournamentAdminPath("/admin/settings", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Tournament Settings
          </Link>
          <Link
            href={tournamentAdminPath("/admin/reglist", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Players List →
          </Link>
          <button type="button" className="btn btn-primary btn-md" onClick={openCreate}>
            + Add Division
          </button>
        </div>
      </div>

      <div className="content">
        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <div className={styles.summaryBanner}>
          <span style={{ fontWeight: 700, color: "var(--primary-text)" }}>
            {divisions.length} Division{divisions.length === 1 ? "" : "s"}
          </span>
          <span style={{ color: "var(--text-sec)", fontSize: 12 }}>
            {totalRegistered} total registrations
          </span>
        </div>

        {divisions.map((div, i) => {
          const pct = div.maxTeams
            ? Math.min(100, Math.round(((div.registeredCount || 0) / div.maxTeams) * 100))
            : 0;
          const isOpen = openId === div.id;
          return (
            <div
              key={div.id}
              className={`${styles.expandCard}${isOpen ? ` ${styles.expandCardOpen}` : ""}`}
            >
              <div
                className={styles.expandHeader}
                onClick={() => setOpenId(isOpen ? null : div.id)}
              >
                <div
                  className={styles.colorBar}
                  style={{ background: divisionAccentColor(div, i) }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 17,
                      fontWeight: 800,
                    }}
                  >
                    {div.name}
                    {div.scoringConfig?.useGlobalSettings === false ? (
                      <span className="pill pill-amber" style={{ marginLeft: 8, fontSize: 10 }}>
                        Override
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
                    {div.formatLabel || div.Event?.eventName} · $
                    {Number(div.registrationFee || 0)} /entry
                    {div.scoringConfig?.useGlobalSettings === false
                      ? " · custom settings"
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
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>
                      {div.registeredCount || 0}/{div.maxTeams}
                    </span>
                  </div>
                </div>
                <span className={`pill ${statusPillClass(div.status)}`}>
                  {div.status || "draft"}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={div.poolStarted}
                  title={
                    div.poolStarted
                      ? "Cannot edit after pools have started"
                      : "Edit division"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(div);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={div.poolStarted}
                  title={
                    div.poolStarted
                      ? "Cannot delete after pools have started"
                      : "Delete division"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(div);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className={styles.expandBody}>
                <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {div.scoringConfig?.skillLevel ? (
                    <div>
                      <span style={{ color: "var(--text-sec)" }}>Skill: </span>
                      <strong>{div.scoringConfig.skillLevel}</strong>
                    </div>
                  ) : null}
                  <div>
                    <span style={{ color: "var(--text-sec)" }}>DUPR range: </span>
                    <strong>
                      {formatRating(div.minRating)}–
                      {div.maxRating ? formatRating(div.maxRating) : "∞"}
                    </strong>
                    {div.scoringConfig?.duprCombinedMin != null ||
                    div.scoringConfig?.duprCombinedMax != null ? (
                      <span style={{ color: "var(--text-ter)", fontSize: 11 }}>
                        {" "}
                        (combined{" "}
                        {div.scoringConfig.duprCombinedMin ?? "—"}–
                        {div.scoringConfig.duprCombinedMax ?? "—"})
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <span style={{ color: "var(--text-sec)" }}>Registration: </span>
                    <strong>
                      {div.scoringConfig?.registrationOn === false ? "Closed" : "Open"}
                    </strong>
                    {div.scoringConfig?.showPublic === false ? " · Hidden" : " · Public"}
                  </div>
                  <div>
                    <span style={{ color: "var(--text-sec)" }}>Dates: </span>
                    <strong>
                      {toDateInput(div.startDate)} – {toDateInput(div.endDate)}
                    </strong>
                  </div>
                  {(div.scoringLabels || div.scoringConfig) && isOpen ? (
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
                              div,
                              stage === "semi" ? "semifinal" : stage
                            ) ||
                              div.scoringLabels?.[stage] ||
                              div.scoringConfig?.[stage]?.label ||
                              "—"}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        <div className={styles.addCard} onClick={openCreate} role="button" tabIndex={0}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>
            Add New Division
          </div>
        </div>
      </div>

      <DivisionFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        meta={meta}
        tournament={tournament}
        tournamentId={tournamentId}
        saving={saving}
        poolStarted={Boolean(editing?.poolStarted)}
        divisionIndex={
          editing
            ? divisions.findIndex((d) => d.id === editing.id)
            : divisions.length
        }
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <DeleteDivisionConfirmModal
        open={Boolean(pendingDelete)}
        division={pendingDelete}
        divisionIndex={
          pendingDelete
            ? divisions.findIndex((d) => d.id === pendingDelete.id)
            : 0
        }
        deleting={deleting}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
