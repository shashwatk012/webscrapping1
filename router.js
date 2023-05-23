"use strict";
const express = require("express");
const router = new express.Router();
const { flipkartfetchUrlDetails } = require("./flipkart/flipkarturlDetails");
const { flipkartfetchReviews } = require("./flipkart/flipkartreviews");
const {
  flipkartfetchIndividualDetails,
} = require("./flipkart/flipkartdetails");
const { flipkartsellerslist } = require("./flipkart/flipkartsellerslist");
const { nykaafetchIndividualDetails } = require("./nykaadetails");
const { convertJSONtoCSV } = require("./csv");
const { typesOfRatings, urlmaking, fields } = require("./text");
const { amazon } = require("./amazon/amazon");
const { flipkart } = require("./flipkart/flipkart");
const { flipkart2 } = require("./flipkart2/flipkart");
const { flipkart3 } = require("./flipkart3/flipkart");
const { flipkart4 } = require("./flipkart4/flipkart");
const { flipkart5 } = require("./flipkart5/flipkart");
const { flipkart6 } = require("./flipkart6/flipkart");
const { flipkart7 } = require("./flipkart7/flipkart");
const { flipkart8 } = require("./flipkart8/flipkart");
const { flipkart9 } = require("./flipkart9/flipkart");
const { flipkart10 } = require("./flipkart10/flipkart");
const { flipkart11 } = require("./flipkart11/flipkart");
const { flipkart12 } = require("./flipkart12/flipkart");
const { flipkart13 } = require("./flipkart13/flipkart");
const { flipkart14 } = require("./flipkart14/flipkart");
const { flipkart15 } = require("./flipkart15/flipkart");
const { flipkart16 } = require("./flipkart16/flipkart");
const { flipkart17 } = require("./flipkart17/flipkart");
const { flipkart18 } = require("./flipkart18/flipkart");
const { flipkart19 } = require("./flipkart19/flipkart");
const { flipkart20 } = require("./flipkart20/flipkart");
const connection = require("./connection");

// convertJSONtoCSV(arr, "flipkartProductdetails");

