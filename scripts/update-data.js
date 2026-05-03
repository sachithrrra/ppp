import axios from 'axios';
import lookup from 'country-code-lookup';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PA.NUS.PPP  = PPP conversion factor, GDP (LCU per international $)
// PA.NUS.FCRF = Official exchange rate (LCU per US$, period average)
// Price level ratio = PA.NUS.PPP / PA.NUS.FCRF  (dimensionless, US = 1.0)
// This replicates the retired PA.NUS.PPPC.RF indicator (price level ratio).
const PPP_URL  = 'https://api.worldbank.org/v2/country/all/indicator/PA.NUS.PPP?downloadformat=excel';
const FCRF_URL = 'https://api.worldbank.org/v2/country/all/indicator/PA.NUS.FCRF?downloadformat=excel';
const OUTPUT_FILE = path.join(__dirname, '../data.json');

async function fetchRows(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer', maxRedirects: 5 });
    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { range: 3 });
}

function latestValue(row) {
    const years = Object.keys(row).filter(k => /^\d{4}$/.test(k)).sort().reverse();
    for (const year of years) {
        if (row[year] !== '' && row[year] !== undefined && row[year] !== null) {
            return parseFloat(row[year]);
        }
    }
    return null;
}

async function downloadAndProcess() {
    console.log('Downloading PPP and exchange rate data from World Bank...');
    try {
        const [pppRows, fxRows] = await Promise.all([
            fetchRows(PPP_URL),
            fetchRows(FCRF_URL),
        ]);

        // Build exchange rate map: ISO3 -> latest value
        const fxMap = {};
        fxRows.forEach(row => {
            const code = row['Country Code'];
            if (!code) return;
            const val = latestValue(row);
            if (val !== null) fxMap[code] = val;
        });

        console.log('Computing price level ratios (PPP / exchange rate)...');
        const pppData = {};

        pppRows.forEach(row => {
            const countryCode = row['Country Code'];
            if (!countryCode) return;

            const ppp = latestValue(row);
            const fx  = fxMap[countryCode];

            if (ppp === null || fx === undefined || fx === 0) return;

            const ratio = ppp / fx;

            pppData[countryCode] = ratio;

            const country = lookup.byIso(countryCode);
            if (country) {
                pppData[country.iso2] = ratio;
            }
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pppData, null, 2));
        console.log(`Data updated successfully! Saved to ${OUTPUT_FILE}`);
        console.log(`Total countries processed: ${Object.keys(pppData).length / 2}`);

    } catch (error) {
        console.error('Error updating data:', error.message);
        console.error(error);
        process.exit(1);
    }
}

downloadAndProcess();
