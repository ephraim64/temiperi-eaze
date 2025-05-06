import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: {
    retail_price: { type: Number, required: true },
    whole_sale_price: { type: Number, required: true },
  },
  size: { type: String, required: false, default: "medium" },
  quantity: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }, // Tracks last activity (creation or update)
});

export default mongoose.model("Product", productSchema);