//Calling middleware to identify the incoming JSON from the front end
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  try {
    res.send("HII");
  } catch {
    res.send("fuss");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetailsbylink", async (req, res) => {
  try {
    let browser, page;
    let flag = true;
    //Creating the link to be scrapped
    let url = req["body"].link;
    const data = {
      productlink: url,
    };

    // scrapping all the required details by going inside every individual products
    let details = await flipkartfetchIndividualDetails(
      data.productlink,
      browser,
      page
    );
    if (details.message === "Can not fetch") {
      flag = false;
    }
    for (let key in details) {
      data[key] = details[key];
    }

    if (details.sellerslink !== undefined) {
      let sellers = await flipkartsellerslist(
        details.sellerslink,
        browser,
        page
      );
      if (sellers.message === "Can not fetch") {
        flag = false;
      }
      data["NumberofSellers"] = sellers.NumberofSellers;
      data["sellerDetails"] = sellers.sellersDetails;
    }

    data["Platform"] = "Flipkart";

    // Checking whether reviews page is available on the site or not
    if (details.reviewsLink !== undefined) {
      let url1 = details.reviewsLink;
      url1 = url1.replace(
        "&marketplace=FLIPKART",
        "&aid=overall&certifiedBuyer=false&sortOrder="
      );

      // looping to scrap the different kinds of reviews such as "MOST_RECENT", "POSITIVE", "NEGATIVE"
      for (let key of typesOfRatings) {
        let urls = url1 + `${key}`;
        const totalReviewsandratings = await flipkartfetchReviews(
          urls,
          key,
          browser,
          page
        );
        if (totalReviewsandratings.message === "Can not fetch") {
          flag = false;
        }
        for (let key in totalReviewsandratings) {
          data[key] = totalReviewsandratings[key];
        }
      }
    }

    // Making a new array of product with required fields
    let obj = {};
    for (let k = 0; k < fields.length; k++) {
      obj[fields[k]] = data[fields[k]];
    }
    if (!flag) {
      res.send("Something went wrong! Try again");
    } else {
      console.log(obj);
      res.send(obj);
    }
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails1", async (req, res) => {
  try {
    const listofproducts = await flipkart(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 1);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails2", async (req, res) => {
  try {
    const listofproducts = await flipkart2(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 2);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails3", async (req, res) => {
  try {
    const listofproducts = await flipkart3(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 3);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails4", async (req, res) => {
  try {
    const listofproducts = await flipkart4(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 4);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails5", async (req, res) => {
  try {
    const listofproducts = await flipkart5(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 5);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails6", async (req, res) => {
  try {
    const listofproducts = await flipkart6(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 6);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails7", async (req, res) => {
  try {
    const listofproducts = await flipkart7(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 7);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails8", async (req, res) => {
  try {
    const listofproducts = await flipkart8(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 8);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails9", async (req, res) => {
  try {
    const listofproducts = await flipkart9(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 9);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails10", async (req, res) => {
  try {
    const listofproducts = await flipkart10(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 10);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails11", async (req, res) => {
  try {
    const listofproducts = await flipkart11(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 11);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails12", async (req, res) => {
  try {
    const listofproducts = await flipkart12(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 12);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails13", async (req, res) => {
  try {
    const listofproducts = await flipkart13(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 13);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails14", async (req, res) => {
  try {
    const listofproducts = await flipkart14(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 14);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails15", async (req, res) => {
  try {
    const listofproducts = await flipkart15(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 15);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails16", async (req, res) => {
  try {
    const listofproducts = await flipkart16(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 16);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});
// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails17", async (req, res) => {
  try {
    const listofproducts = await flipkart17(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 17);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails18", async (req, res) => {
  try {
    const listofproducts = await flipkart18(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 18);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails19", async (req, res) => {
  try {
    const listofproducts = await flipkart19(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 19);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

// Router to handle post request made by flipkart scraping page
router.post("/flipkartdetails20", async (req, res) => {
  try {
    const listofproducts = await flipkart20(req["body"]);
    const listofsellers = [],
      listofreviews = [];
    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i].sellerDetails) {
        for (let j = 0; j < listofproducts[i].sellerDetails.length; j++) {
          listofsellers.push(listofproducts[i].sellerDetails[j]);
        }
      }
      delete listofproducts[i].sellerDetails;
    }

    for (let i = 0; i < listofproducts.length; i++) {
      if (listofproducts[i]["POSITIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["POSITIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["POSITIVE_FIRST"][j]);
        }
      }
      if (listofproducts[i]["NEGATIVE_FIRST"]) {
        for (let j = 0; j < listofproducts[i]["NEGATIVE_FIRST"].length; j++) {
          listofreviews.push(listofproducts[i]["NEGATIVE_FIRST"][j]);
        }
      }
      delete listofproducts[i]["POSITIVE_FIRST"];
      delete listofproducts[i]["NEGATIVE_FIRST"];
    }
    // let Product =
    //   "INSERT INTO PRODUCT_TABLE (imagelink, productlink, Position, ProductName, Brand, price, maxretailprice, stars, Num_Ratings, Num_Reviews, Mother_Category, Category,num_1_star_ratings,num_2_star_ratings,num_3_star_ratings,num_4_star_ratings,num_5_star_ratings,Platform,Quantity, Num_sellers, Description, Num_Images,Net_Rating_Score_NRS, Discount,Search_Term,Min_Price, Max_Price, St_dev_Price, Title_Length, Description_Length, Date) VALUES ?";

    // let Seller =
    //   "INSERT INTO SELLER_TABLE (Seller_Name, price, Ratings,Flipkart_Assured, ProductName ) VALUES ?";

    // let Reviews =
    //   "INSERT INTO Reviews_TABLE (Title, Summary, Type, ProductName ) VALUES ?";

    // let values = [],
    //   values1 = [],
    //   values2 = [];
    // //Make an array of values:
    // for (let i = 0; i < listofproducts.length; i++) {
    //   let keys = [];

    //   for (let value in listofproducts[i]) {
    //     keys.push(listofproducts[i][value]);
    //   }
    //   values.push(keys);
    // }
    // for (let i = 0; i < listofsellers.length; i++) {
    //   let keys = [];

    //   for (let value in listofsellers[i]) {
    //     keys.push(listofsellers[i][value]);
    //   }
    //   values1.push(keys);
    // }
    // for (let i = 0; i < listofreviews.length; i++) {
    //   let keys = [];

    //   for (let value in listofreviews[i]) {
    //     keys.push(listofreviews[i][value]);
    //   }
    //   values2.push(keys);
    // }
    // //Execute the SQL statement, with the value array:
    // connection.query(Product, [values], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Seller, [values1], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(Reviews, [values2], function (err, result) {
    //   if (err) throw err;
    //   console.log("Number of reco rds inserted: " + result.affectedRows);
    // });
    // connection.query(
    //   "SELECT * FROM PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );

    convertJSONtoCSV(listofproducts, listofsellers, listofreviews, 20);
    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});
router.post("/amazondetails", async (req, res) => {
  try {
    const listofproducts = await amazon(req["body"]);
    res.send(listofproducts);
  } catch (e) {
    console.log("Something went wrong on router");
  }
});
router.post("/nykaadetailsbylink", async (req, res) => {
  try {
    //Creating the link to be scrapped
    let url = req["body"].link;

    const data = {
      productlink: url,
    };

    // scrapping all the required details by going inside every individual products
    let details = await nykaafetchIndividualDetails(data.productlink);
    for (let key in details) {
      data[key] = details[key];
    }

    data["Platform"] = "meesho";

    // Checking whether reviews page is available on the site or not
    // if (details.reviewsLink !== undefined) {
    //   let url1 = details.reviewsLink;

    //   // looping to scrap the different kinds of reviews such as "MOST_RECENT", "POSITIVE", "NEGATIVE"
    //   // const totalReviewsandratings = await meeshofetchReviews(urls, key);
    //   // for (let key in totalReviewsandratings) {
    //   //   data[key] = totalReviewsandratings[key];
    //   // }
    // }

    // Making a new array of product with required fields
    let obj = {};
    for (let k = 0; k < fields.length; k++) {
      obj[fields[k]] = data[fields[k]];
    }
    res.send(obj);
  } catch (e) {
    console.log("jh");
    res.send("Something went wrong on router");
  }
});

module.exports = { router };
