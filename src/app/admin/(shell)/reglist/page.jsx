"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

const initialPlayers = [
  {
    id: "p4",
    initials: "AP",
    avatar: "linear-gradient(135deg,#a78bfa 0%,#5b21b6 100%)",
    name: "Anika Patel",
    email: "anika.patel29@gmail.com",
    gender: "F",
    age: 29,
    date: "04/05/2026",
    phone: "(210) 555-0123",
    partner: "Marcus J.",
    partnerId: "p3",
    division: "MXD 16.0",
    dupr: "4.51",
    paid: "✓ Paid",
    paidClass: "pill-approved",
    status: "⏳ Pending",
    statusClass: "pill-pending",
  },
  {
    id: "p3",
    initials: "MJ",
    avatar: "linear-gradient(135deg,#5b8cff 0%,#1e40af 100%)",
    name: "Marcus Johnson",
    email: "marcus.j@outlook.com",
    gender: "M",
    age: 38,
    date: "04/04/2026",
    phone: "(469) 555-0107",
    partner: "Anika P.",
    partnerId: "p4",
    division: "MXD 16.0",
    dupr: "4.91",
    paid: "★ Comp",
    paidClass: "pill-comp",
    status: "✓ Confirmed",
    statusClass: "pill-approved",
  },
  {
    id: "p7",
    initials: "BW",
    avatar: "linear-gradient(135deg,#10b981 0%,#065f46 100%)",
    name: "Ben Williams",
    email: "ben.w.cedar@gmail.com",
    gender: "M",
    age: 33,
    date: "04/01/2026",
    phone: "(512) 555-0191",
    partner: "Elena S.",
    partnerId: null,
    division: "MXD 14.0",
    dupr: "4.61",
    paid: "↺ Refunded",
    paidClass: "pill-wait",
    status: "↺ Withdrawn",
    statusClass: "pill-wait",
  },
  {
    id: "p5",
    initials: "DR",
    avatar: "linear-gradient(135deg,#f59e0b 0%,#92400e 100%)",
    name: "Diego Rivera",
    email: "d.rivera.atx@yahoo.com",
    gender: "M",
    age: 42,
    date: "04/06/2026",
    phone: "(512) 555-0177",
    partner: "Linda T.",
    partnerId: null,
    division: "MXD 18.0",
    dupr: "4.71",
    paid: "◐ Partial",
    paidClass: "pill-pending",
    status: "✓ Confirmed",
    statusClass: "pill-approved",
  },
  {
    id: "p1",
    initials: "JM",
    avatar: "linear-gradient(135deg,#aaff00 0%,#5a8a00 100%)",
    name: "Jorge Martinez",
    email: "jorge.martinez@gmail.com",
    gender: "M",
    age: 34,
    date: "04/02/2026",
    phone: "(512) 555-0188",
    partner: "Sarah C.",
    partnerId: "p2",
    division: "MXD 14.0",
    dupr: "5.02",
    paid: "✓ Paid",
    paidClass: "pill-approved",
    status: "✓ Confirmed",
    statusClass: "pill-approved",
  },
  {
    id: "p2",
    initials: "SC",
    avatar: "linear-gradient(135deg,#f472b6 0%,#9d2466 100%)",
    name: "Sarah Chen",
    email: "sarah.chen.tx@gmail.com",
    gender: "F",
    age: 31,
    date: "04/02/2026",
    phone: "(713) 555-0142",
    partner: "Jorge M.",
    partnerId: "p1",
    division: "MXD 12.0",
    dupr: "4.78",
    paid: "✓ Paid",
    paidClass: "pill-approved",
    status: "✓ Confirmed",
    statusClass: "pill-approved",
  },
];

