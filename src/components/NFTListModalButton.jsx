import { Stack, TextField, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getListings, selectAveragePrice } from "src/slices/marketSlice";

import CustomLoadingButton from "src/components/CustomLoadingButton";
import ModalButton from "src/components/ModalButton";
import NFTMarketStats from "src/components/NFTMarketStats";

import { MAX_MARKETPLACE_PRICE_DECIMALS } from "src/constants";
import {
    messageWithoutErrorPrefix,
    roundToDecimalsIfNeeded,
    waitFor,
} from "src/utils";

export default function NFTListModalButton({
    icon,
    tokenId,
    topicId,
    openseaClient,
    murmurNFTContract,
    ...props
}) {
    const dispatch = useDispatch();

    const theme = useTheme();

    const averagePrice = useSelector(selectAveragePrice);

    const [listingPrice, setListingPrice] = useState(
        roundToDecimalsIfNeeded(averagePrice, MAX_MARKETPLACE_PRICE_DECIMALS),
    );
    const [loadingAction, setLoadingAction] = useState(false);
    const validInput = listingPrice && Number(listingPrice) > 0;

    useEffect(() => {
        setListingPrice(
            roundToDecimalsIfNeeded(
                averagePrice,
                MAX_MARKETPLACE_PRICE_DECIMALS,
            ),
        );
    }, [averagePrice]);

    return (
        <ModalButton
            label={""}
            labelledby="list-nft-for-sale-for-1-month-on-opensea"
            describedby="list-your-nft-for-sale-for-other-users"
            onModalClose={() => {
                // Reset state
                setListingPrice(
                    roundToDecimalsIfNeeded(
                        averagePrice,
                        MAX_MARKETPLACE_PRICE_DECIMALS,
                    ),
                );
            }}
            startIcon={icon}
            {...props}
        >
            {({ handleClose }) => (
                <form
                    onSubmit={async (event) => {
                        event.preventDefault();
                        if (!validInput) {
                            return;
                        }
                        try {
                            setLoadingAction(true);
                            await openseaClient.listToken(
                                tokenId,
                                listingPrice,
                            );
                            await waitFor(1000);
                        } catch (e) {
                            console.error(`Error when listing the token`, e);
                            const errorMessage = messageWithoutErrorPrefix(e);

                            console.error(errorMessage);
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
                    <Stack spacing={2} sx={{ textAlign: "left" }}>
                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: 500,
                                color: "white",
                                pt: 1,
                            }}
                        >
                            List for sale for 1 month
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
                            label="Set a price in ETH"
                            variant="outlined"
                            type="number"
                            step="any"
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
                                    lineHeight: 1.7,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: theme.palette.secondary.main,
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
                            type="submit"
                            loading={loadingAction}
                            disabled={!validInput}
                        >
                            Complete listing
                        </CustomLoadingButton>
                    </Stack>
                </form>
            )}
        </ModalButton>
    );
}
