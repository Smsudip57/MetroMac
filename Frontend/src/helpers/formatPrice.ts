// Assuming this helper function formats numbers with commas

export function formatPrice(price: number | undefined | null): string {
    return (
        (price ?? 0)?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + "৳"
    );
}
