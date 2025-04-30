import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  updateInvoiceField,
} from "../controllers/invoiceControllers.js";
import { fetchInvoices } from "../controllers/invoiceControllers.js";

const invoiceRouter = express.Router();
const app = express();

invoiceRouter.route("/invoice").post(createInvoice);
invoiceRouter.route("/fetch-unit-invoice/:id").get(getInvoice);
invoiceRouter.route("/update-invoice").post(updateInvoiceField);
invoiceRouter.route("/delete-invoice").get(deleteInvoice);

invoiceRouter.get("/invoices", fetchInvoices);
export default invoiceRouter;
