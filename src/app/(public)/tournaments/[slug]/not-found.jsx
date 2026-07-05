import Link from "next/link";

export default function PublicTournamentNotFound() {
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--display)", fontSize: 40, marginBottom: 12 }}>
        Tournament not found
      </h1>
      <p style={{ color: "var(--text2)", marginBottom: 24 }}>
        This page is private, unavailable, or the link may be incorrect.
      </p>
      <Link href="/" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>
        Go to home
      </Link>
    </div>
  );
}
