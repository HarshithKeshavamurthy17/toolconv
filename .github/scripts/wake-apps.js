import puppeteer from 'puppeteer';

const STREAMLIT_APPS = [
    'https://lexguard-app.streamlit.app/',
    'https://f1-win-predictor-app.streamlit.app/',
    'https://autokpi-hk-app.streamlit.app/',
    'https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app/',
];

async function wakeUpApp(browser, url) {
    const page = await browser.newPage();

    try {
        console.log(`\n🔍 Checking ${url}...`);

        // Set a realistic viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to the app
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for initial load
        await page.waitForTimeout(5000);

        // Check if the wake-up button exists
        const wakeUpButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn =>
                btn.textContent.includes('Yes, get this app back up!')
            );
        });

        if (wakeUpButton) {
            console.log('💤 App is sleeping. Clicking wake-up button...');

            // Click the button
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.textContent.includes('Yes, get this app back up!'));
                if (btn) btn.click();
            });

            // Wait for the app to wake up and load
            console.log('⏳ Waiting for app to wake up...');
            await page.waitForTimeout(15000);

            // Wait for Streamlit to fully load (look for iframe or streamlit elements)
            try {
                await page.waitForSelector('iframe, [data-testid="stApp"]', { timeout: 30000 });
                console.log('✅ App woken up and loaded successfully!');
            } catch (e) {
                console.log('⚠️  App woken up but Streamlit elements not detected');
            }
        } else {
            console.log('✅ App is already awake!');

            // Even if awake, wait for Streamlit to fully load to establish WebSocket
            try {
                await page.waitForSelector('iframe, [data-testid="stApp"]', { timeout: 10000 });
                console.log('📡 Streamlit app fully loaded with WebSocket connection');
            } catch (e) {
                console.log('⚠️  Streamlit elements not detected, but page loaded');
            }
        }

        // Stay on the page for a bit to maintain the session
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error(`❌ Error with ${url}:`, error.message);
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('🚀 Starting Streamlit app wake-up process...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    });

    try {
        for (const url of STREAMLIT_APPS) {
            await wakeUpApp(browser, url);
        }

        console.log('\n✨ All apps processed successfully!');
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main();
