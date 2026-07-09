/** @type {import('next').NextConfig} */

function stripEnvUrl(value) {
  if (!value) return value;
  return String(value).trim().replace(/^["']|["']$/g, "");
}

const backendUrl =
  stripEnvUrl(process.env.NEXT_PUBLIC_API_BASE_URL) || "http://127.0.0.1:4000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
