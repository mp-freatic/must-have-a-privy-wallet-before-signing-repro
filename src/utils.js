import { ethers } from "ethers";
import { isAddress } from "viem";
import { normalize } from "viem/ens";

import { CURRENCY_SYMBOL } from "src/constants";

export const getShortenedAddress = (
    address,
    numberOfCharsBeginning = 5,
    numberOfCharsEnd = 3,
) => {
    return `${address.substr(0, numberOfCharsBeginning)}...${address.substr(
        address.length - numberOfCharsEnd,
    )}`;
};

export const bigIntToSolidityBytes = (n) => {
    let hexN = n.toString(16);
    if (hexN.length % 2 === 1) {
        hexN = "0" + hexN;
    }

    return ethers.hexlify("0x" + hexN);
};

export const range = (start, end, step = 1) => {
    const result = [];
    for (let i = start; i < end; i += step) {
        result.push(i);
    }
    return result;
};

export const extractSVGFromTokenURI = (tokenURI) => {
    try {
        const _jsonBuffer = Buffer.from(
            tokenURI.substr(29),
            "base64",
        ).toString();
        const _json = JSON.parse(_jsonBuffer);
        return "data:image/svg+xml;base64," + _json.image.substr(22);
    } catch (e) {
        return "/favicon.ico";
    }
};

export const handleTransactionError = (error) => {
    let errorMessage;
    try {
        console.warn(error);
        const metamaskErrorData = error.error.data;
        errorMessage =
            metamaskErrorData.data.message === "revert"
                ? metamaskErrorData.data.reason
                : metamaskErrorData.data.message.split("'")[1];
    } catch (e) {
        console.error(e);
        if (error?.message) {
            if (error.message.includes("User rejected the request")) {
                errorMessage = null;
            } else {
                errorMessage = error.message;
            }
        } else {
            errorMessage =
                "Could not parse error coming from metamask, please try again";
        }
    }

    return errorMessage;
};

export const getReadableTimeFromSeconds = (timeInSeconds) => {
    const timeLeftInHours = timeInSeconds / 60 / 60;
    const timeLeftInMinutes = timeInSeconds / 60;
    let readableTime = `${Math.floor(timeLeftInHours)} hour${
        Math.floor(timeLeftInHours) > 1 ? "s" : ""
    }`;
    if (timeLeftInHours < 1) {
        readableTime = `${Math.floor(timeLeftInHours * 60)} min${
            Math.floor(timeLeftInHours * 60) > 1 ? "s" : ""
        }`;
    }
    if (timeLeftInMinutes < 1) {
        readableTime = `${Math.floor(timeLeftInMinutes * 60)}s`;
    }

    return readableTime;
};

export function ordinalSuffixOf(i) {
    var j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

export function convertToCurrency(value, fromCurrency, toCurrency) {
    if (value === 0) {
        return 0;
    }

    const valueToConvert = value.toString ? value.toString() : value;

    if (fromCurrency === toCurrency || fromCurrency == null) {
        return valueToConvert;
    }

    if (valueToConvert == null || isNaN(Number(valueToConvert))) {
        console.error(
            `convertToCurrency: value should be a number, number in a string or a bigint - Received: ${value}`,
        );
        return valueToConvert;
    }

    if (
        fromCurrency === CURRENCY_SYMBOL.USD ||
        toCurrency === CURRENCY_SYMBOL.USD
    ) {
        throw new Error(
            `convertToCurrency: USD is not supported. Consider using externallyConvertToCurrency - Received: ${value}`,
        );
    } else if (
        fromCurrency === CURRENCY_SYMBOL.WEI &&
        toCurrency === CURRENCY_SYMBOL.ETH
    ) {
        try {
            return ethers.formatEther(valueToConvert);
        } catch (error) {
            throw new Error(`Error converting Wei to ETH: ${error.message}`);
        }
    } else if (
        fromCurrency === CURRENCY_SYMBOL.ETH &&
        toCurrency === CURRENCY_SYMBOL.WEI
    ) {
        try {
            return ethers.parseEther(valueToConvert).toString();
        } catch (error) {
            throw new Error(`Error converting ETH to Wei: ${error.message}`);
        }
    } else {
        throw new Error(
            `convertToCurrency: unsupported conversion - from ${fromCurrency} to ${toCurrency}`,
        );
    }
}

export function convertCryptoValueToNumber(value, fromUnit, toUnit) {
    const convertedValue = convertToCurrency(value, fromUnit, toUnit);
    return Number(convertedValue);
}

export function capitalize(word) {
    if (!word) {
        return;
    }
    return word[0].toUpperCase() + word.substr(1);
}

export function safeBigInt(value) {
    if (value === null || value === undefined) {
        throw new Error("safeBigInt: value is null or undefined");
    }
    try {
        return BigInt(value);
    } catch (error) {
        console.error(
            `safeBigInt: Error converting value '${value}' to BigInt`,
        );
        throw error;
    }
}

export async function waitFor(
    intervalTime,
    releaseCallback = async () => true,
) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            try {
                const canBeReleased = await releaseCallback();

                if (canBeReleased) {
                    clearInterval(interval);
                    resolve();
                }
            } catch (e) {
                clearInterval(interval);
                reject(e);
            }
        }, intervalTime);
    });
}

