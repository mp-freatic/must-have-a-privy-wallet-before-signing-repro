import assert from "assert";

import { OPENSEA_EVENT_TYPE } from "src/constants";
import { waitFor } from "src/utils";

class OpenseaClient {
    constructor(nftAddress, currentAccountAddress, collectionSlug, openseaSDK) {
        this.nftAdddress = nftAddress;
        this.currentAccountAddress = currentAccountAddress;
        this.collectionSlug = collectionSlug;
        this.openseaSDK = openseaSDK;
        this.requestChunkSize = this.openseaSDK.api.pageSize;
        this.maxRetryCount = 3;
        this.lastRequestTimestamp = 0;
    }

    /**
     * Get collections stats*
     */
    async getCollectionStats() {
        try {
            await this.enforceRateLimiting();
            const stats = await this.openseaSDK.api.getCollectionStats(
                this.collectionSlug,
            );
            return stats;
        } finally {
            this.lastRequestTimestamp = Date.now();
        }
    }

    /**
     * Create a sell order for a token
     * @param tokenId The token ID
     * @param tokenOwner Address of the account selling the token
     * @param startAmountETH Sell price in ETH
     * @returns {Promise<void>}
     */
    async listToken(tokenId, startAmountETH) {
        try {
            // Expire this auction one month from now.
            // Note that we convert from the JavaScript timestamp (milliseconds):
            const expirationTimeInSec = Math.round(
                Date.now() / 1000 + 60 * 60 * 24 * 30,
            );
            try {
                await this.openseaSDK.createListing({
                    asset: {
                        tokenId,
                        tokenAddress: this.nftAdddress,
                    },
                    accountAddress: this.currentAccountAddress,
                    startAmount: startAmountETH,
                    expirationTime: expirationTimeInSec,
                });
            } catch (e) {
                if (
                    !String(e).includes(
                        "provider.waitForTransaction is not a function",
                    )
                ) {
                    // This error occurs for provider that do not support waitForTransaction
                    throw e;
                }
            }
        } catch (e) {
            throw e;
        }
    }

    async buy(tokenId, orderHash) {
        // To buy an item, you need to fulfill a sell order. To do that, it's just one call:
        const timestamp = Math.round(Date.now() / 1000);
        try {
            const order = await this.getListing(tokenId, orderHash);
            await waitFor(1000);
            await this.openseaSDK.fulfillOrder({
                order,
                accountAddress: this.currentAccountAddress,
            });
            const orderMakerAddress = order.maker.address.toLowerCase();
            const currentUserAddressToLowerCase =
                this.currentAccountAddress.toLowerCase();
            const eventFilterPredicate = (_event) =>
                _event.from_address === orderMakerAddress &&
                _event.to_address === currentUserAddressToLowerCase;
            await this.waitActionConfirmation(
                tokenId,
                timestamp,
                OPENSEA_EVENT_TYPE.TRANSFER,
                eventFilterPredicate,
            );
        } catch (e) {
            if (
                !String(e).includes(
                    "provider.waitForTransaction is not a function",
                )
            ) {
                if (this.isRateLimitingError(e)) {
                    throw new Error(
                        "Rate limiting error when trying to buy the NFT. Please try again later.",
                    );
                } else {
                    throw e;
                }
            }
        }
    }

    async cancelListing(tokenId, orderHash) {
        const timestamp = Math.round(Date.now() / 1000);
        try {
            const order = await this.getListing(tokenId, orderHash);
            await waitFor(1000);
            await this.openseaSDK.cancelOrder({
                order,
                accountAddress: this.currentAccountAddress,
            });
            const orderHashLowerCase = order.orderHash.toLowerCase();
            const eventFilterPredicate = (_event) =>
                _event.order_hash.toLowerCase() === orderHashLowerCase;
            await this.waitActionConfirmation(
                tokenId,
                timestamp,
                OPENSEA_EVENT_TYPE.CANCEL,
                eventFilterPredicate,
            );
        } catch (e) {
            if (
                // This error occurs for provider that do not support waitForTransaction
                !String(e).includes(
                    "provider.waitForTransaction is not a function",
                )
            ) {
                if (this.isRateLimitingError(e)) {
                    throw new Error(
                        "Rate limiting error when trying to cancel the NFT. Please try again later.",
                    );
                } else {
                    throw e;
                }
            }
        }
    }

    async getListing(tokenId, orderHash) {
        let retryCount = 0;
        while (retryCount < this.maxRetryCount) {
            try {
                const response = await this.openseaSDK.api.getOrders({
                    assetContractAddress: this.nftAdddress,
                    tokenId,
                    side: "ask",
                });
                const order = response.orders.find(
                    (order) => order.orderHash === orderHash,
                );
                return order;
            } catch (e) {
                if (this.isRateLimitingError(e)) {
                    retryCount++;
                    if (retryCount == this.maxRetryCount) {
                        throw e;
                    }
                    await waitFor(10_000 + retryCount * 1_000);
                } else {
                    throw e;
                }
            }
        }
    }

