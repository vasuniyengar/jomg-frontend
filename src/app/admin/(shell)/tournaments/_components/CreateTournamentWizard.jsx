"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../tournaments.module.css";
import DescriptionRteEditor from "../../_components/DescriptionRteEditor";
import {
  defaultTournamentInfo,
  mergeTournamentSettings,
  stripHtmlForValidation,
} from "@/lib/tournamentSettings";
import {
  buildOrganizerInfoPayload,
  buildTournamentUpdatePayload,
  buildWizardApiPayload,
  buildWizardFormFromTournament,
  createTournament,
  fetchClubs,
  fetchTournamentById,
  mergeTournamentSettingsExtras,
  slugifyTournamentName,
  updateTournament,
} from "@/lib/tournaments";

const TIMEZONES = [
  { value: "", label: "Auto-detect (browser)" },
  { value: "America/New_York", label: "Eastern Time — America/New_York" },
  { value: "America/Chicago", label: "Central Time — America/Chicago" },
  { value: "America/Denver", label: "Mountain Time — America/Denver" },
  { value: "America/Phoenix", label: "Arizona Time — America/Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific Time — America/Los_Angeles" },
  { value: "America/Anchorage", label: "Alaska Time — America/Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii Time — Pacific/Honolulu" },
];

const INITIAL_FORM = {
  name: "",
  clubId: "",
  slug: "",
  description: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: "",
  venue: "",
  location: "",
  timezone: "",
  startDate: "",
  endDate: "",
  registrationOpenDate: "",
  registrationCloseDate: "",
  refundDeadline: "",
  refundFee: "",
  duprRecorded: true,
  duprEnforced: false,
  requireSkillRating: false,
  refundFullWindow: defaultTournamentInfo().refundPolicy.fullWindow,
  refundReplacement: defaultTournamentInfo().refundPolicy.replacement,
  refundQuestions: defaultTournamentInfo().refundPolicy.questions,
};

function buildWizardOrganizerExtras(form, existingOrganizerInfo) {
  const { settings } = mergeTournamentSettings(existingOrganizerInfo);
  return {
    ...settings,
    tournamentInfo: {
      ...settings.tournamentInfo,
      refundPolicy: {
        fullWindow: form.refundFullWindow,
        replacement: form.refundReplacement,
        questions: form.refundQuestions,
      },
    },
  };
}

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

function resolveWizardTimezone(value) {
  if (value) return value;
  return getBrowserTimezone();
}

function toIsoDate(value) {
  if (!value) return undefined;
  return value;
}

