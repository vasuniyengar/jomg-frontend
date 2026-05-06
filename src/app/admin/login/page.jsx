"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./login.module.css";
import { apiRequest } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mapLoginError = (error) => {
    if (!error) {
      return "Unable to sign in";
    }
    if (error.status === 401) {
      return "Invalid email or password.";
    }
    if (error.status === 403) {
      return error.message || "You do not have access to this account.";
    }
    if (error.status === 500) {
      return "Server issue. Please try again in a moment.";
    }
    return error.message || "Unable to sign in";
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await apiRequest("/api/organizer/signin", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      saveAuthSession({
        accessToken: response.accessToken,
        rememberMe,
        user: {
          firstname: response.user?.firstname || "",
          roles: response.user?.roles || [],
        },
      });

      router.push("/admin/dashboard");
    } catch (error) {
      setErrorMessage(mapLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg
            fill="none"
            height="28"
            style={{ verticalAlign: "middle", marginRight: "6px" }}
            viewBox="0 0 22 22"
            width="28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="10" cy="10" fill="#AAFF00" opacity="0.15" rx="9" ry="9" stroke="#AAFF00" strokeWidth="1.5" />
            <rect fill="#AAFF00" height="10" rx="3" width="6" x="7" y="4" />
            <line stroke="#AAFF00" strokeLinecap="round" strokeWidth="2.2" x1="13" x2="18" y1="12" y2="18" />
            <circle cx="10" cy="8" fill="white" opacity="0.7" r="1.2" />
          </svg>
          DRIVE PB
        </div>
        <div className={styles.tagline}>Tournament Director Portal</div>

        <form onSubmit={handleSignIn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="director@drivepb.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={styles.input}
            />
          </div>
          <div className={styles.rememberRow}>
            <label className={styles.rememberLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.rememberCheckbox}
              />
              Remember me
            </label>
            <button type="button" className={styles.forgotLink}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In →"}
          </button>
          {errorMessage ? (
            <div
              style={{
                marginTop: "10px",
                color: "#ff7b7b",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {errorMessage}
            </div>
          ) : null}

        </form>

        
        <div className={styles.dividerWrapper}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>or continue with</span>
        </div>

        
        <button type="button" className={styles.btnGhost}>
          🔑 Single Sign-On (SSO)
        </button>

      </div>
    </div>
  );
}