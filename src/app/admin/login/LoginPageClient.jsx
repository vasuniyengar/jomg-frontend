"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./login.module.css";
import { apiRequest } from "@/lib/api";
import { isAuthenticated, saveAuthSession } from "@/lib/auth";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordChanged = searchParams.get("passwordChanged") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setRedirecting(true);
      router.replace("/admin/dashboard");
    }
  }, [router]);

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
    if (error.status === 0 || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      return (
        error.message ||
        "Cannot reach the API server. Ensure the backend is running on port 4000."
      );
    }
    if (error.status === 500) {
      return error.message || "Server issue. Please try again in a moment.";
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
          id: response.user?.id,
          firstname: response.user?.firstname || "",
          lastname: response.user?.lastname || "",
          email: response.user?.email || "",
          roles: response.user?.roles || [],
        },
      });

      router.replace("/admin/dashboard");
    } catch (error) {
      setErrorMessage(mapLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: "center", color: "var(--text-sec)" }}>
          Redirecting…
        </div>
      </div>
    );
  }

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

        {passwordChanged ? (
          <div
            style={{
              marginBottom: "14px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "rgba(170,255,0,0.12)",
              border: "1px solid rgba(170,255,0,0.35)",
              color: "var(--text)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Password updated. Please sign in with your new password.
          </div>
        ) : null}

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
            <label className={styles.label} htmlFor="login-password">
              Password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
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
