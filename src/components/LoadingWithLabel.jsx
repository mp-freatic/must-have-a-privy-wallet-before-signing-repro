import { CircularProgress, Stack, Typography } from "@mui/material";

export default function LoadingWithLabel({ label, ...props }) {
    return (
        <Stack gap={1} mt={1} mb={2} alignItems="center">
            <CircularProgress />
            <Typography {...props}>{label}</Typography>
        </Stack>
    );
}
