import axios from "axios";
import { CURRENCY_SYMBOL } from "src/constants";

/**
 * Get the exchange rates of a currency
 * @param refCurrencySymbol - reference currency
 * @param rateCurrenciesSymbols - currencies in which the exchange rate is calculated
 * @returns {Promise<Record<string, number>>}
 */
export async function getCurrencyRate(
    refCurrencySymbol = CURRENCY_SYMBOL.ETH,
    rateCurrenciesSymbols = [CURRENCY_SYMBOL.USD],
) {
    const headers: Record<string, string> = {};
    const apiKey = import.meta.env.VITE_CRYPTO_COMPARE_API_KEY;
    if (apiKey) {
        headers["authorization"] = `apiKey ${apiKey}`;
    }
    const rawResponse = await axios.get<Record<string, number>>(
        `https://min-api.cryptocompare.com/data/price?fsym=${refCurrencySymbol}&tsyms=${rateCurrenciesSymbols.join(
            ",",
        )}`,
        {
            headers,
        },
    );
    return rawResponse.data;
}
