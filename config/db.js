import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://temiperi:temiperi123@cluster0.sjoox.mongodb.net/?retryWrites=true&w=majority&appName=temiperi"
    )
    .then(() => {
      console.log("DB connected");
    })
    .catch("There was an error connecting to the database");
};
