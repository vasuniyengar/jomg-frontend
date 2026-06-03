"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DescriptionRteEditor from "../../_components/DescriptionRteEditor";
import TournamentPicker from "../../_components/TournamentPicker";
import styles from "../tournamentInfo.module.css";
import {
  generateDuprRequirementsText,
  mergeTournamentSettings,
  stripHtmlForValidation,
} from "@/lib/tournamentSettings";
import {
  buildOrganizerInfoPayload,
  buildTournamentUpdatePayload,
  fetchTournamentById,
  slugifyTournamentName,
  tournamentAdminPath,
  updateTournament,
} from "@/lib/tournaments";

function toDateInput(value) {
  if (!value) return "";
  const s = typeof value === "string" ? value : new Date(value).toISOString();
  return s.slice(0, 10);
}

export default function TournamentInfoScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationOpenDate, setRegistrationOpenDate] = useState("");
  const [registrationCloseDate, setRegistrationCloseDate] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [organizerOverride, setOrganizerOverride] = useState(false);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");
  const [refundFull, setRefundFull] = useState("");
  const [refundReplacement, setRefundReplacement] = useState("");
  const [refundQuestions, setRefundQuestions] = useState("");
  const [spectatorFee, setSpectatorFee] = useState(0);
  const [spectatorCapacity, setSpectatorCapacity] = useState("");
  const [duprRequirementsText, setDuprRequirementsText] = useState("");
  const [duprManual, setDuprManual] = useState(false);

  const applyTournament = useCallback((data) => {
    setTournament(data);
    const { organizer, settings } = mergeTournamentSettings(data.organizerInfo);
    const info = settings.tournamentInfo;

    setName(data.name || "");
    setSlug(data.slug || "");
    setDescription(data.description || "");
    setVenue(data.venue || "");
    setLocation(data.location || "");
    setStartDate(toDateInput(data.startDate));
    setEndDate(toDateInput(data.endDate));
    setRegistrationOpenDate(toDateInput(data.registrationOpenDate));
    setRegistrationCloseDate(toDateInput(data.registrationCloseDate));
    setBannerUrl(data.tournamentTumbnail || data.banner || "");
    setOrganizerOverride(info.organizerOverride);
    setOrganizerName(organizer.name);
    setOrganizerEmail(organizer.email);
    setOrganizerPhone(organizer.phone);
    setRefundFull(info.refundPolicy.fullWindow);
    setRefundReplacement(info.refundPolicy.replacement);
    setRefundQuestions(info.refundPolicy.questions);
    setSpectatorFee(Number(info.spectators.ticketFee || 0));
    setSpectatorCapacity(info.spectators.maxCapacity || "");
    setDuprManual(info.duprRequirementsManual);
    setDuprRequirementsText(
      info.duprRequirementsText ||
        generateDuprRequirementsText(
          data.duprRecorded,
          data.duprEnforced,
          data.requireSkillRating
        )
    );
  }, []);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTournamentById(tournamentId);
        if (!cancelled) applyTournament(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load tournament");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tournamentId, applyTournament]);

  useEffect(() => {
    if (!tournament || duprManual) return;
    setDuprRequirementsText(
      generateDuprRequirementsText(
        tournament.duprRecorded,
        tournament.duprEnforced,
        tournament.requireSkillRating
      )
    );
  }, [tournament, duprManual]);

  const handleSave = async () => {
    if (!tournament) return;
    if (!name.trim() || !stripHtmlForValidation(description)) {
      setError("Tournament name and description are required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { settings } = mergeTournamentSettings(tournament.organizerInfo);
      const nextSettings = {
        ...settings,
        tournamentInfo: {
          ...settings.tournamentInfo,
          organizerOverride,
          refundPolicy: {
            fullWindow: refundFull,
            replacement: refundReplacement,
            questions: refundQuestions,
          },
          spectators: {
            ticketFee: Number(spectatorFee) || 0,
            maxCapacity: spectatorCapacity,
          },
          duprRequirementsText,
          duprRequirementsManual: duprManual,
        },
      };

      const payload = buildTournamentUpdatePayload(
        {
          ...tournament,
          name: name.trim(),
          slug: slug.trim() || slugifyTournamentName(name),
          description,
          venue,
          location,
          startDate,
          endDate,
          registrationOpenDate,
          registrationCloseDate,
          tournamentTumbnail: bannerUrl || null,
        },
        {
          organizerInfo: buildOrganizerInfoPayload(
            {
              name: organizerName.trim(),
              email: organizerEmail.trim(),
              phone: organizerPhone.trim(),
            },
            nextSettings
          ),
        }
      );

      const updated = await updateTournament(tournament.id, payload);
      applyTournament(updated);
      setMessage("Tournament info saved.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!tournamentId) {
    return <TournamentPicker label="Tournament Info" />;
  }

  if (loading) {
    return <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading…</div>;
  }

  return (
    <div className="screen active" id="screen-create">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 1 · Setup</div>
          <div className="page-title">Tournament Info</div>
          <div className="page-sub">Name, dates, venue, registration &amp; logistics</div>
        </div>
        <div className="page-actions">
          <Link
            href={tournamentAdminPath("/admin/dashboard", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            ← Dashboard
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="content">
        {error ? <div className="alert alert-err">{error}</div> : null}
        {message ? <div className="alert alert-info">{message}</div> : null}

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Basic Info</span>
            </div>
            <div className="form-group">
              <label className="form-label">Tournament Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Event Start</label>
                <input
                  className="form-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event End</label>
                <input
                  className="form-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Facility / Location</label>
              <input
                className="form-input"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Facility name"
              />
              <input
                className="form-input"
                style={{ marginTop: 8 }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street, City, State ZIP"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tournament URL</label>
              <div className={styles.urlWrap}>
                <span className={styles.urlPrefix}>drivepb.app/t/</span>
                <input
                  className="form-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={slugifyTournamentName(name) || "slug"}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <DescriptionRteEditor value={description} onChange={setDescription} />
            </div>

            <div className={styles.orgCard}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong>Organizer Details</strong>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setOrganizerOverride((v) => !v)}
                >
                  {organizerOverride ? "✨ Custom" : "From club profile"}
                </button>
              </div>
              <div className="form-row" style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    value={organizerName}
                    disabled={!organizerOverride}
                    onChange={(e) => setOrganizerName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={organizerEmail}
                    disabled={!organizerOverride}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone (optional)</label>
                <input
                  className="form-input"
                  type="tel"
                  value={organizerPhone}
                  disabled={!organizerOverride}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Registration Window</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Open</label>
                  <input
                    className="form-input"
                    type="date"
                    value={registrationOpenDate}
                    onChange={(e) => setRegistrationOpenDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Close</label>
                  <input
                    className="form-input"
                    type="date"
                    value={registrationCloseDate}
                    onChange={(e) => setRegistrationCloseDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Refund Policy</span>
              </div>
              <div className="form-group">
                <label className="form-label">Full Refund Window</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={refundFull}
                  onChange={(e) => setRefundFull(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Replacement Players</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={refundReplacement}
                  onChange={(e) => setRefundReplacement(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Questions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={refundQuestions}
                  onChange={(e) => setRefundQuestions(e.target.value)}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Spectators</span>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Ticket Fee ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={spectatorFee}
                    onChange={(e) => setSpectatorFee(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Capacity</label>
                  <input
                    className="form-input"
                    placeholder="Unlimited"
                    value={spectatorCapacity}
                    onChange={(e) => setSpectatorCapacity(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Tournament Banner</span>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Banner image URL</label>
                <input
                  className="form-input"
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://…"
                />
                {bannerUrl ? (
                  <div
                    className={styles.bannerPreview}
                    style={{ backgroundImage: `url(${bannerUrl})` }}
                  />
                ) : null}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">DUPR Level Requirements</span>
              </div>
              <textarea
                className="form-textarea"
                rows={4}
                value={duprRequirementsText}
                onChange={(e) => {
                  setDuprManual(true);
                  setDuprRequirementsText(e.target.value);
                }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setDuprManual(false);
                  if (tournament) {
                    setDuprRequirementsText(
                      generateDuprRequirementsText(
                        tournament.duprRecorded,
                        tournament.duprEnforced,
                        tournament.requireSkillRating
                      )
                    );
                  }
                }}
              >
                Reset from DUPR settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
