// This page scrapps the complete product details

const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { headers, replce } = require("../text");

const scrapdetails = (html) => {
  // cheerio nodejs module to load html
  const $ = cheerio.load(html);

  // Declaration of object to store the product details
  let obj = {};

  // Scraping the ProductName
  let ProductName = $(
    "div._1AtVbE.col-12-12>div.aMaAEs>div>h1.yhB1nd>span.B_NuCI"
  )
    .text()
    .trim();
  if (ProductName !== undefined) {
    obj["ProductName"] = ProductName;
  }

  ProductName = null;

  let price = $("div._30jeq3._16Jk6d").text();
  price = replce(price);
  obj["price"] = price;

  let maxprice = $("div._3I9_wc._2p6lqe").text();
  if (maxprice === "") {
    maxprice = price;
  } else {
    maxprice = replce(maxprice);
  }
  obj["maxretailprice"] = maxprice;

  let discount = (maxprice - price) / maxprice;
  obj["Discount%"] = Math.floor(discount * 100);

  let image = $("div.CXW8mj._3nMexc>img").attr("src");
  if (image === undefined) {
    image = $("img._2r_T1I._396QI4").attr("src");
  }
  obj["imagelink"] = image;

  // scraping the number of global ratings
  let ratings = $("span._2_R_DZ._2IRzS8").text();

  // scraping the global rating(i.e 4.1)
  let stars = $("div._3LWZlK._138NNC").text();

  if (stars && ratings) {
    stars = replce(stars);
    obj.stars = stars;
    let p = ratings.indexOf("and");
    if (p === -1) {
      p = ratings.indexOf("&");
    }
    let rating = ratings.substring(0, p);
    let review = ratings.substring(p);
    rating = rating.replace(/\D/g, "");
    review = review.replace(/\D/g, "");

    rating = replce(rating);
    review = replce(review);
    obj["Ratings"] = rating;
    obj["Reviews"] = review;
  } else {
    // scraping the number of global ratings
    let ratings = $("div.row._2afbiS>div.col-12-12>span").text();

    // scraping the global ratings(i.e 4.1)
    let stars = $("div._2d4LTz").text();
    stars = replce(stars);
    obj.stars = stars;
    let p = ratings.indexOf("and");
    if (p === -1) {
      p = ratings.indexOf("&");
    }
    let rating = ratings.substring(0, p);
    let review = ratings.substring(p);
    rating = rating.replace(/\D/g, "");
    review = review.replace(/\D/g, "");
    rating = replce(rating);
    review = replce(review);
    obj["Ratings"] = rating;
    obj["Reviews"] = review;
  }
  ratings = null;
  stars = null;

  // Declaration of an array to store the Category and Sub-Categories
  let Categories = [];

  //selecting the category element and the looping to get the category and sub-category
  $("div._1MR4o5>div._3GIHBu").each(async (_idx, el) => {
    const x = $(el);
    let category = x.find("a._2whKao").text();
    if (category) {
      Categories.push(category);
    }
    category = null;
  });
  obj["Mother Category"] = Categories[1];
  obj["Category"] = Categories[2];
  obj["Sub-Category"] = Categories[3];
  obj["Product"] = Categories[Categories.length - 2];
  if (Categories.length) {
    const product = obj["Product"].split(" ");
    const Brand = Categories[Categories.length - 1].split(" ");
    let pos = Brand[Brand.length - 1];
    for (let i = 0; i < Brand.length; i++) {
      if (Brand[i] === product[0]) {
        pos = i;
        break;
      }
    }
    let st = "";
    for (let i = 0; i < pos; i++) {
      st += Brand[i];
    }
    obj["Brand"] = st;
  }

  Categories.length = 0;

  //scraping the pagelink for the reviews
  let reviewsLink = $("div.col.JOpGWq>a").attr("href");
  if (reviewsLink !== undefined) {
    obj["reviewsLink"] = `https://www.flipkart.com${reviewsLink}`;
  }
  reviewsLink = null;

  // Declaration of an array to store the highlights of products
  let highLits = [];

  //selecting the product details element and the looping to get the highlights of product
  $("div._2418kt>ul>li._21Ahn-").each(async (_idx, el) => {
    const x = $(el);
    const p = x.text();
    highLits.push(p);

    if (highLits.length !== 0) {
      obj["HighLights"] = highLits;
    }
  });
  highLits.length = 0;

  //selecting the product details element and the looping to get the complete product details
  $("table._14cfVK>tbody>tr._1s_Smc.row").each(async (_idx, el) => {
    const x = $(el);
    let key = x.find("td._1hKmbr.col.col-3-12").text();
    let value = x.find("li._21lJbe").text();
    if (key !== "" && value !== "") {
      obj[key] = value;
    }
    key = null;
    value = null;
  });

  // Scraping the sellers page link
  let sellerslink = $("li._38I6QT>a").attr("href");
  if (sellerslink) {
    obj["sellerslink"] = `https://www.flipkart.com${sellerslink}`;
  }
  sellerslink = null;
  let description = $("div._1mXcCf").text();

  let count = 1;
  $("li._20Gt85._1Y_A6W").each(async (_idx, el) => {
    count++;
  });
  obj["Number of images"] = count;
  if (description === "") {
    description = "NA";
  }
  obj["Description"] = description;
  count = null;
  description = null;

  return obj;
};

const flipkartfetchIndividualDetails = async (url, browser, page) => {
  // function to scrap complete data about one product
  try {
    // api to get html of the required page
    browser = await puppeteer.launch({
      headless: `true`,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    page = await browser.newPage();
    await page.goto(url);
    // await page.waitForSelector("div.col.JOpGWq>a");

    await page.evaluate(() => {
      document.querySelector("div.col.JOpGWq>a").scrollIntoView();
    });
    // await page.waitForTimeout(1000);
    const html = await page.content();
    await page.close();

    await browser.close();

    // function in text.js to scrap the required details from the page
    return scrapdetails(html);
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

      // function in text.js to scrap the required details from the page
      return scrapdetails(html);
    } catch (e) {
      return { message: "Some error occured" };
    }
  }
};

module.exports = { flipkartfetchIndividualDetails };