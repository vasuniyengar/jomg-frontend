function stripEnvUrl(value) {
  if (!value) return value;
  return String(value).trim().replace(/^["']|["']$/g, "");
}

const API_BASE_URL =
  stripEnvUrl(process.env.NEXT_PUBLIC_API_BASE_URL) || "http://127.0.0.1:4000";

/** Resolve a stored media key to a browser URL via the backend uploads route. */
export function resolveAdminMediaUrl(keyOrUrl) {
  if (!keyOrUrl || typeof keyOrUrl !== "string") return "";
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    return keyOrUrl;
  }
  return `${API_BASE_URL.replace(/\/$/, "")}/uploads/${keyOrUrl.replace(/^\//, "")}`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("jomg_access_token") ||
    sessionStorage.getItem("jomg_access_token")
  );
}

export async function uploadTournamentMedia(tournamentId, file, purpose = "banner") {
  const token = getToken();
  if (!token) {
    throw new Error("You must be signed in to upload files.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);

  const res = await fetch(
    `${API_BASE_URL}/api/tournaments/${tournamentId}/media?purpose=${encodeURIComponent(purpose)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.error) {
    throw new Error(payload.message || "Upload failed");
  }
  return payload.data;
}
