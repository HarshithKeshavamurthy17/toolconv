const puppeteer = require('puppeteer');

const urls = [
    'https://lexguard-app.streamlit.app/',
    'https://f1-win-predictor-app.streamlit.app/',
    'https://autokpi-hk-app.streamlit.app/',
    'https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app/'
];

(async () => {
    console.log('🚀 Starting aggressive wake-up protocol...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const url of urls) {
        console.log(`\nTargeting: ${url}`);
        const page = await browser.newPage();

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        try {
            // Go to the page and wait for network activity to settle
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            console.log('✅ Page loaded');

            // Check for the "Yes, get this app back up!" button
            // Streamlit sleep page usually has a button with this text
            const wakeUpButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const target = buttons.find(b => b.innerText.includes('Yes, get this app back up!'));
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            });

            if (wakeUpButton) {
                console.log('💤 App was sleeping. Clicked "Wake Up" button! 🔔');
                // Wait for the app to actually boot up
                await new Promise(r => setTimeout(r, 10000));
            } else {
                console.log('✨ App appears to be running (no wake-up button found).');
            }

            // Take a screenshot for debugging (optional, but good practice in CI)
            // await page.screenshot({ path: `screenshot-${url.split('/')[2]}.png` });

        } catch (error) {
            console.error(`❌ Failed to process ${url}:`, error.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('\n🏁 Aggressive wake-up protocol complete.');
})();
