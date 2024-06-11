import { useTheme } from "@mui/material";
import { PrivyProvider } from "@privy-io/react-auth";

import { getEnvDependentChain, getExtraEnvChains } from "src/chains";
import { LOGIN_METHODS } from "src/constants";

const WalletAuthProvider = ({ children }) => {
    const theme = useTheme();
    return (
        <PrivyProvider
            appId={import.meta.env.VITE_PUBLIC_PRIVY_APP_ID}
            config={{
                loginMethods: LOGIN_METHODS,
                defaultChain: getEnvDependentChain(),
                appearance: {
                    theme: "dark",
                    showWalletLoginFirst: false,
                    accentColor: theme.palette.primary.light,
                },
                embeddedWallets: {
                    createOnLogin: "users-without-wallets",
                    noPromptOnSignature: true,
                },
                additionalChains: getExtraEnvChains(),
            }}
        >
            {children}
        </PrivyProvider>
    );
};

export default WalletAuthProvider;
