// sort-imports-ignore
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as Sentry from "@sentry/react";
import { AxiosError } from "axios";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "src/log";
// Important to have this imported AFTER the src/log import
import { HttpRequestError, RpcError } from "viem";

import WalletAuthProvider from "src/components/WalletAuthProvider";

import "src/global.css";
import { store } from "src/store";
import theme from "src/theme";
import { isSerializable } from "src/utils";

// App import needs to be after store import to avoid error like : Cannot access 'authReducer' before initialization
import App from "src/App";

const backendHostRegexp = new RegExp(`${import.meta.env.VITE_BACKEND_HOST}/.*`);
if (import.meta.env.VITE_SENTRY_ENV !== "dev") {
    Sentry.init({
        dsn: "https://d18639e6aaefc47104c40a0420898e3f@o4504594017878016.ingest.sentry.io/4506398675369984",
        environment: import.meta.env.VITE_SENTRY_ENV || "unkown",
        integrations: [
            new Sentry.BrowserTracing({
                // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
                tracePropagationTargets: ["localhost", backendHostRegexp],
            }),
            new Sentry.Replay(),
        ],
        // Performance Monitoring
        tracesSampleRate: 0.5, //  Capture 100% of the transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
        ignoreErrors: [
            "authenticating with privy token again took too long",
            "WebSocket connection failed for host: wss://relay.walletconnect.org",
            "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing",
        ],
        beforeSend: (event, hint) => {
            const exception = hint.originalException;

            if (
                hint?.mechanism?.type == "onunhandledrejection" &&
                event?.exception?.values?.[0]
            ) {
                let exceptionValue = "Unhandled rejection of promise with";
                exceptionValue += isSerializable(hint.originalException)
                    ? ` argument: ${JSON.stringify(hint.originalException)}`
                    : ` keys (argument is not serializable): ${Object.keys(
                          hint.originalException,
                      ).join()}`;
                exceptionValue += isSerializable(hint.data)
                    ? ` and data: ${JSON.stringify(hint.data)}`
                    : ` and data keys: ${Object.keys(hint.data).join()}`;
                event.exception.values[0] = {
                    mechanism: hint?.mechanism,
                    type: "UnhandledRejection ",
                    value: exceptionValue,
                };
            }

            // Exclude no internet connection from being reported to Sentry
            if (
                exception?.code === AxiosError.ERR_NETWORK ||
                /No internet connection/.test(exception?.message)
            ) {
                return null;
            }
            if (exception instanceof RpcError) {
                // temporarily saving exception structure to further enhance granularity
                event.extra = {
                    ...event.extra,
                    exception,
                    cause: exception.cause,
                };
                event.fingerprint = [
                    "{{ default }}",
                    String(exception.code),
                    String(exception.name),
                ];
            }
            if (exception instanceof HttpRequestError) {
                // temporarily saving exception structure to further enhance granularity
                event.extra = {
                    ...event.extra,
                    exception,
                };
                event.fingerprint = [
                    "{{ default }}",
                    String(exception.status),
                    String(exception.url),
                    String(exception.body?.method),
                ];
            }

            return event;
        },
    });
}

const root = createRoot(document.getElementById("root"));

const router = createBrowserRouter([{ path: "*", Component: App }]);

root.render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <WalletAuthProvider>
                    <CssBaseline>
                        <RouterProvider router={router} />
                    </CssBaseline>
                </WalletAuthProvider>
            </Provider>
        </ThemeProvider>
    </StrictMode>,
);
