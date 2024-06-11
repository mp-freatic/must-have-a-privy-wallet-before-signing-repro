import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import difference from "lodash.difference";

import {
    getAllFeedTokensFromSmartContract,
    getSubscriberFeedTokensFromSmartContract,
} from "src/services/murmur";
import OpenseaClient from "src/services/opensea";

import { AppDispatch, RootState } from "src/store";
import { ContractType, TokenListingType } from "src/types/extraTypes";

type LoadingTypes = "market";

interface IMarketState {
    userTokens: Array<TokenListingType | number>;
    feedListings: Array<TokenListingType | number>;
    floorPrice: string;
    averagePrice: string;
    loading: Record<LoadingTypes, boolean>;
}

export const marketSlice = createSlice({
    name: "market",
    initialState: {
        userTokens: [],
        feedListings: [],
        floorPrice: "",
        averagePrice: "",
        loading: {
            market: false,
        },
    } as IMarketState,
    reducers: {
        setUserTokens: (
            state,
            { payload }: PayloadAction<Array<TokenListingType | number>>,
        ) => {
            state.userTokens = payload;
        },
        setFeedListings: (
            state,
            { payload }: PayloadAction<Array<TokenListingType | number>>,
        ) => {
            state.feedListings = payload;
        },
        setFloorPrice: (state, { payload }: PayloadAction<string>) => {
            state.floorPrice = payload;
        },
        setAveragePrice: (state, { payload }: PayloadAction<string>) => {
            state.averagePrice = payload;
        },
        setMarketLoading: (
            state,
            {
                payload: { type, status },
            }: PayloadAction<{ type: LoadingTypes; status: boolean }>,
        ) => {
            state.loading[type] = status;
        },
    },
});

export const {
    setUserTokens,
    setFeedListings,
    setFloorPrice,
    setAveragePrice,
    setMarketLoading,
} = marketSlice.actions;

export const getCollectionStats =
    (openseaClient: OpenseaClient | null) => async (dispatch: AppDispatch) => {
        try {
            const stats = await openseaClient?.getCollectionStats();
            dispatch(setFloorPrice(stats.total?.floor_price?.toString()));
            dispatch(setAveragePrice(stats.total?.average_price?.toString()));
        } catch (e) {
            console.error("Error when getting collection stats: ", e);
        }
    };

export const getListings =
    (
        openseaClient: OpenseaClient | null,
        topicId: number,
        murmurNFTDevContract: ContractType | null,
    ) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const { currentUserWalletAddress } = getState().auth;
        if (!currentUserWalletAddress) {
            dispatch(setUserTokens([]));
            return;
        }

        dispatch(setMarketLoading({ type: "market", status: true }));
        try {
            const allFeedTokensIds: number[] =
                murmurNFTDevContract == null
                    ? await getAllFeedTokens(topicId)
                    : await getAllFeedTokensFromSmartContract(
                          murmurNFTDevContract,
                          topicId,
                      );

            const userTokenIds: number[] =
                murmurNFTDevContract == null
                    ? await getSubscriberFeedTokens(
                          topicId,
                          currentUserWalletAddress,
                      )
                    : await getSubscriberFeedTokensFromSmartContract(
                          murmurNFTDevContract,
                          topicId,
                          currentUserWalletAddress,
                      );

            const userTokenIdsToNumbers = userTokenIds.map((feedToken) =>
                Number(feedToken),
            );

            const allFeedTokenIdsToNumbers = allFeedTokensIds.map((feedToken) =>
                Number(feedToken),
            );

            //  Shape of a token listing:
            // {
            //     "orderHash": "0xc49c5a8922391da1e7463fa6eeb96eafdfc59326449c467dc9adb6788daa1bc0",
            //     "listingTimestamp": 1715678194,
            //     "expirationTimestamp": 1718270194,
            //     "tokenId": 12,
            //     "orderMaker": {
            //         "address": "0xb498f13113328dd6b078a677326decf50d81ccf0",
            //         "socialMediaAccounts": {}
            //     },
            //     "currentPrice": "5362383250000000",
            //     "makerFees": {
            //         "account": {
            //             "address": "0x0000a26b00c1f0df003000390027140000faa719",
            //             "socialMediaAccounts": {}
            //         },
            //         "basisPoints": "250"
            //     }
            // }
            if (openseaClient) {
                const listings = (await openseaClient.getAllOrders(
                    allFeedTokenIdsToNumbers,
                )) as unknown as TokenListingType[];
                const serializableListings = listings.map((listing) => {
                    return makeSerializable(listing);
                });

                const userListings = serializableListings.filter(
                    (listing) =>
                        listing.orderMaker.address.toLowerCase() ===
                        currentUserWalletAddress.toLowerCase(),
                );
                const userListedTokenIds = userListings.map((listing) =>
                    Number(listing.tokenId),
                );
                const userNonListedTokenIds = difference(
                    userTokenIdsToNumbers,
                    userListedTokenIds,
                );
                const userTokens: Array<TokenListingType | number> =
                    userNonListedTokenIds.concat(userListings);
                // Descending order by tokenId
                userTokens.sort(
                    (tokenA, tokenB) =>
                        ((tokenB as TokenListingType).tokenId ?? tokenB) -
                        ((tokenA as TokenListingType).tokenId ?? tokenA),
                );

                dispatch(setUserTokens(userTokens));
                dispatch(setFeedListings(serializableListings));
            }
        } catch (e) {
            console.error("Error when getting listings: ", e);
        } finally {
            dispatch(setMarketLoading({ type: "market", status: false }));
        }
    };

export function selectUserTokens(state: RootState) {
    return state.market.userTokens || [];
}

export function selectTopicListings(state: RootState) {
    return state.market.feedListings || [];
}

export function selectFloorPrice(state: RootState) {
    return state.market.floorPrice;
}

export function selectAveragePrice(state: RootState) {
    return state.market.averagePrice;
}

export function selectMarketLoading(type: LoadingTypes) {
    return function selectLoadingFromState(state: RootState) {
        return state.market.loading[type];
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeSerializable = (object: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(object).reduce((result: any, key) => {
        if (Number.isNaN(parseInt(key))) {
            const value = object[key];
            if (value?._isBigNumber) {
                // If it's a BigInt, this will probably work
                try {
                    result[key] = value.toNumber();
                } catch (e) {
                    result[key] = value.toString();
                }
            } else if (typeof value === "bigint") {
                result[key] = value.toString();
            } else if (typeof value === "object") {
                result[key] = makeSerializable(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }, {});
};

export default marketSlice.reducer;
