import express from "express";
const orderRouter = express.Router();
import {
  addOrder,
  deleteOrder,
  orderList,
  singleOrder,
  updateOrderField,
} from "../controllers/orderController.js";

orderRouter.route("/order").post(addOrder);
orderRouter.route("/orders").get(orderList);
orderRouter.route("/update-order").post(updateOrderField);
orderRouter.route("/delete-order").get(deleteOrder);
orderRouter.route("/orders/:id").get(singleOrder);

export default orderRouter;
