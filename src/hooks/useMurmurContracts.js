import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    BaseError,
    createWalletClient,
    custom,
    decodeErrorResult,
    getContract,
} from "viem";

import useCurrentPrivyAccount from "src/hooks/useCurrentPrivyAccount";
import usePublicClient from "src/hooks/usePublicClient";

import { getEnvDependentChain } from "src/chains";

export class ArtifactError extends Error {}

export class BadNetworkError extends Error {}

export async function fechArtifact(url) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    if (response.status !== 200) {
        throw new ArtifactError("Could not load contract artifact");
    }

    const json = await response.json();

    if (!json.deployedAddress) {
        throw new ArtifactError(
            `Could not get contract address from artifact from ${url}`,
        );
    }

    return json;
}

const improveContractWithErrorParsingBeforeThrow = (contract) => {
    try {
        const handler = {
            get(target, prop, receiver) {
                return async (...args) => {
                    try {
                        return await target[prop](...args);
                    } catch (error) {
                        let errorToThrow = error;
                        if (error instanceof BaseError && error.details) {
                            // This error parsing works only when the gas estimation fails
                            // if a transaction is reverted during the execution, there is no way to get the reverted reason (at least for now)
                            // see https://nalyze.atlassian.net/browse/MRMR-791?focusedCommentId=11669 for more details
                            try {
                                const regex = new RegExp(
                                    `(?<=error=)(.*)(?=})`,
                                );
                                const errorObjectAsString =
                                    error.details.match(regex)?.[0];
                                if (errorObjectAsString) {
                                    const parsedError = JSON.parse(
                                        `${errorObjectAsString}}`,
                                    );
                                    let decodedError;
                                    if (
                                        typeof parsedError.error?.data ===
                                        "string"
                                    ) {
                                        // Once deployed parsedError.error?.data = "0x..."
                                        decodedError = decodeErrorResult({
                                            abi: contract.abi,
                                            data: parsedError.error.data,
                                        });
                                    } else if (
                                        typeof parsedError.error?.data?.data ===
                                        "string"
                                    ) {
                                        // In local, parsedError.error?.data is directly something like:
                                        // { data: "0x...", message: "Error: VM Exception while processing transaction: reverted with custom error 'DuplicateMessage(\"0x3d8117581e40c657dd418305bcef16483037a82047baee3b0d055d8aa24ba7b3\")'" }
                                        decodedError = decodeErrorResult({
                                            abi: contract.abi,
                                            data: parsedError.error.data.data,
                                        });
                                    }
                                    if (decodedError) {
                                        // You can find a list of all possible viem error names here : https://viem.sh/docs/glossary/errors.html#errors
                                        errorToThrow = new Error(
                                            `${error.name}: ${decodedError.errorName}`,
                                        );
                                        errorToThrow.decodedError =
                                            JSON.stringify(
                                                decodedError,
                                                (key, value) =>
                                                    typeof value === "bigint"
                                                        ? value.toString()
                                                        : value,
                                            );
                                    }
                                } else {
                                    const regexToGetTransactionHash =
                                        new RegExp(
                                            `(?<=transactionHash=")([^,]*)(?=",)`,
                                        );
                                    const transactionHash = error.details.match(
                                        regexToGetTransactionHash,
                                    )?.[0];
                                    if (error.shortMessage && error.name) {
                                        errorToThrow = new Error(
                                            `${error.name}: ${error.shortMessage}`,
                                        );
                                        errorToThrow.hash = transactionHash;
                                    }
                                }
                            } catch (error) {
                                console.error(
                                    "Error trying to parse error log",
                                    error,
                                );
                            }
                        }
                        errorToThrow.fullError = error;
                        throw errorToThrow;
                    }
                };
            },
        };
        if (contract.read) {
            contract.read = new Proxy(contract.read, handler);
        }
        if (contract.write) {
            contract.write = new Proxy(contract.write, handler);
        }
        return contract;
    } catch (e) {
        console.error("Could not enhance contract", e, contract);
        return contract;
    }
};

export async function getContractFromJson({
    jsonArtifact,
    contractAddress,
    publicClient,
    walletClient,
}) {
    const _contract = getContract({
        address: contractAddress
            ? contractAddress
            : jsonArtifact.deployedAddress,
        abi: jsonArtifact.abi,
        publicClient,
        walletClient,
    });

    _contract.deployBlockNumber = jsonArtifact.deployBlockNumber;
    _contract.publicClient = publicClient;

    if (_contract.provider) {
        const contractCode = await _contract.provider.getCode(
            jsonArtifact.deployedAddress,
        );
        if (contractCode === "0x") {
            throw new BadNetworkError(
                "Could not get contract code from this network",
            );
        }
    }

    return _contract;
}

const useMurmurContracts = () => {
    const dispatch = useDispatch();
    const [jsonArtifacts, setJSONArtifacts] = useState();
    const [contracts, setContracts] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const embeddedWallet = useCurrentPrivyAccount();
    const privyHasWallet = Boolean(
        embeddedWallet?.address && embeddedWallet?.getEthereumProvider,
    );
    const publicClient = usePublicClient();
    const nftDevPublicClient = usePublicClient(
        import.meta.env.VITE_NFT_DEV_CHAIN_ID,
        import.meta.env.VITE_NFT_DEV_CHAIN_ID ? "dev" : undefined,
    );

    useEffect(() => {
        async function fetchArtifacts() {
            try {
                const murmurNFTJson = await fechArtifact(
                    import.meta.env.VITE_NFT_CONTRACT_URL,
                );

                setJSONArtifacts({
                    murmurNFTJson,
                });
            } catch (e) {
                console.error(e);
                setError(
                    `${e.message}.\nThe team has been informed!\nPlease come back and retry later.`,
                );
            } finally {
                setLoading(false);
            }
        }

        fetchArtifacts();
    }, []);

    const refreshContracts = useCallback(async () => {
        if (!jsonArtifacts) {
            console.warn(
                "Skipping refreshContracts while waiting for artifacts",
            );
            return;
        }
        setError(null);
        try {
            setLoading(true);

            let walletClient;
            if (privyHasWallet) {
                const provider = await embeddedWallet.getEthereumProvider();
                const chain = getEnvDependentChain();
                // Override wrong chainId in provider seems to do the trick
                if (provider.chainId !== chain.id) {
                    provider.chainId = chain.id;
                }

                walletClient = createWalletClient({
                    chain,
                    transport: custom(provider),
                    account: embeddedWallet,
                });
            }

            const { murmurNFTJson } = jsonArtifacts;
            const murmurNFTContract = await getContractFromJson({
                jsonArtifact: murmurNFTJson,
                publicClient,
                walletClient,
            });

            if (!murmurNFTContract) {
                throw Error("Could not load contract(s)");
            }
            setContracts({
                murmurNFTContract:
                    improveContractWithErrorParsingBeforeThrow(
                        murmurNFTContract,
                    ),
            });
        } catch (e) {
            setError(e);
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [jsonArtifacts, privyHasWallet, embeddedWallet, publicClient]);

    useEffect(() => {
        refreshContracts();
    }, [dispatch, privyHasWallet, refreshContracts]);

    return {
        contracts,
        error,
        loading,
    };
};

export default useMurmurContracts;
