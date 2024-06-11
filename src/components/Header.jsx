import { Box, useTheme } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { selectIsConnected } from "src/slices/authSlice";

import Logo from "src/components/Logo";
import UserBalances from "src/components/UserBalances";

import { ROUTES } from "src/constants";

export default function Header({ children = null }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const body = document.querySelector("body");

    const isConnected = useSelector(selectIsConnected);

    let backgroundColor = "background";
    let title = (
        <Box
            sx={{
                alignItems: "flex-start",
                flex: 1,
            }}
        >
            <Button
                onClick={() =>
                    navigate(isConnected ? ROUTES.HOME : ROUTES.START)
                }
                sx={{
                    padding: 0,
                }}
            >
                <Logo />
            </Button>
        </Box>
    );

    let rightItem = (
        <UserBalances
            showCurrentUserAvatar={
                import.meta.env.VITE_ENABLED_MULTI_TOPICS_TABS !== "true"
            }
            onTopic
        />
    );

    // Status bar color handling on iOS
    if (true) {
        body.setAttribute(
            "style",
            `background-color: ${theme.palette.primary.dark}`,
        );
    } else {
        body.removeAttribute("style");
    }

    let content = children;

    if (!content) {
        content = (
            <>
                <Box
                    flex={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    pt={3}
                    pb={1}
                >
                    {title}
                    {rightItem}
                </Box>
            </>
        );
    }

    return (
        <AppBar
            position={"relative"}
            component="nav"
            color={backgroundColor}
            style={{
                boxShadow: "none",
            }}
        >
            {content}
        </AppBar>
    );
}
