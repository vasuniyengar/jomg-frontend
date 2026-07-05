import { Suspense } from "react";
import DrawPageClient from "./DrawPageClient";

function Fallback() {
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function DrawPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <DrawPageClient />
    </Suspense>
  );
}
