import mongoose, { Schema } from "mongoose";

const clothingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String, required: true },
  company: { type: String, required: true },
  tags: { type: [String], required: true },
});

// Create indexes for faster queries
clothingItemSchema.index({ tags: 1, category: 1, company: 1, price: 1 });

const ClothingItem =
  mongoose.models.ClothingItem ||
  mongoose.model("ClothingItem", clothingItemSchema, "clothingitems");

export default ClothingItem;
