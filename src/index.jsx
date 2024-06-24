// sort-imports-ignore
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Important to have this imported AFTER the src/log import

import WalletAuthProvider from "src/components/WalletAuthProvider";

import "src/global.css";
import { store } from "src/store";
import theme from "src/theme";

// App import needs to be after store import to avoid error like : Cannot access 'authReducer' before initialization
import App from "src/App";

const backendHostRegexp = new RegExp(`${import.meta.env.VITE_BACKEND_HOST}/.*`);

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
