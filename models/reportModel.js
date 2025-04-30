import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    required: true,
  },
  emailSent: {
    type: Boolean,
    default: false,
  }
});

export const ReportModel = mongoose.model("Report", reportSchema);
