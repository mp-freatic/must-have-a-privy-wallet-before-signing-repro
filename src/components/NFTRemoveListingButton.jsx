import { useDispatch } from "react-redux";

import { getListings } from "src/slices/marketSlice";

import CustomLoadingButton from "src/components/CustomLoadingButton";

import { waitFor } from "src/utils";

export default function NFTRemoveListingButton({
    tokenId,
    topicId,
    listing,
    openseaClient,
    loadingAction,
    setLoadingAction,
    murmurNFTContract,
}) {
    const dispatch = useDispatch();

    return (
        <CustomLoadingButton
            size="small"
            loading={loadingAction}
            onClick={async () => {
                try {
                    setLoadingAction(true);
                    await openseaClient.cancelListing(
                        tokenId,
                        listing.orderHash,
                    );
                    await waitFor(1000);
                } catch (e) {
                    console.error("Error when removing the listing", e);
                } finally {
                    setLoadingAction(false);
                    // In some cases, the API transaction on Opensea may work but end up in error.
                    // A refresh in the "finally" block will allow to present a view in conformity with the final state of the NFT on Opensea.
                    dispatch(
                        getListings(openseaClient, topicId, murmurNFTContract),
                    );
                }
            }}
        >
            Remove
        </CustomLoadingButton>
    );
}
