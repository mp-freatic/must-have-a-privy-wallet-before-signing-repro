import { Link } from "@mui/material";

import { TWITTER_BASE_URL, WARPCAST_BASE_URL } from "src/constants";

export default function SocialNetworkLink({
    username,
    socialNetworkType,
    children,
    ...props
}) {
    const socialNetworkLink = `${
        socialNetworkType === "farcaster" ? WARPCAST_BASE_URL : TWITTER_BASE_URL
    }/${username}`;
    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={socialNetworkLink}
            {...props}
            sx={{
                textDecoration: "none",
                color: "inherit",
                ...props.sx,
            }}
        >
            {children}
        </Link>
    );
}
