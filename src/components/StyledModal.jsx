import { Box, Modal } from "@mui/material";

export const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "calc(100vw - 2rem)",
    maxWidth: 500,
    bgcolor: "background.paper",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "secondary.main",
    borderRadius: 3,
    boxShadow: 24,
    px: 2,
    py: 3,
    textAlign: "center",
    outline: "none",
};

export default function StyledModal({ children, handleClose, sx, ...props }) {
    return (
        <Modal {...props}>
            <Box sx={{ ...modalStyle, ...sx }}>
                {typeof children === "function"
                    ? children({ handleClose })
                    : children}
            </Box>
        </Modal>
    );
}
