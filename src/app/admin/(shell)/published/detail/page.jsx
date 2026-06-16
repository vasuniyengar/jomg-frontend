import { Suspense } from "react";
import PublishedDetailPageClient from "./PublishedDetailPageClient";

function Fallback() {
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function PublishedDetailPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <PublishedDetailPageClient />
    </Suspense>
  );
}
