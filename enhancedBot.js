// Import puppeteer-extra and the stealth plugin
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fetch = require('node-fetch'); // Ensure you have node-fetch or similar installed to make HTTP requests

async function solveCaptcha(apiKey, googleKey, pageUrl) {
  const formData = new URLSearchParams();
  formData.append('key', apiKey);
  formData.append('method', 'userrecaptcha');
  formData.append('googlekey', googleKey);
  formData.append('pageurl', pageUrl);
  formData.append('json', 1);

  const response = await fetch('http://2captcha.com/in.php', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();

  if (data.status === 1) {
    let captchaId = data.request;
    let solvedCaptcha = await checkCaptcha(apiKey, captchaId);
    return solvedCaptcha;
  } else {
    throw new Error('Failed to submit captcha for solving.');
  }
}

async function checkCaptcha(apiKey, captchaId) {
  const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`;

  for (let i = 0; i < 15; i++) { // Try up to 15 times to get the solved captcha
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 1) {
      return data.request;
    }
  }
  throw new Error('Failed to solve captcha in time.');
}

async function humanMouseMove(page, targetSelector) {
  const target = await page.$(targetSelector);
  if (!target) {
      console.log(`Selector ${targetSelector} not found.`);
      return;
  }
  const targetBox = await target.boundingBox();
  const {x, y, width, height} = targetBox;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  await page.mouse.move(centerX, centerY, {steps: 10});
  await page.mouse.click(centerX, centerY);
}


async function randomSelector(page) {
  const selectors = [
      '#challenge-stage > div > label > input[type=checkbox]',
      '#challenge-stage > div'
  ];

  // Choose a random selector from the array
  const randomIndex = Math.floor(Math.random() * selectors.length);
  const chosenSelector = selectors[randomIndex];

  console.log(`Using selector: ${chosenSelector}`);
  await humanMouseMove(page, chosenSelector);

  // Adding random delay after action to mimic human behavior
  const randomDelay = Math.random() * (16000 - 6000) + 6000;
  await new Promise(resolve => setTimeout(resolve, randomDelay)); // 120000 milliseconds = 2 minutes
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the targeted webpage
    await page.goto("https://rollbit.com/trade", { waitUntil: 'networkidle0' });
    console.log('Page stable/network idle and done loading');

     // Check for and click the specified element until it's no longer present
     let elementVisible = await page.$('#challenge-stage > div'); // Replace 'ELEMENT_SELECTOR' with the actual selector
     while (elementVisible) {
      
        // await humanMouseMove(page, '#challenge-stage > div');
         await randomSelector(page);
         console.log('waiting');
         const randomDelay = Math.random() * (16000 - 6000) + 6000;
         await new Promise(resolve => setTimeout(resolve, randomDelay)); // 120000 milliseconds = 2 minutes
         elementVisible = await page.$('#challenge-stage > div'); // Check again if the element is still visible
     }
     console.log('Element is no longer present.');

    // Assuming you've identified the captcha's google key and the page URL where captcha appears
    const googleKey = 'YOUR_SITEKEY_HERE'; // Replace with the site's reCAPTCHA key
    const pageUrl = 'https://rollbit.com/trade'; // The URL where the captcha is found

    try {
        const apiKey = '4dfd509b8b8dee5bd6c0d439f2becd30'; // Replace with your 2Captcha API key
        //const solvedCaptcha = await solveCaptcha(apiKey, googleKey, pageUrl);

        // Use the solved captcha response to fill and submit the captcha form on the page
        // This part of the script depends on how the captcha is implemented on the page
        // Example for reCAPTCHA v2: 
        //await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${solvedCaptcha}";`);
        // Make sure to trigger any necessary event listeners or form submissions after filling the captcha response
        
        console.log('Captcha solved and submitted.');

        // Adding a 2-minute pause
        await new Promise(resolve => setTimeout(resolve, 120000)); // 120000 milliseconds = 2 minutes
        console.log('2-minute pause is over.');
    } catch (error) {
        console.error('Error solving captcha:', error.message);
    }

    // Your interaction with the webpage continues here

    await browser.close();
})();
