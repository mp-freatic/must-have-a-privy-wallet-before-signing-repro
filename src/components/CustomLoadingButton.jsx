import { LoadingButton } from "@mui/lab";

export default function CustomLoadingButton({ children, ...props }) {
    return (
        <LoadingButton {...props}>
            {props.loading ? "Processing..." : children}
        </LoadingButton>
    );
}
