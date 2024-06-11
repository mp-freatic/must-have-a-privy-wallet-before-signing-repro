import { base } from "viem/chains";

import { CURRENCY_SYMBOL } from "src/constants";

export const baseSepolia = {
    id: 84532,
    name: "Base Sepolia",
    network: "baseSepolia",
    nativeCurrency: {
        decimals: 18,
        name: "Ethereum",
        symbol: CURRENCY_SYMBOL.ETH,
    },
    rpcUrls: {
        public: {
            http: [
                "https://base-sepolia.g.alchemy.com/v2/PQ4kCacRvUa9l3N-1i4DskAe-FH_VZUI",
            ],
        },
        dev: {
            http: ["https://sepolia.base.org"],
        },
        default: {
            http: [
                "https://base-sepolia.g.alchemy.com/v2/PQ4kCacRvUa9l3N-1i4DskAe-FH_VZUI",
            ],
        },
    },
    contracts: {},
};

export function getChainByStringID(id) {
    switch (id) {
        case "84532":
            return baseSepolia;
        default:
            return null;
    }
}

export function getEnvDependentChain() {
    return getChainByStringID(import.meta.env.VITE_CHAIN_ID);
}

export const getExtraEnvChains = () => {
    const extraChains = [];

    const chain = getEnvDependentChain();
    if (chain !== base) {
        extraChains.push(chain);
    }

    return extraChains;
};

export function getDefaultChains() {
    const defaultChains = [getEnvDependentChain()];

    return defaultChains;
}
