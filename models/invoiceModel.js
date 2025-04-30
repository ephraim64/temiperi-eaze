import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    productId: { type: String, required: false },
    paymentMethod: {
      type: String,
      required: false,
      default: "cash",
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: () => Date.now(), required: false },
    productName: { type: String, required: false },
  },
  {
    timestamps: {
      currentTime: () =>
        new Date().toLocaleString("en-US", { timeZone: "Africa/Accra" }),
    },
  }
);

export const InvoiceModel = mongoose.model("Invoice", invoiceSchema);
