"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { fetchDivisions } from "@/lib/divisions";
import { pushTournamentSettings } from "@/lib/dashboard";
import OverrideConfirmModal from "./OverrideConfirmModal";
import MasterPushBanner from "./sections/MasterPushBanner";
import CourtsInfoCard from "./sections/CourtsInfoCard";
import PricingPrizesCard from "./sections/PricingPrizesCard";
import PlayRulesCard from "./sections/PlayRulesCard";
import DuprIntegrationCard from "./sections/DuprIntegrationCard";
import NotificationsCard from "./sections/NotificationsCard";
import SponsorsCard from "./sections/SponsorsCard";
import BannerCard from "./sections/BannerCard";
import VisibilityCard, { validateVisibilityPassword } from "./sections/VisibilityCard";
import ConfirmSettingsCard from "./sections/ConfirmSettingsCard";
import { publicTournamentPath } from "@/lib/publicTournamentPaths";

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
  const [divisions, setDivisions] = useState([]);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideSection, setOverrideSection] = useState(null);
  const [pendingSectionPatch, setPendingSectionPatch] = useState(null);
  const [pushing, setPushing] = useState(false);
  const sponsorsRef = useRef(null);
  const bannerRef = useRef(null);

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
        try {
          const divs = await fetchDivisions(tournamentId);
          if (!cancelled) setDivisions(divs);
        } catch {
          if (!cancelled) setDivisions([]);
        }
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

  const persistSettings = async (nextSettings, { tournamentTumbnail } = {}) => {
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
      tournamentTumbnail:
        tournamentTumbnail !== undefined
          ? tournamentTumbnail
          : tournament.tournamentTumbnail,
    });
    const updated = await updateTournament(tournament.id, payload);
    applyTournament(updated);
    return updated;
  };

  const prepareSettingsForSave = async () => {
    let nextSettings = settings;
    let tournamentTumbnail;

    if (tournament && bannerRef.current?.hasPendingUpload()) {
      tournamentTumbnail = await bannerRef.current.prepareForSave(tournament.id);
    }

    if (tournament && sponsorsRef.current?.hasPendingUploads()) {
      const nextSponsors = await sponsorsRef.current.prepareForSave(tournament.id);
      nextSettings = {
        ...nextSettings,
        tournamentInfo: {
          ...nextSettings.tournamentInfo,
          sponsors: nextSponsors,
        },
      };
      setSettings(nextSettings);
    }

    return { nextSettings, tournamentTumbnail };
  };

  const handleSave = async () => {
    if (!tournament) return;
    setSaving(true);
    setSaveMessage("");
    setError("");
    try {
      const { nextSettings, tournamentTumbnail } = await prepareSettingsForSave();
      const result = await persistSettings(nextSettings, { tournamentTumbnail });
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
    setSaving(true);
    setError("");
    try {
      const { nextSettings: preparedSettings, tournamentTumbnail } =
        await prepareSettingsForSave();
      const nextSettings = {
        ...preparedSettings,
        settingsConfirmed: true,
        settingsConfirmedAt: new Date().toISOString(),
      };
      setSettings(nextSettings);
      const result = await persistSettings(nextSettings, { tournamentTumbnail });
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

  const handleSectionEnablePush = (sectionKey, patch) => {
    if (!divisions.length) {
      patchSettings(patch);
      return;
    }
    setPendingSectionPatch(patch);
    setOverrideSection(sectionKey);
    setOverrideOpen(true);
  };

  const runPush = async ({ sections, bracketIds }) => {
    if (!tournament) return;
    setPushing(true);
    setError("");
    try {
      const { nextSettings: preparedSettings, tournamentTumbnail } =
        await prepareSettingsForSave();
      const mergedSettings = pendingSectionPatch
        ? { ...preparedSettings, ...pendingSectionPatch }
        : preparedSettings;
      if (mergedSettings !== preparedSettings) {
        setSettings(mergedSettings);
      }
      await persistSettings(mergedSettings, { tournamentTumbnail });
      await pushTournamentSettings(tournament.id, { sections, bracketIds });
      setSaveMessage("Settings pushed to selected divisions.");
      setTimeout(() => setSaveMessage(""), 3000);
      setOverrideOpen(false);
      setPendingSectionPatch(null);
    } catch (err) {
      setError(err.message || "Failed to push settings");
    } finally {
      setPushing(false);
    }
  };

  const unconfirmSettings = async () => {
    if (!tournament) return;
    const prevSettings = settings;
    const nextSettings = {
      ...settings,
      settingsConfirmed: false,
      settingsConfirmedAt: null,
    };
    setSettings(nextSettings);
    setSaving(true);
    setError("");
    try {
      const payload = buildTournamentUpdatePayload(tournament, {
        entryFee,
        duprRecorded,
        duprEnforced,
        requireSkillRating,
        settings: nextSettings,
        status: tournament.status === "active" ? "draft" : tournament.status,
      });
      const updated = await updateTournament(tournament.id, payload);
      applyTournament(updated);
      setSaveMessage("Settings unlocked. Tournament reverted to draft if it was published.");
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err) {
      setSettings(prevSettings);
      setError(err.message || "Failed to unlock settings");
    } finally {
      setSaving(false);
    }
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

        {tournament?.slug ? (
          <div className={styles.playerUrlBanner}>
            <span className={styles.playerUrlLabel}>Player website</span>
            {settings.visibility?.publicTournamentPage &&
            !settings.visibility?.privateOnly ? (
              <a
                href={publicTournamentPath(
                  tournament.slug,
                  { preview: tournament.status === "draft" }
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                /tournaments/{tournament.slug}
                {tournament.status === "draft" ? " (draft preview)" : ""}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: "var(--text-sec)" }}>
                Hidden — turn on{" "}
                <strong style={{ color: "var(--text)" }}>Public Tournament Page</strong>{" "}
                or turn off <strong style={{ color: "var(--text)" }}>Private Only</strong>, then
                save.
              </span>
            )}
          </div>
        ) : null}

        <MasterPushBanner settings={settings} onChange={patchSettings} />
        <CourtsInfoCard settings={settings} onChange={patchSettings} />
        <PricingPrizesCard
          settings={settings}
          entryFee={entryFee}
          onSettingsChange={patchSettings}
          onEntryFeeChange={setEntryFee}
          onEnableSectionPush={handleSectionEnablePush}
        />
        <PlayRulesCard
          settings={settings}
          onSettingsChange={patchSettings}
          onEnableSectionPush={handleSectionEnablePush}
        />
        <DuprIntegrationCard
          settings={settings}
          duprRecorded={duprRecorded}
          duprEnforced={duprEnforced}
          requireSkillRating={requireSkillRating}
          onSettingsChange={patchSettings}
          onEnableSectionPush={handleSectionEnablePush}
          onDuprRecorded={setDuprRecorded}
          onDuprEnforced={setDuprEnforced}
          onRequireSkillRating={setRequireSkillRating}
        />
        <NotificationsCard settings={settings} onSettingsChange={patchSettings} />
        <BannerCard ref={bannerRef} bannerUrl={tournament?.tournamentTumbnail || ""} />
        <SponsorsCard
          ref={sponsorsRef}
          settings={settings}
          onSettingsChange={patchSettings}
        />
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

      <OverrideConfirmModal
        open={overrideOpen}
        section={overrideSection}
        divisions={divisions}
        pushing={pushing}
        onCancel={() => {
          setOverrideOpen(false);
          setPendingSectionPatch(null);
        }}
        onConfirm={runPush}
      />
    </div>
  );
}
