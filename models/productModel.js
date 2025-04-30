import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, require: true },
  price: {
    retail_price: { type: Number, required: true },
    whole_sale_price: { type: Number, required: true },
  },
  size: { type: String, required: false, default: "medium" },
  quantity: { type: Number, require: true, default: 0 },
  category: { type: String, require: true },
  createdAt: { type: Date, required: false, default: Date.now() },
});

export default mongoose.model("Product", productSchema);
