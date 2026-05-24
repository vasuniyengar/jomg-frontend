"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { mergeTournamentSettings } from "@/lib/tournamentSettings";
import styles from "../settings.module.css";
import {
  buildTournamentUpdatePayload,
  fetchTournamentById,
  tournamentAdminPath,
  updateTournament,
} from "@/lib/tournaments";
import MasterPushBanner from "./sections/MasterPushBanner";
import CourtsInfoCard from "./sections/CourtsInfoCard";
import PricingPrizesCard from "./sections/PricingPrizesCard";
import PlayRulesCard from "./sections/PlayRulesCard";
import DuprIntegrationCard from "./sections/DuprIntegrationCard";
import NotificationsCard from "./sections/NotificationsCard";
import VisibilityCard, { validateVisibilityPassword } from "./sections/VisibilityCard";
import ConfirmSettingsCard from "./sections/ConfirmSettingsCard";

export default function TournamentSettingsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [entryFee, setEntryFee] = useState(0);
  const [duprRecorded, setDuprRecorded] = useState(true);
  const [duprEnforced, setDuprEnforced] = useState(false);
  const [requireSkillRating, setRequireSkillRating] = useState(false);
  const [settings, setSettings] = useState(() => mergeTournamentSettings(null).settings);
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const patchSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyTournament = useCallback((data) => {
    setTournament(data);
    setEntryFee(Number(data.entryFee || 0));
    setDuprRecorded(data.duprRecorded ?? true);
    setDuprEnforced(data.duprEnforced ?? false);
    setRequireSkillRating(data.requireSkillRating ?? false);
    const merged = mergeTournamentSettings(data.organizerInfo);
    setSettings(merged.settings);
    setPasswordConfirm(merged.settings.visibility.registrationPassword || "");
  }, []);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      setError("No tournament selected. Create a tournament or open one from My Tournaments.");
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTournamentById(tournamentId);
        if (cancelled) return;

        const user = getStoredUser();
        if (user?.id && data.hostId && Number(user.id) !== Number(data.hostId)) {
          setError("You do not have access to edit this tournament.");
          setTournament(null);
          return;
        }

        applyTournament(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load tournament");
          setTournament(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tournamentId, applyTournament]);

  const validateBeforeSave = (candidate = settings) => {
    const pwError = validateVisibilityPassword(candidate.visibility);
    if (pwError) return pwError;
    if (candidate.visibility.passwordProtected) {
      const pw = candidate.visibility.registrationPassword || "";
      if (passwordConfirm && pw !== passwordConfirm) {
        return "Registration passwords do not match";
      }
    }
    return null;
  };

  const persistSettings = async (nextSettings) => {
    const validationError = validateBeforeSave(nextSettings);
    if (validationError) {
      setError(validationError);
      return null;
    }

    const payload = buildTournamentUpdatePayload(tournament, {
      entryFee,
      duprRecorded,
      duprEnforced,
      requireSkillRating,
      settings: nextSettings,
    });
    const updated = await updateTournament(tournament.id, payload);
    applyTournament(updated);
    return updated;
  };

  const handleSave = async () => {
    if (!tournament) return;
    setSaving(true);
    setSaveMessage("");
    setError("");
    try {
      const result = await persistSettings(settings);
      if (!result) return;
      setSaveMessage("Settings saved.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const confirmSettings = async () => {
    if (!tournament) return;
    const prevSettings = settings;
    const nextSettings = {
      ...settings,
      settingsConfirmed: true,
      settingsConfirmedAt: new Date().toISOString(),
    };
    setSettings(nextSettings);
    setSaving(true);
    setError("");
    try {
      const result = await persistSettings(nextSettings);
      if (!result) {
        setSettings(prevSettings);
        return;
      }
      setSaveMessage("Settings confirmed.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to confirm settings");
    } finally {
      setSaving(false);
    }
  };

  const unconfirmSettings = () => {
    patchSettings({ settingsConfirmed: false, settingsConfirmedAt: null });
  };

  if (loading) {
    return <div className={styles.loading}>Loading tournament settings…</div>;
  }

  if (!tournament && error) {
    return (
      <div className="screen active">
        <div className="page-header">
          <div className="page-title-group">
            <div className="page-title">Tournament Settings</div>
          </div>
        </div>
        <div className="content">
          <div className={styles.errorBanner}>{error}</div>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => router.push("/admin/tournaments")}
          >
            ← My Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`screen active ${styles.page}`} id="screen-settings">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 1 · Setup</div>
          <div className="page-title">Tournament Settings</div>
          <div className="page-sub">
            {tournament.name} — global defaults for divisions and registration
          </div>
        </div>
        <div className="page-actions">
          <Link
            href={tournamentAdminPath("/admin/divisions", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            View Divisions →
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saveMessage ? <span className={styles.saveToast}>{saveMessage}</span> : null}
        </div>
      </div>

      <div className={`content ${styles.content}`}>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <MasterPushBanner settings={settings} onChange={patchSettings} />
        <CourtsInfoCard settings={settings} onChange={patchSettings} />
        <PricingPrizesCard
          settings={settings}
          entryFee={entryFee}
          onSettingsChange={patchSettings}
          onEntryFeeChange={setEntryFee}
        />
        <PlayRulesCard settings={settings} onSettingsChange={patchSettings} />
        <DuprIntegrationCard
          settings={settings}
          duprRecorded={duprRecorded}
          duprEnforced={duprEnforced}
          requireSkillRating={requireSkillRating}
          onSettingsChange={patchSettings}
          onDuprRecorded={setDuprRecorded}
          onDuprEnforced={setDuprEnforced}
          onRequireSkillRating={setRequireSkillRating}
        />
        <NotificationsCard settings={settings} onSettingsChange={patchSettings} />
        <VisibilityCard
          settings={settings}
          onSettingsChange={patchSettings}
          passwordConfirm={passwordConfirm}
          onPasswordConfirmChange={setPasswordConfirm}
        />
        <ConfirmSettingsCard
          settings={settings}
          saving={saving}
          onConfirm={confirmSettings}
          onUnconfirm={unconfirmSettings}
        />
      </div>
    </div>
  );
}
