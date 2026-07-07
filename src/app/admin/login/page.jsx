import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";
import styles from "./login.module.css";

function LoginFallback() {
  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ textAlign: "center", color: "#b4b9c1" }}>
        Loading…
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}
