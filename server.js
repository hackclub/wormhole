import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import pkg from "@slack/bolt";
const { App } = pkg;
import { createReadStream } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const expressApp = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Configure CORS
expressApp.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      process.env.FRONTEND_URL || "https://your-coolify-domain.com",
    ],
    credentials: true,
  })
);

expressApp.use(express.json());

// Initialize Slack Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Test endpoint
expressApp.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Slack OAuth endpoint
expressApp.post("/api/slack/auth", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await app.client.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL || "https://your-coolify-domain.com"
          : "https://localhost:5173",
    });

    if (!response.ok) {
      if (response.error === "invalid_code") {
        return res.status(400).json({
          error: "Invalid or expired code",
          details:
            "The authentication code has expired or has already been used. Please try logging in again.",
        });
      }

      return res.status(500).json({
        error: "Failed to authenticate with Slack",
        details: response.error,
      });
    }

    // Get user info
    const userResponse = await app.client.users.info({
      user: response.authed_user.id,
    });

    if (!userResponse.ok) {
      return res.status(500).json({
        error: "Failed to get user info",
        details: userResponse.error,
      });
    }

    res.json({
      name: userResponse.user.real_name,
      email: userResponse.user.profile.email,
      image_72: userResponse.user.profile.image_72,
      id: response.authed_user.id,
    });
  } catch (error) {
    console.error("Error during Slack authentication:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Publish to Slack endpoint
expressApp.post(
  "/api/publish",
  upload.single("recording"),
  async (req, res) => {
    try {
      console.log("Received publish request");
      console.log("Request body:", req.body);
      console.log(
        "Request file:",
        req.file
          ? {
              fieldname: req.file.fieldname,
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
              path: req.file.path,
            }
          : "No file"
      );

      if (!req.file) {
        throw new Error("No file uploaded");
      }

      if (!process.env.SLACK_BOT_TOKEN) {
        throw new Error("SLACK_BOT_TOKEN is not configured");
      }

      if (!process.env.SLACK_CHANNEL_ID) {
        throw new Error("SLACK_CHANNEL_ID is not configured");
      }

      // Upload file to Slack using Bolt
      console.log("Uploading file to Slack...");
      const fileStream = createReadStream(req.file.path);

      const uploadResult = await app.client.files.uploadV2({
        channels: process.env.SLACK_CHANNEL_ID,
        file: fileStream,
        filename: req.file.originalname,
        title: req.body.title || "New Timelapse",
        initial_comment: `Thank you for your offering, <@${req.body.userId}>`,
      });

      console.log("Upload result:", JSON.stringify(uploadResult, null, 2));

      if (!uploadResult.ok) {
        throw new Error(`Failed to upload file: ${uploadResult.error}`);
      }

      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);

      res.json({ success: true, message: "Published to Slack successfully" });
    } catch (error) {
      console.error("Error publishing to Slack:", error);
      console.error("Error stack:", error.stack);
      if (error.response) {
        console.error("Slack API error response:", error.response.data);
      }
      res.status(500).json({
        error: error.message,
        details: error.stack,
        slackError: error.response?.data,
      });
    }
  }
);

// Test Slack token endpoint
expressApp.get("/api/test-slack-token", async (req, res) => {
  try {
    console.log("Testing Slack token...");
    const response = await app.client.auth.test();

    console.log("Slack API response:", response);

    if (!response.ok) {
      throw new Error(response.error || "Failed to verify Slack token");
    }

    res.json({
      success: true,
      message: "Slack token is valid",
      botName: response.user,
      teamName: response.team,
    });
  } catch (error) {
    console.error("Error testing Slack token:", error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || error.stack,
    });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the React app
  expressApp.use(express.static(path.join(__dirname, "dist")));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  expressApp.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Start the Express server
const port = process.env.PORT || 3001;
expressApp.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
