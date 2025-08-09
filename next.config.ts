
import type {NextConfig} from 'next';
// @ts-ignore
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 1000,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase body size limit for file uploads
    },
  },
  turbopack: {
    resolveAlias: {
      // Fix for mapbox-gl in Turbopack
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    },
  },
  webpack: (config, { isServer }) => {
    // Fix for mapbox-gl (only when not using Turbopack)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  images: {
    // Habilitamos la optimización de imágenes para un mejor rendimiento.
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qlbuwoyugbwpzzwdflsq.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qmbzgazhkhiymbwngzox.supabase.co',
        port: '',
        pathname: '/**',
      },

    ],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' || process.env.DISABLE_PWA === 'true',
  runtimeCaching: [
    // Static assets
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // API calls
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
    // Profile pages - always fetch from network first
    {
      urlPattern: /\/profile\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'profile-pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 2, // 2 minutes
        },
      },
    },
    // Other pages
    {
      urlPattern: /^https:\/\/.*\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 10, // 10 minutes
        },
      },
    },
  ],
})(nextConfig);
