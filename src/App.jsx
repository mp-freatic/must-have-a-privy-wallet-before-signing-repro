import { usePrivy, useToken } from "@privy-io/react-auth";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import useCurrentPrivyAccount from "src/hooks/useCurrentPrivyAccount";
import {
    handleAuthConnection,
    logoutFromAll,
    selectIsConnected,
    selectIsLoggingOut,
    setIsConnectingPrivy,
} from "src/slices/authSlice";

import FullscreenCircularProgress from "src/components/FullscreenCircularProgress";
import PageContainer from "src/components/PageContainer";

import { ROUTES } from "src/constants";

const MarketPage = React.lazy(
    async () =>
        await import(
            /* webpackChunkName: "MarketPage" */ "src/routes/MarketPage"
        ),
);
const StartPage = React.lazy(
    async () =>
        await import(
            /* webpackChunkName: "StartAndTopicsPages" */ "src/routes/StartPage"
        ),
);

const App = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const account = useCurrentPrivyAccount();
    const isConnected = useSelector(selectIsConnected);
    const { ready, authenticated, user, unlinkTwitter } = usePrivy();
    const isLoggingOut = useSelector(selectIsLoggingOut);

    const [deferredPrompt, setDeferredPrompt] = useState();
    const location = useLocation();
    const [
        duplicateTwitterAccountModalType,
        setDuplicateTwitterAccountModalType,
    ] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const referralCode = queryParams.get("referralCode");

    useToken({
        onAccessTokenGranted: (accessToken) => {
            // This will be called when a user logs in, or when a user's access token is refreshed.
            console.info("New privy access token provided");
        },
        onAccessTokenRemoved: () => {
            if (location.pathname !== "/profile") {
                // we log an error if privy access token was removed without user logout action
                console.warn(
                    "Privy access token removed without user logout action",
                );
            }
            // To handle user logout, we always only logout from privy in components
            // and here, when privy user is fully logged out, we logout from anything else (backend, OneSignal, redux store, local storage values...)
            if (isConnected) {
                dispatch(logoutFromAll());
            }
            if (
                ![ROUTES.START, ROUTES.PRIVACY_POLICY].includes(
                    location.pathname,
                )
            ) {
                navigate(ROUTES.START);
            }
        },
    });

    useEffect(() => {
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (e) {
                const body = document.getElementsByTagName("body")[0];
                body.style.overflow = "auto"; // To enable global pull to refresh if used on navigator
            }
        });
        const intialStartPage = document.querySelector(".initial-loading-page");
        if (intialStartPage) {
            intialStartPage.remove();
        }
    }, [dispatch]);

    const handleDuplicateTwitterAccountError = useCallback(() => {
        if (
            user.linkedAccounts &&
            !duplicateTwitterAccountModalType &&
            user?.twitter?.subject
        ) {
            setDuplicateTwitterAccountModalType("error");
            const socialLinks = user.linkedAccounts.filter(
                (linkedAccount) => linkedAccount.type !== "wallet",
            );
            if (socialLinks.length > 1) {
                // We can't unlink if only 1 social (email, google, twitter ...) linked account
                unlinkTwitter(user.twitter.subject).catch((error) =>
                    console.error("Error with unlinkTwitter", error),
                );
            }
        }
    }, [
        unlinkTwitter,
        duplicateTwitterAccountModalType,
        user?.linkedAccounts,
        user?.twitter?.subject,
    ]);

    const privyUserIsFullyAuthenticated = Boolean(
        ready && authenticated && user?.wallet,
    );
    const isPrivacyPolicyPage = location.pathname === ROUTES.PRIVACY_POLICY;
    useEffect(() => {
        if (
            !isConnected &&
            account?.address &&
            privyUserIsFullyAuthenticated &&
            !isLoggingOut &&
            !isPrivacyPolicyPage
        ) {
            handleAuthConnection({
                walletAddress: account.address,
                handleDuplicateTwitterAccountError,
            })(dispatch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to run the useEffect when handleDuplicateTwitterAccountError is updated
    }, [
        isConnected,
        account?.address,
        privyUserIsFullyAuthenticated,
        isLoggingOut,
        isPrivacyPolicyPage,
    ]);

    // manage state of privy "loading"
    useEffect(() => {
        dispatch(
            setIsConnectingPrivy(
                !ready || (ready && authenticated && !account?.address),
            ),
        );
    }, [dispatch, ready, authenticated, account.address]);

    return (
        <Routes>
            <Route
                path={ROUTES.START}
                element={
                    <React.Suspense fallback={<FullscreenCircularProgress />}>
                        <StartPage
                            deferredPrompt={deferredPrompt}
                            setDeferredPrompt={setDeferredPrompt}
                        />
                    </React.Suspense>
                }
            />
            <Route
                path={ROUTES.FEED_MARKETPLACE}
                element={
                    <PageContainer showHeader>
                        <React.Suspense
                            fallback={
                                <FullscreenCircularProgress
                                    onlyLoader
                                    sx={{ height: "100%" }}
                                />
                            }
                        >
                            <MarketPage />
                        </React.Suspense>
                    </PageContainer>
                }
            />
        </Routes>
    );
};

export default App;
