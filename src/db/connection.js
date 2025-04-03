import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/wormhole";
    console.log("Using MongoDB URI:", uri);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log("Database ping successful");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  }
};

export default connectDB;
