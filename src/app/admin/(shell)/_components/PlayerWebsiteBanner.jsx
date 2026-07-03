import Link from "next/link";
import { publicTournamentPath } from "@/lib/publicTournamentPaths";
import styles from "./playerWebsiteBanner.module.css";

/** Matches backend listing rules: public unless explicitly private or turned off. */
export function isPlayerPagePublic(visibility) {
  if (!visibility) return true;
  if (visibility.privateOnly) return false;
  if (visibility.publicTournamentPage === false) return false;
  return true;
}

export default function PlayerWebsiteBanner({
  slug,
  status = "draft",
  visibility,
  settingsHref,
  alwaysShowLink = false,
  className = "",
}) {
  if (!slug) return null;

  const isPublic = isPlayerPagePublic(visibility);
  const href = publicTournamentPath(slug, { preview: status === "draft" });
  const pathLabel = `/tournaments/${slug}${
    status === "draft" ? " (draft preview)" : ""
  }`;

  return (
    <div className={`${styles.banner} ${className}`.trim()}>
      <span className={styles.label}>Player website</span>
      {isPublic || alwaysShowLink ? (
        <>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {pathLabel}
          </a>
          {!isPublic && alwaysShowLink ? (
            <span className={styles.privateNote}>
              Not listed publicly —
              {settingsHref ? (
                <>
                  {" "}
                  enable in{" "}
                  <Link href={settingsHref} className={styles.settingsLink}>
                    Tournament Settings
                  </Link>
                </>
              ) : (
                " enable Public Tournament Page in settings"
              )}
            </span>
          ) : null}
        </>
      ) : (
        <span className={styles.hiddenNote}>
          Hidden — turn on <strong>Public Tournament Page</strong> or turn off{" "}
          <strong>Private Only</strong>
          {settingsHref ? (
            <>
              {" "}
              in{" "}
              <Link href={settingsHref} className={styles.settingsLink}>
                Tournament Settings
              </Link>
            </>
          ) : (
            ", then save."
          )}
          .
        </span>
      )}
    </div>
  );
}
