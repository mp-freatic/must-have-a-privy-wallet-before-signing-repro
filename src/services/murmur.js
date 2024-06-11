/**
 * Should be used only for development testing purposes. Since MRMR-787 the tokens are fetched from the backend in normal environment.
 * @param murmurNFTDevContract
 * @param topicId
 * @param subscriberAddress
 * @returns {Promise<*|*[]>}
 */
export async function getSubscriberFeedTokensFromSmartContract(
    murmurNFTDevContract,
    topicId,
    subscriberAddress,
) {
    try {
        const tokenIds = await murmurNFTDevContract.read.getFeedTokens([
            topicId,
            subscriberAddress,
        ]);
        return tokenIds;
    } catch (error) {
        console.error("Error getting subscriber feed tokens:", error);
        return [];
    }
}

/**
 * Should be used only for development testing purposes. Since MRMR-787 the tokens are fetched from the backend in normal environment.
 * @param murmurNFTDevContract
 * @param topicId
 * @returns {Promise<*|*[]>}
 */
export async function getAllFeedTokensFromSmartContract(
    murmurNFTDevContract,
    topicId,
) {
    try {
        const tokenIds = await murmurNFTDevContract.read.getAllFeedTokens([
            topicId,
        ]);
        return tokenIds;
    } catch (error) {
        console.error("Error getting all feed tokens:", error);
        return [];
    }
}

export async function transferNFT(
    murmurNFTContract,
    accountAddress,
    recipientAddress,
    tokenId,
) {
    const tx = await murmurNFTContract.write.safeTransferFrom([
        accountAddress,
        recipientAddress,
        tokenId,
    ]);
    return tx;
}

export async function ownerOf(murmurNFTContract, tokenId) {
    return await murmurNFTContract.read.ownerOf([tokenId]);
}

export async function getTokensNumberIssued(
    murmurNFTContract,
    numberOfSubscribers,
) {
    const contractToCall = murmurNFTContract;

    return await contractToCall.read.tokenIssuance([numberOfSubscribers]);
}
