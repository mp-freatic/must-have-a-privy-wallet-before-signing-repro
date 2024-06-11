import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setCurrentUserWalletAddress } from "src/slices/authSlice";

const defaultEmptyWallet = {};

export default function useCurrentPrivyAccount() {
    const dispatch = useDispatch();
    const { ready, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const [currentPrivyWallet, setCurrentPrivyWallet] = useState();

    useEffect(() => {
        if (ready && authenticated) {
            const embeddedWallet = wallets.find(
                (wallet) => wallet.walletClientType === "privy",
            );

            if (embeddedWallet) {
                dispatch(setCurrentUserWalletAddress(embeddedWallet.address));
                setCurrentPrivyWallet(embeddedWallet);
            }
        }
    }, [dispatch, ready, authenticated, wallets]);

    return currentPrivyWallet || defaultEmptyWallet;
}
