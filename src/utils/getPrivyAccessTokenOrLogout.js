import { getAccessToken } from "@privy-io/react-auth";
import { differenceInSeconds } from "date-fns";

import { logoutFromAll } from "src/slices/authSlice";

import store from "src/store";
import { waitFor } from "src/utils";

let token = null;
let isLoadingToken = false;
let lastCall;

const getAccessTokenFromPrivy = async () => {
    lastCall = new Date();
    isLoadingToken = true;
    try {
        token = await getAccessToken();
    } catch (error) {
        console.error("Error getting privy access token", error);
        token = null;
    }
    isLoadingToken = false;
};

// this function is called before each API call
// or if the backend return a 401 (unauthenticated) error
export const getPrivyAccessTokenOrLogout = async (
    from,
    forceNewCall = false,
) => {
    if (isLoadingToken) {
        await waitFor(1_000, async () => {
            return !isLoadingToken;
        });
    }
    if (!lastCall || forceNewCall) {
        await getAccessTokenFromPrivy();
    } else {
        const secondsSinceLastCall = differenceInSeconds(
            new Date(),
            new Date(lastCall),
        );
        // we call the getAccessToken from privy maximum each 5 seconds
        if (secondsSinceLastCall > 5) {
            await getAccessTokenFromPrivy();
        }
    }
    if (!token) {
        console.warn(`No more privy access token on: ${from}`);
        store.dispatch(logoutFromAll()); // this will implies isConnected = false
    }

    return token;
};
