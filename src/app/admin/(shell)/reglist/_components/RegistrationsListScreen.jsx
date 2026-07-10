"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import TournamentPicker from "../../_components/TournamentPicker";
import AddPlayerModal from "./AddPlayerModal";
import EditPlayerModal from "./EditPlayerModal";
import DeletePlayerModal from "./DeletePlayerModal";
import {
  MAX_PAYMENT_EMAILS,
  bulkUpdateRegistrationPayments,
  bulkUploadPlayers,
  deleteRegistration,
  fetchDivisions,
  fetchRegisteredPlayers,
  resendPaymentEmails,
  updateRegistrationPayment,
} from "@/lib/divisions";
import {
  buildBulkUploadTemplateAoA,
  normalizeBulkUploadRow,
} from "@/lib/bulkUpload";
import { fetchHostTournaments, fetchTournamentById, tournamentAdminPath } from "@/lib/tournaments";
import styles from "../reglist.module.css";

function formatDupr(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function SortableColumnHeader({ label, columnKey, sortKey, sortDir, onSort }) {
  const active = sortKey === columnKey;
  return (
    <button
      type="button"
      className={`${styles.sortHeader}${active ? ` ${styles.sortHeaderActive}` : ""}`}
      onClick={() => onSort(columnKey)}
      title={`Sort by ${label.toLowerCase()}`}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span>{label}</span>
      <span className={styles.sortIcons} aria-hidden="true">
        <span
          className={`${styles.sortArrow}${active && sortDir === "asc" ? ` ${styles.sortArrowActive}` : ""}`}
        >
          ▲
        </span>
        <span
          className={`${styles.sortArrow}${active && sortDir === "desc" ? ` ${styles.sortArrowActive}` : ""}`}
        >
          ▼
        </span>
      </span>
    </button>
  );
}

function paymentMeta(paymentStatus) {
  if (paymentStatus === "paid") return { label: "✓ Paid", cls: "pill-approved" };
  if (paymentStatus === "refunded") return { label: "↺ Refunded", cls: "pill-wait" };
  return { label: "⏱ Unpaid", cls: "pill-live" };
}

function registrationStatusMeta(status) {
  switch (status) {
    case "registered":
      return { label: "Registered", cls: "pill-approved" };
    case "completed":
      return { label: "Completed", cls: "pill-approved" };
    case "withdraw":
      return { label: "Withdrawn", cls: "pill-wait" };
    case "not_registered":
      return { label: "Not registered", cls: "pill-live" };
    default:
      return { label: status || "—", cls: "pill-wait" };
  }
}

function normalizeGenderForForm(gender) {
  const g = String(gender || "").trim().toLowerCase();
  if (g.startsWith("f")) return "female";
  if (g.startsWith("m")) return "male";
  return "male";
}

function mapApiPlayersToRows(apiList, tournamentClubName = "") {
  const rows = [];
  for (const p of apiList || []) {
    const events = p.events?.length ? p.events : [];
    if (!events.length) continue;

    for (const event of events) {
      const paid = paymentMeta(event?.paymentStatus);
      const paymentEmailSentCount = event?.paymentEmailSentCount ?? 0;
      const paymentStatus = event?.paymentStatus || "unpaid";
      const canResendEmail =
        paymentStatus === "unpaid" && paymentEmailSentCount < MAX_PAYMENT_EMAILS;
      const regStatus = registrationStatusMeta(event?.status);
      const initials = String(p.name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join("")
        .toUpperCase();
      const clubDisplay =
        event?.clubName?.trim() || tournamentClubName?.trim() || "";
      rows.push({
        id: `reg-${event?.registrationId || `${p.playerId}-${event?.bracketId}`}`,
        registrationId: event?.registrationId,
        playerId: p.playerId,
        bracketId: event?.bracketId,
        paymentStatus,
        paymentEmailSentCount,
        canResendEmail,
        resendDisabledReason:
          paymentStatus !== "unpaid"
            ? "Paid players cannot receive payment reminder emails"
            : paymentEmailSentCount >= MAX_PAYMENT_EMAILS
              ? `Payment email limit reached (${MAX_PAYMENT_EMAILS} max)`
              : "",
        initials: initials || "??",
        avatar: "linear-gradient(135deg,#64748b 0%,#334155 100%)",
        name: p.name,
        email: p.email,
        gender: p.gender?.[0]?.toUpperCase() || "M",
        genderForEdit: normalizeGenderForForm(p.gender),
        partnerOriginal: event?.partnerName && event.partnerName !== "—" ? event.partnerName : "",
        age: p.age || "—",
        date: new Date().toLocaleDateString("en-US"),
        phone: p.phoneNumber || "—",
        partner: event?.partnerName || "—",
        division: event?.bracketName || "—",
        dupr: formatDupr(p.duprRating),
        duprRaw: p.duprRating,
        duprId: p.duprId || event?.duprId || "",
        clubName: clubDisplay,
        rosterNumber: event?.rosterNumber || "",
        playerRole: event?.playerRole || "",
        registrationStatus: event?.status || "registered",
        checkInStatus: event?.checkInStatus || "not_checked_in",
        paid: paid.label,
        paidClass: paid.cls,
        status: regStatus.label,
        statusClass: regStatus.cls,
      });
    }
  }
  return rows;
}

export default function RegistrationsListScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [search, setSearch] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadHadTeamNames, setUploadHadTeamNames] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingUploadRows, setPendingUploadRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [tournamentClubName, setTournamentClubName] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [playerToDelete, setPlayerToDelete] = useState(null);

  const loadPlayers = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const statusArg =
        paymentFilter === "all" ? undefined : { paymentStatus: paymentFilter };
      const data = await fetchRegisteredPlayers(tournamentId, statusArg);
      setPlayers(mapApiPlayersToRows(data, tournamentClubName));
      setSelectedIds(new Set());
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, paymentFilter, tournamentClubName]);

  useEffect(() => {
    fetchHostTournaments().then(setTournaments).catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    if (!tournamentId) {
      setDivisions([]);
      setTournamentClubName("");
      return;
    }
    fetchDivisions(tournamentId)
      .then(setDivisions)
      .catch(() => setDivisions([]));
    fetchTournamentById(tournamentId)
      .then((t) => {
        setTournamentClubName(t?.clubName || t?.Club?.name || "");
      })
      .catch(() => setTournamentClubName(""));
  }, [tournamentId]);

  const toggleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }, [sortKey]);

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = players;
    if (q) {
      rows = players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.division.toLowerCase().includes(q) ||
          (p.clubName || "").toLowerCase().includes(q)
      );
    }
    if (!sortKey) return rows;

    const dir = sortDir === "desc" ? -1 : 1;
    return [...rows].sort((a, b) => {
      const av = String(a[sortKey] || "").trim().toLowerCase();
      const bv = String(b[sortKey] || "").trim().toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [search, players, sortKey, sortDir]);

  const selectablePlayers = useMemo(
    () => filteredPlayers.filter((p) => p.registrationId),
    [filteredPlayers]
  );

  const eligiblePlayers = useMemo(
    () => filteredPlayers.filter((p) => p.canResendEmail && p.registrationId),
    [filteredPlayers]
  );

  const selectedEligible = useMemo(
    () => eligiblePlayers.filter((p) => selectedIds.has(p.registrationId)),
    [eligiblePlayers, selectedIds]
  );

  const selectedForPayment = useMemo(
    () => selectablePlayers.filter((p) => selectedIds.has(p.registrationId)),
    [selectablePlayers, selectedIds]
  );

  const allSelectableSelected =
    selectablePlayers.length > 0 &&
    selectablePlayers.every((p) => selectedIds.has(p.registrationId));

  const unpaidCount = useMemo(
    () => players.filter((p) => p.paidClass === "pill-live").length,
    [players]
  );

  const tournamentName =
    tournaments.find((t) => String(t.id) === String(tournamentId))?.name ||
    "Tournament";

  const toggleSelect = (registrationId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(registrationId)) next.delete(registrationId);
      else next.add(registrationId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(selectablePlayers.map((p) => p.registrationId)));
  };

  const handleBulkPayment = async (paymentStatus) => {
    if (!tournamentId || !selectedForPayment.length) return;
    setPaymentUpdating(true);
    setPaymentMessage("");
    setPaymentError("");
    try {
      const result = await bulkUpdateRegistrationPayments(tournamentId, {
        registrationIds: selectedForPayment.map((p) => p.registrationId),
        paymentStatus,
        syncPartner: true,
      });
      const updated = result?.updated?.length ?? selectedForPayment.length;
      setPaymentMessage(
        `Updated payment status to ${paymentStatus} for ${updated} registration(s).`
      );
      await loadPlayers();
    } catch (err) {
      setPaymentError(err.message || "Failed to update payment status");
    } finally {
      setPaymentUpdating(false);
    }
  };

  const handleRowPayment = async (player, paymentStatus) => {
    if (!tournamentId || !player.registrationId) return;
    setPaymentUpdating(true);
    setPaymentMessage("");
    setPaymentError("");
    try {
      await updateRegistrationPayment(tournamentId, player.registrationId, {
        paymentStatus,
        syncPartner: true,
      });
      setPaymentMessage(`Marked ${player.name} as ${paymentStatus}.`);
      await loadPlayers();
    } catch (err) {
      setPaymentError(err.message || "Failed to update payment");
    } finally {
      setPaymentUpdating(false);
    }
  };

  const handleDeletePlayer = async () => {
    const player = playerToDelete;
    if (!tournamentId || !player?.registrationId) return;

    setDeletingId(player.registrationId);
    setDeleteError("");
    setDeleteMessage("");
    try {
      await deleteRegistration(tournamentId, player.registrationId);
      setDeleteMessage(`${player.name} removed from ${player.division}.`);
      if (editPlayer?.registrationId === player.registrationId) {
        setEditPlayer(null);
      }
      setPlayerToDelete(null);
      await loadPlayers();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete player");
    } finally {
      setDeletingId(null);
    }
  };

  const handleResendPaymentEmails = async () => {
    if (!tournamentId || !selectedEligible.length) return;
    setResending(true);
    setResendMessage("");
    setResendError("");
    try {
      const result = await resendPaymentEmails(
        tournamentId,
        selectedEligible.map((p) => p.registrationId)
      );
      const queued = result?.queued?.length || 0;
      const skipped = result?.skipped?.length || 0;
      setResendMessage(
        `Queued ${queued} payment email(s)${skipped ? `; ${skipped} skipped` : ""}. They will be sent shortly.`
      );
      await loadPlayers();
    } catch (err) {
      setResendError(err.message || "Failed to resend payment emails");
    } finally {
      setResending(false);
    }
  };

  const handleTemplateDownload = () => {
    const ws = XLSX.utils.aoa_to_sheet(buildBulkUploadTemplateAoA());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Players");
    XLSX.writeFile(wb, "players-upload-template.xlsx");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploadMessage("");
    setUploadHadTeamNames(false);
    setPendingUploadRows([]);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const normalized = rows.map(normalizeBulkUploadRow).filter(Boolean);
      if (!normalized.length) {
        setUploadError("No valid rows found. Use the template format.");
        return;
      }
      setPendingUploadRows(normalized);
      setUploadMessage(`${normalized.length} rows ready. Click Submit Upload.`);
    } catch {
      setUploadError("Upload failed. Please use the provided Excel template.");
    }
  };
  const handleSubmitUpload = async () => {
    if (!pendingUploadRows.length || !tournamentId) return;
    setUploading(true);
    setUploadError("");
    try {
      const result = await bulkUploadPlayers(tournamentId, pendingUploadRows, true);
      const created = result?.created?.length || 0;
      const skipped = result?.skipped?.length || 0;
      const errCount = result?.errors?.length || 0;
      const emailsQueued = result?.emailsQueued ?? 0;
      const hadTeamNames = pendingUploadRows.some((r) =>
        String(r.team_name || r.teamName || "").trim()
      );
      setUploadHadTeamNames(hadTeamNames && created > 0);
      setUploadMessage(
        `Registered ${created} player(s).${skipped ? ` ${skipped} skipped.` : ""}${emailsQueued ? ` Payment emails queued (${emailsQueued}).` : ""}${errCount ? ` ${errCount} issue(s) — see details below.` : ""}`
      );
      const detailLines = [];
      if (result?.skipped?.length) {
        detailLines.push(
          ...result.skipped.map(
            (s) => `Row ${s.row}${s.email ? ` (${s.email})` : ""}: ${s.reason}`
          )
        );
      }
      if (result?.errors?.length) {
        detailLines.push(
          ...result.errors.map((e) => `Row ${e.row}: ${e.reason}`)
        );
      }
      if (detailLines.length) {
        setUploadError(detailLines.join("\n"));
      }
      setPendingUploadRows([]);
      await loadPlayers();
    } catch (err) {
      setUploadError(err.message || "Bulk upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!tournamentId) {
    return <TournamentPicker label="Players List" />;
  }

  return (
    <div className="screen" id="screen-reglist">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 2 · Registrations</div>
          <div className="page-title">Players List</div>
          <div className="page-sub">
            {tournamentName} · {players.length} registered
          </div>
        </div>
        <div className="page-actions">
          <Link
            href={tournamentAdminPath("/admin/teams", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Manage Teams →
          </Link>
          <Link
            href={tournamentAdminPath("/admin/checkin", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Player Check-In →
          </Link>
          <Link
            href={tournamentAdminPath("/admin/divisions", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Manage Divisions
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-md"
            disabled={!selectedEligible.length || resending}
            onClick={handleResendPaymentEmails}
            title="Resend payment email to selected unpaid players (max 3 per player)"
          >
            {resending
              ? "Sending…"
              : `Resend payment email${selectedEligible.length ? ` (${selectedEligible.length})` : ""}`}
          </button>
          <input
            className="form-input"
            placeholder="Search players…"
            style={{ width: 180, padding: "8px 12px", fontSize: 13 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-md"
            onClick={() => setAddPlayerOpen(true)}
          >
            + Add Player
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            onClick={() => setShowBulkUpload((v) => !v)}
          >
            ⬆ Bulk Upload
          </button>
        </div>
      </div>

      <div className="content">
        {resendMessage ? (
          <div className="bulk-upload-success" style={{ marginBottom: 12 }}>
            {resendMessage}
          </div>
        ) : null}
        {resendError ? (
          <div
            className="bulk-upload-error"
            style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
          >
            {resendError}
          </div>
        ) : null}
        {paymentMessage ? (
          <div className="bulk-upload-success" style={{ marginBottom: 12 }}>
            {paymentMessage}
          </div>
        ) : null}
        {paymentError ? (
          <div
            className="bulk-upload-error"
            style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
          >
            {paymentError}
          </div>
        ) : null}
        {deleteMessage ? (
          <div className="bulk-upload-success" style={{ marginBottom: 12 }}>
            {deleteMessage}
          </div>
        ) : null}
        {deleteError ? (
          <div
            className="bulk-upload-error"
            style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}
          >
            {deleteError}
          </div>
        ) : null}

        {showBulkUpload ? (
          <div className="card bulk-upload-card">
            <div className="card-header">
              <span className="card-title">Bulk Upload Players</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleTemplateDownload}
              >
                ⬇ Download Excel Template
              </button>
            </div>
            <div className="bulk-upload-grid">
              <div className="bulk-upload-field">
                <label className="form-label">Tournament</label>
                <select className="form-select" value={tournamentId} disabled>
                  <option value={tournamentId}>{tournamentName}</option>
                </select>
              </div>
              <div className="bulk-upload-field">
                <label className="form-label">Upload Excel File</label>
                <input
                  className="form-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!pendingUploadRows.length || uploading}
                onClick={handleSubmitUpload}
              >
                {uploading ? "Uploading…" : "Submit Upload"}
              </button>
            </div>
            {uploadMessage ? (
              <div className="bulk-upload-success">
                {uploadMessage}
                {uploadHadTeamNames ? (
                  <>
                    {" "}
                    <Link
                      href={tournamentAdminPath("/admin/teams", tournamentId)}
                      style={{ color: "var(--primary-text)", fontWeight: 600 }}
                    >
                      View teams in Manage Teams →
                    </Link>
                  </>
                ) : null}
              </div>
            ) : null}
            {uploadError ? (
              <div className="bulk-upload-error" style={{ whiteSpace: "pre-wrap" }}>
                {uploadError}
              </div>
            ) : null}
            <p className="form-hint">
              Required: name, email, division (match Manage Divisions exactly). MLP: team_name,
              role (starter/bench), rosterNumber. Doubles: partner, pay_for_partner (yes/no).
              DUPR rating in dupr or numeric DuprID; account ID in DuprID when not numeric.
              paymentStatus: paid/unpaid/refunded. Set payment phone, Zelle, or Venmo in Tournament Settings
              before sending payment emails.
            </p>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            padding: "14px 20px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sec)" }}>
              REGISTERED
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-text)" }}>
              {players.length}
            </span>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sec)" }}>
              UNPAID
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24" }}>
              {unpaidCount}
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All" },
              { id: "unpaid", label: "Unpaid" },
              { id: "paid", label: "Paid" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn btn-sm ${paymentFilter === f.id ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setPaymentFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!selectedForPayment.length || paymentUpdating}
              onClick={() => handleBulkPayment("paid")}
            >
              Mark paid ({selectedForPayment.length})
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!selectedForPayment.length || paymentUpdating}
              onClick={() => handleBulkPayment("unpaid")}
            >
              Mark unpaid
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-sec)", padding: 12 }}>Loading players…</p>
        ) : null}

        <div className="card">
          <div className="table-wrap">
            <table id="players-list-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={allSelectableSelected}
                      disabled={!selectablePlayers.length}
                      onChange={toggleSelectAll}
                      title="Select all players in list"
                      aria-label="Select all"
                    />
                  </th>
                  <th style={{ width: 44 }} />
                  <th>
                    <SortableColumnHeader
                      label="Player"
                      columnKey="name"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                  </th>
                  <th>Gender & Age</th>
                  <th>Phone</th>
                  <th>Partner</th>
                  <th>
                    <SortableColumnHeader
                      label="Division"
                      columnKey="division"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                  </th>
                  <th>DUPR</th>
                  <th>DUPR ID</th>
                  <th>
                    <SortableColumnHeader
                      label="Club"
                      columnKey="clubName"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                    />
                  </th>
                  <th>Roster</th>
                  <th>Paid</th>
                  <th>Payment email</th>
                  <th>Status</th>
                  <th style={{ width: 140 }} />
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={
                          p.registrationId ? selectedIds.has(p.registrationId) : false
                        }
                        disabled={!p.registrationId}
                        onChange={() =>
                          p.registrationId && toggleSelect(p.registrationId)
                        }
                        title={
                          p.resendDisabledReason ||
                          "Select for bulk payment or payment email"
                        }
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td>
                      <span className="player-avatar-row" style={{ background: p.avatar }}>
                        {p.initials}
                      </span>
                    </td>
                    <td>
                      <div className="player-name-line">
                        <strong>{p.name}</strong>
                      </div>
                      <div className="player-email-line">{p.email}</div>
                    </td>
                    <td>
                      <span className="gender-age-pill">
                        {p.gender}-{p.age}
                      </span>
                    </td>
                    <td>{p.phone}</td>
                    <td>{p.partner}</td>
                    <td>{p.division}</td>
                    <td>{p.dupr}</td>
                    <td>{p.duprId || "—"}</td>
                    <td>{p.clubName || "—"}</td>
                    <td>{p.rosterNumber || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className={`pill ${p.paidClass}`}
                        style={{
                          border: "none",
                          cursor: p.registrationId ? "pointer" : "default",
                        }}
                        disabled={!p.registrationId || paymentUpdating}
                        title={
                          p.paymentStatus === "paid"
                            ? "Click to mark unpaid"
                            : "Click to mark paid"
                        }
                        onClick={() =>
                          handleRowPayment(
                            p,
                            p.paymentStatus === "paid" ? "unpaid" : "paid"
                          )
                        }
                      >
                        {p.paid}
                      </button>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            p.paymentEmailSentCount >= MAX_PAYMENT_EMAILS
                              ? "var(--text-ter)"
                              : "var(--text-sec)",
                        }}
                      >
                        {p.paymentEmailSentCount}/{MAX_PAYMENT_EMAILS}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${p.statusClass}`}>{p.status}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={!p.registrationId || deletingId === p.registrationId}
                          onClick={() => setEditPlayer(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={!p.registrationId || deletingId === p.registrationId}
                          style={{ color: "var(--danger, #ef4444)" }}
                          title="Remove player from this division"
                          onClick={() => {
                            setDeleteError("");
                            setPlayerToDelete(p);
                          }}
                        >
                          {deletingId === p.registrationId ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !filteredPlayers.length ? (
                  <tr>
                    <td colSpan={15} style={{ padding: 24, color: "var(--text-sec)" }}>
                      No players yet. Add divisions, then add or bulk upload players.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddPlayerModal
        open={addPlayerOpen}
        onClose={() => setAddPlayerOpen(false)}
        tournamentId={tournamentId}
        divisions={divisions}
        tournamentClubName={tournamentClubName}
        onAdded={loadPlayers}
      />
      <EditPlayerModal
        open={Boolean(editPlayer)}
        onClose={() => setEditPlayer(null)}
        tournamentId={tournamentId}
        player={editPlayer}
        divisions={divisions}
        onSaved={loadPlayers}
      />
      <DeletePlayerModal
        open={Boolean(playerToDelete)}
        player={playerToDelete}
        deleting={Boolean(deletingId)}
        error={deleteError}
        onClose={() => {
          if (deletingId) return;
          setPlayerToDelete(null);
          setDeleteError("");
        }}
        onConfirm={handleDeletePlayer}
      />
    </div>
  );
}
