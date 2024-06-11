import {
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
    selectCurrentUserWalletAddress,
    selectIsLoadingAuth,
    selectIsLoggingOut,
    setIsLoggingOut,
} from "src/slices/authSlice";

import LabeledCircularProgress from "src/components/LabeledCircularProgress";
import Logo from "src/components/Logo";
import PageContainer from "src/components/PageContainer";
import SkipButton from "src/components/SkipButton";

import { LAYOUT, ROUTES } from "src/constants";

export default function StartPage() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isLoadingAuth = useSelector(selectIsLoadingAuth);
    const address = useSelector(selectCurrentUserWalletAddress);
    const [canRedirect, setCanRedirect] = useState(false);
    const { user, authenticated, isModalOpen: isPrivyModalOpen } = usePrivy();
    const isLoggingOut = useSelector(selectIsLoggingOut);

    const { login } = useLogin({
        onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
            if (!wasAlreadyAuthenticated && !isNewUser) {
                // Nothing
            } else if (isNewUser) {
                // We use url params here because when we link / sign in with social network, we are redirected on another page and the we come back on the previouse url
                // so we can't use a state that will be refreshed but we can use url params
                searchParams.set("isNewUser", true);
                setSearchParams(searchParams);
            }
            setCanRedirect(true);
        },
    });

    useEffect(() => {
        if (isLoggingOut) {
            // we put the state as false here to avoid infinite loop with handleAuthConnection -> no privy access token > logout > handleAuthConnection
            dispatch(setIsLoggingOut(false));
        }
    }, [dispatch, isLoggingOut]);

    const buttonWidth = isMobile
        ? "100%"
        : LAYOUT.START_PAGE.DESKTOP_BUTTON_WIDTH;

    // WELCOME_CONTENT_STEPS_CONDITIONS are content of "welcome" page (displayed when !address so no privy connection or when we are trying to connect the user)
    const WELCOME_CONTENT_STEPS_CONDITIONS = {
        POTENTIAL_LOADING_PRIVY: {
            condition: authenticated && user && !user.wallet, // when privy is creating the wallet
            conntent: (
                <LabeledCircularProgress label="Awaiting wallet generation" />
            ),
        },
        LOADING_AUTH: {
            condition: isLoadingAuth || isPrivyModalOpen,
            content: (
                <LabeledCircularProgress label="Building your experience" />
            ),
        },
        NOT_SIGNED_IN: {
            condition: !isLoadingAuth,
            content: (
                <Stack gap={1} width="100%" alignItems="center">
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            width: buttonWidth,
                        }}
                        onClick={login}
                    >
                        Sign in
                    </Button>
                    <Link to={ROUTES.PRIVACY_POLICY} target="_blank">
                        <SkipButton text="Check out our privacy policy" />
                    </Link>
                </Stack>
            ),
        },
    };

    let welcomeContentKey = Object.keys(WELCOME_CONTENT_STEPS_CONDITIONS).find(
        (key) => WELCOME_CONTENT_STEPS_CONDITIONS[key].condition,
    );

    const STEPS_CONDITIONS = {
        WELCOME: {
            condition: !address || isLoadingAuth || isPrivyModalOpen,
            content: (
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    width="100%"
                >
                    <Box
                        flex={1}
                        display="flex"
                        flexDirection="column"
                        alignSelf="center"
                        maxWidth="250px"
                        textAlign="center"
                    >
                        <Typography>
                            <Typography component="span" variant="h6">
                                A monetization layer for alpha
                            </Typography>
                            &nbsp;
                            <Link
                                to="https://medium.com/@freaticteam/introducing-murmur-leveraging-untapped-information-6e95b09a0032"
                                target="_blank"
                            >
                                <SkipButton
                                    component="span"
                                    text="Learn more"
                                    variant="h6"
                                />
                            </Link>
                        </Typography>
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        textAlign="center"
                        alignItems="center"
                        minHeight="60px"
                    >
                        {WELCOME_CONTENT_STEPS_CONDITIONS[welcomeContentKey]
                            ?.content || <CircularProgress />}
                    </Box>
                </Box>
            ),
        },
    };

    let contentKey = Object.keys(STEPS_CONDITIONS).find(
        (key) => STEPS_CONDITIONS[key].condition,
    );

    useEffect(() => {
        let timeout = null;
        if (!contentKey && !canRedirect) {
            // When deployed, we don't go through the privy onComplete if user is already connected
            // for this specific case, we redirect him after 2 sec if all steps are good
            timeout = setTimeout(() => {
                setCanRedirect(true);
            }, 2_000);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };
    }, [contentKey, canRedirect]);

    const fromLocation = searchParams.get("fromLocation");
    useEffect(() => {
        if (!contentKey && canRedirect) {
            navigate(fromLocation ?? ROUTES.FEED_MARKETPLACE, {
                replace: true,
            });
        }
    }, [
        navigate,
        contentKey,
        user?.wallet?.address,
        canRedirect,
        fromLocation,
    ]);

    let logo = (
        <Logo
            size="large"
            sx={{ justifySelf: "flex-end", textAlign: "center" }}
        />
    );

    return (
        <PageContainer showBackground sx={{ px: 2, py: 8 }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                flex={1}
                sx={{ height: "100%", width: "100%" }}
            >
                {![
                    "CHOOSE_FAVORITE_TOPIC_FOR_REFERRED_USER",
                    "REFERRAL_PROGRAM",
                ].includes(contentKey) && (
                    <Box
                        flex={1}
                        display="flex"
                        alignItems="flex-end"
                        justifyContent="center"
                    >
                        {logo}
                    </Box>
                )}
                <Box
                    flex={1}
                    mt={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                >
                    {STEPS_CONDITIONS[contentKey]?.content || "All done!"}
                </Box>
            </Box>
        </PageContainer>
    );
}
