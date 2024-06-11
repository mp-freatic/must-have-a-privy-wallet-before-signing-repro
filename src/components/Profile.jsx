import { CircularProgress, Stack, Typography } from "@mui/material";

import AddressDisplay from "src/components/AddressDisplay";
import AvatarWithBadge from "src/components/AvatarWithBadge";
import SocialNetworkLink from "src/components/SocialNetworkLink";

import { getShortenedAddress } from "src/utils";

export default function Profile({
    address = null,
    addSocialLinkOnLabel = false,
    profile = null,
    showAvatar = true,
    showName = true,
    showUsername = false,
    showAddress = false,
    labelProps = {},
    avatarSize = null,
    labelPrefix = null,
    labelSuffix = null,
    leftArea = null,
    rightArea = null,
    badgeComponent = undefined,
    ...props
}) {
    const profileToDisplay = profile || {
        name: address,
        pictureUrl: null,
        username: getShortenedAddress(address),
    };

    let labelToDisplay = "";
    if (profileToDisplay) {
        const name = showName ? profileToDisplay?.name : "";
        const username = showUsername ? `@${profileToDisplay?.username}` : "";
        labelToDisplay = `${name}${name && username ? " " : ""}${username}`;
    }

    let labelContent;
    if (labelToDisplay) {
        labelContent = (
            <Stack direction="row" alignItems="center">
                {typeof labelPrefix === "object" && labelPrefix}
                <Typography variant="h7" noWrap {...labelProps}>
                    {typeof labelPrefix === "string" && labelPrefix}
                    {labelToDisplay}
                </Typography>
                {labelSuffix}
            </Stack>
        );

        if (addSocialLinkOnLabel) {
            labelContent = (
                <SocialNetworkLink
                    username={profileToDisplay.username}
                    socialNetworkType={profileToDisplay.socialNetworkType}
                >
                    {labelContent}
                </SocialNetworkLink>
            );
        }
    }

    return (
        <Stack direction="row" alignItems="center" gap={1} {...props}>
            {leftArea}
            {!profileToDisplay ? (
                <CircularProgress />
            ) : (
                <>
                    <SocialNetworkLink
                        tabIndex={-1}
                        username={profileToDisplay.username}
                        socialNetworkType={profileToDisplay.socialNetworkType}
                    >
                        {showAvatar && (
                            <AvatarWithBadge
                                profile={profileToDisplay}
                                avatarSize={avatarSize}
                                badgeComponent={badgeComponent}
                            />
                        )}
                    </SocialNetworkLink>
                    {(labelContent || showAddress) && (
                        <Stack
                            minWidth="4rem"
                            maxWidth="100%"
                            gap={0.5}
                            flex={1}
                        >
                            {labelContent}
                            {showAddress && (
                                <AddressDisplay
                                    address={address}
                                    shorten
                                    copyable
                                />
                            )}
                        </Stack>
                    )}
                </>
            )}
            {rightArea}
        </Stack>
    );
}
