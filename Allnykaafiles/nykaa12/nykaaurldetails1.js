"use strict";
const axios = require("axios");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { headers, replce } = require("../../text");

const nykaafetchUrlDetails1 = async (url, browser, page) => {
  try {
    console.log(url);
    // api to get html of the required page
    browser = await puppeteer.launch({
      // headless: "new",
      headless: `true`,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // `headless: 'new'` enables new Headless;
      // `headless: false` enables “headful” mode.
    });

    page = await browser.newPage();
    await page.goto(url);
    // await page.waitForSelector("button.load-more-button");

    let html = await page.content();

    let $ = cheerio.load(html);
    let load = $("div.css-8u7lru>a").first().text();
    const nykaa = [];

    $("div#product-list-wrap>div.productWrapper.css-xin9gt").each(
      async (_idx, el) => {
        // selecting the elements to be scrapped
        const links = $(el);

        // let imagelink = links.find(imglink).attr("src"); // scraping the image

        const link = links // scraping the link of the product
          .find("a")
          .attr("href");

        let element = {
          // imagelink,
          productlink: `https://www.nykaa.com${link}`,
        };
        nykaa.push(element); //storing the details in an array
      }
    );
    let i = 1;

    while (load) {
      let pagenum = Math.min(4, i + 1);
      await page.click(`div.css-8u7lru>a:nth-child(${pagenum})`);
      // await page.waitForTimeout(1000);
      let lastHeight = await page.evaluate("document.body.scrollHeight");

      while (true) {
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await page.waitForTimeout(1000); // sleep a bit
        let newHeight = await page.evaluate("document.body.scrollHeight");
        if (newHeight === lastHeight) {
          break;
        }
        lastHeight = newHeight;
      }

      // await page.waitForSelector("button.load-more-button");
      html = await page.content();

      $ = cheerio.load(html);

      $("div#product-list-wrap>div.productWrapper.css-xin9gt").each(
        async (_idx, el) => {
          // selecting the elements to be scrapped
          const links = $(el);

          // let imagelink = links.find(imglink).attr("src"); // scraping the image

          const link = links // scraping the link of the product
            .find("a")
            .attr("href");

          let element = {
            // imagelink,
            productlink: `https://www.nykaa.com${link}`,
          };
          nykaa.push(element); //storing the details in an array
        }
      );
      load = $("div.css-8u7lru>a").first().text();
      console.log(load);
      i++;
      if (i == 3) {
        break;
      }
    }
    await page.close();
    await browser.close();

    return nykaa;
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }
      if (browser) {
        await browser.close();
      }
      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      $ = cheerio.load(html);

      const nykaa = [];

      $("div#product-list-wrap>div.productWrapper.css-xin9gt").each(
        async (_idx, el) => {
          // selecting the elements to be scrapped
          const links = $(el);

          // let imagelink = links.find(imglink).attr("src"); // scraping the image

          const link = links // scraping the link of the product
            .find("a")
            .attr("href");

          let element = {
            // imagelink,
            productlink: `https://www.nykaa.com${link}`,
          };
          nykaa.push(element); //storing the details in an array
        }
      );
      return nykaa;
    } catch (e) {
      return [{ message: "Can not fetch" }];
    }
  }
};

module.exports = { nykaafetchUrlDetails1 };