export default function CreateTournamentWizard({
  open,
  onClose,
  onCreated,
  editTournamentId = null,
}) {
  const router = useRouter();
  const isEdit = Boolean(editTournamentId);
  const [step, setStep] = useState(1);
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editStatus, setEditStatus] = useState("draft");
  const [loadingTournament, setLoadingTournament] = useState(false);
  const [stepError, setStepError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [clubsLoadError, setClubsLoadError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setForm({
        ...INITIAL_FORM,
        timezone: getBrowserTimezone(),
      });
      setStep(1);
      setEditStatus("draft");
    }
    let mounted = true;
    setClubsLoadError("");
    fetchClubs()
      .then((data) => {
        if (!mounted) return;
        setClubs(data);
        if (data?.length) {
          const club = data[0];
          setForm((prev) => {
            if (prev.clubId) return prev;
            return {
              ...prev,
              clubId: String(club.id),
              venue: club.name || prev.venue,
              location: club.location || prev.location,
              organizerName: club.name || prev.organizerName,
              organizerPhone: club.phoneNumber || prev.organizerPhone,
            };
          });
        }
      })
      .catch((err) => {
        if (mounted) {
          setClubs([]);
          setClubsLoadError(
            err.message || "Could not load clubs. Sign in as organizer@jomg.com and restart the API."
          );
        }
      });
    return () => {
      mounted = false;
    };
  }, [open, isEdit]);

  useEffect(() => {
    if (!open || !editTournamentId) return;
    let mounted = true;
    setLoadingTournament(true);
    setSubmitError("");
    fetchTournamentById(editTournamentId)
      .then((t) => {
        if (!mounted || !t) return;
        setEditStatus(t.status || "draft");
        const base = buildWizardFormFromTournament(t);
        const { settings } = mergeTournamentSettings(t.organizerInfo);
        setForm({
          ...base,
          refundFullWindow: settings.tournamentInfo.refundPolicy.fullWindow,
          refundReplacement: settings.tournamentInfo.refundPolicy.replacement,
          refundQuestions: settings.tournamentInfo.refundPolicy.questions,
        });
        setStep(1);
      })
      .catch((err) => {
        if (mounted) setSubmitError(err.message || "Failed to load tournament");
      })
      .finally(() => {
        if (mounted) setLoadingTournament(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, editTournamentId]);

  const selectedClub = useMemo(
    () => clubs.find((c) => String(c.id) === String(form.clubId)),
    [clubs, form.clubId]
  );

  const slugPlaceholder = useMemo(
    () => slugifyTournamentName(form.name) || "auto-generated",
    [form.name]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onClubChange = (clubId) => {
    const club = clubs.find((c) => String(c.id) === String(clubId));
    setForm((prev) => ({
      ...prev,
      clubId,
      venue: club?.name || prev.venue,
      location: club?.location || prev.location,
      organizerName: club?.name || prev.organizerName,
      organizerPhone: club?.phoneNumber || prev.organizerPhone,
    }));
  };

  const validateDates = () => {
    const { startDate, endDate, registrationOpenDate, registrationCloseDate, refundDeadline } =
      form;
    if (!startDate || !endDate || !registrationOpenDate || !registrationCloseDate) {
      setDateError("");
      return true;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const regOpen = new Date(registrationOpenDate);
    const regClose = new Date(registrationCloseDate);

    if (end < start) {
      setDateError("Event end must be on or after event start.");
      return false;
    }
    if (regOpen >= start) {
      setDateError("Registration open must be before event start.");
      return false;
    }
    if (regClose < regOpen) {
      setDateError("Registration close must be on or after registration open.");
      return false;
    }
    if (regClose > end) {
      setDateError("Registration close must be on or before event end.");
      return false;
    }
    if (refundDeadline) {
      const refund = new Date(refundDeadline);
      if (refund >= start) {
        setDateError("Refund deadline must be before event start.");
        return false;
      }
    }

    setDateError("");
    return true;
  };

  const validateStep = (currentStep) => {
    setStepError("");
    if (currentStep === 1) {
      if (
        !form.name.trim() ||
        !form.clubId ||
        !stripHtmlForValidation(form.description) ||
        !form.organizerName.trim() ||
        !form.organizerEmail.trim()
      ) {
        setStepError("Please complete all required fields marked with *");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (
        !form.venue.trim() ||
        !form.location.trim() ||
        !form.startDate ||
        !form.endDate ||
        !form.registrationOpenDate ||
        !form.registrationCloseDate
      ) {
        setStepError("Please complete all required fields marked with *");
        return false;
      }
      return validateDates();
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = buildWizardApiPayload(
        { ...form, timezone: resolveWizardTimezone(form.timezone) },
        {
        status: isEdit ? editStatus : "draft",
      }
      );

      if (isEdit) {
        const existing = await fetchTournamentById(editTournamentId);
        const { extras } = mergeTournamentSettingsExtras(existing?.organizerInfo);
        const updatePayload = buildTournamentUpdatePayload(
          {
            ...existing,
            ...payload,
            clubId: payload.clubId,
          },
          {
            duprRecorded: payload.duprRecorded,
            duprEnforced: payload.duprEnforced,
            requireSkillRating: payload.requireSkillRating,
            organizerInfo: buildOrganizerInfoPayload(
              payload.organizerInfo,
              buildWizardOrganizerExtras(form, existing?.organizerInfo)
            ),
          }
        );
        const updated = await updateTournament(editTournamentId, updatePayload);
        await onCreated?.(updated);
        onClose();
        return;
      }

      const createPayload = {
        ...payload,
        organizerInfo: buildOrganizerInfoPayload(
          payload.organizerInfo,
          buildWizardOrganizerExtras(form, null)
        ),
      };
      const created = await createTournament(createPayload);
      await onCreated?.(created);
      onClose();
      if (created?.id) {
        router.push(`/admin/settings?tournamentId=${created.id}`);
      }
    } catch (err) {
      setSubmitError(
        err.message || `Failed to ${isEdit ? "update" : "create"} tournament`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStepError("");
    setStep((s) => Math.max(1, s - 1));
  };

  if (!open) return null;

  const stepLabels = ["Basics", "Facility & Dates", "DUPR", "Finish"];

  return (
    <div className={styles.wizardOverlay} role="dialog" aria-modal="true">
      <div className={styles.wizardPanel}>
        <div className={styles.wizardHeader}>
          <div>
            <div className={styles.wizardTitle}>
              {isEdit ? "Edit Tournament" : "Create New Tournament"}
            </div>
            <div className={styles.wizardSub}>
              {isEdit
                ? "Update tournament details"
                : "Fill in the basics — you can add divisions and settings after"}
            </div>
          </div>
          <button type="button" className={styles.wizardClose} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.wizardSteps}>
          {stepLabels.map((label, index) => {
            const n = index + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div
                key={label}
                className={`${styles.wizardStep} ${isActive ? styles.wizardStepActive : ""} ${isDone ? styles.wizardStepDone : ""}`}
              >
                <div className={styles.wizardStepDot}>{isDone ? "✓" : n}</div>
                <div className={styles.wizardStepLabel}>{label}</div>
              </div>
            );
          })}
        </div>

        {loadingTournament ? (
          <div className={styles.wizardBody} style={{ color: "var(--text-sec)" }}>
            Loading tournament…
          </div>
        ) : null}

        {!loadingTournament && step === 1 && (
          <div className={styles.wizardBody}>
            <div className="form-group">
              <label className="form-label">
                Tournament Name <span style={{ color: "#ff5555" }}>*</span>
              </label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Austin Pickleball Open 2025"
              />
            </div>
            {clubsLoadError && (
              <div className="form-group">
                <p className="form-hint" style={{ color: "#ff5555" }}>
                  {clubsLoadError}
                </p>
              </div>
            )}
            {!clubs.length && !clubsLoadError && (
              <div className="form-group">
                <p className="form-hint">
                  No clubs found. Run <code>npm run prisma:seed</code> in the backend, then sign in as{" "}
                  <strong>organizer@jomg.com</strong>.
                </p>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Tournament URL</label>
              <div className={styles.urlInputWrap}>
                <span className={styles.urlPrefix}>drivepb.app/tournaments/</span>
                <input
                  className="form-input"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder={slugPlaceholder}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Description <span style={{ color: "#ff5555" }}>*</span>
              </label>
              <DescriptionRteEditor
                value={form.description}
                onChange={(html) => updateField("description", html)}
                minHeight={100}
              />
            </div>
            <div className={styles.orgCard}>
              <div className={styles.orgCardTitle}>Organizer Details</div>
              <p className={styles.orgCardHint}>
                {selectedClub
                  ? `Organizer details from ${selectedClub.name} (tournament host club).`
                  : "Enter organizer contact for this tournament."}
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Name <span style={{ color: "#ff5555" }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    value={form.organizerName}
                    onChange={(e) => updateField("organizerName", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Email <span style={{ color: "#ff5555" }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.organizerEmail}
                    onChange={(e) => updateField("organizerEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone (optional)</label>
                <input
                  className="form-input"
                  type="tel"
                  value={form.organizerPhone}
                  onChange={(e) => updateField("organizerPhone", e.target.value)}
                />
              </div>
            </div>
            {stepError && <div className={styles.stepError}>⚠ {stepError}</div>}
          </div>
        )}

        {!loadingTournament && step === 2 && (
          <div className={styles.wizardBody}>
            <div className="form-group">
              <label className="form-label">
                Facility Name <span style={{ color: "#ff5555" }}>*</span>
              </label>
              <input
                className="form-input"
                value={form.venue}
                onChange={(e) => updateField("venue", e.target.value)}
                placeholder="e.g. Austin Sports Complex"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Location / Address <span style={{ color: "#ff5555" }}>*</span>
              </label>
              <input
                className="form-input"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Street, City, State ZIP"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="form-select"
                value={form.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value || "auto"} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Event Start <span style={{ color: "#ff5555" }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Event End <span style={{ color: "#ff5555" }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className={styles.sectionLabel}>Registration Window</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Open <span style={{ color: "#ff5555" }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={form.registrationOpenDate}
                  onChange={(e) => updateField("registrationOpenDate", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Close <span style={{ color: "#ff5555" }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={form.registrationCloseDate}
                  onChange={(e) => updateField("registrationCloseDate", e.target.value)}
                />
              </div>
            </div>
            <div className={styles.sectionLabel}>Refund Policy</div>
            <div className="form-group">
              <label className="form-label">Full Refund Window</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={form.refundFullWindow}
                onChange={(e) => updateField("refundFullWindow", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Replacement Players</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={form.refundReplacement}
                onChange={(e) => updateField("refundReplacement", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Questions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={form.refundQuestions}
                onChange={(e) => updateField("refundQuestions", e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Refund Deadline</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.refundDeadline}
                  onChange={(e) => updateField("refundDeadline", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Refund Fee ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.refundFee}
                  onChange={(e) => updateField("refundFee", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            {dateError && <div className={styles.stepError}>⚠ {dateError}</div>}
            {stepError && <div className={styles.stepError}>⚠ {stepError}</div>}
          </div>
        )}

        {!loadingTournament && step === 3 && (
          <div className={styles.wizardBody}>
            <div className={styles.duprBanner}>
              <strong>DUPR</strong> — Rating &amp; verification defaults for this tournament.
              Per-division settings can be configured after creation.
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <strong>DUPR Recorded</strong>
                <small>Matches count toward player ratings</small>
              </div>
              <label className="mini-toggle">
                <input
                  type="checkbox"
                  checked={form.duprRecorded}
                  onChange={(e) => updateField("duprRecorded", e.target.checked)}
                />
                <span className="mini-slider" />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <strong>DUPR Enforced</strong>
                <small>Only verified DUPR profiles can register</small>
              </div>
              <label className="mini-toggle">
                <input
                  type="checkbox"
                  checked={form.duprEnforced}
                  onChange={(e) => updateField("duprEnforced", e.target.checked)}
                />
                <span className="mini-slider" />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <strong>Require Skill Rating</strong>
                <small>Self-reported rating required if DUPR unavailable</small>
              </div>
              <label className="mini-toggle">
                <input
                  type="checkbox"
                  checked={form.requireSkillRating}
                  onChange={(e) => updateField("requireSkillRating", e.target.checked)}
                />
                <span className="mini-slider" />
              </label>
            </div>
          </div>
        )}

        {!loadingTournament && step === 4 && (
          <div className={styles.wizardBody}>
            <div className={styles.finishCard}>
              <div className={styles.finishEmoji}>🎉</div>
              <div className={styles.finishTitle}>
                You&apos;re all set to finish in Tournament Settings
              </div>
              <p className={styles.finishText}>
                Your tournament will be created as a draft. Complete publishing, courts, and
                visibility in Tournament Settings next.
              </p>
            </div>
            {submitError && <div className={styles.stepError}>⚠ {submitError}</div>}
          </div>
        )}

        <div className={styles.wizardFooter}>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            onClick={handleBack}
            style={{ visibility: step > 1 ? "visible" : "hidden" }}
          >
            ← Back
          </button>
          <span style={{ fontSize: 12, color: "var(--text-ter)" }}>Step {step} of 4</span>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : step === 4
                ? isEdit
                  ? "Save Changes"
                  : "✨ Create & Open Settings →"
                : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
