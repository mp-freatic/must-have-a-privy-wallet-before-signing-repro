import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Stack,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUserWalletAddress } from "src/slices/authSlice";
import { selectAveragePrice } from "src/slices/marketSlice";

import NFTBuyModalButton from "src/components/NFTBuyModalButton";
import NFTListModalButton from "src/components/NFTListModalButton";
import NFTRemoveListingButton from "src/components/NFTRemoveListingButton";
import NFTTransferModalButton from "src/components/NFTTransferModalButton";
import NFTUpdateListingModalButton from "src/components/NFTUpdateListingModalButton";
import Profile from "src/components/Profile";

import { CURRENCY_SYMBOL } from "src/constants";
import { convertToCurrency, roundToTheSameDecimals } from "src/utils";

export default function NFTMarketItem({
    tokenId,
    tokenListingInfo,
    topicId,
    forSale,
    openseaClient,
    murmurNFTContract,
}) {
    const currentUserWalletAddress = useSelector(
        selectCurrentUserWalletAddress,
    );
    const averagePrice = useSelector(selectAveragePrice);
    const [loadingAction, setLoadingAction] = useState(false);
    const { burningRateStep } = 1_000_000;

    const ownedByUser =
        tokenListingInfo == null ||
        currentUserWalletAddress.toLowerCase() ===
            tokenListingInfo.orderMaker.address.toLowerCase();

    let tokenPriceDisplay;
    if (tokenListingInfo) {
        const price = convertToCurrency(
            tokenListingInfo.currentPrice || 0,
            CURRENCY_SYMBOL.WEI,
            CURRENCY_SYMBOL.ETH,
        );

        tokenPriceDisplay = `${roundToTheSameDecimals(
            price,
            convertToCurrency(
                burningRateStep || 0,
                CURRENCY_SYMBOL.WEI,
                CURRENCY_SYMBOL.ETH,
            ),
        )} ETH`;
    } else if (averagePrice) {
        tokenPriceDisplay = `≈ ${roundToTheSameDecimals(
            averagePrice,
            convertToCurrency(
                burningRateStep || 0,
                CURRENCY_SYMBOL.WEI,
                CURRENCY_SYMBOL.ETH,
            ),
        )} ETH`;
    }

    return (
        <Card>
            <CardHeader
                avatar={<LocalActivityIcon />}
                title={`Coupon #${tokenId}`}
            />
            <CardContent>
                <Profile
                    address={
                        ownedByUser
                            ? currentUserWalletAddress
                            : tokenListingInfo.orderMaker.address
                    }
                    avatarSize={20}
                    showName={false}
                    showUsername={true}
                    labelPrefix="Owned by "
                    labelProps={{
                        variant: "body2",
                    }}
                    rightArea={
                        <Typography variant="body2">
                            {tokenPriceDisplay}
                        </Typography>
                    }
                    sx={{ padding: 0 }}
                    addSocialLinkOnLabel
                />
            </CardContent>
            <CardActions>
                {ownedByUser && !tokenListingInfo ? (
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                        width="100%"
                    >
                        <NFTListModalButton
                            label="List for sale"
                            tokenId={tokenId}
                            topicId={topicId}
                            fontSize="large"
                            size="small"
                            fullWidth
                            openseaClient={openseaClient}
                            murmurNFTContract={murmurNFTContract}
                        />
                        <NFTTransferModalButton
                            label="Gift"
                            tokenId={tokenId}
                            topicId={topicId}
                            fontSize="large"
                            size="small"
                            fullWidth
                            openseaClient={openseaClient}
                            murmurNFTContract={murmurNFTContract}
                        />
                    </Stack>
                ) : null}
                {ownedByUser && tokenListingInfo ? (
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                        width="100%"
                    >
                        <NFTUpdateListingModalButton
                            label="Update"
                            disabled={loadingAction}
                            tokenId={tokenId}
                            listing={tokenListingInfo}
                            topicId={topicId}
                            size="small"
                            fullWidth
                            openseaClient={openseaClient}
                            murmurNFTContract={murmurNFTContract}
                        />
                        <NFTRemoveListingButton
                            loadingAction={loadingAction}
                            setLoadingAction={setLoadingAction}
                            listing={tokenListingInfo}
                            tokenId={tokenId}
                            topicId={topicId}
                            openseaClient={openseaClient}
                            murmurNFTContract={murmurNFTContract}
                        />
                    </Stack>
                ) : null}
                {tokenListingInfo && forSale && !ownedByUser && (
                    <NFTBuyModalButton
                        label="Purchase"
                        disabled={ownedByUser}
                        tokenId={tokenId}
                        listing={tokenListingInfo}
                        topicId={topicId}
                        size="small"
                        fullWidth
                        openseaClient={openseaClient}
                        murmurNFTContract={murmurNFTContract}
                    />
                )}
            </CardActions>
        </Card>
    );
}
