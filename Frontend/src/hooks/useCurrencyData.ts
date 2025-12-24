import { useGetGeneralSettingsQuery } from "@/redux/api/settings/generalsettings/generalSettingsApi";

export function useCurrencyData() {
    const { data: settingsData, isLoading, error } = useGetGeneralSettingsQuery(undefined);

    const currencyCode = settingsData?.data?.default_currency || "USD";
    const currencySign = settingsData?.data?.currency_sign || "$";

    // Format price with either code or sign
    const formatPrice = (price: number | string, type: "code" | "sign" = "code"): string => {
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        const formattedPrice = numPrice.toFixed(2);

        if (type === "code") {
            return `${currencyCode} ${formattedPrice}`;
        } else {
            return `${currencySign}${formattedPrice}`;
        }
    };

    const currencyData = {
        code: currencyCode,
        sign: currencySign,
        formatPrice,
        isLoading,
        error,
    };

    return currencyData;
}
