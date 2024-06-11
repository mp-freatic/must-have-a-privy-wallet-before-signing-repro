import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import useIsCurrentUser from "src/hooks/useIsCurrentUser";

import { getShortenedAddress } from "src/utils";

function AddressDisplay({
    address,
    shorten,
    copyable,
    showLink,
    showYouIfApplicable = false,
    underline = true,
    color = "secondary",
    ...props
}) {
    const isYou = useIsCurrentUser(address);
    const copyToClipboard = useCopyToClipboard();

    let shortenedAddress = "";
    if (address) {
        shortenedAddress = shorten ? getShortenedAddress(address) : address;
    }

    let content = (
        <Box
            display="flex"
            gap={1}
            component={props.component ?? "span"}
            onClick={
                copyable
                    ? (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          copyToClipboard({
                              contentToCopy: address,
                              successMessage: "Address copied to clipboard",
                              errorMessage:
                                  "Could not copy your address, sorry. Please try again",
                          });
                      }
                    : props.onClick
            }
            {...props}
            sx={{
                ...props.sx,
                ...(copyable ? { cursor: "pointer" } : {}),
            }}
        >
            <Typography
                sx={{
                    textDecoration: underline ? "underline" : undefined,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                }}
                component={props.component ?? "span"}
                color={color}
            >
                {shortenedAddress} {isYou && showYouIfApplicable ? "(You)" : ""}
            </Typography>
            {copyable ? (
                <ContentCopyIcon fontSize="xs" color="secondary" />
            ) : null}
            {showLink ? <OpenInNewIcon fontSize="xs" color={color} /> : null}
        </Box>
    );

    if (showLink) {
        content = (
            <Link
                to={`${
                    import.meta.env.VITE_BLOCK_EXPLORER_URL
                }/address/${address}`}
                target="_blank"
                style={{ display: "inline-block" }}
            >
                {content}
            </Link>
        );
    }

    return content;
}

export default AddressDisplay;
