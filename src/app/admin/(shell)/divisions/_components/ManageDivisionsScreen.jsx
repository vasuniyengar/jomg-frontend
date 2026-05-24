"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import styles from "../divisions.module.css";
import {
  createDivision,
  deleteDivision,
  DIVISION_COLORS,
  fetchBracketMeta,
  fetchDivisions,
  updateDivision,
} from "@/lib/divisions";
import { getStageScoringLabel } from "@/lib/scoring";
import { fetchTournamentById, tournamentAdminPath } from "@/lib/tournaments";

const EMPTY_FORM = {
  bracketName: "",
  groupId: "",
  formatId: "",
  bracketFormatId: "",
  maxTeams: "16",
  registrationFee: "",
  minAge: "0",
  maxAge: "0",
  minRating: "0",
  maxRating: "0",
  startDate: "",
  endDate: "",
};

function toDateInput(value) {
  if (!value) return "";
  const s = typeof value === "string" ? value : new Date(value).toISOString();
  return s.slice(0, 10);
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
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
    setForm({
      ...EMPTY_FORM,
      registrationFee: String(tournament?.entryFee ?? 0),
      startDate: toDateInput(tournament?.startDate),
      endDate: toDateInput(tournament?.endDate),
      groupId: defaultGroupId(),
      formatId: defaultFormatId(),
      bracketFormatId: defaultBracketFormatId(),
    });
    setModalOpen(true);
  };

  const openEdit = (div) => {
    setEditing(div);
    setForm({
      bracketName: div.name || "",
      groupId: defaultGroupId(),
      formatId: defaultFormatId(),
      bracketFormatId: String(div.bracketFormatId || defaultBracketFormatId()),
      maxTeams: String(div.maxTeams ?? 16),
      registrationFee: String(div.registrationFee ?? 0),
      minAge: String(div.minAge ?? 0),
      maxAge: String(div.maxAge ?? 0),
      minRating: String(div.minRating ?? 0),
      maxRating: String(div.maxRating ?? 0),
      startDate: toDateInput(div.startDate),
      endDate: toDateInput(div.endDate),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!tournamentId || !form.bracketName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        bracketName: form.bracketName.trim(),
        groupId: Number(form.groupId),
        formatId: Number(form.formatId),
        bracketFormatId: Number(form.bracketFormatId),
        maxTeams: Number(form.maxTeams) || 16,
        registrationFee: Number(form.registrationFee) || 0,
        minAge: Number(form.minAge) || 0,
        maxAge: Number(form.maxAge) || 0,
        minRating: Number(form.minRating) || 0,
        maxRating: Number(form.maxRating) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
        status: "draft",
      };

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

  const handleDelete = async (div) => {
    if (!window.confirm(`Delete division "${div.name}"?`)) return;
    try {
      await deleteDivision(tournamentId, div.id);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete division");
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
                  style={{ background: DIVISION_COLORS[i % DIVISION_COLORS.length] }}
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
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
                    {div.formatLabel || div.Event?.eventName} · $
                    {Number(div.registrationFee || 0)} /entry
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(div);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className={styles.expandBody}>
                <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>
                    <span style={{ color: "var(--text-sec)" }}>DUPR range: </span>
                    <strong>
                      {div.minRating}–{div.maxRating || "∞"}
                    </strong>
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

      {modalOpen ? (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>
              {editing ? "Edit Division" : "Add New Division"}
            </div>
            <div className={styles.formGrid}>
              <div className={`form-group ${styles.formGridFull}`}>
                <label className="form-label">Division name</label>
                <input
                  className="form-input"
                  placeholder="e.g. MXD 16.0"
                  value={form.bracketName}
                  onChange={(e) => setForm((f) => ({ ...f, bracketName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <select
                  className="form-select"
                  value={form.groupId}
                  onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
                >
                  {(meta?.groups || []).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select
                  className="form-select"
                  value={form.formatId}
                  onChange={(e) => setForm((f) => ({ ...f, formatId: e.target.value }))}
                >
                  {(meta?.formats || []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bracket format</label>
                <select
                  className="form-select"
                  value={form.bracketFormatId}
                  onChange={(e) => setForm((f) => ({ ...f, bracketFormatId: e.target.value }))}
                >
                  {(meta?.bracketFormats || []).map((bf) => (
                    <option key={bf.id} value={bf.id}>
                      {bf.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max teams</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={form.maxTeams}
                  onChange={(e) => setForm((f) => ({ ...f, maxTeams: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Entry fee ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={form.registrationFee}
                  onChange={(e) => setForm((f) => ({ ...f, registrationFee: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">DUPR min</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={form.minRating}
                  onChange={(e) => setForm((f) => ({ ...f, minRating: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">DUPR max</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={form.maxRating}
                  onChange={(e) => setForm((f) => ({ ...f, maxRating: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost btn-md" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Division"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
