import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Typography } from "@mui/material";

export default function SkipButton({
    text = "Skip",
    showArrow = true,
    sx = {},
    ...props
}) {
    return (
        <Typography
            color="secondary"
            sx={{
                textDecoration: "underline",
                mt: 1,
                cursor: "pointer",
                "&:hover": {
                    textDecoration: "none",
                },
                ...sx,
            }}
            {...props}
        >
            {text}
            {showArrow && (
                <ArrowForwardIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle" }}
                />
            )}
        </Typography>
    );
}
