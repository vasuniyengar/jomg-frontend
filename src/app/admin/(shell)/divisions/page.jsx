import { Suspense } from "react";
import ManageDivisionsScreen from "./_components/ManageDivisionsScreen";

function Fallback() {
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading divisions…
      </div>
    </div>
  );
}

export default function DivisionsPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ManageDivisionsScreen />
    </Suspense>
  );
}
