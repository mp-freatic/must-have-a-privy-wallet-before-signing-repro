import { Box, Typography } from "@mui/material";

export default function ErrorMessage({ message, ...props }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Typography
                color="error"
                sx={{ display: "flex", alignItems: "center" }}
                fontSize={10}
                {...props}
            >
                {message}
            </Typography>
        </Box>
    );
}
