/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "@react-native-async-storage/async-storage");
    // WalletConnect providers attempt browser-only initialization at module
    // load time; marking them external on the server prevents the SSR crash.
    if (isServer) {
      config.externals.push(
        "@walletconnect/ethereum-provider",
        "@walletconnect/universal-provider",
      );
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },
};

export default nextConfig;
