"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 760px)";
const SHOW_AFTER_PX = 320;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const update = () => {
      const isMobile = media.matches;
      const scrolled = window.scrollY > SHOW_AFTER_PX;
      setVisible(isMobile && scrolled);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      media.removeEventListener("change", update);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-top-btn"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
