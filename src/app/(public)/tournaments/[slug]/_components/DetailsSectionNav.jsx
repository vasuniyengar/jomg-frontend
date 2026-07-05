"use client";

import { useEffect, useState } from "react";

export function buildDetailsSections({
  hasAbout,
  hasCourts,
  hasOfficialBall,
  hasInstructions,
  hasPaddlePolicy,
  hasSponsors,
  hasDuprPolicy,
  hasRefund,
}) {
  const sections = [{ id: "details-venue", label: "Venue" }];
  if (hasAbout) {
    sections.push({ id: "details-about", label: "Tournament Info" });
  }
  if (hasCourts || hasOfficialBall) {
    sections.push({ id: "details-courts", label: "Courts" });
  }
  if (hasPaddlePolicy) {
    sections.push({ id: "details-paddle", label: "Paddle" });
  }
  if (hasSponsors) {
    sections.push({ id: "details-sponsors", label: "Sponsors" });
  }
  if (hasDuprPolicy) {
    sections.push({ id: "details-dupr", label: "DUPR" });
  }
  if (hasInstructions) {
    sections.push({ id: "details-instructions", label: "Essentials" });
  }
  if (hasRefund) {
    sections.push({ id: "details-refund", label: "Refund" });
  }
  return sections;
}

export default function DetailsSectionNav({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (!sections.length) return undefined;

    setActiveId(sections[0].id);

    const observers = sections
      .map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return null;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setActiveId(id);
          },
          { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
        );
        observer.observe(el);
        return observer;
      })
      .filter(Boolean);

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sections]);

  if (!sections.length) return null;

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    const details = section?.querySelector("details");
    if (details) details.open = true;
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="details-section-nav" aria-label="Details sections">
      <div className="details-section-nav-inner">
        {sections.map((section) => {
          const selected = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              className={`details-section-chip${selected ? " active" : ""}`}
              aria-current={selected ? "true" : undefined}
              onClick={() => scrollTo(section.id)}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
