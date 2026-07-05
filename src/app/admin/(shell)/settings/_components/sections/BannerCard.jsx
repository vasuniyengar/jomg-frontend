"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  BANNER_SPEC_LABEL,
  BANNER_MEDIA,
  uploadPendingBanner,
  validateBannerFile,
} from "@/lib/tournamentBanner";
import styles from "../../settings.module.css";
import { CardBadge } from "../SettingsUi";

const BannerCard = forwardRef(function BannerCard({ bannerUrl }, ref) {
  const fileRef = useRef(null);
  const pendingFileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [dimensions, setDimensions] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useImperativeHandle(ref, () => ({
    hasPendingUpload() {
      return Boolean(pendingFileRef.current);
    },
    async prepareForSave(tournamentId) {
      if (!pendingFileRef.current) return null;
      const keyOrUrl = await uploadPendingBanner(tournamentId, pendingFileRef.current);
      pendingFileRef.current = null;
      setPending(false);
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setDimensions("");
      return keyOrUrl;
    },
    clearPending() {
      pendingFileRef.current = null;
      setPending(false);
      setDimensions("");
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return "";
      });
    },
  }));

  const displayUrl = previewUrl || bannerUrl || "";

  const handleSelect = async (file) => {
    if (!file) return;
    setError("");
    try {
      const dims = await validateBannerFile(file);
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      pendingFileRef.current = file;
      setPending(true);
      setPreviewUrl(URL.createObjectURL(file));
      setDimensions(`${dims.width} × ${dims.height} px`);
    } catch (err) {
      setError(err.message || "Invalid banner image");
    }
  };

  return (
    <div className="card" id="banner-card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Tournament Banner</span>
          <div className={styles.cardSectionTitle}>
            Hero image on the public tournament page. Uploads when you save settings.
          </div>
        </div>
        <CardBadge>Public page</CardBadge>
      </div>

      <p className={styles.bannerSpec}>{BANNER_SPEC_LABEL}</p>

      {error ? (
        <div className={styles.errorBanner} style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept={BANNER_MEDIA.accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelect(file);
          e.target.value = "";
        }}
      />

      <div className={styles.bannerActions}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => fileRef.current?.click()}
        >
          {displayUrl ? "Replace banner" : "Choose banner"}
        </button>
        {pending ? (
          <span className={styles.bannerPending}>Pending save</span>
        ) : null}
        {dimensions ? (
          <span className={styles.bannerDims}>{dimensions}</span>
        ) : null}
      </div>

      {displayUrl ? (
        <div
          className={styles.bannerPreview}
          style={{ backgroundImage: `url(${displayUrl})` }}
        />
      ) : (
        <div className={styles.bannerPreviewEmpty}>
          No banner uploaded yet
        </div>
      )}
    </div>
  );
});

export default BannerCard;