    /**
     *
     * @param tokenId
     * @param afterTimestamp
     * @param eventType {OPENSEA_EVENT_TYPE}
     * @returns {Promise<[*]>}
     */
    async getEvents(tokenId, afterTimestamp, eventType) {
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                "x-api-key": this.openseaSDK.api.apiKey,
            },
        };
        const rawResponse = await fetch(
            `${this.openseaSDK.api.apiBaseUrl}/api/v2/events/chain/${this.openseaSDK.chain}/contract/${this.nftAdddress}/nfts/${tokenId}?after=${afterTimestamp}&event_type=${eventType}`,
            options,
        );
        const response = await rawResponse.json();
        const events = response.asset_events;
        return events;
    }

    /**
     * Get all the listings for a list of token IDs
     * @param tokenIds List of token IDs
     * @param limit Max number of listings to return. Must be between 1 and 50.
     * @returns Tokens existing listings
     */
    async getAllOrders(tokenIds, limit = this.requestChunkSize) {
        if (tokenIds.length === 0) {
            console.warn("Not event calling opensea, no tokenids provided");
            return [];
        }
        const result = [];
        const numberOfChunks = Math.ceil(
            tokenIds.length / this.requestChunkSize,
        );
        await this.enforceRateLimiting();
        try {
            for (let i = 0; i < numberOfChunks; i++) {
                const start = i * this.requestChunkSize;
                const end = Math.min(
                    (i + 1) * this.requestChunkSize,
                    tokenIds.length,
                );
                const chunkTokenIds = tokenIds.slice(start, end);
                const chunkOrders = await this.getChunkOrders(
                    chunkTokenIds,
                    limit,
                );
                result.push(...chunkOrders);
                await waitFor(1_000);
            }
            return result;
        } finally {
            this.lastRequestTimestamp = Date.now();
        }
    }

    async getChunkOrders(tokenIds, limit = this.requestChunkSize) {
        if (tokenIds.length === 0) {
            return [];
        }
        let nextPageCursor = null;
        const result = [];
        do {
            const { next, orders } = await this.getOrdersWithRetry(
                tokenIds,
                nextPageCursor,
                limit,
            );
            nextPageCursor = next;
            result.push(...orders);
        } while (nextPageCursor != null);
        return result;
    }

    async getOrdersWithRetry(tokenIds, cursor, limit = this.requestChunkSize) {
        let retryCount = 0;
        while (retryCount < this.maxRetryCount) {
            try {
                const { next, orders } = await this.openseaSDK.api.getOrders({
                    assetContractAddress: this.nftAdddress,
                    tokenIds: tokenIds,
                    side: "ask",
                    cursor: cursor,
                    limit: limit,
                });
                const convertedListings = orders.map((order) =>
                    this.convertToAppModel(order),
                );
                return { next, orders: convertedListings };
            } catch (e) {
                if (this.isRateLimitingError(e)) {
                    retryCount++;
                    if (retryCount == this.maxRetryCount) {
                        throw e;
                    }
                    await waitFor(1_000 + retryCount * 1_000);
                } else {
                    throw e;
                }
            }
        }
    }

    async waitActionConfirmation(
        tokenId,
        afterTimestamp,
        eventType,
        eventFilterPredicate,
        timeoutMS = 30_000,
    ) {
        const startTimestamp = Date.now();
        while (true) {
            const events = await this.getEvents(
                tokenId,
                afterTimestamp,
                eventType,
            );
            const filtered = events.filter(eventFilterPredicate);
            if (filtered.length > 0) {
                return;
            }
            if (Date.now() - startTimestamp > timeoutMS) {
                throw new Error(
                    `Timeout waiting for token ${tokenId} ${eventType} confirmation event. But the action may still have succeeded.`,
                );
            }
            await waitFor(3_000);
        }
    }

    /**
     *
     * @param order
     * @returns {{listingTimestamp: number | BigNumber | string, makerFees: *, tokenId: string, creatorRoyalty: *, orderMaker: any, currentPrice: *, expirationTimestamp}}
     */
    convertToAppModel(order) {
        const result = {
            orderHash: order.orderHash,
            listingTimestamp: order.listingTime,
            expirationTimestamp: order.expirationTime,
            tokenId: Number(
                order.protocolData.parameters.offer[0].identifierOrCriteria,
            ),
            orderMaker: order.maker,
            currentPrice: order.currentPrice.toString(),
            makerFees: order.makerFees[0],
            creatorRoyalty: order.makerFees[1],
        };
        this.validateOrder(result);
        return result;
    }

    validateOrder(order) {
        assert(order.orderHash != null, "orderHash is null");
        assert(order.listingTimestamp != null, "listingTimestamp is null");
        assert(
            order.expirationTimestamp != null,
            "expirationTimestamp is null",
        );
        assert(order.tokenId != null, "tokenId is null");
        assert(order.orderMaker != null, "orderMaker is null");
        assert(order.currentPrice != null, "currentPrice is null");
        assert(order.makerFees != null, "marketFees is null");
    }

    isRateLimitingError(e) {
        if (!e) {
            return false;
        }
        if (
            e.reason &&
            e.reason.includes("missing response") &&
            e.requestBody == null
        ) {
            return true;
        }
        return false;
    }

    async enforceRateLimiting() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTimestamp;
        if (timeSinceLastRequest < 1_000) {
            await waitFor(1_000 - timeSinceLastRequest);
        }
    }
}

export default OpenseaClient;
