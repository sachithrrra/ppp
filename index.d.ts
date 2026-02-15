/**
 * Rounding strategies for the final calculated price
 */
export type RoundingStrategy = 'none' | 'currency' | 'pretty';

/**
 * Calculates the Purchasing Power Parity (PPP) adjusted fair price in USD.
 * 
 * @param originalPrice - The base price in USD (International Dollars).
 * @param countryCode - The ISO country code (2-letter or 3-letter). Case-insensitive.
 * @param smoothing - A value between 0 and 1 to normalize the price. Default is 0.2.
 * @param rounding - Rounding strategy: 'none', 'currency', 'pretty'. Default is 'none'.
 * @returns The PPP adjusted price in USD, or null if invalid inputs/country code.
 */
declare function ppp(
    originalPrice: number,
    countryCode: string,
    smoothing?: number,
    rounding?: RoundingStrategy
): number | null;

/**
 * Namespace for additional PPP utilities
 */
declare namespace ppp {
    /**
     * Retrieves the Price Level Ratio for the given country code.
     * @param countryCode - The ISO country code (2-letter or 3-letter).
     * @returns The raw Price Level Ratio, or null if not found.
     */
    function factor(countryCode: string): number | null;
}

export default ppp;
