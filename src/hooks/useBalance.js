import { useCallback, useEffect, useState } from "react";

import usePublicClient from "src/hooks/usePublicClient";

export default function useBalance({
    address,
    chainId,
    fetchInterval = null, // interval value if need to fetch the data periodically
}) {
    const publicClient = usePublicClient(chainId);
    const [balance, setBalance] = useState();

    const fetchBalance = useCallback(
        async (address) => {
            try {
                const balance = await publicClient.getBalance({ address });
                setBalance(balance.toString());
                return balance;
            } catch (e) {
                console.error(`Cannot get balance from ${address}`, e);
            }
        },
        [publicClient],
    );

    useEffect(() => {
        if (address) {
            fetchBalance(address);
            let interval;
            if (fetchInterval) {
                interval = setInterval(
                    () => fetchBalance(address),
                    fetchInterval,
                );
            }
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        } else {
            console.warn("No address provided, not doing anything");
        }
    }, [address, fetchBalance, fetchInterval]);

    return { balance, refetch: () => fetchBalance(address) };
}
