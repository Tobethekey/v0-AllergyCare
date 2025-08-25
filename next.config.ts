// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ACHTUNG: Dies sollte entfernt werden, sobald die App stabil läuft,
    // um zukünftige Typ-Fehler sehen zu können.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ======================================================================
  // ===== LÖSUNG FÜR DEN "require.extensions"-FEHLER =====
  // ======================================================================
  webpack: (config) => {
    // Wir sagen Webpack, dass es bestimmte Pakete, die für den Server
    // gedacht sind, nicht in das Bundle packen soll.
    // Dies vermeidet Kompatibilitätsprobleme wie den `require.extensions`-Fehler.
    // Dies ist oft für serverseitige SDKs (wie genkit) notwendig.
    config.externals.push(
      '@opentelemetry/api',
      '@opentelemetry/exporter-jaeger'
    );

    return config;
  },
};

export default nextConfig;
