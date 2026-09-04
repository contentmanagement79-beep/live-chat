/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  compiler: {
    styledJsx: true,
  },

  // প্রোফাইল পিকচার বা এভাটার লোড করার জন্য 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // প্রোডাকশনে যাওয়ার সময় এখানে আপনার Supabase স্টোরেজ বা স্পেসিফিক ডোমেইন দিতে পারেন
      },
    ],
  },

  // 🛡️ প্রো-লেভেল সিকিউরিটি হেডার্স
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Clickjacking প্রতিরোধ করবে
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // MIME type sniffing বন্ধ করবে
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // সিকিউর রেফারার পলিসি
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // HTTPS ফোর্স করবে
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // অপ্রয়োজনীয় ব্রাউজার পারমিশন ব্লক করবে
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
