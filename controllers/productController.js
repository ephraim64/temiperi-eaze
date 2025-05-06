import Product from "../models/productModel.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ lastUpdated: -1 }); // Changed createdAt to lastUpdated
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    console.log("Products fetched");
    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message }); // Fixed error response
  }
};

// Create products
export const addProduct = async (req, res) => {
  try {
    console.log("Received body:", req.body); // Debug input

    const products = Array.isArray(req.body) ? req.body : [req.body];

    // Validate price structure and add lastUpdated
    const productsWithTimestamp = products.map((product) => ({
      ...product,
      lastUpdated: new Date(),
    }));

    // Validate price structure
    productsWithTimestamp.forEach((product) => {
      if (
        !product.price ||
        typeof product.price !== "object" ||
        !product.price.retail_price ||
        !product.price.whole_sale_price
      ) {
        throw new Error("Invalid price format");
      }
    });

    const savedProducts = await Product.insertMany(productsWithTimestamp); // Insert multiple products
    return res.status(201).json({ data: savedProducts });
  } catch (error) {
    console.log("Validation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get a product
export const getProduct = async (req, res) => {};

// Update a product (deduct quantity)
export const updateProduct = async (req, res) => {
  try {
    // Extract product ID and quantity to deduct from the request body
    const { productId, quantityToDeduct } = req.body;

    // Validate input
    if (!productId || !quantityToDeduct || quantityToDeduct <= 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    // Check if product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if there is enough quantity to deduct
    if (product.quantity < quantityToDeduct) {
      return res.status(400).json({ message: "Insufficient product quantity" });
    }

    // Deduct the quantity and set lastUpdated
    product.quantity -= quantityToDeduct;

    // Save the updated product
    await product.save();

    // Respond with success message and updated product
    return res.status(200).json({
      message: "Product quantity updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Update specific fields of a product
export const updateProductField = async (req, res) => {
  const { id } = req.query; // Get product ID from URL parameters
  const updates = req.body; // Get updates from request body

  // Check if ID is present
  if (!id) {
    return res.status(400).json({ message: "ID not provided" });
  }

  // Check if updates were provided
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No updates provided" });
  }

  try {
    // Create an object for storing non-empty fields only
    const nonEmptyFields = {
      ...updates,
      lastUpdated: new Date(), // Always update the lastUpdated timestamp
    };

    // Filter out empty or null fields
    Object.keys(nonEmptyFields).forEach((key) => {
      const value = nonEmptyFields[key];
      if (value === "" || value === null || value === undefined) {
        delete nonEmptyFields[key]; // Remove empty or invalid values
      }
    });

    // If no valid updates after filtering, return an error
    if (Object.keys(nonEmptyFields).length === 0) {
      return res
        .status(400)
        .json({ message: "All provided fields are empty or invalid" });
    }

    // Update product using filtered fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: nonEmptyFields }, // Update only non-empty fields
      { new: true, runValidators: true } // Return updated document and validate input
    );

    // If no product was found, return error
    if (!updatedProduct) {
      console.log("No product was found");
      return res.status(404).json({ message: "Product not found" });
    }

    // Respond with the updated product
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message }); // Fixed error response
  }
};

// Delete all products
export const clearDatabase = async (req, res) => {
  try {
    // Delete all documents in the 'products' collection
    await Product.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All products have been deleted successfully",
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear database",
      error: error.message,
    });
  }
};

// Delete a single product
export const deleteProduct = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Product ID not provided" });
  }

  try {
    const product = await Product.findByIdAndDelete(id); // Fixed syntax
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};