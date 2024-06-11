import VerifiedIcon from "@mui/icons-material/Verified";
import { Avatar, Box, CircularProgress } from "@mui/material";

import { getAvatarNameComponentPropsFromString } from "src/utils";

// 0.4 to make it 8px for a size of 20
const BADGE_RATIO = 0.4;

export default function AvatarWithBadge({
    profile,
    avatarSize = 25,
    loading = false,
    showBadge = true,
    badgeComponent,
    sx = {},
    onClick,
}) {
    let BadgeComponent = VerifiedIcon;
    if (badgeComponent || badgeComponent === null) {
        BadgeComponent = badgeComponent;
    }

    const badgeSize = BADGE_RATIO * avatarSize;

    const publisherStatus = false;

    return (
        <Box sx={{ position: "relative", ...sx }} onClick={onClick}>
            <Avatar
                alt={profile?.name}
                src={profile?.pictureUrl}
                size={avatarSize}
                {...(profile &&
                !profile.pictureUrl &&
                (profile.name ?? profile.username)
                    ? getAvatarNameComponentPropsFromString(
                          profile.name ?? profile.username,
                      )
                    : {})}
            />
            <Box
                sx={{
                    position: "absolute",
                    lineHeight: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                {loading ? (
                    <CircularProgress size={badgeSize} color="white" />
                ) : null}
                {!loading &&
                    showBadge &&
                    publisherStatus?.isVerified &&
                    BadgeComponent && (
                        <Box
                            sx={{
                                width: badgeSize / 2,
                                height: badgeSize / 2,
                                background: "black",
                                borderRadius: avatarSize,
                                position: "relative",
                            }}
                        >
                            <BadgeComponent
                                sx={{
                                    color: "yellow.main",
                                    fontSize: badgeSize,
                                    position: "absolute",
                                    left: -badgeSize / 4,
                                    top: -badgeSize / 4,
                                }}
                            />
                        </Box>
                    )}
            </Box>
        </Box>
    );
}
