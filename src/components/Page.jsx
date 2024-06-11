import { Container, Stack } from "@mui/material";
import React from "react";
import PullToRefresh from "react-simple-pull-to-refresh";

export default function Page({
    before,
    children,
    title,
    onRefresh,
    sx = {},
    containerSx = {},
    ...props
}) {
    let content = (
        <Stack
            {...props}
            sx={{
                padding: 2,
                paddingTop: 0,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                ...sx,
            }}
        >
            {children}
        </Stack>
    );

    if (onRefresh) {
        content = (
            <PullToRefresh
                onRefresh={onRefresh}
                className="pull-to-refresh-custom"
            >
                {content}
            </PullToRefresh>
        );
    }

    return (
        <Container
            disableGutters
            sx={{
                padding: 0,
                height: "100%",
                ...containerSx,
            }}
        >
            {before}
            {content}
        </Container>
    );
}
