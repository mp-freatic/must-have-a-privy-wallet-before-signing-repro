import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import { Button, Stack, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import useBalance from "src/hooks/useBalance";
import {
    logoutFromAll,
    selectCurrentUserWalletAddress,
    selectIsConnected,
} from "src/slices/authSlice";

import CurrencyDisplay from "src/components/CurrencyDisplay";

import EthereumIcon from "src/assets/ethereum.svg?react";
import { CURRENCY_SYMBOL, ROUTES } from "src/constants";

export default function UserBalances({
    showCurrentUserAvatar = false,
    onTopic = false,
}) {
    const dispatch = useDispatch();
    const location = useLocation();
    const { topicId } = useParams();
    const navigate = useNavigate();
    const currentUserWalletAddress = useSelector(
        selectCurrentUserWalletAddress,
    );
    const isConnected = useSelector(selectIsConnected);

    const { balance } = useBalance({
        address: currentUserWalletAddress,
        fetchInterval: 10_000,
    });
    const theme = useTheme();

    if (!isConnected) {
        return showCurrentUserAvatar ? (
            <Stack
                spacing={1}
                justifySelf="flex-end"
                alignItems="center"
                direction="row"
                sx={{
                    p: 1,
                }}
            >
                {currentUserWalletAddress}
            </Stack>
        ) : null;
    }
    return (
        <Stack
            spacing={1}
            justifySelf="flex-end"
            alignItems="center"
            direction="row"
            sx={{
                backgroundColor: onTopic ? "background.main" : "primary.dark",
                borderRadius: 3,
                p: 1,
                cursor: "pointer",
            }}
        >
            {topicId && (
                <Stack
                    direction="row"
                    alignItems="center"
                    onClick={() => {
                        location.pathname !==
                            ROUTES.FEED_MARKETPLACE(topicId) &&
                            navigate(ROUTES.FEED_MARKETPLACE(topicId), {
                                state: { from: location.pathname },
                            });
                    }}
                >
                    <LocalActivityIcon color="primary" />
                    &nbsp;{0}
                </Stack>
            )}
            <Stack
                spacing={1}
                direction="row"
                onClick={() => {
                    location.pathname !== ROUTES.PROFILE &&
                        navigate(ROUTES.PROFILE, {
                            state: { from: location.pathname },
                        });
                }}
            >
                <Stack direction="row" alignItems="center">
                    <EthereumIcon
                        style={{ color: theme.palette.primary.main }}
                    />
                    <CurrencyDisplay
                        amount={balance || 0}
                        currency={CURRENCY_SYMBOL.ETH}
                        convertFrom={CURRENCY_SYMBOL.WEI}
                        toFixed={balance ? 2 : 0}
                        showUnit={false}
                    />
                    &nbsp; Wallet: {currentUserWalletAddress}
                    <Button onClick={() => dispatch(logoutFromAll())}>
                        Logout
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
}
