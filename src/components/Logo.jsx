import { Typography } from "@mui/material";

export default function Logo({ size = "normal", text = "murmur", ...props }) {
    let variantDependingOnSize;

    switch (size) {
        case "large":
            variantDependingOnSize = "h3";
            break;
        case "small":
            variantDependingOnSize = "h7";
            break;
        default:
            variantDependingOnSize = "h5";
            break;
    }

    return (
        <Typography
            variant={variantDependingOnSize}
            color="white.main"
            fontWeight="bold"
            fontSize={40}
            height={40}
            lineHeight={`30px`}
            {...props}
        >
            {text}
        </Typography>
    );
}
