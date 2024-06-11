import { Box } from "@mui/material";

import LabeledCircularProgress from "src/components/LabeledCircularProgress";
import Logo from "src/components/Logo";

// Be careful that if you change CSS here, you should also change the CSS of the index.html file
export default function FullscreenCircularProgress({
    label,
    onlyLoader = false,
    sx = {},
    ...props
}) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                height: "100%",
                width: "100%",
                ...(!onlyLoader && {
                    backgroundImage: `linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 100%), url("/img/background.svg")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                }),
                ...sx,
            }}
        >
            {onlyLoader ? (
                <LabeledCircularProgress label={label} {...props} />
            ) : (
                <>
                    <Box
                        display="flex"
                        flex="1"
                        justifyContent="center"
                        alignItems="end"
                        width="100%"
                    >
                        <Logo size="large" />
                    </Box>
                    <Box
                        display="flex"
                        flex="1"
                        justifyContent="center"
                        alignItems="start"
                        width="100%"
                        mt={1}
                        padding="0 1rem"
                    >
                        <LabeledCircularProgress label={label} {...props} />
                    </Box>
                </>
            )}
        </Box>
    );
}
