import { InvoiceModel } from "../models/invoiceModel.js";
import { OrderModel } from "../models/orderModel.js";
import ProductModel from "../models/productModel.js";
import StockSyncService from '../services/stockSyncService.js';

//create new invoice
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Validate required fields
    if (!invoiceData.invoiceNumber || !invoiceData.customerName) {
      return res.status(400).json({
        message: "Invoice number and customer name are required",
      });
    }

    // Validate items array
    if (
      !invoiceData.items ||
      !Array.isArray(invoiceData.items) ||
      invoiceData.items.length === 0
    ) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    // Validate each item
    for (const item of invoiceData.items) {
      if (!item.description || !item.quantity || !item.price) {
        return res.status(400).json({
          message: "Each item must have description, quantity, and price",
        });
      }
    }

    // Update stock quantities
    const stockUpdateResult = await StockSyncService.updateStockFromInvoice(invoiceData.items);
    
    // Create and save the invoice
    const invoice = new InvoiceModel(invoiceData);
    await invoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
      stockUpdate: stockUpdateResult
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    // Handle specific error cases
    if (error.message.includes('Product not found')) {
      return res.status(404).json({
        message: error.message
      });
    }

    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        message: error.message
      });
    }

    // Handle duplicate invoice number
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Invoice number already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      message: "Error creating invoice",
      error: error.message,
    });
  }
};

//Get all invoices
export const fetchInvoices = async (req, res) => {
  console.log("Request received for invoices"); // Log request start
  try {
    const invoices = await InvoiceModel.find().lean(); // Database query

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    // Send response directly (CORS headers are already handled by middleware)
    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get invoice by id
export const getInvoice = async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not Found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update invoice
export const updateInvoiceField = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get the original invoice to compare items
    const originalInvoice = await InvoiceModel.findById(id);
    if (!originalInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update the invoice
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // If items were updated, sync stock
    if (updateData.items) {
      const stockUpdateResult = await StockSyncService.handleEditedInvoiceStock(
        originalInvoice.items,
        updateData.items
      );

      return res.status(200).json({
        message: "Invoice updated successfully",
        invoice: updatedInvoice,
        stockUpdate: stockUpdateResult
      });
    }

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the invoice before deleting
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Revert stock quantities
    const stockUpdateResult = await StockSyncService.revertStockFromDeletedInvoice(invoice.items);

    // Delete the invoice
    await InvoiceModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Invoice deleted successfully",
      stockUpdate: stockUpdateResult
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ error: error.message });
  }
};
