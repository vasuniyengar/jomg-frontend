import { Suspense } from "react";
import TeamsPageClient from "./TeamsPageClient";

function Fallback() {
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <TeamsPageClient />
    </Suspense>
  );
}
