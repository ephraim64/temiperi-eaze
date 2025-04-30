import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: { type: String },
  paymentType: {
    type: String,
    required: false,
    enum: ["full", "partial"],
    default: "full",
  },
  paymentMethod: {
    type: String,
    required: false,
    default: "cash",
  },
  cashAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  momoAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  items: [
    {
      quantity: { type: Number },
      description: { type: String, required: false },
      price: { type: Number },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false,
      },
    },
  ],
  createdAt: { type: Date, default: () => Date.now(), required: false },
  invoiceNumber: { type: String, required: true },
}, {
  timestamps: {
    currentTime: () => new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' })
  }
});

export const OrderModel = mongoose.model("Order", orderSchema);
