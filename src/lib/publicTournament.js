function stripEnvUrl(value) {
  if (!value) return value;
  return String(value).trim().replace(/^["']|["']$/g, "");
}

const API_BASE_URL =
  stripEnvUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ||
  stripEnvUrl(process.env.API_BASE_URL) ||
  "http://127.0.0.1:4000";

async function publicFetch(path, { revalidate, preview = false } = {}) {
  const isServer = typeof window === "undefined";
  const fetchOpts = {
    headers: { Accept: "application/json" },
  };

  if (isServer && revalidate != null) {
    fetchOpts.next = { revalidate };
  } else if (!isServer) {
    fetchOpts.cache = "no-store";
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  if (preview) {
    url.searchParams.set("preview", "1");
  }

  const res = await fetch(url.toString(), fetchOpts);

  if (res.status === 404) return null;

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.error) {
    throw new Error(payload.message || "Failed to load tournament page");
  }
  return payload.data;
}

export async function fetchPublicTournamentPage(slug, { preview = false } = {}) {
  const encoded = encodeURIComponent(slug);
  let data = await publicFetch(`/api/public/tournaments/${encoded}`, {
    revalidate: 30,
    preview,
  });

  if (!data && !preview) {
    data = await publicFetch(`/api/public/tournaments/${encoded}`, {
      revalidate: 30,
      preview: true,
    });
  }

  return data;
}

export async function fetchPublicDivisionDetail(slug, bracketId, { preview = false } = {}) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedBracket = encodeURIComponent(bracketId);
  return publicFetch(
    `/api/public/tournaments/${encodedSlug}/divisions/${encodedBracket}`,
    { preview }
  );
}
