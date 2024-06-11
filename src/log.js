import * as Sentry from "@sentry/react";

// We override console.error to catch all errors passed to `console.error` to Sentry
const originalConsoleError = console.error;
console.error = function (...args) {
    originalConsoleError(...args);
    try {
        args.forEach((arg) => {
            if (arg instanceof Error) {
                Sentry.captureException(arg);
            }
        });
    } catch (e) {
        originalConsoleError(e);
        Sentry.captureException(e);
    }
};
