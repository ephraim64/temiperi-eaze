import { ReportModel } from "../models/reportModel.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const report = new ReportModel({
      title,
      content,
      author,
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await ReportModel.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single report
export const getReport = async (req, res) => {
  try {
    const report = await ReportModel.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report
export const updateReport = async (req, res) => {
  try {
    const { title, content } = req.body;
    const report = await ReportModel.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report's email status
export const updateEmailStatus = async (req, res) => {
  try {
    const report = await ReportModel.findByIdAndUpdate(
      req.params.id,
      { emailSent: true },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const report = await ReportModel.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
