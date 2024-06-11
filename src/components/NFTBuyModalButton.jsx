import {
    Divider,
    InputAdornment,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useBalance from "src/hooks/useBalance";
import { selectCurrentUserWalletAddress } from "src/slices/authSlice";
import { getListings } from "src/slices/marketSlice";

import CurrencyDisplay from "src/components/CurrencyDisplay";
import CustomLoadingButton from "src/components/CustomLoadingButton";
import ModalButton from "src/components/ModalButton";

import { CURRENCY_SYMBOL } from "src/constants";
import { convertToCurrency, waitFor } from "src/utils";

export default function NFTBuyModalButton({
    icon,
    tokenId,
    listing,
    topicId,
    openseaClient,
    murmurNFTContract,
    ...props
}) {
    const dispatch = useDispatch();
    const currentUserWalletAddress = useSelector(
        selectCurrentUserWalletAddress,
    );

    const theme = useTheme();

    const [listingPrice, setListingPrice] = useState(
        convertToCurrency(
            listing.currentPrice,
            CURRENCY_SYMBOL.WEI,
            CURRENCY_SYMBOL.ETH,
        ),
    );
    const [loadingAction, setLoadingAction] = useState(false);

    const { balance } = useBalance({ address: currentUserWalletAddress });
    const accountBalance = balance
        ? convertToCurrency(balance, CURRENCY_SYMBOL.WEI, CURRENCY_SYMBOL.ETH)
        : 0;

    return (
        <ModalButton
            label={``}
            labelledby="buy-coupon"
            describedby="instructions-to-complete-nft-purchase"
            startIcon={icon}
            {...props}
        >
            {({ handleClose }) => (
                <Stack spacing={2} sx={{ textAlign: "left" }}>
                    <Typography
                        sx={{
                            fontSize: 18,
                            fontWeight: 500,
                            color: "white",
                            py: 1,
                        }}
                    >
                        Buy coupon #{tokenId}
                    </Typography>

                    <TextField
                        sx={{
                            width: "100%",
                        }}
                        id="listingPrice-field"
                        label="Listing price"
                        variant="outlined"
                        value={`${listingPrice} ETH`}
                        onChange={(event) => {
                            setListingPrice(event.target.value);
                        }}
                        InputLabelProps={{
                            style: {
                                ...theme.typography?.body2,
                            },
                        }}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment
                                    position="end"
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: theme.palette.secondary.main,
                                    }}
                                >
                                    {"≈"}&#160;
                                    <CurrencyDisplay
                                        amount={listingPrice || 0}
                                        currency={CURRENCY_SYMBOL.USD}
                                        convertFrom={CURRENCY_SYMBOL.ETH}
                                        toFixed={2}
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{ pb: 1 }}
                        >
                            <Typography
                                variant={"body1"}
                                sx={{
                                    color: "secondary.main",
                                }}
                            >
                                Available in wallet
                            </Typography>
                            <CurrencyDisplay
                                amount={accountBalance}
                                currency={CURRENCY_SYMBOL.ETH}
                                toFixed={3}
                                sx={{
                                    fontWeight: 500,
                                    fontSize: 14,
                                    color:
                                        accountBalance < Number(listingPrice)
                                            ? "error.main"
                                            : "white",
                                }}
                            />
                        </Stack>
                        <Divider />
                    </Stack>

                    <CustomLoadingButton
                        disabled={accountBalance < listingPrice}
                        loading={loadingAction}
                        onClick={async () => {
                            try {
                                setLoadingAction(true);
                                await openseaClient.buy(
                                    tokenId,
                                    listing.orderHash,
                                );

                                await waitFor(1000);
                            } catch (e) {
                                console.error("Error when buying the token", e);
                            } finally {
                                setLoadingAction(false);
                                handleClose();
                                // In some cases, the API transaction on Opensea may work but end up in error.
                                // A refresh in the finaly block will allow to present a view in conformity with the final state of the NFT on Opensea.
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
                        Complete purchase
                    </CustomLoadingButton>
                </Stack>
            )}
        </ModalButton>
    );
}
