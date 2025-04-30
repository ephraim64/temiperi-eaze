//controller to create the report from the client side and to also retrieve them when created

export const createReport = (req, res) => {
  const reportBody = req.body;
  if (!reportBody) {
    return res.status(400).json({ message: "There was no report entered" });
  }
};
