import { Suspense } from "react";
import PublishedPageClient from "./PublishedPageClient";

function Fallback() {
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function PublishedPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <PublishedPageClient />
    </Suspense>
  );
}
