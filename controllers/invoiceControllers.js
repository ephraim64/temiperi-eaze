import { InvoiceModel } from "../models/invoiceModel.js";
import { OrderModel } from "../models/orderModel.js";
import ProductModel from "../models/productModel.js";

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

    // Create and save the invoice
    const invoice = new InvoiceModel(invoiceData);
    await invoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

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

export const updateInvoiceField = async (req, res) => {
  const { id } = req.query;
  const updates = req.body;

  // Check if Id is present
  if (!id) {
    return res.status(400).json({ message: "Id not provided" });
  }

  // Check if updates were provided
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No updates provided." });
  }

  try {
    // First get the original invoice to compare quantities
    const originalInvoice = await InvoiceModel.findById(id);
    if (!originalInvoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    // Create an object for storing non-empty fields only
    const nonEmptyFields = {};

    // Filter out empty or null fields and validate numbers
    Object.keys(updates).forEach((key) => {
      const value = updates[key];

      // Skip empty values
      if (value === "" || value === null || value === undefined) {
        return;
      }

      // Handle items array specially
      if (key === "items" && Array.isArray(value)) {
        nonEmptyFields[key] = value.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.price),
        }));
      } else {
        nonEmptyFields[key] = value;
      }
    });

    // If no valid updates after filtering, return an error
    if (Object.keys(nonEmptyFields).length === 0) {
      return res.status(400).json({
        message: "All provided fields are empty or invalid.",
      });
    }

    // Validate items if they exist in the update
    if (nonEmptyFields.items) {
      for (const item of nonEmptyFields.items) {
        if (isNaN(item.quantity) || item.quantity < 0) {
          return res.status(400).json({
            message: "Invalid quantity value provided",
          });
        }
        if (isNaN(item.price) || item.price < 0) {
          return res.status(400).json({
            message: "Invalid price value provided",
          });
        }
      }
    }

    // Update invoice using filtered fields
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: nonEmptyFields },
      { new: true, runValidators: true }
    );

    // Update product quantities
    try {
      if (nonEmptyFields.items) {
        // Create a map of original quantities
        const originalQuantities = {};
        originalInvoice.items.forEach((item) => {
          if (item.productId) {
            originalQuantities[item.productId.toString()] = item.quantity;
          }
        });

        // Process each item in the updated invoice
        for (const item of updatedInvoice.items) {
          if (item.productId) {
            const product = await ProductModel.findById(item.productId);
            if (product) {
              const originalQty =
                originalQuantities[item.productId.toString()] || 0;
              const quantityDiff = item.quantity - originalQty;

              // Calculate new product quantity
              const newQuantity = product.quantity - quantityDiff;

              // Validate new quantity
              if (newQuantity < 0) {
                return res.status(400).json({
                  message: `Insufficient stock for product ${product.name}`,
                });
              }

              // Update product quantity
              await ProductModel.findByIdAndUpdate(item.productId, {
                $set: { quantity: newQuantity },
              });
            }
          }
        }
      }
      // Respond with the updated invoice
      return res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
        invoice: updatedInvoice,
      });
    } catch (error) {
      console.error("Error updating product quantities:", error);
      return res.status(500).json({
        message: "Error updating product quantities",
        error: error.message,
        success: false,
      });
    }
  } catch (error) {
    console.error("Error in updateInvoiceField:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: error.message || "Server error while updating invoice.",
      success: false,
    });
  }
};

export const deleteInvoice = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ message: "There was no payload for the product id" });
  }

  //delete from the database
  await InvoiceModel.findByIdAndDelete({ _id: id });

  //return a response to the client
  return res.status(200).json({
    message: "Invoice deleted successfully",
    success: true,
  });
};
