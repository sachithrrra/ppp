
# PPP (Purchasing Power Parity)

A simple, lightweight, and dependency-free (for clients) NPM package to calculate **Purchasing Power Parity (PPP)** adjusted fair prices in USD.

This package allows you to calculate what a "fair" price (in USD) would be in a different country, based on the **Price Level Ratio of PPP conversion factor to market exchange rate**.

## Installation

```bash
npm install @sachithrrra/ppp
```

## Quick Start
Calculate a fair price for a $10 product in Sri Lanka:

```javascript
import ppp from '@sachithrrra/ppp';

// Sri Lanka (Default: Smoothing 0.2, No Rounding)
console.log(ppp(10, 'LK')); 
// Output: 4.3108...

// Sri Lanka (Currency Rounding)
console.log(ppp(10, 'LK', 0.2, 'currency')); 
// Output: 4.31

// Sri Lanka (Pretty Rounding)
console.log(ppp(10, 'LK', 0.2, 'pretty')); 
// Output: 4.49 (Rounded to nice marketing numbers like .49, .99, or integers)
```

## Why use this?

Charging the same USD price globally ignores the vast differences in purchasing power.
-   **$10** in the US is a cheap lunch.
-   **$10** in a developing nation might be a day's wage.

By adjusting your pricing, you make your product affordable to the rest of the world (parity pricing), potentially increasing your total revenue by unlocking new markets.

## API Reference

### `ppp(originalPrice, countryCode, smoothing, rounding)`

Calculates the PPP-adjusted fair price in USD.

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `originalPrice` | `number` | **Required** | The base price in USD (your US / Global price). |
| `countryCode` | `string` | **Required** | The ISO country code (2-letter or 3-letter). Case-insensitive. |
| `smoothing` | `number` | `0.2` | A normalization factor between `0` and `1`. |
| `rounding` | `string` | `'none'` | Rounding method: `'none'`, `'currency'`, `'pretty'`. |

**Returns**: `number` The adjusted price in USD. Returns `null` if the country code is invalid.

#### The `smoothing` Parameter

Raw PPP prices can sometimes be too low. The `smoothing` parameter helps normalize the price.

-   **`0.2` (Default)**: A balanced discount.
-   **`0`**: Raw PPP Price (Aggressive discount).
-   **`1`**: Original Price (No discount).

#### The `rounding` Parameter

Controls how the final price is formatted.

-   **`'none'` (Default)**: Returns the raw calculated number (e.g. `4.310847...`). Maximum precision.
-   **`'currency'`**: Rounds to 2 decimal places (standard USD format).
    -   `4.3108...` -> `4.31`
-   **`'pretty'`**: Rounds to marketing-friendly numbers.
    -   Prices < 10: Ends in `.49` or `.99` (e.g. `4.31` -> `4.49`).
    -   Prices 10-100: Rounds to nearest integer (e.g. `43.2` -> `43`).
    -   Prices > 100: Rounds to nearest 5 (e.g. `132` -> `130`, `134` -> `135`).

---

### `ppp.factor(countryCode)`

Retrieves the **Price Level Ratio** (The "Fairness Factor") used for the country.

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `countryCode` | `string` | **Required** | The ISO country code. |

**Returns**: `number` The raw ratio used for calculation.
-   `~0.29` (Sri Lanka) -> Goods are ~29% as expensive as in the US.
-   `~1.0` (USA) -> Baseline.
-   `> 1.0` (Switzerland) -> Goods are more expensive than in the US.

## How it works

The library uses the **Price Level Ratio of PPP conversion factor (GDP) to market exchange rate** (World Bank Indicator: `PA.NUS.PPPC.RF`). 

**Formula**:
`Fair_Price_USD = Original_USD_Price * (Ratio + (1 - Ratio) * Smoothing)`

## License

MIT
