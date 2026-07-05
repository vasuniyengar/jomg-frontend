import { Suspense } from "react";
import RegistrationsListScreen from "./_components/RegistrationsListScreen";

function Fallback() {
  return (
    <div className="screen">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function ReglistPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <RegistrationsListScreen />
    </Suspense>
  );
}
