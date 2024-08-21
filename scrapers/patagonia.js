const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define the schema and model directly within the file
const clothingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
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
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
};

const categorizeAndTagItem = (name, category) => {
  const tags = [];
  let mainCategory = "";

  // Lowercase name and category for case-insensitive matching
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Add gender tags based on name or category
  if (lowerName.includes("m's") || lowerCategory.includes("m's")) {
    tags.push("Men's");
  } else if (lowerName.includes("w's") || lowerCategory.includes("w's")) {
    tags.push("Women's");
  } else if (lowerName.includes("kid") || lowerCategory.includes("kid")) {
    tags.push("Kids");
  }

  // Categorize and add tags
  if (lowerName.includes("dress")) {
    mainCategory = "Dresses";
    tags.push("Dresses");
  } else if (
    lowerName.includes("top") ||
    lowerName.includes("shirt") ||
    lowerName.includes("tee") ||
    lowerName.includes("blouse") ||
    lowerName.includes("sweater") ||
    lowerName.includes("hoodie") ||
    lowerName.includes("tank") ||
    lowerCategory.includes("top") ||
    lowerCategory.includes("shirt") ||
    lowerCategory.includes("sweater") ||
    lowerCategory.includes("hoodie") ||
    lowerCategory.includes("blouse") ||
    lowerCategory.includes("tank")
  ) {
    mainCategory = "Tops";
    if (lowerName.includes("shirt") || lowerName.includes("tee"))
      tags.push("Shirts");
    if (lowerName.includes("sweater")) tags.push("Sweaters");
    if (lowerName.includes("blouse")) tags.push("Blouses");
    if (lowerName.includes("hoodie")) tags.push("Hoodies");
    if (lowerName.includes("tank")) tags.push("Tanks");
  } else if (lowerName.includes("pant") || lowerCategory.includes("pant")) {
    mainCategory = "Bottoms";
    tags.push("Pants");
  } else if (
    lowerName.includes("short") ||
    lowerName.includes("trunk") ||
    lowerCategory.includes("short") ||
    lowerCategory.includes("trunk")
  ) {
    mainCategory = "Bottoms";
    tags.push("Shorts");
    if (lowerName.includes("trunk")) tags.push("Trunks");
  } else if (
    lowerName.includes("jacket") ||
    lowerName.includes("pullover") ||
    lowerName.includes("coat") ||
    lowerCategory.includes("jacket") ||
    lowerCategory.includes("pullover") ||
    lowerCategory.includes("coat")
  ) {
    mainCategory = "Outerwear";
    if (lowerName.includes("jacket")) tags.push("Jackets");
    if (lowerName.includes("pullover")) tags.push("Pullovers");
    if (lowerName.includes("coat")) tags.push("Coats");
  } else if (
    lowerName.includes("hat") ||
    lowerName.includes("belt") ||
    lowerCategory.includes("hat") ||
    lowerCategory.includes("belt")
  ) {
    mainCategory = "Miscellaneous";
    if (lowerName.includes("hat")) tags.push("Hats");
    if (lowerName.includes("belt")) tags.push("Belts");
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
    name: "Patagonia",
    url: "https://www.patagonia.com/shop/web-specials/recycled?prefn1=isSale&prefv1=true&page=6",
  };

  await page.goto(company.url, { waitUntil: "networkidle2", timeout: 60000 });

  // Remove modal and backdrop
  try {
    await page.waitForSelector(".modal.show", { timeout: 20000 });
    await page.evaluate(() => {
      const modal = document.querySelector(".modal.show");
      const backdrop = document.querySelector(".modal-backdrop.show");
      if (modal) modal.remove();
      if (backdrop) backdrop.remove();
    });
  } catch (error) {
    console.log("Modal/backdrop not found or could not be removed:", error);
  }

  const items = await page.evaluate(() => {
    const productItems = Array.from(
      document.querySelectorAll(".product-tile__wrapper")
    );
    return productItems
      .map((item) => {
        const name = item.querySelector(".product-tile__name")?.innerText || "";
        const price =
          item.querySelector(".sales.text-sales-price .value")?.innerText || "";
        const category =
          item.querySelector('[itemprop="category"]')?.content || "";
        const imageUrl =
          item.querySelector('meta[itemprop="image"]')?.content || "";
        const link = item.querySelector(".product-tile__cover a")?.href || "";

        return { name, price, category, imageUrl, link };
      })
      .filter(
        (item) =>
          item.name && item.price && item.category && item.imageUrl && item.link
      );
  });

  const categorizedItems = items.map((item) => {
    const { mainCategory, tags } = categorizeAndTagItem(
      item.name,
      item.category
    );
    return { ...item, category: mainCategory, tags };
  });

  console.log("Categorized items:", categorizedItems);

  if (categorizedItems.length > 0) {
    await ClothingItem.insertMany(
      categorizedItems.map((item) => ({ ...item, company: company.name }))
    );
    console.log(
      "Patagonia data has been saved to the clothing collection in MongoDB"
    );
  } else {
    console.log("No items to save");
  }

  await browser.close();
  mongoose.connection.close();
})();
