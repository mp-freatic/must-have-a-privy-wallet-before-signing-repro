import { configureStore } from "@reduxjs/toolkit";

import authReducer from "src/slices/authSlice";
import marketReducer from "src/slices/marketSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        market: marketReducer,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
