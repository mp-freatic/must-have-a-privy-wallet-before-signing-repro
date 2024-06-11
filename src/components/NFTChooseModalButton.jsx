import { LocalActivityOutlined } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";

import InformationBox from "src/components/InformationBox";
import ModalButton from "src/components/ModalButton";

export default function NFTChooseModalButton({ nfts, onNFTChosen, ...props }) {
    return (
        <ModalButton
            label={`Apply coupon`}
            component={Typography}
            labelledby="apply-coupon"
            describedby="instructions-to-choose-coupon"
            sx={{ textDecoration: "underline" }}
            {...props}
        >
            {({ handleClose }) => (
                <Box
                    sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography variant="h6">
                        Choose a coupon to apply
                    </Typography>

                    <Stack gap={1} my={2}>
                        {nfts.map((nft) => (
                            <InformationBox
                                color="green"
                                key={nft.tokenId}
                                onClick={() => {
                                    if (onNFTChosen) {
                                        onNFTChosen(nft);
                                    }
                                }}
                                Icon={LocalActivityOutlined}
                                content={`${nft.discount}% discount applied using coupon #${nft.tokenId}`}
                            />
                        ))}
                    </Stack>
                    <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </Box>
            )}
        </ModalButton>
    );
}
