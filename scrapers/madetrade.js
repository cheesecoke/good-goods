const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const clothingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String, required: true },
  company: { type: String, required: true },
  tags: { type: [String], required: true },
});

const ClothingItem = mongoose.model(
  "ClothingItem",
  clothingItemSchema,
  "clothingitems"
);

const scrollPage = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};

const categorizeAndTagItem = (name, category) => {
  const tags = [];
  let mainCategory = "";

  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerName.includes("men's") || lowerCategory.includes("men's")) {
    tags.push("Men's");
  } else if (
    lowerName.includes("women's") ||
    lowerCategory.includes("women's")
  ) {
    tags.push("Women's");
  }

  if (lowerName.includes("dress")) {
    mainCategory = "Dresses";
    tags.push("Dresses");
  } else if (lowerName.includes("top") || lowerName.includes("shirt")) {
    mainCategory = "Tops";
    tags.push("Shirts");
  } else if (lowerName.includes("pant")) {
    mainCategory = "Bottoms";
    tags.push("Pants");
  } else {
    mainCategory = "Miscellaneous";
  }

  return { mainCategory, tags };
};

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const company = {
    name: "MadeTrade",
    url: "https://www.madetrade.com/collections/clothing?filter.v.price.gte=&filter.v.price.lte=&filter.p.tag=__value%3ARecycled&sort_by=manual",
  };

  await page.goto(company.url, { waitUntil: "networkidle2", timeout: 60000 });

  await scrollPage(page);

  const items = await page.evaluate(() => {
    const productItems = Array.from(document.querySelectorAll(".ProductItem"));
    console.log("Number of product items found:", productItems.length);

    return productItems
      .map((item) => {
        const name =
          item.querySelector(".ProductItem__Title a")?.innerText || "";
        let priceString =
          item.querySelector(".ProductItem__PriceList .Price--highlight")
            ?.innerText ||
          item.querySelector(".ProductItem__Price")?.innerText ||
          "";
        const price = parseFloat(priceString.replace(/[^0-9.]/g, ""));
        const category = ""; // In the original HTML, no specific category was found.
        let imageUrl =
          item
            .querySelector(".ProductItem__ImageWrapper img")
            ?.getAttribute("data-srcset")
            ?.split(", ")[0]
            ?.split(" ")[0] || "";
        const link =
          "https://www.madetrade.com" +
          (item.querySelector(".ProductItem__Title a")?.getAttribute("href") ||
            "");

        if (imageUrl.startsWith("//")) {
          imageUrl = "https:" + imageUrl;
        }

        return { name, price, category, imageUrl, link };
      })
      .filter((item) => item.name && item.price && item.imageUrl && item.link);
  });

  console.log("Total items scraped:", items.length);

  if (items.length === 0) {
    console.error("No items scraped, exiting...");
    await browser.close();
    return;
  }

  const categorizedItems = items.map((item) => {
    const { mainCategory, tags } = categorizeAndTagItem(
      item.name,
      item.category
    );
    return { ...item, category: mainCategory, tags };
  });

  console.log("Categorized items:", categorizedItems);

  if (categorizedItems.length > 0) {
    try {
      await ClothingItem.insertMany(
        categorizedItems.map((item) => ({ ...item, company: company.name }))
      );
      console.log(
        "MadeTrade data has been saved to the clothing collection in MongoDB"
      );
    } catch (err) {
      console.error("Error saving to MongoDB:", err);
    }
  } else {
    console.log("No categorized items to save");
  }

  await browser.close();
  mongoose.connection.close();
})();
