export default function useCopyToClipboard() {
    const copyToClipboard = async ({ contentToCopy }) => {
        try {
            navigator.clipboard.writeText(contentToCopy);
        } catch (error) {
            console.error(error);
        }
    };
    return copyToClipboard;
}
