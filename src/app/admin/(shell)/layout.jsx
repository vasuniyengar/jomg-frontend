"use client";

import "./shell.css";
import Sidebar from "./_components/Sidebar";
import { ThemeProvider } from "./_components/ThemeProvider";
import Topbar from "./_components/Topbar";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AdminShellLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authed = isAuthenticated();
    if (!authed) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  const isHubMode = pathname === "/admin/tournaments";

  return (
    <ThemeProvider>
      <div className={`app${isHubMode ? " hub-mode" : ""}`}>
        <Suspense fallback={null}>
          <Topbar />
        </Suspense>
        <div className="body-area">
          {!isHubMode ? <Sidebar /> : null}
          <main className="main">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
