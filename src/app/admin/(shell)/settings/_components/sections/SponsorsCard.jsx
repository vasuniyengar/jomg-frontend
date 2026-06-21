"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  SPONSOR_TIER_KEYS,
  SPONSOR_TIER_LABELS,
  newSponsorItemId,
} from "@/lib/tournamentSettings";
import { uploadPendingSponsorLogos } from "@/lib/sponsorMedia";
import { resolveAdminMediaUrl } from "@/lib/tournamentMedia";
import styles from "../../settings.module.css";
import { CardBadge } from "../SettingsUi";

function resolveLogoPreview(item, pendingPreviews) {
  if (pendingPreviews[item.id]) return pendingPreviews[item.id];
  if (item.logoUrl) return item.logoUrl;
  return resolveAdminMediaUrl(item.logoKey);
}

const SponsorsCard = forwardRef(function SponsorsCard(
  { settings, onSettingsChange },
  ref
) {
  const fileRefs = useRef({});
  const pendingFilesRef = useRef(new Map());
  const [pendingPreviews, setPendingPreviews] = useState({});

  const sponsors = settings.tournamentInfo?.sponsors || { intro: "", tiers: {} };

  useEffect(() => {
    return () => {
      Object.values(pendingPreviews).forEach((url) => {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [pendingPreviews]);

  useImperativeHandle(ref, () => ({
    hasPendingUploads() {
      return pendingFilesRef.current.size > 0;
    },
    async prepareForSave(tournamentId) {
      if (!pendingFilesRef.current.size) return null;

      const nextSponsors = await uploadPendingSponsorLogos(
        tournamentId,
        sponsors,
        pendingFilesRef.current
      );

      pendingFilesRef.current = new Map();
      setPendingPreviews((prev) => {
        Object.values(prev).forEach((url) => {
          if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return {};
      });

      return nextSponsors;
    },
  }));

  const patchSponsors = (patch) => {
    onSettingsChange({
      tournamentInfo: {
        ...settings.tournamentInfo,
        sponsors: { ...sponsors, ...patch },
      },
    });
  };

  const patchTierItems = (tierKey, items) => {
    patchSponsors({
      tiers: {
        ...sponsors.tiers,
        [tierKey]: { items },
      },
    });
  };

  const addSponsorRow = (tierKey) => {
    const items = [...(sponsors.tiers?.[tierKey]?.items || [])];
    items.push({
      id: newSponsorItemId(),
      name: "",
      url: "",
      logoKey: "",
      logoUrl: "",
      darkLogo: false,
    });
    patchTierItems(tierKey, items);
  };

  const updateSponsorRow = (tierKey, itemId, patch) => {
    const items = (sponsors.tiers?.[tierKey]?.items || []).map((item) =>
      item.id === itemId ? { ...item, ...patch } : item
    );
    patchTierItems(tierKey, items);
  };

  const clearPendingForItem = (itemId) => {
    const pendingFile = pendingFilesRef.current.get(itemId);
    if (pendingFile) {
      pendingFilesRef.current.delete(itemId);
    }
    setPendingPreviews((prev) => {
      const next = { ...prev };
      if (next[itemId]?.startsWith("blob:")) {
        URL.revokeObjectURL(next[itemId]);
      }
      delete next[itemId];
      return next;
    });
  };

  const removeSponsorRow = (tierKey, itemId) => {
    clearPendingForItem(itemId);
    const items = (sponsors.tiers?.[tierKey]?.items || []).filter(
      (item) => item.id !== itemId
    );
    patchTierItems(tierKey, items);
  };

  const handleLogoSelect = (itemId, file) => {
    if (!file) return;
    clearPendingForItem(itemId);
    pendingFilesRef.current.set(itemId, file);
    setPendingPreviews((prev) => ({
      ...prev,
      [itemId]: URL.createObjectURL(file),
    }));
  };

  return (
    <div className="card" id="sponsors-card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Sponsors</span>
          <div className={styles.cardSectionTitle}>
            Partner logos shown on the public tournament page. Logos upload when you save settings.
          </div>
        </div>
        <CardBadge>Public page</CardBadge>
      </div>

      {SPONSOR_TIER_KEYS.map((tierKey) => {
        const items = sponsors.tiers?.[tierKey]?.items || [];
        return (
          <div key={tierKey} style={{ marginBottom: 24 }}>
            <div className={styles.cardSectionTitle} style={{ marginBottom: 12 }}>
              {SPONSOR_TIER_LABELS[tierKey]}
            </div>
            {items.map((item) => {
              const preview = resolveLogoPreview(item, pendingPreviews);
              const isPending = Boolean(pendingPreviews[item.id]);
              return (
                <div
                  key={item.id}
                  className={styles.sponsorRow}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr auto auto",
                    gap: 12,
                    alignItems: "end",
                    marginBottom: 12,
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Name</label>
                    <input
                      className="form-input"
                      value={item.name}
                      onChange={(e) =>
                        updateSponsorRow(tierKey, item.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Website URL</label>
                    <input
                      className="form-input"
                      type="url"
                      value={item.url === "#" ? "" : item.url}
                      onChange={(e) =>
                        updateSponsorRow(tierKey, item.id, {
                          url: e.target.value || "#",
                        })
                      }
                      placeholder="https://…"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Logo</label>
                    <input
                      ref={(el) => {
                        fileRefs.current[`${tierKey}-${item.id}`] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoSelect(item.id, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => fileRefs.current[`${tierKey}-${item.id}`]?.click()}
                    >
                      {preview ? "Replace logo" : "Choose logo"}
                    </button>
                    {isPending ? (
                      <p style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 6 }}>
                        Pending save
                      </p>
                    ) : null}
                    {preview ? (
                      <img
                        src={preview}
                        alt=""
                        style={{
                          display: "block",
                          marginTop: 8,
                          maxHeight: 40,
                          maxWidth: 120,
                          objectFit: "contain",
                        }}
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeSponsorRow(tierKey, item.id)}
                    aria-label="Remove sponsor"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => addSponsorRow(tierKey)}
            >
              + Add {SPONSOR_TIER_LABELS[tierKey]}
            </button>
          </div>
        );
      })}
    </div>
  );
});

export default SponsorsCard;
