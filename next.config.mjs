/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev-only allowlist for the Next.js dev client (HMR socket + /_next/* chunks).
  // Requests from an unlisted host get a 403, so the page paints but never hydrates.
  // 169.254.x.x is link-local and changes between boots, so allow the whole range.
  // This option has no effect on production builds.
  allowedDevOrigins: [
    "169.254.83.105",
    "169.254.196.155",
    "169.254.*.*",
  ],
};

export default nextConfig;