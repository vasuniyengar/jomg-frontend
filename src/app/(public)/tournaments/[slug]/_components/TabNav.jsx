const TABS = [
  { id: "details", label: "Details" },
  { id: "format", label: "Format" },
  { id: "pointsAdvance", label: "Points & Advance" },
  { id: "divisions", label: "Divisions" },
  { id: "sponsors", label: "Sponsors" },
  { id: "refund", label: "Refund Policy" },
  { id: "livePlay", label: "Live Play", hiddenUnlessEnabled: true },
];

export default function TabNav({ activeTab, onTabChange, livePlayEnabled }) {
  return (
    <div className="o3-tabs">
      {TABS.map((tab) => {
        if (tab.hiddenUnlessEnabled && !livePlayEnabled) return null;
        return (
          <button
            key={tab.id}
            type="button"
            className={`o3-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
