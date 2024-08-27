import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import ClothingItem from "@/models/ClothingItem";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI!, {});

    // Get query parameters
    const { tags, categories, companies, price, page = 1 } = req.query;

    // Prepare the filter object
    const filter: any = {};

    // Handle tags filtering
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(",");
      filter.tags = { $in: tagsArray };
    }

    // Handle categories filtering
    if (categories) {
      const categoriesArray = Array.isArray(categories)
        ? categories
        : categories.split(",");
      filter.category = { $in: categoriesArray };
    }

    // Handle companies filtering
    if (companies) {
      const companiesArray = Array.isArray(companies)
        ? companies
        : companies.split(",");
      filter.company = { $in: companiesArray };
    }

    // Handle price filtering directly
    if (price) {
      const priceRanges: any = {
        "less-50": { min: 0, max: 50 },
        "50-100": { min: 50, max: 100 },
        "100-200": { min: 100, max: 200 },
        "200-500": { min: 200, max: 500 },
        "more-500": { min: 500, max: Infinity },
      };

      if (typeof price === "string" && price in priceRanges) {
        filter.price = {
          $gte: priceRanges[price].min,
          $lt: priceRanges[price].max,
        };
      }
    }

    // Pagination
    const limit = 16;
    const skip = (parseInt(page as string) - 1) * limit;

    // Build the aggregation pipeline
    const pipeline = [{ $match: filter }, { $skip: skip }, { $limit: limit }];

    // Execute the aggregation pipeline
    const items = await ClothingItem.aggregate(pipeline).exec();

    // Count total items for pagination
    const totalItemsCount = await ClothingItem.countDocuments(filter).exec();

    // Return the items and total count
    res.status(200).json({ items, totalItemsCount });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export default handler;
