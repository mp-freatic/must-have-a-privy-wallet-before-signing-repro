import { Box, CircularProgress, Typography } from "@mui/material";

export default function LabeledCircularProgress({ label, ...props }) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <CircularProgress {...props} />
            {label && (
                <Typography sx={{ mt: 4, textAlign: "center" }}>
                    {label}
                </Typography>
            )}
        </Box>
    );
}
