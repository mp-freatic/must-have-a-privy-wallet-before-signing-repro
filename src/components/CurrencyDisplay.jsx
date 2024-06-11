import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { getCurrencyRate } from "src/services/api";

import { CURRENCY_SYMBOL } from "src/constants";
import { convertToCurrency } from "src/utils";

async function externallyConvertToCurrency(value, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return Number(value.toString());
    }

    if (
        fromCurrency !== CURRENCY_SYMBOL.USD &&
        toCurrency !== CURRENCY_SYMBOL.USD
    ) {
        return convertToCurrency(value, fromCurrency, toCurrency);
    }
    if (fromCurrency === CURRENCY_SYMBOL.USD) {
        const rate = await getCurrencyRate(CURRENCY_SYMBOL.USD, [
            CURRENCY_SYMBOL.ETH,
        ]);
        const ethValue = Number(value) * rate[CURRENCY_SYMBOL.ETH];
        return convertToCurrency(ethValue, CURRENCY_SYMBOL.ETH, toCurrency);
    } else if (toCurrency === CURRENCY_SYMBOL.USD) {
        const rate = await getCurrencyRate(CURRENCY_SYMBOL.ETH, [
            CURRENCY_SYMBOL.USD,
        ]);
        const ethValue = convertToCurrency(
            value,
            fromCurrency,
            CURRENCY_SYMBOL.ETH,
        );
        return Number(ethValue) * rate[CURRENCY_SYMBOL.USD];
    } else {
        throw new Error(
            "convertToCurrency: unsupported conversion -",
            fromCurrency,
            "to",
            toCurrency,
        );
    }
}
function CurrencyDisplay({
    amount,
    currency,
    convertFrom,
    toFixed,
    component,
    variant,
    showUnit = true,
    sx,
    ...props
}) {
    const [externallyConvertedAmount, setExternallyConvertedAmount] =
        useState(null);

    const displayAmount =
        currency !== CURRENCY_SYMBOL.USD &&
        convertFrom !== CURRENCY_SYMBOL.USD &&
        !isNaN(Number(amount))
            ? convertToCurrency(amount, convertFrom, currency)
            : "???";
    const prefix = currency === CURRENCY_SYMBOL.USD ? `$` : "";
    const suffix =
        currency ===
            (CURRENCY_SYMBOL.ETH || currency === CURRENCY_SYMBOL.WEI) &&
        showUnit
            ? ` ${currency}`
            : "";

    const toString = (amount) => {
        if (toFixed && typeof amount === "number") {
            return amount.toFixed(toFixed);
        } else if (
            toFixed &&
            (typeof amount === "bigint" || typeof amount === "string")
        ) {
            return Number(amount).toFixed(toFixed);
        } else {
            // convert scientific notation to plain text
            return amount.toLocaleString(undefined, {
                useGrouping: false,
                maximumFractionDigits: 18,
            });
        }
    };

    useEffect(() => {
        if (amount == null || isNaN(Number(amount))) {
            setExternallyConvertedAmount("???");
            return;
        }

        async function externallyConvertAmountToCurrency(
            amount,
            convertFrom,
            currency,
        ) {
            try {
                const convertedAmount = await externallyConvertToCurrency(
                    amount,
                    convertFrom,
                    currency,
                );
                setExternallyConvertedAmount(convertedAmount);
            } catch (error) {
                console.error(error);
                setExternallyConvertedAmount("???");
            }
        }
        if (
            currency === CURRENCY_SYMBOL.USD &&
            convertFrom !== CURRENCY_SYMBOL.USD
        ) {
            externallyConvertAmountToCurrency(amount, convertFrom, currency);
        } else {
            setExternallyConvertedAmount(null);
        }
    }, [amount, currency, convertFrom]);

    return (
        <Typography
            component={component || "span"}
            variant={variant || "inherit"}
            sx={{ display: "inline", ...sx }}
            {...props}
        >
            {`${prefix}${
                externallyConvertedAmount === null
                    ? toString(displayAmount)
                    : toString(externallyConvertedAmount)
            } ${suffix}`}
        </Typography>
    );
}

export default CurrencyDisplay;
