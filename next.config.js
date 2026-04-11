/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // 🔹 NEW: Added Flaticon to allow the profile details avatar
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      }
    ],
  },
};

export default nextConfig; // Use 'module.exports = nextConfig;' if your file ends in .js