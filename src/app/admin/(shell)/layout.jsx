"use client";

import "./shell.css";
import Sidebar from "./_components/Sidebar";
import { ThemeProvider } from "./_components/ThemeProvider";
import Topbar from "./_components/Topbar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AdminShellLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // #region agent log
  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H1-H3",
        location: "layout.jsx:render",
        message: "AdminShellLayout render",
        data: { pathname, ready, blockingShell: !ready },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  useEffect(() => {
    const effectStart = Date.now();
    const authed = isAuthenticated();
    // #region agent log
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H1-H3",
        location: "layout.jsx:authEffect",
        message: "Auth effect ran",
        data: { pathname, authed, effectStart },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (!authed) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
    // #region agent log
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "layout.jsx:setReady",
        message: "Shell ready — children can render",
        data: { pathname, msSinceEffectStart: Date.now() - effectStart },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  const isHubMode = pathname === "/admin/tournaments";

  return (
    <ThemeProvider>
      <div className={`app${isHubMode ? " hub-mode" : ""}`}>
        <Topbar />
        <div className="body-area">
          {!isHubMode ? <Sidebar /> : null}
          <main className="main">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
