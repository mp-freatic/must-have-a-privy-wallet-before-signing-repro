import { Button } from "@mui/material";
import { useState } from "react";

import ErrorMessage from "src/components/ErrorMessage";
import StyledModal from "src/components/StyledModal";

export default function ModalButton({
    component,
    label,
    children,
    onModalOpen,
    onModalClose,
    labelledby,
    describedby,
    sx,
    errorMessage,
    variant = "contained",
    ...props
}) {
    if (!labelledby) {
        console.warn(`You should set the 'labelledby' prop on any modal`);
    }
    if (!describedby) {
        console.warn(`You should set the 'describedby' prop on any modal`);
    }

    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
        if (onModalOpen) {
            onModalOpen();
        }
    };
    const handleClose = () => {
        setOpen(false);
        if (onModalClose) {
            onModalClose();
        }
    };

    let ComponentToRender = Button;
    if (component) {
        ComponentToRender = component;
    }

    return (
        <>
            {errorMessage && <ErrorMessage message={errorMessage} />}
            <ComponentToRender
                onClick={handleOpen}
                sx={sx}
                variant={variant}
                {...props}
            >
                {label}
            </ComponentToRender>
            <StyledModal
                open={open}
                onClose={handleClose}
                aria-labelledby={labelledby}
                aria-describedby={describedby}
                handleClose={handleClose}
            >
                {children}
            </StyledModal>
        </>
    );
}
