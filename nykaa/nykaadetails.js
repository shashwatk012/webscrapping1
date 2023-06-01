const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { headers, replce } = require("../text");

const nykaafetchIndividualDetails = async (url, browser, page) => {
  // function to scrap complete data about one product
  try {
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

    let lastHeight = await page.evaluate("document.body.scrollHeight");

    while (true) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(2000); // sleep a bit
      let newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === lastHeight) {
        break;
      }
      lastHeight = newHeight;
    }

    const html = await page.content();

    const hii = await page.$("span.css-16jimk8");
    await hii.click("span.css-16jimk8");
    await page.waitForSelector("div.css-3auqkn>span.css-kvhcn5");

    // const html1 = await page.content();

    await page.click("span.css-kvhcn5");
    await page.waitForSelector("label.css-qi8mdx");

    // const html2 = await page.content();

    const pullovers = await page.$$("label.css-qi8mdx>span");
    // console.log(pullovers);
    await pullovers[4].click();
    await page.waitForSelector("div.css-3auqkn>span.css-kvhcn5");

    // await page.hover("a.css-1mavm7h");

    const html1 = await page.content();

    // cheerio nodejs module to load html
    let $ = cheerio.load(html);

    // Declaration of object to store the product details
    let obj = {};

    let a = $("div#brand_arrowUp").text();

    // Scraping the ProductName
    const ProductName = $("div.css-1d5wdox>h1.css-1gc4x7i").text().trim();
    if (ProductName !== undefined) {
      obj["ProductName"] = ProductName;
    }

    const pos = ProductName.indexOf("(");

    if (pos !== -1) {
      let Quantity = ProductName.substring(pos + 1, ProductName.length - 1);

      const QuantityUnit = Quantity.match(/[a-z]+/gi).join("");
      // matching all numbers
      Quantity = Quantity.match(/\d+/g).join("");

      obj["Quantity"] = Number(Quantity);
      obj["Quantity unit"] = QuantityUnit;
    } else {
      obj["Quantity"] = 1;
      obj["Quantity Unit"] = "NA";
    }

    const price = $("div.css-1d0jf8e>span.css-1jczs19").text();
    let arr = [];

    if (price) {
      arr = price.split("₹");
    }
    obj["price"] = Number(arr[1]);

    obj["Price per unit"] = obj["price"] / obj["Quantity"];

    const maxretailprice = $("div.css-1d0jf8e>span.css-u05rr>span").text();

    if (maxretailprice) {
      arr = maxretailprice.split("₹");
    }

    obj["maxretailprice"] = Number(arr[1]);

    const discount = $("div.css-1d0jf8e>span.css-bhhehx").text();

    if (discount) {
      arr = discount.split("%");
    }

    obj["Discount%"] = Number(arr[0]);

    // scraping the number of global ratings and reviews
    let ratingsandreviews = $("div.css-1hvvm95").text().trim();
    let ratings, reviews;
    if (ratingsandreviews) {
      arr = ratingsandreviews.split(" ");
      ratings = Number(arr[0]);
      reviews = Number(arr[arr.length - 2]);
    }

    // scraping the global rating(i.e 4.1)
    let stars = $("div.css-m6n3ou").text();

    if (stars) {
      arr = stars.split("/");
      obj.stars = Number(arr[0]);
    }

    obj["Ratings"] = ratings;
    obj["Reviews"] = reviews;

    let categories = [];
    $("div.css-16kpx0l>ul.css-1uxnb1o>li").each(async (_idx, el) => {
      const x = $(el);
      const category = x.find("a.name").text();
      categories.push(category);
    });
    obj["Mother Category"] = categories[1];
    obj["Category"] = categories[2];
    obj["Sub-Category"] = categories[3];

    //scraping the pagelink for the reviews
    const reviewsLink = $("div.css-1ux41ja>a.css-1xv8iu0").attr("href");
    if (reviewsLink !== undefined) {
      obj["reviewsLink"] = `https://www.nykaa.com${reviewsLink}`;
    }

    let count = 1;
    $("div.css-qb9x9j").each(async (_idx, el) => {
      count++;
    });
    obj["Number of images"] = count;

    console.log(obj);
    $ = cheerio.load(html1);
    // const ab = $("label.css-qi8mdx").text();
    const abc = $("span.css-kvhcn5").text();
    console.log(abc);
    // let brands = [];
    // $("div.css-150nd8c>a").each(async (_idx, el) => {
    //   const x = $(el);
    //   brands.push(x.text());
    // });

    // if (ProductName) {
    //   let arr = ProductName.split(" ");
    //   const index = brands.findIndex((element) => element.includes(arr[0]));
    //   obj.Brand = brands[index];
    // }
    await page.close();
    await browser.close();
    return obj;
  } catch (error) {
    console.log(error);
    res.send("something wrong with details");
  }
};

module.exports = { nykaafetchIndividualDetails };