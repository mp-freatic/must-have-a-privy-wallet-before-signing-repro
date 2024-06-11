import { useSelector } from "react-redux";

import { selectProfile } from "src/slices/profileSlice";

import AddressDisplay from "src/components/AddressDisplay";
import SocialNetworkLink from "src/components/SocialNetworkLink";

export default function NFTOwnerDisplay({ address }) {
    const nftOwnerProfile = useSelector(selectProfile(address));

    if (nftOwnerProfile) {
        const name = nftOwnerProfile?.name;
        const username = nftOwnerProfile?.username
            ? `@${nftOwnerProfile?.username}`
            : undefined;
        return (
            <SocialNetworkLink
                username={nftOwnerProfile.username}
                socialNetworkType={nftOwnerProfile.socialNetworkType}
                sx={{ textDecoration: "underline", display: "inline-flex" }}
            >
                <strong>{name ?? username}</strong>
            </SocialNetworkLink>
        );
    } else if (address) {
        return (
            <AddressDisplay
                address={address}
                shorten
                showLink
                sx={{ display: "inline-flex" }}
            />
        );
    }
    return null;
}
