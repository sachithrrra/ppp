import ppp from './index.js';

console.log('Testing PPP Package (FAIR PRICE):');

// Test with Sri Lanka (2-letter)
// Test with Sri Lanka (Default Smoothing 0.2)
// Latest data from WB for LK is ~0.288
// Calculation: 10 * (0.288 + (1-0.288)*0.2) = 10 * (0.288 + 0.1424) = 4.304...
try {
    const pppLKDefault = ppp(10, 'LK');
    console.log(`Fair USD Price for $10 (Default Smoothing 0.2): ${pppLKDefault} (Expected ~4.30)`);

    const pppLKRaw = ppp(10, 'LK', 0);
    console.log(`Fair USD Price for $10 (Raw PPP - Smoothing 0): ${pppLKRaw} (Expected ~2.89)`);

    const pppLKSmooth = ppp(10, 'LK', 0.5);
    console.log(`Fair USD Price for $10 (Smoothing 0.5): ${pppLKSmooth} (Expected ~6.44)`);
    
    // Rounding Tests
    const pppLKCurrency = ppp(10, 'LK', 0.2, 'currency');
    console.log(`Fair USD Price for $10 (Currency Rounding): ${pppLKCurrency} (Expected 4.31)`);

    const pppLKPretty = ppp(10, 'LK', 0.2, 'pretty');
    console.log(`Fair USD Price for $10 (Pretty Rounding): ${pppLKPretty} (Expected 4.49)`);

    const pppLKPrettyHigh = ppp(100, 'LK', 0.2, 'pretty'); 
    // 100 * (0.288 + 0.1424) = 43.04 -> Pretty -> 43
    console.log(`Fair USD Price for $100 (Pretty Rounding): ${pppLKPrettyHigh} (Expected 43 or similar integer)`);

} catch (e) {
    console.error('Sri Lanka (LK) Failed', e);
}

// Test with Sri Lanka (3-letter)
try {
    const pppLKA = ppp(10, 'LKA');
    console.log(`Fair USD Price for $10 in Sri Lanka (LKA - Default): ${pppLKA} (Expected ~4.30)`);
} catch (e) {
    console.error('Sri Lanka (LKA) Failed', e);
}

// Test with Non-existent
try {
    const result = ppp(1, 'ZZ');
    if (result === null) {
        console.log('Passed invalid code test (Result is null)');
    } else {
        console.error('Failed invalid code test');
    }
} catch (e) {
    // Should pass if it returns null, not throw
}

// Test factor method
try {
    const factor = ppp.factor('LK');
    console.log(`Factor for LK: ${factor}`);
    if (factor > 0) {
        console.log('Factor test passed');
    } else {
        console.error('Factor test failed');
    }
} catch (e) {
    console.error('Factor test errored', e);
}
