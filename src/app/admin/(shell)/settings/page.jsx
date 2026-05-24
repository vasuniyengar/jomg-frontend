import { Suspense } from "react";
import TournamentSettingsScreen from "./_components/TournamentSettingsScreen";

function SettingsFallback() {
  return (
    <div className="screen active">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title">Tournament Settings</div>
        </div>
      </div>
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function TournamentSettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <TournamentSettingsScreen />
    </Suspense>
  );
}
