import { useSelector } from "react-redux";

import { selectCurrentUserWalletAddress } from "src/slices/authSlice";

export default function useIsCurrentUser(address) {
    const currentUserWalletAddress = useSelector(
        selectCurrentUserWalletAddress,
    );

    return (
        currentUserWalletAddress &&
        address &&
        address.toLowerCase() === currentUserWalletAddress.toLowerCase()
    );
}
