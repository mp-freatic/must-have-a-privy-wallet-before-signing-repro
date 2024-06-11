import { BrowserProvider } from "ethers";
import { OpenSeaSDK } from "opensea-js";
import { useEffect, useState } from "react";

import useCurrentPrivyAccount from "src/hooks/useCurrentPrivyAccount";
import OpenseaClient from "src/services/opensea";

import { getEnvDependentChain } from "src/chains";

const useOpenseaClient = (murmurNFTContract) => {
    const embeddedWallet = useCurrentPrivyAccount();

    const [openseaClient, setOpenseaClient] = useState(null);

    useEffect(() => {
        async function initOpenseaClient() {
            const chainName = import.meta.env.VITE_OPENSEA_CHAIN_NAME;
            const API_KEY = import.meta.env.VITE_OPENSEA_API_KEY;
            const openseaCollectionSlug = import.meta.env
                .VITE_OPENSEA_COLLECTION_SLUG;
            const openseaLogger = (message) => {
                console.log("Murmur OpenseaLogger: ", message);
            };

            if (!chainName || !openseaCollectionSlug || !murmurNFTContract) {
                return;
            }

            const chain = getEnvDependentChain();
            embeddedWallet.switchChain(chain.id); // Force network switch so the ethers provider is on the good network
            const ethereum = await embeddedWallet.getEthereumProvider();
            const ethers6Provider = new BrowserProvider(ethereum);

            const openseaSDK = new OpenSeaSDK(
                ethers6Provider,
                {
                    chain: chainName,
                    apiKey: API_KEY,
                },
                openseaLogger,
            );
            const client = new OpenseaClient(
                murmurNFTContract.address,
                embeddedWallet.address,
                openseaCollectionSlug,
                openseaSDK,
            );
            setOpenseaClient(client);
        }

        if (!openseaClient && embeddedWallet.address) {
            initOpenseaClient();
        }
    }, [embeddedWallet, murmurNFTContract, openseaClient]);

    return openseaClient;
};

export default useOpenseaClient;
