import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import connectDB from "./src/db/connection.js";
import Recording from "./src/db/models/recording.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB with detailed logging
console.log("Attempting to connect to MongoDB...");
connectDB()
  .then(() => {
    console.log("MongoDB connection successful");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const app = express();

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
app.use(
  cors({
    origin: ["https://localhost:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

// Test endpoint with detailed logging
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Upload recording endpoint
app.post(
  "/api/recordings/upload",
  upload.single("recording"),
  async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const recording = new Recording({
        userId: req.body.userId,
        title: req.body.title,
        filename: req.file.filename,
        path: req.file.path,
        isPublic: req.body.isPublic === "true" || false,
      });

      await recording.save();
      res.json({ recording });
    } catch (error) {
      console.error("Error saving recording:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get user's recordings
app.get("/api/recordings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const recordings = await Recording.find({
      $or: [{ userId: userId }, { isPublic: true, userId: { $ne: userId } }],
    })
      .select("+isPublic")
      .sort({ createdAt: -1 });

    res.json(recordings);
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get recording file
app.get("/api/recordings/:userId/:recordingId", async (req, res) => {
  try {
    const { userId, recordingId } = req.params;
    const recording = await Recording.findOne({
      _id: recordingId,
      $or: [{ userId: userId }, { isPublic: true }],
    });

    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    if (!fs.existsSync(recording.path)) {
      return res.status(404).json({ error: "Recording file not found" });
    }

    const stat = fs.statSync(recording.path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      if (start >= fileSize) {
        return res.status(416).json({ error: "Range not satisfiable" });
      }

      const file = fs.createReadStream(recording.path, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/webm",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/webm",
      };
      res.writeHead(200, head);
      fs.createReadStream(recording.path).pipe(res);
    }
  } catch (error) {
    console.error("Error fetching recording file:", error);
    res.status(500).json({ error: "Failed to fetch recording file" });
  }
});

// Delete recording endpoint
app.delete("/api/recordings/:userId/:recordingId", async (req, res) => {
  try {
    const { userId, recordingId } = req.params;
    const recording = await Recording.findOne({
      _id: recordingId,
      userId: userId,
    });

    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    if (fs.existsSync(recording.path)) {
      fs.unlinkSync(recording.path);
    }

    await Recording.deleteOne({ _id: recordingId });
    res.json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update recording visibility endpoint
app.patch("/api/recordings/:userId/:recordingId", async (req, res) => {
  try {
    const { userId, recordingId } = req.params;
    const { isPublic } = req.body;

    const recording = await Recording.findOneAndUpdate(
      {
        _id: recordingId,
        userId: userId,
      },
      { $set: { isPublic: Boolean(isPublic) } },
      { new: true }
    );

    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    res.json({ recording });
  } catch (error) {
    console.error("Error updating recording visibility:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update recording title endpoint
app.patch("/api/recordings/:userId/:recordingId/title", async (req, res) => {
  try {
    const { userId, recordingId } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a string" });
    }

    const recording = await Recording.findOneAndUpdate(
      {
        _id: recordingId,
        userId: userId,
      },
      { $set: { title } },
      { new: true }
    );

    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    res.json({ recording });
  } catch (error) {
    console.error("Error updating recording title:", error);
    res.status(500).json({ error: error.message });
  }
});

// Slack OAuth endpoint
app.post("/api/slack/auth", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      null,
      {
        params: {
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET,
          code,
          redirect_uri: "https://localhost:5173",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.data.ok) {
      if (response.data.error === "invalid_code") {
        return res.status(400).json({
          error: "Invalid or expired code",
          details:
            "The authentication code has expired or has already been used. Please try logging in again.",
        });
      }

      return res.status(500).json({
        error: "Failed to authenticate with Slack",
        details: response.data.error,
      });
    }

    const userResponse = await axios.get("https://slack.com/api/users.info", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        user: response.data.authed_user.id,
      },
    });

    if (!userResponse.data.ok) {
      return res.status(500).json({
        error: "Failed to get user info",
        details: userResponse.data.error,
      });
    }

    res.json({
      name: userResponse.data.user.real_name,
      email: userResponse.data.user.profile.email,
      image_72: userResponse.data.user.profile.image_72,
    });
  } catch (error) {
    console.error("Error during Slack authentication:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get public recordings endpoint
app.get("/api/recordings/public", async (req, res) => {
  try {
    const recordings = await Recording.find({ isPublic: true })
      .select("+isPublic")
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 most recent public recordings

    res.json(recordings);
  } catch (error) {
    console.error("Error fetching public recordings:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;

// Create HTTPS server
const httpsOptions = {
  key: fs.readFileSync("localhost+2-key.pem"),
  cert: fs.readFileSync("localhost+2.pem"),
};

https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`Server running on https://localhost:${port}`);
});
