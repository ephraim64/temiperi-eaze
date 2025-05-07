import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb://localhost:27017/temiperi"
    )
    .then(() => {
      console.log("DB connected");
    })
    .catch("There was an error connecting to the database");
};
