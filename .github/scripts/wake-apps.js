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

        // Navigate to the app
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a moment for the page to load
        await page.waitForTimeout(3000);

        // Check if the wake-up button exists (look for the text content)
        const wakeUpButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn =>
                btn.textContent.includes('Yes, get this app back up!')
            );
        });

        if (wakeUpButton) {
            console.log('💤 App is sleeping. Clicking wake-up button...');

            // Click the button using page.evaluate
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.textContent.includes('Yes, get this app back up!'));
                if (btn) btn.click();
            });

            // Wait for the app to wake up
            await page.waitForTimeout(10000);
            console.log('✅ App woken up successfully!');
        } else {
            console.log('✅ App is already awake!');
        }

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
