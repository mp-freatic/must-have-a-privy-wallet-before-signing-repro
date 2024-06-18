import { Box, Stack, TextField, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedCallback } from "use-debounce";

import usePublicClient from "src/hooks/usePublicClient";
import { ownerOf, transferNFT } from "src/services/murmur";
import { selectCurrentUserWalletAddress } from "src/slices/authSlice";
import { getListings } from "src/slices/marketSlice";

import AddressDisplay from "src/components/AddressDisplay";
import CustomLoadingButton from "src/components/CustomLoadingButton";
import ModalButton from "src/components/ModalButton";

import { validateAddress, waitFor } from "src/utils";

let lastValidationTaskId = 0;
export default function NFTTransferModalButton({
    icon,
    tokenId,
    topicId,
    openseaClient,
    murmurNFTContract,
    ...props
}) {
    const dispatch = useDispatch();
    const currentUserWalletAddress = useSelector(
        selectCurrentUserWalletAddress,
    );
    const ethClient = usePublicClient("1"); // mainnet for ENS

    const theme = useTheme();

    const [addressInput, setAddressInput] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isValidInput, setIsValidInput] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);

    const validateAddressDebounced = useDebouncedCallback(
        async (addressValue) => {
            const validationTaskId = ++lastValidationTaskId;
            let isValid = true;
            try {
                const validatedAddress = await validateAddress(
                    addressValue,
                    currentUserWalletAddress,
                    ethClient,
                );
                // Validations are async, so we need to check if the validation task is still the last one which relates to the
                // current state of the value to be validated
                if (validationTaskId === lastValidationTaskId) {
                    setIsValidInput(isValid);
                    setRecipientAddress(validatedAddress);
                }

                return validatedAddress;
            } catch (e) {
                setIsValidInput(false);
                setRecipientAddress("");
                setErrorMessage(e.message);
            }
        },
        400,
    );

    return (
        <ModalButton
            label={""}
            labelledby="transfer-coupon-to"
            describedby="transfer-your-coupon-to-an-address"
            onModalClose={() => {
                // Reset state
                setIsValidInput(true);
                setAddressInput("");
                setRecipientAddress("");
                setErrorMessage("");
            }}
            startIcon={icon}
            {...props}
        >
            {({ handleClose }) => (
                <form
                    onSubmit={async (event) => {
                        event.preventDefault();

                        if (!isValidInput) {
                            return;
                        }

                        try {
                            setLoadingAction(true);
                            console.log(
                                `Transfering NFT #${tokenId} from ${currentUserWalletAddress} to ${recipientAddress}`,
                            );
                            const txHash = await transferNFT(
                                murmurNFTContract,
                                currentUserWalletAddress,
                                recipientAddress,
                                tokenId,
                            );
                            // Wait until the NFT is transferred
                            const startTime = Date.now();
                            await waitFor(1_000, async () => {
                                if (Date.now() - startTime > 30_000) {
                                    const message = `Timeout when transferring the NFT. Please check the transaction status on the blockchain: ${txHash}`;
                                    throw new Error(message);
                                }

                                const currentOwner = await ownerOf(
                                    murmurNFTContract,
                                    tokenId,
                                );
                                return currentOwner === recipientAddress;
                            });
                        } catch (e) {
                            console.error(`Error when transferring the NFT`, e);
                        } finally {
                            setLoadingAction(false);
                            handleClose();
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
                            Transfer coupon #{tokenId} to:
                        </Typography>

                        <TextField
                            sx={{
                                width: "100%",
                                input: {
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: theme.palette.secondary.main,
                                },
                            }}
                            id="transfer-recipent-field"
                            label="e.g 0x1d62 ... or recipient.eth (ens name)"
                            variant="outlined"
                            type="string"
                            value={addressInput}
                            disabled={loadingAction}
                            error={addressInput.length > 0 && !isValidInput}
                            onChange={async (event) => {
                                setErrorMessage("");
                                setAddressInput(event.target.value);
                                setIsValidInput(false); // invalidate the value first, otherwise the user might have time to click on an active button after the data has become invalid.
                                await validateAddressDebounced(
                                    event.target.value,
                                );
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
                        {recipientAddress &&
                            isValidInput &&
                            addressInput !== recipientAddress && (
                                <Box
                                    sx={{
                                        p: 2,
                                        backgroundColor: "background.hairline",
                                        borderRadius: 2,
                                        display: "flex",
                                    }}
                                >
                                    Sending to:&nbsp;
                                    <AddressDisplay
                                        address={recipientAddress}
                                        shorten
                                        showLink
                                    />
                                </Box>
                            )}
                        {errorMessage && (
                            <Typography color="error">
                                {errorMessage}
                            </Typography>
                        )}
                        <CustomLoadingButton
                            type="submit"
                            loading={loadingAction}
                            disabled={!recipientAddress || !isValidInput}
                        >
                            Gift
                        </CustomLoadingButton>
                    </Stack>
                </form>
            )}
        </ModalButton>
    );
}
