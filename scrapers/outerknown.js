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

const closeModal = async (page) => {
  try {
    await page.waitForSelector("#closeIconContainer", { timeout: 5000 });
    await page.click("#closeIconContainer");
    console.log("Modal closed successfully");
  } catch (error) {
    console.log("Modal not found or couldn't be closed:", error);
  }
};

const loadMoreItems = async (page, times) => {
  for (let i = 0; i < times; i++) {
    try {
      await scrollPage(page);
      const loadMoreButton = await page.$("a.button--secondary");
      if (loadMoreButton) {
        await loadMoreButton.click();
        await page.waitForTimeout(2000); // Wait for items to load
      } else {
        console.log("Load More button not found, stopping.");
        break;
      }
    } catch (error) {
      console.log("Error loading more items:", error);
    }
  }
};

const categorizeAndTagItem = (name, category) => {
  const tags = ["Pre-Owned"];
  let mainCategory = "";

  // Lowercase name and category for case-insensitive matching
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Add gender tags based on name or category
  if (lowerName.includes("men's") || lowerCategory.includes("men's")) {
    tags.push("Men's");
  } else if (
    lowerName.includes("women's") ||
    lowerCategory.includes("women's")
  ) {
    tags.push("Women's");
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
    name: "Outerknown",
    url: "https://www.outerknown.com/collections/outerworn",
  };

  await page.goto(company.url, { waitUntil: "networkidle2", timeout: 60000 });

  // Close the modal if it appears
  await closeModal(page);

  // Scroll and click 'Load More' button 5 times
  await loadMoreItems(page, 5);

  const items = await page.evaluate(() => {
    const productItems = Array.from(
      document.querySelectorAll(".collection-grid__item")
    );
    return productItems.map((item) => {
      const data = JSON.parse(item.querySelector(".nosto-data").innerText);
      const name = data.name || "";
      const price = `$${data.price}` || "";
      const category = data.categories.join(", ") || "";
      const imageUrl = data.imageUrl || "";
      const link = data.url || "";

      return { name, price, category, imageUrl, link };
    });
  });

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
        "Outerknown data has been saved to the clothing collection in MongoDB"
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
