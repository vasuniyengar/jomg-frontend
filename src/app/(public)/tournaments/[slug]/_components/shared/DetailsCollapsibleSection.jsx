"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 760px)";

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export default function DetailsCollapsibleSection({
  id,
  title,
  titleStyle,
  defaultOpen = false,
  card = true,
  className = "",
  desktop,
  children,
}) {
  const isMobile = useIsMobileViewport();
  const anchorClass = `details-section-anchor ${className}`.trim();

  if (!isMobile) {
    if (desktop) {
      return (
        <section id={id} className={anchorClass}>
          {desktop}
        </section>
      );
    }

    if (card) {
      return (
        <section id={id} className={anchorClass}>
          <div className="vcard dsec">
            <div className="sh">
              <div className="sh-title" style={titleStyle}>
                {title}
              </div>
            </div>
            {children}
          </div>
        </section>
      );
    }

    return (
      <section id={id} className={anchorClass}>
        {children}
      </section>
    );
  }

  return (
    <section id={id} className={anchorClass}>
      <details
        className={`details-collapsible${card ? " vcard dsec" : ""}`}
        {...(defaultOpen ? { open: true } : {})}
      >
        <summary className="details-collapsible-summary">
          <div className="sh" style={{ marginBottom: 0 }}>
            <div className="sh-title" style={titleStyle}>
              {title}
            </div>
          </div>
        </summary>
        <div className="details-collapsible-body">{children}</div>
      </details>
    </section>
  );
}
