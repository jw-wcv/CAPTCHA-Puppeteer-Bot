// Use puppeteer-extra with the stealth plugin to prevent detection
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Assuming you're using a captcha service like 2Captcha
const CaptchaSolver = require('2captcha-node');
const solver = new CaptchaSolver('YOUR_2CAPTCHA_API_KEY');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to Rollbit's trade page
    await page.goto("https://rollbit.com/trade", { waitUntil: 'networkidle0' });

    console.log('Page stable/network idle and done loading');

    // Your script logic to interact with the page goes here
    // Example: Fill in a form, click a button, etc.

    // Checking for the presence of a captcha
    // Note: Update 'CAPTCHA_SELECTOR' to the actual selector of the captcha image or iframe
    const isCaptchaPresent = await page.$('CAPTCHA_SELECTOR') !== null;
    
    if (isCaptchaPresent) {
        // Solve the captcha
        // Note: You need to determine the correct method to retrieve the captcha image or data needed for solving
        const captchaSolution = await solver.solveCaptcha('CAPTCHA_DATA_HERE');

        // Enter the captcha solution
        // Note: Update 'CAPTCHA_INPUT_SELECTOR' with the selector of the input field for the captcha solution
        await page.type('CAPTCHA_INPUT_SELECTOR', captchaSolution);

        // Submit the captcha solution
        // Note: Update 'SUBMIT_BUTTON_SELECTOR' with the actual selector of the submit button for the captcha
        await page.click('SUBMIT_BUTTON_SELECTOR');
    }

    // Continue with your script's logic after solving the captcha

    await browser.close();
})();