export function roundToDecimalsIfNeeded(
    valueToRound,
    numberOfDecimals,
    trim = false,
) {
    if (valueToRound.length <= numberOfDecimals + 2) {
        return valueToRound;
    }

    const valueAsNumber = Number(valueToRound);
    const roundedValue = valueAsNumber.toFixed(numberOfDecimals);
    if (trim) {
        return `${parseFloat(roundedValue)}`;
    }

    return roundedValue;
}

export function roundToTheSameDecimals(valueToRound, reference) {
    const numberOfDecimals = String(reference).split(".")[1]?.length || 0;
    return roundToDecimalsIfNeeded(valueToRound, numberOfDecimals, true);
}

/**
 * Return from an error object the message without "error" prefix
 * @param error error object
 * @returns {string}
 */
export function messageWithoutErrorPrefix(error) {
    let message = String(error).trimStart();

    if (message.includes("Failed to fetch")) {
        return "Issue communicating with Opensea's servers. Please retry later";
    }

    const messageToLowerCase = message.toLowerCase();
    if (messageToLowerCase.startsWith("error")) {
        message = message.substring(5).trimStart();
        if (message.startsWith(":")) {
            message = message.substring(1).trimStart();
        }
    }
    return message;
}

export function matchesRoute(pathname, routeFunctionOrPattern) {
    let routePattern = "";
    let args = [];

    if (typeof routeFunctionOrPattern === "function") {
        const argCount = routeFunctionOrPattern.length;
        // Generate an array of generic argument names based on the count
        args = Array.from({ length: argCount }, (_, i) => `:arg${i + 1}`);
        // Call the route function with the generic argument names
        routePattern = routeFunctionOrPattern(...args);

        // Replace each generic argument name in the route pattern with a regex pattern
        // This regex pattern matches one or more characters that are not a forward slash
        args.forEach((arg) => {
            routePattern = routePattern.replace(new RegExp(arg, "g"), "[^/]+");
        });
    } else {
        routePattern = routeFunctionOrPattern;
    }

    // Escape forward slashes for regex
    routePattern = routePattern.replace(/\//g, "\\/");

    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
}

export const generateJsonFile = async (obj, name) => {
    const blob = new Blob([JSON.stringify(obj)], {
        type: "application/json",
    });
    return new File([blob], name);
};

export const parseJsonFile = async (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = async () => {
            try {
                resolve(JSON.parse(reader.result));
            } catch (e) {
                reject(e);
            }
        };

        reader.readAsText(file);
    });
};

export const isJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

export const isSerializable = (obj) => {
    try {
        JSON.stringify(obj);
    } catch (e) {
        return false;
    }
    return true;
};

const units = ["bytes", "KB", "MB", "GB", "TB"];

export const niceBytes = (x) => {
    let l = 0,
        n = parseInt(x, 10) || 0;

    while (n >= 1000 && ++l) {
        n = n / 1000;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
};

export const getExtension = (filename) => {
    return filename && filename.split(".").pop();
};

export const validateAddress = async (
    address,
    currentUserWalletAddress,
    client,
) => {
    let validatedAddress;
    if (address?.includes(".")) {
        try {
            const ensAddress = await client.getEnsAddress({
                name: normalize(address),
            });

            if (isAddress(ensAddress)) {
                validatedAddress = ensAddress;
            }
        } catch (e) {
            const errorMessage = `Could not resolve ENS address for ${normalize(
                address,
            )}`;
            console.error(errorMessage, e);
            throw new Error(errorMessage);
        }
    } else if (isAddress(address)) {
        validatedAddress = address;
    }

    if (validatedAddress && validatedAddress === currentUserWalletAddress) {
        throw new Error("Cannot transfer coupon to yourself");
    }

    return validatedAddress;
};

const stringToColor = (string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
};

export const getAvatarNameComponentPropsFromString = (name) => {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(" ")[0]?.[0]?.toUpperCase() ?? ""}${
            name.split(" ")[1]?.[0]?.toUpperCase() ?? ""
        }`,
    };
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
