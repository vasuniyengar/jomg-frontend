import { Suspense } from "react";
import CheckInScreen from "./_components/CheckInScreen";

function Fallback() {
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24, color: "var(--text-sec)" }}>
        Loading…
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <CheckInScreen />
    </Suspense>
  );
}
