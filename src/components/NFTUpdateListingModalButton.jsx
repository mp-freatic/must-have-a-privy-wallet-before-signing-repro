import { Stack, TextField, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { getListings, setMarketLoading } from "src/slices/marketSlice";

import CustomLoadingButton from "src/components/CustomLoadingButton";
import ModalButton from "src/components/ModalButton";
import NFTMarketStats from "src/components/NFTMarketStats";

import { CURRENCY_SYMBOL, MAX_MARKETPLACE_PRICE_DECIMALS } from "src/constants";
import { convertToCurrency, roundToDecimalsIfNeeded, waitFor } from "src/utils";

export default function NFTUpdateListingModalButton({
    icon,
    tokenId,
    listing,
    topicId,
    openseaClient,
    murmurNFTContract,
    ...props
}) {
    const dispatch = useDispatch();
    const theme = useTheme();

    const [listingPrice, setListingPrice] = useState(
        convertToCurrency(
            listing.currentPrice,
            CURRENCY_SYMBOL.WEI,
            CURRENCY_SYMBOL.ETH,
        ),
    );
    const [loadingAction, setLoadingAction] = useState(false);

    function resetState() {
        setListingPrice(
            convertToCurrency(
                listing.currentPrice,
                CURRENCY_SYMBOL.WEI,
                CURRENCY_SYMBOL.ETH,
            ),
        );
    }

    return (
        <ModalButton
            label={""}
            labelledby="update-or-remove-nft-for-sale-on-opensea"
            describedby="list-or-remove-your-nft-for-sale-for-other-users"
            startIcon={icon}
            onModalClose={resetState}
            {...props}
        >
            {({ handleClose }) => (
                <Stack spacing={2} sx={{ textAlign: "left" }}>
                    <Typography
                        sx={{
                            py: 1,
                            fontSize: 18,
                            fontWeight: 500,
                            color: "white",
                        }}
                    >
                        Change listing price
                    </Typography>
                    <TextField
                        sx={{
                            width: "100%",
                            input: {
                                fontSize: 18,
                                fontWeight: 800,
                            },
                        }}
                        id="listingPrice-field"
                        variant="outlined"
                        label={"Price in ETH"}
                        type="number"
                        value={listingPrice}
                        disabled={loadingAction}
                        onChange={(event) => {
                            setListingPrice(
                                roundToDecimalsIfNeeded(
                                    event.target.value,
                                    MAX_MARKETPLACE_PRICE_DECIMALS,
                                ),
                            );
                        }}
                        inputProps={{
                            step: "any",
                        }}
                        InputLabelProps={{
                            style: {
                                ...theme.typography?.body2,
                            },
                        }}
                    />
                    <NFTMarketStats
                        onPriceClick={(price) =>
                            setListingPrice(
                                roundToDecimalsIfNeeded(
                                    price,
                                    MAX_MARKETPLACE_PRICE_DECIMALS,
                                ),
                            )
                        }
                    />
                    <CustomLoadingButton
                        sx={{
                            mb: 10,
                        }}
                        disabled={
                            !listingPrice ||
                            Number(listingPrice) === 0 ||
                            Number(listingPrice) ===
                                Number(
                                    convertToCurrency(
                                        listing.currentPrice,
                                        CURRENCY_SYMBOL.WEI,
                                        CURRENCY_SYMBOL.ETH,
                                    ),
                                )
                        }
                        loading={loadingAction}
                        onClick={async () => {
                            try {
                                setLoadingAction(true);
                                if (
                                    Number(listingPrice) !==
                                    Number(listing.currentPrice)
                                ) {
                                    await openseaClient.cancelListing(
                                        tokenId,
                                        listing.orderHash,
                                    );
                                    await waitFor(1000);
                                    await openseaClient.listToken(
                                        tokenId,
                                        listingPrice,
                                    );

                                    await waitFor(1000);
                                }
                            } catch (e) {
                                setMarketLoading("market", false);
                                console.error(
                                    "Error when updating the NFT listing",
                                    e,
                                );
                            } finally {
                                setLoadingAction(false);
                                handleClose();
                                // In some cases, the API transaction on Opensea may work but end up in error.
                                // A refresh in the "finally" block will allow to present a view in conformity with the final state of the NFT on Opensea.
                                dispatch(
                                    getListings(
                                        openseaClient,
                                        topicId,
                                        murmurNFTContract,
                                    ),
                                );
                            }
                        }}
                    >
                        Update
                    </CustomLoadingButton>
                </Stack>
            )}
        </ModalButton>
    );
}
