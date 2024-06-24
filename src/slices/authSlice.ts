import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";

import { AppDispatch, RootState } from "src/store";

interface IAuthState {
    needsToGenerateKey: boolean;
    isLoggingOut: boolean;
    currentUserWalletAddress?: string;
    isConnectingPrivy: boolean;
    isLoadingAuth: boolean;
}

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        needsToGenerateKey: true,
        isLoggingOut: false,
        currentUserWalletAddress: undefined,
        isConnectingPrivy: true,
        isLoadingAuth: false,
    } as IAuthState,
    reducers: {
        clearProfile: (state) => {
            state.currentUserWalletAddress = undefined;
        },
        setIsLoadingAuth: (state, action: PayloadAction<boolean>) => {
            state.isLoadingAuth = action.payload;
        },
        setIsLoggingOut: (state, action: PayloadAction<boolean>) => {
            state.isLoggingOut = action.payload;
        },
        setCurrentUserWalletAddress: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            state.currentUserWalletAddress = action.payload;
        },
        setIsConnectingPrivy: (state, action: PayloadAction<boolean>) => {
            state.isConnectingPrivy = action.payload;
        },
    },
});

export const {
    clearProfile,
    setIsConnectingPrivy,
    setIsLoggingOut,
    setCurrentUserWalletAddress,
    setIsLoadingAuth,
} = authSlice.actions;
export default authSlice.reducer;

export function selectIsConnected(state: RootState) {
    const { currentUserWalletAddress } = state.auth;

    return Boolean(currentUserWalletAddress);
}

export function selectIsLoadingAuth(state: RootState) {
    const { isLoadingAuth, isConnectingPrivy } = state.auth;
    return Boolean(isLoadingAuth || isConnectingPrivy);
}

export function selectIsLoggingOut(state: RootState) {
    return state.auth.isLoggingOut;
}

export function selectCurrentUserWalletAddress(state: RootState) {
    return state.auth.currentUserWalletAddress;
}

export const logoutFromAll =
    () => async (dispatch: AppDispatch) => {
        dispatch(setIsLoggingOut(true));
        // the setIsLoggingOut(false) is done in the start page to avoid infinite loop
    };

type HandleAuthConnectionType = {
    walletAddress: string;
    handleDuplicateTwitterAccountError: () => void;
    referralCode?: string;
};
export const handleAuthConnection =
    ({
        walletAddress,
        handleDuplicateTwitterAccountError,
    }: HandleAuthConnectionType) =>
    async (dispatch: AppDispatch) => {
        try {
            dispatch(setIsLoadingAuth(true));
            dispatch(setCurrentUserWalletAddress(walletAddress));
        } catch (error) {
            dispatch(setCurrentUserWalletAddress(undefined));
            if (
                isAxiosError(error) &&
                error.response?.data?.error ===
                    "This twitter id is already used"
            ) {
                console.warn("This twitter id is already used");
                handleDuplicateTwitterAccountError();
            } else {
                console.error("Error in handleAuthConnection", error);
            }
        } finally {
            dispatch(setIsLoadingAuth(false));
        }
    };
