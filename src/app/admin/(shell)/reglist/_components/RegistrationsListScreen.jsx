"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import TournamentPicker from "../../_components/TournamentPicker";
import {
  MAX_PAYMENT_EMAILS,
  bulkUploadPlayers,
  fetchRegisteredPlayers,
  resendPaymentEmails,
} from "@/lib/divisions";
import { fetchHostTournaments, tournamentAdminPath } from "@/lib/tournaments";

function paymentMeta(paymentStatus) {
  if (paymentStatus === "paid") return { label: "✓ Paid", cls: "pill-approved" };
  if (paymentStatus === "refunded") return { label: "↺ Refunded", cls: "pill-wait" };
  return { label: "⏱ Unpaid", cls: "pill-live" };
}

function mapApiPlayersToRows(apiList) {
  const rows = [];
  for (const p of apiList || []) {
    const event = p.events?.[0];
    const paid = paymentMeta(event?.paymentStatus);
    const paymentEmailSentCount = event?.paymentEmailSentCount ?? 0;
    const paymentStatus = event?.paymentStatus || "unpaid";
    const canResendEmail =
      paymentStatus === "unpaid" && paymentEmailSentCount < MAX_PAYMENT_EMAILS;
    const initials = String(p.name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();
    rows.push({
      id: `p-${p.playerId}-${event?.bracketId || 0}`,
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
      age: p.age || "—",
      date: new Date().toLocaleDateString("en-US"),
      phone: p.phoneNumber || "—",
      partner: "—",
      division: event?.bracketName || "—",
      dupr: "—",
      paid: paid.label,
      paidClass: paid.cls,
      status: "✓ Confirmed",
      statusClass: "pill-approved",
    });
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
  const [uploadError, setUploadError] = useState("");
  const [pendingUploadRows, setPendingUploadRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const loadPlayers = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const data = await fetchRegisteredPlayers(tournamentId);
      setPlayers(mapApiPlayersToRows(data));
      setSelectedIds(new Set());
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchHostTournaments().then(setTournaments).catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q)
    );
  }, [search, players]);

  const eligiblePlayers = useMemo(
    () => filteredPlayers.filter((p) => p.canResendEmail && p.registrationId),
    [filteredPlayers]
  );

  const selectedEligible = useMemo(
    () => eligiblePlayers.filter((p) => selectedIds.has(p.registrationId)),
    [eligiblePlayers, selectedIds]
  );

  const allEligibleSelected =
    eligiblePlayers.length > 0 &&
    eligiblePlayers.every((p) => selectedIds.has(p.registrationId));

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

  const toggleSelectAllEligible = () => {
    if (allEligibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(eligiblePlayers.map((p) => p.registrationId)));
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

  // const handleTemplateDownload = () => {
  //   const templateRows = [
  //     [
  //       "name",
  //       "email",
  //       "gender",
  //       "age",
  //       "phone",
  //       "partner",
  //       "division",
  //       "dupr",
  //       "pay_for_partner",
  //     ],
  //     [
  //       "Alex Turner",
  //       "alex@example.com",
  //       "M",
  //       "34",
  //       "(512) 555-0100",
  //       "Sam Lee",
  //       "MXD 14.0",
  //       "4.20",
  //       "yes",
  //     ],
  //   ];
  //   const ws = XLSX.utils.aoa_to_sheet(templateRows);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Players");
  //   XLSX.writeFile(wb, "players-upload-template.xlsx");
  // };
  const handleTemplateDownload = () => {
  const templateRows = [
    ["name", "team_name", "gender", "role (starter or bench)", "email", "phone", "instagram", "facebook", "DuprID", "division","paymentMethod","paymentStatus","rosterNumber"],
    ["Alex Turner", "Team Thunderbolts", "M", "starter", "alex@example.com", "(512) 555-0100", "@alexturner", "facebook.com/alexturner", "4.20", "MXD 14.0","Stripe","unpaid","M1"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Players");
  XLSX.writeFile(wb, "players-upload-template.xlsx");
};

  // const handleFileUpload = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploadError("");
  //   setUploadMessage("");
  //   setPendingUploadRows([]);
  //   try {
  //     const buffer = await file.arrayBuffer();
  //     const wb = XLSX.read(buffer, { type: "array" });
  //     const sheet = wb.Sheets[wb.SheetNames[0]];
  //     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  //     const normalized = rows
  //       .map((r) => {
  //         const name = String(r.name || r.Name || "").trim();
  //         if (!name) return null;
  //         const partner = String(r.partner || r.Partner || "").trim();
  //         const payRaw = String(r.pay_for_partner || r.payForPartner || "").toLowerCase();
  //         return {
  //           name,
  //           email: String(r.email || r.Email || "").trim(),
  //           gender: String(r.gender || r.Gender || "M").trim(),
  //           age: Number(r.age || r.Age || 30) || 30,
  //           phone: String(r.phone || r.Phone || "").trim(),
  //           partner: partner || "-",
  //           division: String(r.division || r.Division || "").trim(),
  //           dupr: String(r.dupr || r.DUPR || "").trim(),
  //           pay_for_partner: payRaw === "no" ? "no" : partner && partner !== "-" ? "yes" : "no",
  //         };
  //       })
  //       .filter(Boolean);
  //     if (!normalized.length) {
  //       setUploadError("No valid rows found. Use the template format.");
  //       return;
  //     }
  //     setPendingUploadRows(normalized);
  //     setUploadMessage(`${normalized.length} rows ready. Click Submit Upload.`);
  //   } catch {
  //     setUploadError("Upload failed. Please use the provided Excel template.");
  //   }
  // };
const handleFileUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploadError("");
  setUploadMessage("");
  setPendingUploadRows([]);
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const normalized = rows
      .map((r) => {
        const name = String(r.name || r.Name || "").trim();
        if (!name) return null;
        return {
          name,
          team_name: String(r.team_name || r.TeamName || "").trim(),
          gender: String(r.gender || r.Gender || "M").trim(),
          role: String(r["role (starter or bench)"] || r.role || r.Role || "starter").trim(),
          email: String(r.email || r.Email || "").trim(),
          phone: String(r.phone || r.Phone || "").trim(),
          instagram: String(r.instagram || r.Instagram || "").trim(),
          facebook: String(r.facebook || r.Facebook || "").trim(),
          duprId: String(r.DuprID || r.duprId || r.dupr || "").trim(),
          division: String(r.division || r.Division || "").trim(),
          paymentMethod: String(r.paymentMethod || r.payment_method || r.PaymentMethod || "").trim(),  
          paymentStatus: String(r.paymentStatus || r.payment_status || r.PaymentStatus || "unpaid").trim(),
          rosterNumber: String(r.rosterNumber || r.roster_number || r.RosterNumber || "").trim(), 
        };
      })
      .filter(Boolean);
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
      const errCount = result?.errors?.length || 0;
      const emailsQueued = result?.emailsQueued ?? 0;
      setUploadMessage(
        `Registered ${created} player(s).${emailsQueued ? ` Payment emails queued (${emailsQueued}).` : ""}${errCount ? ` ${errCount} issue(s) — see details below.` : ""}`
      );
      if (result?.errors?.length) {
        setUploadError(result.errors.map((e) => `Row ${e.row}: ${e.reason}`).join("\n"));
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
              <div className="bulk-upload-success">{uploadMessage}</div>
            ) : null}
            {uploadError ? (
              <div className="bulk-upload-error" style={{ whiteSpace: "pre-wrap" }}>
                {uploadError}
              </div>
            ) : null}
            <p className="form-hint">
              Division names must match Manage Divisions exactly. Set payment mobile in
              Tournament Settings before upload.
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
                      checked={allEligibleSelected}
                      disabled={!eligiblePlayers.length}
                      onChange={toggleSelectAllEligible}
                      title="Select all unpaid players eligible for payment email"
                      aria-label="Select all eligible"
                    />
                  </th>
                  <th style={{ width: 44 }} />
                  <th>Player</th>
                  <th>Gender & Age</th>
                  <th>Phone</th>
                  <th>Division</th>
                  <th>Paid</th>
                  <th>Payment email</th>
                  <th>Status</th>
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
                        disabled={!p.canResendEmail || !p.registrationId}
                        onChange={() =>
                          p.registrationId && toggleSelect(p.registrationId)
                        }
                        title={p.resendDisabledReason || "Select to resend payment email"}
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
                    <td>{p.division}</td>
                    <td>
                      <span className={`pill ${p.paidClass}`}>{p.paid}</span>
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
                  </tr>
                ))}
                {!loading && !filteredPlayers.length ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 24, color: "var(--text-sec)" }}>
                      No players yet. Add divisions, then bulk upload.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
