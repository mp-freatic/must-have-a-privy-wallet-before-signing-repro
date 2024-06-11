import { Stack, Typography } from "@mui/material";

export default function TipMessage({
    message,
    button = null,
    color = "secondary",
    textAlign = "center",
    typographyProps = {},
    ...props
}) {
    return (
        <Stack gap={2} {...props} sx={{ pt: 2, ...props.sx }}>
            <Typography
                color={color}
                textAlign={textAlign}
                {...typographyProps}
            >
                <strong>Tip</strong>: {message}
            </Typography>
            {button}
        </Stack>
    );
}
