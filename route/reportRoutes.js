import express from "express";
import {
  createReport,
  getReports,
  getReport,
  updateReport,
  updateEmailStatus,
  deleteReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/create-report", createReport);
router.get("/get-reports", getReports);
router.get("/get-report/:id", getReport);
router.put("/update-report/:id", updateReport);
router.patch("/update-email/:id", updateEmailStatus);
router.delete("/delete-report/:id", deleteReport);

export default router;
