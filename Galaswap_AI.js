const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the GalaSwap site\
    //await page.goto("https://galaswap.gala.com/swap/Materium%7CUnit%7Cnone%7Cnone/GALA%7CUnit%7Cnone%7Cnone?quantity=1000", { waitUntil: 'networkidle0' });
    await page.goto("https://galaswap.gala.com/", { waitUntil: 'networkidle0' });
    
    // Example: Wait for a specific element that indicates the page has loaded
    console.log('Page stable/network idle and done loading');
    await page.waitForSelector('#__nuxt > div.page.relative > header > nav > div.flex.shrink.items-center.gap-4 > a > svg');
    console.log('found Gala selector'); 

    await page.waitForSelector('#headlessui-listbox-button-3 > span:nth-child(1)');
    console.log('found input selector'); 

    // Ensure the dropdown is loaded
    await page.waitForSelector('#headlessui-listbox-button-6', { visible: true });

    // Click the dropdown to expand the options
    await page.click('#headlessui-listbox-button-6');

    // Wait for the dropdown options to become visible
    await page.waitForSelector('li[id="headlessui-listbox.option-52"]', { visible: true }); 
    //console.log('found li[id="headlessui-listbox.option-52"]');

    await page.evaluate(() => {
        // Find the option with the specific content
        const options = Array.from(document.querySelectorAll('li[role="option"]'));
        const targetOption = options.find(option => option.innerText.includes('MTRM'));
    
        // Click the target option if it exists
        if (targetOption) {
            targetOption.click();
            console.log('Option clicked');
        } else {
            console.log('Option not found');
        }
    });

    

    // Use page.evaluate to access the DOM element properties
    const elementDetails = await page.evaluate(() => {
        const element = document.querySelector('span.flex.items-center'); // Adjust the selector if needed
        if (element) {
            const imgSrc = element.querySelector('img') ? element.querySelector('img').src : null;
            const spanText = element.querySelector('span.symbol') ? element.querySelector('span.symbol').textContent : null;
            return { imgSrc, spanText };
        }
        return null;
    });

    if (elementDetails) {
        console.log('Element details:', elementDetails);
    } else {
        console.log('Element not found');
    }

    const swapOffers = await page.evaluate(() => {
        // Initialize an array to hold the extracted swap offer(s)
        let offers = [];
    
        // Define a function to safely extract text content
        const extractText = (selector, parent = document) => {
            const element = parent.querySelector(selector);
            return element ? element.textContent.trim() : null;
        };
    
        // Find the container of the swap results. This example assumes there's only one swap offer.
        // Adjust the selector based on the actual structure if there are multiple offers.
        const swapResultItem = document.querySelector('.swap-results-item');
    
        if (swapResultItem) {
            // Extracting the token you give
            const youGiveToken = extractText('.data-row:nth-child(1) .symbol', swapResultItem);
            const youGiveQuantity = extractText('.data-row:nth-child(1) span:last-child', swapResultItem);
    
            // Extracting the exchange rate
            const exchangeRate = extractText('.data-row:nth-child(2) .flex', swapResultItem);
    
            // Extracting the token you receive
            const youReceiveToken = extractText('.data-row:nth-child(3) .symbol', swapResultItem);
            const youReceiveQuantity = extractText('.data-row:nth-child(3) span:last-child', swapResultItem);
    
            // Extracting gas fee (assuming it's in GALA)
            const gasFee = extractText('.data-row:nth-child(5) span:last-child', swapResultItem);
    
            // Constructing the offer object
            const offer = {
                youGive: {
                    token: youGiveToken,
                    quantity: parseFloat(youGiveQuantity || '0'),
                },
                exchangeRate: parseFloat(exchangeRate.split(' ')[1] || '0'),
                youReceive: {
                    token: youReceiveToken,
                    quantity: parseFloat(youReceiveQuantity || '0'),
                },
                gasFee: parseFloat(gasFee || '0'),
            };
    
            offers.push(offer);
        }
    
        return offers;
    });
    
    // Compare exchange rates with data obtained from other platforms
    for (const offer of swapOffers) {
        //const dexPrice = await getDexPrice(offer.token); // Use your method to get Dex price
        const dexPrice = 100000;

        // Compare GalaSwap exchange rate with Dex price
        if (offer.exchangeRate > dexPrice) {
            // Execute the trade on GalaSwap
            //await executeTrade(offer);
            console.log("Trade executed on GalaSwap:", offer);
        }
    }

    await browser.close();
})();

async function getDexPrice(token) {
    // Implement your method to get the price from the Dex
}

async function executeTrade(offer) {
    // Implement logic to execute the trade on GalaSwap
}
