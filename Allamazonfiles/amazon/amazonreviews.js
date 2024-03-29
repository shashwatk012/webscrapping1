const cheerio = require("cheerio");
const amazontext = require("./amazontext");
const { proxyReqforreviews } = require("./proxyreq");
const puppeteer = require("puppeteer-extra");

const amazonscrapreviews = (html) => {
  const $ = cheerio.load(html);

  let obj = {};
  // Scraping the Global number of reviews
  const noReviews = $(amazontext.A_NUM_REVIEWS_CN);
  numberReviews = noReviews.html();
  if (numberReviews) {
    numberReviews = numberReviews.trim();
    let sp = numberReviews.split(",");
    numberReviews = sp[1].replace(/\D/g, "");
  }

  //Scraping the number of all type of ratings such as 5 star, 4 star
  $(amazontext.A_ALLRATINGS_CN).each(async (_idx, el) => {
    // selecting the ratings element and the looping to get the different ratings
    const x = $(el);
    let key = x.find(amazontext.A_ALLRATINGS_key_CN).text();
    let value = x.find(amazontext.A_ALLRATINGS_value_CN).text();
    if (key) {
      key = key.trim();
    }
    if (value) {
      value = value.trim(); // triming to trim the spaces in the string
    }

    if (key !== "" && value !== "") {
      const result = value.replace(/\D/g, "");
      obj[`Num_${5 - _idx}_${amazontext.A_STARRATINGS1_FD}`] = result; // saving the scraped data in an object
    }
  });

  obj[amazontext.A_REVIEWS_FD] = Number(numberReviews);

  // Scraping the reviews
  const reviews1 = [];
  $(amazontext.A_REVIEWS_CN).each(async (_idx, el) => {
    const reviews = $(el);
    const name = reviews.find(amazontext.A_REVIEWS_TITLE_CN).text();
    const review = reviews.find(amazontext.A_REVIEWS_SUMMARY_CN).text();
    reviews1.push({
      name: name,
      review: review,
    });
  });

  obj["top10reviews"] = reviews1;

  return obj;
};

const amazonfetchReviews = async (url) => {
  try {
    console.log(url);
    let html;
    while (true) {
      html = await proxyReqforreviews(url);
      if (html !== "") {
        break;
      }
    }

    return amazonscrapreviews(html);
  } catch (error) {
    try {
      console.log("Some thing Went Wrong on review.js");
      let html;
      while (true) {
        html = await proxyReqforreviews(url);
        if (html !== "") {
          break;
        }
      }
      return amazonscrapreviews(html);
    } catch (e) {
      console.log("Some thing Went Wrong on review1.js");
      let html;
      while (true) {
        html = await proxyReqforreviews(url);
        if (html !== "") {
          break;
        }
      }
      return amazonscrapreviews(html);
    }
  }
};

module.exports = { amazonfetchReviews };
