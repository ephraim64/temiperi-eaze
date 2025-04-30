import express from "express";
import { connectDB } from "./config/db.js";
import router from "./route/userRoute.js";
import orderRouter from "./route/orderRoute.js";
import morgan from "morgan";
import products from "./route/productRoute.js";
import { notFound } from "./middleware/notFound.js";
import { fetchInvoices } from "./controllers/invoiceControllers.js";
import { errorHandler } from "./middleware/errorHandler.js";
import invoiceRouter from "./route/inoviceRoute.js";
import cors from "cors";
import reportRouter from "./route/reportRoutes.js";
import { config } from "dotenv";
import {
  clearDatabase,
  deleteProduct,
  updateProduct,
  updateProductField,
} from "./controllers/productController.js";

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 4000;

connectDB();

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins (change to specific domains for production)
    credentials: false, // No cookies or Authorization headers needed
    allowedHeaders: "*", // Allow all headers (use this if you want to accept any header)
    exposedHeaders: "*", // Expose all headers (use this if you want to allow access to all response headers)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allow all methods
  })
);

// Force HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use("/temiperi", router);
app.use("/temiperi", orderRouter);
app.use("/temiperi", products);
app.use("/temiperi", invoiceRouter);
app.use("/temiperi", reportRouter);

app.use("/product-update", updateProduct);
app.use("/clear-products", clearDatabase);
app.patch(`/temiperi/products`, updateProductField);
app.delete(`/temiperi/delete-product`, deleteProduct);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("software is working");
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