export default function Page() {
  const [players, setPlayers] = useState(initialPlayers);
  const [search, setSearch] = useState("");
  const [openFilter, setOpenFilter] = useState("");
  const [openViewSaver, setOpenViewSaver] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [savedView, setSavedView] = useState(false);
  const [activeView, setActiveView] = useState("default");
  const [selectedTournament, setSelectedTournament] = useState("Austin Open 2025");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [pendingUploadRows, setPendingUploadRows] = useState([]);
  const [selected, setSelected] = useState({
    division: [],
    dupr: [],
    payment: [],
  });

  useEffect(() => {
    const onDocClick = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".ms-filter")) setOpenFilter("");
      if (!target.closest(".view-saver")) setOpenViewSaver(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const options = {
    division: [
      { label: "MXD 12.0", count: 22 },
      { label: "MXD 14.0", count: 28 },
      { label: "MXD 16.0", count: 26 },
      { label: "MXD 18.0", count: 20 },
      { label: "MXD 20.0", count: 18 },
    ],
    dupr: [
      { label: "Under 3.5", count: 8 },
      { label: "3.5 – 4.0", count: 22 },
      { label: "4.0 – 4.5", count: 38 },
      { label: "4.5 – 5.0", count: 42 },
      { label: "5.0 +", count: 13 },
    ],
    payment: [
      { label: "✓ Paid", count: 115 },
      { label: "⏱ Unpaid", count: 5 },
      { label: "◐ Partial", count: 3 },
      { label: "★ Comp", count: 3 },
      { label: "↺ Refunded", count: 2 },
    ],
  };

  const isDirty =
    search.trim().length > 0 ||
    selected.division.length > 0 ||
    selected.dupr.length > 0 ||
    selected.payment.length > 0;

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.partner.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q)
      );
    });
  }, [search, players]);

  const toggleOption = (key, label) => {
    setSelected((prev) => {
      const has = prev[key].includes(label);
      return {
        ...prev,
        [key]: has
          ? prev[key].filter((v) => v !== label)
          : [...prev[key], label],
      };
    });
  };

  const clearFilter = (key) => {
    setSelected((prev) => ({ ...prev, [key]: [] }));
  };

  const jumpToPartner = (partnerId) => {
    if (!partnerId) return;
    const row = document.getElementById(`row-${partnerId}`);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const paymentClass = (paid) => {
    const t = String(paid || "").toLowerCase();
    if (t.includes("comp")) return "pill-comp";
    if (t.includes("partial")) return "pill-pending";
    if (t.includes("unpaid")) return "pill-live";
    if (t.includes("refund")) return "pill-wait";
    return "pill-approved";
  };

  const statusClass = (status) => {
    const t = String(status || "").toLowerCase();
    if (t.includes("pending")) return "pill-pending";
    if (t.includes("wait")) return "pill-wait";
    if (t.includes("withdraw")) return "pill-wait";
    return "pill-approved";
  };

  const handleTemplateDownload = () => {
    const templateRows = [
      [
        "name",
        "email",
        "gender",
        "age",
        "phone",
        "partner",
        "division",
        "dupr",
        "paid",
        "status",
      ],
      [
        "Alex Turner",
        "alex@example.com",
        "M",
        "34",
        "(512) 555-0100",
        "Sam Lee",
        "MXD 14.0",
        "4.20",
        "✓ Paid",
        "✓ Confirmed",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Players");
    XLSX.writeFile(wb, "players-upload-template.xlsx");
  };

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
        .map((r, idx) => {
          const name = String(r.name || r.Name || "").trim();
          if (!name) return null;
          const email = String(r.email || r.Email || "").trim();
          const gender = String(r.gender || r.Gender || "M").trim();
          const age = Number(r.age || r.Age || 30) || 30;
          const paid = String(r.paid || r.Paid || "✓ Paid").trim();
          const status = String(r.status || r.Status || "✓ Confirmed").trim();
          const initials = name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase();
          return {
            id: `u${Date.now()}-${idx}`,
            initials,
            avatar: "linear-gradient(135deg,#64748b 0%,#334155 100%)",
            name,
            email,
            gender: gender[0]?.toUpperCase() || "M",
            age,
            date: new Date().toLocaleDateString("en-US"),
            phone: String(r.phone || r.Phone || "").trim() || "-",
            partner: String(r.partner || r.Partner || "").trim() || "-",
            partnerId: null,
            division: String(r.division || r.Division || "MXD 14.0").trim(),
            dupr: String(r.dupr || r.DUPR || "0.00").trim(),
            paid,
            paidClass: paymentClass(paid),
            status,
            statusClass: statusClass(status),
          };
        })
        .filter(Boolean);
      if (!normalized.length) {
        setUploadError("No valid rows found. Please use the template format.");
        return;
      }
      setPendingUploadRows(normalized);
      setUploadMessage(
        `${normalized.length} rows ready for ${selectedTournament}. Click Submit Upload.`,
      );
    } catch {
      setUploadError("Upload failed. Please use the provided Excel template.");
    }
  };

  const handleSubmitUpload = () => {
    if (!pendingUploadRows.length) return;
    setPlayers((prev) => [...pendingUploadRows, ...prev]);
    setUploadMessage(
      `Uploaded ${pendingUploadRows.length} players to ${selectedTournament}.`,
    );
    setPendingUploadRows([]);
  };

  return (
    <div className="screen" id="screen-reglist">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 2 · Registrations</div>
          <div className="page-title">Players List</div>
          <div className="page-sub">All players & teams · 128 registered</div>
        </div>
        <div className="page-actions">
          <input
            className="form-input"
            placeholder="🔍  Search players..."
            style={{ width: "180px", padding: "8px 12px", fontSize: "13px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {["division", "dupr", "payment"].map((key) => (
            <div
              className={`ms-filter${openFilter === key ? " open" : ""}`}
              id={`msf-${key}`}
              key={key}
            >
              <button
                className={`ms-filter-trigger${selected[key].length ? " has-active" : ""}`}
                type="button"
                onClick={() => setOpenFilter(openFilter === key ? "" : key)}
              >
                {key === "dupr" ? "DUPR" : key[0].toUpperCase() + key.slice(1)}
                {selected[key].length > 0 ? (
                  <span className="ms-filter-count">{selected[key].length}</span>
                ) : null}
                <span className="ms-filter-chevron">▼</span>
              </button>
              <div className="ms-filter-panel">
                {options[key].map((opt) => (
                  <label className="ms-filter-option" key={opt.label}>
                    <input
                      type="checkbox"
                      checked={selected[key].includes(opt.label)}
                      onChange={() => toggleOption(key, opt.label)}
                    />
                    {opt.label}
                    <span className="ms-filter-option-count">{opt.count}</span>
                  </label>
                ))}
                <div className="ms-filter-footer">
                  <button type="button" onClick={() => clearFilter(key)}>
                    Clear
                  </button>
                  <button type="button" onClick={() => setOpenFilter("")}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className={`view-saver${openViewSaver ? " open" : ""}`} id="view-saver">
            <button
              className={`view-saver-trigger${isDirty ? " dirty" : ""}`}
              type="button"
              onClick={() => setOpenViewSaver((v) => !v)}
            >
              <span className="vs-current">
                {activeView === "default" ? "Default · A–Z" : "My saved view"}
              </span>
              <span style={{ fontSize: "9px", opacity: 0.6 }}>▼</span>
            </button>
            <div className="view-saver-panel">
              <div className="view-saver-section-label">Views</div>
              <button
                className={`view-saver-option${activeView === "default" ? " active" : ""}`}
                type="button"
                onClick={() => {
                  setActiveView("default");
                  setOpenViewSaver(false);
                }}
              >
                <span className="vs-icon">●</span> Default · A–Z by first name
              </button>
              {savedView ? (
                <button
                  className={`view-saver-option${activeView === "saved-1" ? " active" : ""}`}
                  type="button"
                  onClick={() => {
                    setActiveView("saved-1");
                    setOpenViewSaver(false);
                  }}
                >
                  <span className="vs-icon">⭐</span> <span>My saved view</span>
                </button>
              ) : null}
              <div className="view-saver-divider"></div>
              <button
                className="view-saver-option"
                type="button"
                onClick={() => {
                  setSavedView(true);
                  setActiveView("saved-1");
                  setOpenViewSaver(false);
                }}
              >
                <span className="vs-icon">+</span> Save current view…
              </button>
              <button
                className="view-saver-option"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelected({ division: [], dupr: [], payment: [] });
                  setActiveView("default");
                  setOpenViewSaver(false);
                }}
              >
                <span className="vs-icon">↺</span> Reset to default
              </button>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-md nav-coming-soon"
            type="button"
            title="Available on tournament day · May 8, 2026"
            style={{ opacity: 0.55, cursor: "not-allowed" }}
          >
            ✅ Check-In
          </button>
          <Link className="btn btn-primary btn-md" href="/admin/create">
            + Add Player
          </Link>
          <button
            className="btn btn-ghost btn-md"
            type="button"
            onClick={() => setShowBulkUpload((v) => !v)}
          >
            ⬆ Bulk Upload
          </button>
        </div>
      </div>

      <div className="content">
        {showBulkUpload ? (
          <div className="card bulk-upload-card">
            <div className="card-header">
              <span className="card-title">Bulk Upload Players</span>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={handleTemplateDownload}
              >
                ⬇ Download Excel Template
              </button>
            </div>
            <div className="bulk-upload-grid">
              <div className="bulk-upload-field">
                <label className="form-label">Select Tournament</label>
                <select
                  className="form-select"
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                >
                  <option>Austin Open 2025</option>
                  <option>Spring Smash Classic</option>
                  <option>JOMG Invitational</option>
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
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                disabled={!pendingUploadRows.length}
                onClick={handleSubmitUpload}
                style={{
                  opacity: pendingUploadRows.length ? 1 : 0.55,
                  cursor: pendingUploadRows.length ? "pointer" : "not-allowed",
                }}
              >
                Submit Upload
              </button>
              {pendingUploadRows.length ? (
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => {
                    setPendingUploadRows([]);
                    setUploadMessage("");
                    setUploadError("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
            {uploadMessage ? (
              <div className="bulk-upload-success">{uploadMessage}</div>
            ) : null}
            {uploadError ? (
              <div className="bulk-upload-error">{uploadError}</div>
            ) : null}
            <p className="form-hint">
              Required columns: name, email, gender, age, phone, partner, division, dupr,
              paid, status.
            </p>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            padding: "14px 20px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            marginBottom: "14px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-sec)",
                textTransform: "uppercase",
              }}
            >
              Registered
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--primary-text)",
              }}
            >
              128
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-sec)",
                textTransform: "uppercase",
              }}
            >
              Checked In
            </span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#00c84a" }}>
              120
            </span>
          </div>
          <div style={{ width: "1px", height: "24px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-sec)",
                textTransform: "uppercase",
              }}
            >
              Waitlisted
            </span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#ff5555" }}>7</span>
          </div>
          <div style={{ width: "1px", height: "24px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-sec)",
                textTransform: "uppercase",
              }}
            >
              Unpaid
            </span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24" }}>5</span>
          </div>
          <div style={{ width: "1px", height: "24px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-sec)",
                textTransform: "uppercase",
              }}
            >
              Revenue
            </span>
            <span
              style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary-text)" }}
            >
              $6.4k
            </span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link className="btn btn-ghost btn-sm" href="/admin/control">
              🎮 Live View →
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-sec)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginRight: "4px",
            }}
          >
            Status
          </span>
          <button
            className="stage-chip stage-chip-active"
            style={{
              background: "var(--primary)",
              color: "#1a1a1a",
              borderColor: "var(--primary)",
              fontWeight: 700,
            }}
            type="button"
          >
            All <span style={{ opacity: 0.7, fontWeight: 700 }}>{players.length}</span>
          </button>
          <button className="stage-chip" type="button">
            ✓ Confirmed <span style={{ opacity: 0.6, fontWeight: 600 }}>114</span>
          </button>
          <button className="stage-chip" type="button">
            ⏳ Pending <span style={{ opacity: 0.6, fontWeight: 600 }}>7</span>
          </button>
          <button className="stage-chip" type="button">
            ⚠ Waitlisted <span style={{ opacity: 0.6, fontWeight: 600 }}>7</span>
          </button>
          <button className="stage-chip" type="button">
            ↺ Withdrawn <span style={{ opacity: 0.6, fontWeight: 600 }}>2</span>
          </button>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-ter)" }}>
            Showing all {filteredPlayers.length} of {players.length} players
          </span>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table id="players-list-table">
              <thead>
                <tr>
                  <th style={{ width: "44px" }}></th>
                  <th>Player</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                    Gender & Age
                  </th>
                  <th style={{ whiteSpace: "nowrap" }}>Registered Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Phone</th>
                  <th>Partner / Team</th>
                  <th>Division</th>
                  <th>DUPR</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => (
                  <tr key={p.id} id={`row-${p.id}`}>
                    <td>
                      <span className="player-avatar-row" style={{ background: p.avatar }}>
                        {p.initials}
                      </span>
                    </td>
                    <td>
                      <div className="player-name-line">
                        <strong>{p.name}</strong>
                        <span className="presence-wrap">
                          <span
                            className="player-presence-dot in"
                            style={{
                              display: "inline-block",
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                            }}
                          ></span>
                          <div className="presence-tooltip">
                            <div className="presence-tt-header">Check-In Status</div>
                            <div className="presence-tt-status">
                              <span className="pt-dot-mini in"></span>Checked in
                            </div>
                          </div>
                        </span>
                      </div>
                      <div className="player-email-line">{p.email}</div>
                    </td>
                    <td>
                      <span className="gender-age-pill">
                        <span className="ga-gender">{p.gender}</span>
                        <span className="ga-sep">-</span>
                        <span className="ga-age">{p.age}</span>
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "12px", fontWeight: 600 }}>
                      {p.date}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-sec)", whiteSpace: "nowrap" }}>
                      {p.phone}
                    </td>
                    <td>
                      <a
                        className="partner-row-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          jumpToPartner(p.partnerId);
                        }}
                      >
                        {p.partner}
                      </a>
                    </td>
                    <td>{p.division}</td>
                    <td>
                      <div className="dupr-cell">
                        <span className="dupr-main">{p.dupr}</span>
                        <span className="dupr-verified-tick">✓</span>
                        <div className="dupr-tooltip">
                          <div className="dupr-tt-header">
                            <span className="dupr-badge">DUPR</span>
                          </div>
                          <div className="dupr-tt-row">
                            <span>Doubles</span>
                            <span>{p.dupr}</span>
                          </div>
                          <div className="dupr-tt-row">
                            <span>Singles</span>
                            <span>{(Number(p.dupr) - 0.25).toFixed(2)}</span>
                          </div>
                          <div className="dupr-tt-row">
                            <span>Mixed Doubles</span>
                            <span>{(Number(p.dupr) + 0.04).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${p.paidClass}`}>{p.paid}</span>
                    </td>
                    <td>
                      <span className={`pill ${p.statusClass}`}>{p.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" type="button">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
