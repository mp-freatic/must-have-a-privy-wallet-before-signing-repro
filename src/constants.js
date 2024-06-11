export const ROUTES = {
    START: "/",
    FEED_MARKETPLACE: `/home`,
};

export const OPENSEA_EVENT_TYPE = {
    ALL: "all",
    CANCEL: "cancel",
    ORDER: "order",
    SALE: "sale",
    TRANSFER: "transfer",
};

export const CURRENCY_SYMBOL = {
    ETH: "ETH",
    WEI: "Wei",
    USD: "USD",
};

export const LAYOUT = {
    START_PAGE: {
        DESKTOP_BUTTON_WIDTH: 400,
    },
    MAIN_CONTENT: {
        MAX_WIDTH: 768,
    },
};

export const MAX_MARKETPLACE_PRICE_DECIMALS = 15;
export const MAX_AMOUNT_MARGIN = 0.9999;
export const COUPONS_FOR_SLOWDOWN_ENABLED =
    import.meta.env.VITE_ENABLED_USE_COUPONS_FOR_SLOWDOWN === "true";

export const LOGIN_METHODS =
    import.meta.env.VITE_ENABLED_LOGIN_METHODS?.split(",") ?? [];

export const FEED_TABS = () => ({
    COUPONS: {
        label: "Coupons",
        path: ROUTES.FEED_MARKETPLACE,
        activePaths: [],
        userCouponsTab: "coupons-you-own",
        couponsForSaleTab: "coupons-for-sale",
    },
});

export const TWITTER_BASE_URL = "https://x.com";
export const WARPCAST_BASE_URL = "https://warpcast.com";
