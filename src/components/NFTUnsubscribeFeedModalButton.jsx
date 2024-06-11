import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import { Stack, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useIsLowBalance from "src/hooks/useIsLowBalance";
import { leaveFeed } from "src/services/murmur";
import { selectCurrentUserWalletAddress } from "src/slices/authSlice";
import { setSnackbarFeedback } from "src/slices/snackbarFeedbackSlice";
import {
    getCurrentUserSubscription,
    getFeedSubscriptions,
    getNFTs,
    selectCurrentUserDisabledNFT,
} from "src/slices/subscriptionsSlice";

import CustomLoadingButton from "src/components/CustomLoadingButton";
import ErrorMessage from "src/components/ErrorMessage";
import InformationBox from "src/components/InformationBox";
import ModalButton from "src/components/ModalButton";

import { ContractsContext } from "src/contexts";
import store from "src/store";
import { waitFor } from "src/utils";

const NFTUnsubscribeFeedModalButton = ({ topicId, onUnsubscribe }) => {
    const dispatch = useDispatch();
    const [loadingLeaveFeed, setLoadingLeaveFeed] = useState(false);
    const currentUserWalletAddress = useSelector(
        selectCurrentUserWalletAddress,
    );
    const { isLowBalance } = useIsLowBalance();
    const { murmurContract, murmurNFTContract } = useContext(ContractsContext);
    const currentUserDisabledNFT = useSelector(
        selectCurrentUserDisabledNFT(topicId),
    );

    useEffect(() => {
        dispatch(getNFTs(murmurNFTContract, topicId));
    }, [dispatch, murmurNFTContract, topicId]);

    const onLeaveFeed = async (handleClose) => {
        try {
            setLoadingLeaveFeed(true);

            await leaveFeed(murmurContract, topicId);

            // Check backend until cache has been updated
            await waitFor(2_000, async () => {
                const subs = await getFeedSubscriptions(topicId)(dispatch);
                const notFoundUpdatedSub = !subs.find(
                    ({ subscriber }) => subscriber === currentUserWalletAddress,
                );

                return notFoundUpdatedSub;
            });

            await getNFTs(
                murmurNFTContract,
                murmurContract,
                topicId,
            )(dispatch, store.getState);

            dispatch(
                setSnackbarFeedback({
                    type: "success",
                    message: "You have successfully unsubscribed",
                }),
            );

            await getCurrentUserSubscription(murmurContract, topicId)(
                dispatch,
                store.getState,
            );

            handleClose();

            if (onUnsubscribe) {
                await onUnsubscribe();
            }
        } catch (e) {
            console.error(e);
            dispatch(setSnackbarFeedback({ type: "error", message: e }));
        } finally {
            setLoadingLeaveFeed(false);
        }
    };

    if (!currentUserDisabledNFT) {
        return null;
    }

    return (
        <ModalButton
            label="Unsubscribe"
            labelledby="unsubscribe-title"
            describedby="unsubscribe-description"
            color="error"
            fullWidth
        >
            {({ handleClose }) => (
                <Stack gap={1}>
                    <Typography variant="h6" textAlign="left" fontSize={18}>
                        Unsubscribe
                    </Typography>
                    {!isLowBalance && (
                        <InformationBox
                            color="error"
                            subBackgroundColor="dark"
                            subTextColor="darkContrastText"
                            Icon={LocalActivityIcon}
                            content={
                                <>
                                    Your coupon{" "}
                                    <Typography
                                        fontSize="inherit"
                                        color="inherit"
                                        component="span"
                                        sx={{ textDecoration: "underline" }}
                                    >
                                        #{currentUserDisabledNFT.tokenId}
                                    </Typography>{" "}
                                    will be destroyed
                                </>
                            }
                        />
                    )}
                    {isLowBalance && (
                        <ErrorMessage message="Your balance is very low, please add funds to be able to unsubscribe" />
                    )}
                    <CustomLoadingButton
                        onClick={() => onLeaveFeed(handleClose)}
                        disabled={isLowBalance}
                        loading={loadingLeaveFeed}
                    >
                        Confirm unsubscription
                    </CustomLoadingButton>
                </Stack>
            )}
        </ModalButton>
    );
};

export default NFTUnsubscribeFeedModalButton;
