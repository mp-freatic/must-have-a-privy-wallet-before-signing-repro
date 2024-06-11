import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

import { muteWarningsPlugin } from "./src/vite-custom-plugins";

const warningsToIgnore = [
    ["SOURCEMAP_ERROR", "Can't resolve original location of error"],
    [
        "INVALID_ANNOTATION",
        "contains an annotation that Rollup cannot interpret",
    ],
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        port: 3000,
        host: "0.0.0.0",
    },
    build: {
        outDir: `./build/${mode === "dev" ? "local" : mode}`,
        sourcemap: true, // Source map generation must be turned on
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("commonjsHelpers"))
                        return "commonjsHelpers";

                    if (
                        id.includes("node-forge/lib") ||
                        id.includes("bcryptjs") ||
                        id.includes("src/cryptography")
                    ) {
                        return "crypto";
                    }
                    if (
                        id.includes("@mui/icons-material") ||
                        id.includes("@mui/lab") ||
                        id.includes("@mui/material")
                    ) {
                        return "mui";
                    }
                    if (
                        id.includes("react-router-dom") ||
                        id.includes("react-router")
                    ) {
                        return "react-router";
                    }
                    if (id.includes("@privy-io/react-auth")) {
                        return "privy";
                    }
                },
            },
        },
        modulePreload: false, // better performances without
    },
    resolve: {
        alias: {
            crypto: "crypto-browserify",
            stream: "stream-browserify",
            util: "util",
        },
    },
    plugins: [
        react(),
        tsconfigPaths(),
        svgr(),
        VitePWA({
            srcDir: "src",
            filename: "service-worker.js",
            strategies: "injectManifest",
            injectRegister: false,
            manifest: false,
            injectManifest: {
                injectionPoint: null,
            },
        }), // see https://vite-pwa-org.netlify.app/guide/service-worker-without-pwa-capabilities.html (as we just want the "install" feature)
        sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: "murmur-frontend",
            // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
            authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
        muteWarningsPlugin(warningsToIgnore),
    ],
    optimizeDeps: {
        include: ["opensea-js"],
    },
}));
