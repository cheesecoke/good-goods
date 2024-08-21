import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Item from "../../models/ClothingItem";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined.");
}

mongoose.connect(MONGODB_URI, {});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { company } = req.query;

  if (!company) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    const items = await Item.find({ company: company.toString() }).exec();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
}
