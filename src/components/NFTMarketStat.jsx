import { Divider, Stack, Typography } from "@mui/material";

import CurrencyDisplay from "src/components/CurrencyDisplay";

import { CURRENCY_SYMBOL } from "src/constants";

export default function NFTMarketStat({ label, value, onClick }) {
    return (
        <Stack onClick={() => onClick?.(value)}>
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
                    {label}
                </Typography>
                <CurrencyDisplay
                    amount={value}
                    currency={CURRENCY_SYMBOL.ETH}
                    toFixed={6}
                    sx={{ fontWeight: 500, fontSize: 14, color: "white" }}
                />
            </Stack>
            <Divider />
        </Stack>
    );
}
