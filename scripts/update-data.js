import axios from 'axios';
import lookup from 'country-code-lookup';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_URL = 'https://api.worldbank.org/v2/country/all/indicator/PA.NUS.PPPC.RF?downloadformat=excel';
const OUTPUT_FILE = path.join(__dirname, '../data.json');

async function downloadAndProcess() {
    console.log('Downloading data from World Bank...');
    try {
        const response = await axios.get(DATA_URL, {
            responseType: 'arraybuffer',
            maxRedirects: 5
        });

        console.log(`Processing Excel data...`);
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        // The file usually has 3 header rows. The real header is row 4 (index 3).
        const data = XLSX.utils.sheet_to_json(sheet, { range: 3 });

        const pppData = {};

        data.forEach(row => {
            const countryCode = row['Country Code']; // ISO 3-letter
            if (!countryCode) return;

            // Find the latest year with data
            // Columns are usually "1960", "1961", ... "2023", etc.
            // We iterate backwards from current year.
            let latestValue = null;
            const years = Object.keys(row).filter(k => /^\d{4}$/.test(k)).sort().reverse();
            
            for (const year of years) {
                if (row[year] !== '' && row[year] !== undefined && row[year] !== null) {
                    latestValue = parseFloat(row[year]);
                    break;
                }
            }

            if (latestValue !== null) {
                // Store both 2-letter and 3-letter codes for easy lookup
                pppData[countryCode] = latestValue;
                
                // Try to find 2-letter code
                const country = lookup.byIso(countryCode);
                if (country) {
                    pppData[country.iso2] = latestValue;
                }
            }
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pppData, null, 2));
        console.log(`Data updated successfully! Saved to ${OUTPUT_FILE}`);
        console.log(`Total countries processed: ${Object.keys(pppData).length / 2}`); // Divide by 2 because we store 2 codes per country approx

    } catch (error) {
        console.error('Error updating data:', error.message);
        console.error(error);
        process.exit(1);
    }
}

downloadAndProcess();
