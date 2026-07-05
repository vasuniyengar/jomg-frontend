const TABS = [
  { id: "details", label: "Details" },
  { id: "format", label: "Format" },
  { id: "pointsAdvance", label: "Points & Advance" },
  { id: "divisions", label: "Divisions" },
  { id: "sponsors", label: "Sponsors", desktopOnly: true },
  { id: "refund", label: "Refund Policy", desktopOnly: true },
  { id: "livePlay", label: "Live Play", hiddenUnlessEnabled: true },
];

export default function TabNav({ activeTab, onTabChange, livePlayEnabled }) {
  return (
    <div className="o3-tabs-wrap">
      <div className="o3-tabs" role="tablist" aria-label="Tournament sections">
        {TABS.map((tab) => {
          if (tab.hiddenUnlessEnabled && !livePlayEnabled) return null;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`o3-tab${selected ? " active" : ""}${tab.desktopOnly ? " o3-tab-desktop-only" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
