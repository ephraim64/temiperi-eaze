import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  updateInvoiceField,
} from "../controllers/invoiceControllers.js";
import { fetchInvoices } from "../controllers/invoiceControllers.js";

const invoiceRouter = express.Router();

// Create new invoice
invoiceRouter.post("/invoice", createInvoice);

// Get all invoices
invoiceRouter.get("/invoices", fetchInvoices);

// Get single invoice
invoiceRouter.get("/fetch-unit-invoice/:id", getInvoice);

// Update invoice
invoiceRouter.put("/invoice/:id", updateInvoiceField);

// Delete invoice
invoiceRouter.delete("/invoice/:id", deleteInvoice);

export default invoiceRouter;
