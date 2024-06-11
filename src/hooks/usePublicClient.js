import { useMemo } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

import { getChainByStringID, getEnvDependentChain } from "src/chains";

let publicClients = {};

export default function usePublicClient(chainId, urlKey) {
    const chain = useMemo(() => {
        let memoizedChain;
        if (!chainId) {
            memoizedChain = getEnvDependentChain();
        } else {
            memoizedChain = getChainByStringID(chainId && `${chainId}`);
        }

        if (!memoizedChain) {
            memoizedChain = mainnet;
        }

        return memoizedChain;
    }, [chainId]);

    const effectiveChainId = chain.id;
    const instanceKey = `${effectiveChainId}${urlKey || ""}`;
    if (!publicClients[instanceKey]) {
        publicClients[instanceKey] = createPublicClient({
            chain,
            transport: urlKey ? http(chain.rpcUrls[urlKey].http[0]) : http(),
        });
    }

    return publicClients[instanceKey];
}
