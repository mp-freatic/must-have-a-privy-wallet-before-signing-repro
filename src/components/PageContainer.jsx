import { Box, Grid, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";

import Header from "src/components/Header";

import { LAYOUT, ROUTES } from "src/constants";

export default function PageContainer({
    showBackground = false,
    showHeader = false,
    children,
    sx = {},
    ...props
}) {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
    const location = useLocation();
    const isOnboarding = location.pathname === ROUTES.START;
    const isIOS =
        isMobile &&
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

    const responsiveStyle = {
        marginLeft: isTablet
            ? `calc((100vw - ${LAYOUT.NAVBAR.WIDTH}px) / 2))`
            : "0px",
        maxWidth:
            !isMobile && !isOnboarding
                ? `${LAYOUT.MAIN_CONTENT.MAX_WIDTH}px`
                : "100%",

        ...(showBackground && {
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 100%), url("/img/background.svg")`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
        }),
    };

    const containerHeight =
        isIOS && !showBackground
            ? `calc(100vh - env(safe-area-inset-bottom))`
            : "100vh";

    return (
        <>
            <Grid
                container
                sx={{
                    height: containerHeight,
                    position: "relative",
                    overflow: "auto",
                }}
                {...props}
            >
                <Grid item xs>
                    <Box
                        sx={{
                            ...responsiveStyle,
                            height: "100%",
                            position: "relative",
                            margin: "auto",
                            ...sx,
                        }}
                    >
                        <Stack
                            sx={{
                                height: "100%",
                                maxHeight: "100vh",
                            }}
                        >
                            {showHeader && <Header isMobile={isMobile} />}
                            <Box
                                flex={1}
                                sx={{
                                    overflow: "auto",
                                }}
                            >
                                {children}
                            </Box>
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}
