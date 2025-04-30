import express, { Router } from "express";

import {
  getAllProducts,
  addProduct,
  getProduct,
  deleteProduct,
  updateProductField,
} from "../controllers/productController.js";

const products = express.Router();

products.route("/products").get(getAllProducts).post(addProduct);

export default products;
