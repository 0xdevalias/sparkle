"use strict";

const fs = require("fs").promises;

const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise((resolve) =>
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  );
};

const puppeteer = require("puppeteer");

// Set to the dates one day before and one day after the day of reports to extract
const from = "07/24/2020";
const to = "07/26/2020";

// Zoom has a captcha, so save cookies to avoid logging in too many times.
// Set this to true to log in and save cookies.
// Set to false if cookies are already available.
const newLogin = false;

// Login credentials (only needed if newLogin is true)
const username = "";
const password = "";

// Log in to zoom, and download all participants reports from the above selected dates.
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const navigationPromise = page.waitForNavigation();

  await page.setViewport({ width: 1400, height: 900 });

  if (!newLogin) {
    console.log("Loading cookies");
    const cookiesString = await fs.readFile("./cookies.json");
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
  }

  await page.goto(`https://zoom.us/account/report/user?from=${from}&to=${to}`);

  await navigationPromise;

  if (newLogin) {
    await page.waitForSelector(".form > #login-form #email");
    await page.type(".form > #login-form #email", username);

    await page.type(".form > #login-form #password", password);

    await page.waitForSelector(
      "#login-form > .form-group > .controls > .signin > .btn"
    );
    await page.click("#login-form > .form-group > .controls > .signin > .btn");

    await navigationPromise;
  }

  console.log("Press any key to continue...");
  await keypress();

  if (newLogin) {
    console.log("Saving cookies");
    const cookies = await page.cookies();
    await fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2));
  }

  console.log("Beginning export");

  let onLastPageAndExportedAll = false;
  let pageNum = 1;
  while (!onLastPageAndExportedAll) {
    await page.waitForSelector("#meeting_list > tbody > tr");
    const numberOfReports = (await page.$$("#meeting_list > tbody > tr"))
      .length;
    console.log(`Number of reports on page ${pageNum}: ${numberOfReports}`);

    await page.waitFor(2000);

    let i = 1;

    while (i <= numberOfReports) {
      console.log(`Page ${pageNum}: exporting report ${i}...`);

      await page.waitForSelector(`#meeting_list > tbody > tr`, {
        visible: true,
      });

      await page.waitForSelector(
        `#meeting_list > tbody > tr:nth-child(${i}) > .col6 > a`,
        { visible: true }
      );
      await page.click(
        `#meeting_list > tbody > tr:nth-child(${i}) > .col6 > a`
      );

      await page.waitForSelector(
        "#contentDiv > .clearfix > div > #withMeetingHeaderDiv input",
        { visible: true }
      );
      await page.click(
        "#contentDiv > .clearfix > div > #withMeetingHeaderDiv input"
      );

      await page.waitFor(100);

      await page.waitForSelector(
        ".modal-body > #contentDiv #btnExportParticipants"
      );
      await page.click(".modal-body > #contentDiv #btnExportParticipants");

      await page.mouse.click(10, 10);

      await page.waitFor(1000);

      i += 1;
    }

    console.log("Moving on to next page...");

    await page.waitForSelector(
      "#meetingList > .list-col > .dynamo_pagination > li:nth-child(2) > a"
    );
    await page.click(
      "#meetingList > .list-col > .dynamo_pagination > li:nth-child(2) > a"
    );

    await navigationPromise;

    const nextButtonDisabled =
      (await page.$(
        "#meetingList > .list-col > .dynamo_pagination > li:nth-child(2).disabled > a"
      )) !== null;
    onLastPageAndExportedAll = nextButtonDisabled;

    pageNum += 1;
  }

  console.log("Press any key to continue...");
  await keypress();

  await browser.close();
})();
