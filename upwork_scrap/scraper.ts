const playwright = require('playwright');
const random_useragent = require('random-useragent');
const fs = require('fs');
const csvWriter = require('csv-write-stream');

const BASE_URL = 'https://www.upwork.com/nx/search/jobs?amount=1000-4999,5000-&duration_v3=months,semester,ongoing&hourly_rate=20-&location=Australia,Austria,Belgium,Canada,Croatia,Czech%20Republic,Denmark,Estonia,Finland,France,Germany,Hong%20Kong,Hungary,Ireland,Italy,Lithuania,Luxembourg,Monaco,Netherlands,New%20Zealand,Norway,Saudi%20Arabia,Slovakia,Slovenia,South%20Korea,Spain,Sweden,Switzerland,United%20Arab%20Emirates,United%20Kingdom,United%20States&payment_verified=1&per_page=100&q=NOT%20%28adult%20OR%20gambling%20OR%20dutch-speaking%20OR%20LATAM%20OR%20developer%20OR%20engineer%20OR%20tutor%20OR%20coder%20OR%20expert%20OR%20programmer%20OR%20coach%20OR%20manager%20OR%20specialist%20OR%20designer%20OR%20freelancer%29&sort=recency&t=0,1';

;(async () => {
  // create random agent
  const agent = random_useragent.getRandom();

  // browser setup
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({ userAgent: agent });
  const page = await context.newPage({ bypassCSP: true });
  await page.setDefaultTimeout(30000);
  await page.setViewportSize({ width: 800, height: 600 });

  // Array to store gathered information
  const allText = [];

  // Loop through multiple pages
  for (let pageIdx = 1; pageIdx <= 10; pageIdx++) {
    const url = `${BASE_URL}&page=${pageIdx}`;
    await page.goto(url);

    // Gather information from the current page
    const text = await page.locator('span.air3-token').allInnerTexts();

    // Exclude values starting with "+"
    const filteredText = text.filter(value => !value.startsWith('+'));
    
    // Add the filtered values to the allText array
    allText.push(...filteredText);

    // Delay to ensure the page is loaded before navigating to the next one
    // await page.waitForTimeout(2000);
  }

  // Store Data into CSV File
  const writer = csvWriter();
  writer.pipe(fs.createWriteStream('data.csv'));

  allText.forEach(value => {
    writer.write({ value });
  });

  writer.end();

  // close browser
  await browser.close();
})().catch((error) => {
  console.log(error);
  process.exit(1);
});
