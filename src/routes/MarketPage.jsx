import { Button, Stack, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useCurrentPrivyAccount from "src/hooks/useCurrentPrivyAccount";
import useMurmurContracts from "src/hooks/useMurmurContracts";
import useOpenseaClient from "src/hooks/useOpenseaClient";
import {
    getCollectionStats,
    getListings,
    selectMarketLoading,
    selectTopicListings,
    selectUserTokens,
    setFeedListings,
    setUserTokens,
} from "src/slices/marketSlice";

import LoadingWithLabel from "src/components/LoadingWithLabel";
import NFTMarketList from "src/components/NFTMarketList";
import Page from "src/components/Page";
import TipMessage from "src/components/TipMessage";

import { FEED_TABS } from "src/constants";
import store from "src/store";

// Shape of a token listing (to create fake data easily)
// {
//     tokenId: 1,
//     orderMaker: {
//         address: account.address,
//     },
//     currentPrice: (1 * 10) ^ 15,
//     orderHash: "hash1",
// },
export default function MarketPage() {
    const embeddedWallet = useCurrentPrivyAccount();
    const dispatch = useDispatch();
    const { contracts } = useMurmurContracts();
    const { murmurNFTContract } = contracts;
    const openseaClient = useOpenseaClient(murmurNFTContract);
    const userTokens = useSelector(selectUserTokens);
    const allListings = useSelector(selectTopicListings);
    const loading = useSelector(selectMarketLoading("market"));
    const [signature, setSignature] = useState();

    const tabs = FEED_TABS();
    const [currentTab, setCurrentTab] = useState(
        window.location.hash === `#${tabs.COUPONS.couponsForSaleTab}`
            ? tabs.COUPONS.couponsForSaleTab
            : tabs.COUPONS.userCouponsTab,
    );
    const nbOfCouponsOwned = userTokens.length;
    const nbOfCouponsForSale = allListings.length;

    function isCurrentTab(tabName) {
        return tabName === currentTab;
    }

    function tabBackgroundColor(tabName) {
        return isCurrentTab(tabName) ? "primary.main" : "primary.dark";
    }

    function tabColor(tabName) {
        return isCurrentTab(tabName) ? "white" : "primary.main";
    }

    const refresh = useCallback(async () => {
        await getListings(
            openseaClient,
            1,
            murmurNFTContract,
            1,
        )(dispatch, store.getState);
        dispatch(getCollectionStats(openseaClient));
    }, [dispatch, openseaClient, murmurNFTContract]);

    useEffect(() => {
        if (openseaClient) {
            refresh();

            return () => {
                dispatch(setUserTokens([]));
                dispatch(setFeedListings([]));
            };
        }
    }, [dispatch, openseaClient, refresh]);

    return (
        <Page sx={{ padding: 0 }} onRefresh={refresh}>
            <Button
                onClick={async () => {
                    const provider = await embeddedWallet.getEthereumProvider();
                    const messageToSign = new Date().getTime();
                    console.log(
                        `Signing ${messageToSign} with ${embeddedWallet.address}`,
                    );
                    const sig = await provider.request({
                        method: "personal_sign",
                        params: [`${messageToSign}`, embeddedWallet.address],
                    });
                    window.alert(`sig: ${sig}`);
                }}
            >
                Sign current timestamp
            </Button>
            <Tabs
                variant="fullWidth"
                value={currentTab}
                aria-label="Coupon marketplace tabs"
                indicatorColor="primary.main"
                onChange={(e, newValue) => setCurrentTab(newValue)}
                sx={{ px: 0 }}
            >
                <Tab
                    sx={{
                        backgroundColor: tabBackgroundColor(
                            tabs.COUPONS.userCouponsTab,
                        ),
                        color: tabColor(tabs.COUPONS.userCouponsTab),
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                    value={tabs.COUPONS.userCouponsTab}
                    label={`Coupons you own (${nbOfCouponsOwned})`}
                />
                <Tab
                    sx={{
                        backgroundColor: tabBackgroundColor(
                            tabs.COUPONS.couponsForSaleTab,
                        ),
                        color: tabColor(tabs.COUPONS.couponsForSaleTab),
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                    value={tabs.COUPONS.couponsForSaleTab}
                    label={`Coupons for sale (${nbOfCouponsForSale})`}
                />
            </Tabs>

            <Stack
                alignItems="center"
                sx={{
                    width: "100%",
                    overflow: "auto",
                }}
            >
                {!loading &&
                    isCurrentTab(tabs.COUPONS.userCouponsTab) &&
                    nbOfCouponsOwned === 0 && (
                        <TipMessage
                            sx={{ px: 2 }}
                            message={`Coupons are the fuel of the app. They are specific to a topic and can be: (1) acquired for free by revealing non-public posts to everyone, or (2) bought from others.`}
                            button={
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                        setCurrentTab(
                                            tabs.COUPONS.couponsForSaleTab,
                                        )
                                    }
                                >
                                    Go buy a coupon
                                </Button>
                            }
                        />
                    )}

                {isCurrentTab(tabs.COUPONS.userCouponsTab) &&
                    nbOfCouponsOwned > 0 && (
                        <NFTMarketList
                            tokens={userTokens}
                            topicId={1}
                            openseaClient={openseaClient}
                            murmurNFTContract={murmurNFTContract}
                        />
                    )}

                {!loading &&
                    isCurrentTab(tabs.COUPONS.couponsForSaleTab) &&
                    allListings.length === 0 && (
                        <TipMessage
                            sx={{ px: 2 }}
                            message={`Coupons can be bought and sold directly from the app. Not all coupons are equal as some offer more discount than others.`}
                            button={
                                nbOfCouponsOwned > 0 ? (
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            setCurrentTab(
                                                tabs.COUPONS.userCouponsTab,
                                            )
                                        }
                                    >
                                        List your coupons for sale
                                    </Button>
                                ) : null
                            }
                        />
                    )}

                {isCurrentTab(tabs.COUPONS.couponsForSaleTab) &&
                    allListings.length > 0 && (
                        <NFTMarketList
                            tokens={allListings}
                            topicId={1}
                            forSale
                            openseaClient={openseaClient}
                            murmurNFTContract={murmurNFTContract}
                        />
                    )}

                {loading && (
                    <LoadingWithLabel label="Fetching coupons information..." />
                )}
            </Stack>
        </Page>
    );
}
