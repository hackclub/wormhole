import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import { generateFunnyTitle } from "./utils/titleGenerator";
import RecordingsList from "./components/RecordingsList";
import PublicRecordingsCarousel from "./components/PublicRecordingsCarousel";
import RecordingInterface from "./components/RecordingInterface";
import LoginScreen from "./components/LoginScreen";

function App() {
  const [interval, setInterval] = useState(1); // Default interval of 1 second
  const [isRecording, setIsRecording] = useState(false);
  const [frames, setFrames] = useState([]);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const lastCaptureTimeRef = useRef(null);
  const isRecordingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timelapseVideo, setTimelapseVideo] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recordings, setRecordings] = useState([]);
  const [publicRecordings, setPublicRecordings] = useState([]);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("slackUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);

    // Request camera access when component mounts
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Set video ready state immediately after setting srcObject
          setIsVideoReady(true);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert(
          "Could not access webcam. Please make sure you have granted camera permissions."
        );
      }
    }
    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSlackLogin = async () => {
    try {
      // Test backend connection first
      console.log("Testing backend connection...");
      const testResponse = await fetch("https://localhost:3001/api/test");
      if (!testResponse.ok) {
        throw new Error("Backend server is not responding");
      }
      console.log("Backend connection successful");

      const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID;
      const REDIRECT_URI = window.location.origin;
      const scope = "users:read users:read.email";

      const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scope}&redirect_uri=${REDIRECT_URI}`;

      window.location.href = slackAuthUrl;
    } catch (error) {
      console.error("Error testing backend connection:", error);
      alert(
        "Cannot connect to the server. Please make sure the backend server is running."
      );
    }
  };

  const handleSlackLogout = () => {
    // Stop the camera stream before logging out
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVideoReady(false);
    localStorage.removeItem("slackUser");
    setUser(null);
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      console.log("Received code from Slack:", code);
      console.log("Full URL:", window.location.href);

      if (error) {
        console.error("Slack OAuth error:", error);
        alert(`Slack authentication failed: ${error}`);
        return;
      }

      if (code) {
        try {
          console.log("Sending auth request to backend...");
          console.log("Request body:", JSON.stringify({ code }, null, 2));

          const response = await fetch(
            "https://localhost:3001/api/slack/auth",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code }),
            }
          );

          console.log("Response status:", response.status);
          console.log(
            "Response headers:",
            JSON.stringify(
              Object.fromEntries(response.headers.entries()),
              null,
              2
            )
          );

          const data = await response.json();
          console.log("Backend response:", data);

          if (!response.ok) {
            throw new Error(
              data.details ||
                data.error ||
                `HTTP error! status: ${response.status}`
            );
          }

          console.log("Received user data:", data);
          setUser(data);
          localStorage.setItem("slackUser", JSON.stringify(data));

          // Set up camera after successful login
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              },
            });

            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setIsVideoReady(true);
            }
          } catch (err) {
            console.error("Error accessing webcam:", err);
            alert(
              "Could not access webcam. Please make sure you have granted camera permissions."
            );
          }

          // Clean up the URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("Error completing Slack authentication:", error);
          if (error.message === "invalid_code") {
            alert(
              "The authentication code has expired. Please try logging in again."
            );
          } else {
            alert(`Failed to complete authentication: ${error.message}`);
          }
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const handleVideoLoaded = () => {
    console.log("Video is ready");
    setIsVideoReady(true);
  };

  const captureFrame = () => {
    if (!videoRef.current || !isVideoReady) {
      console.log("Video not ready for capture");
      return;
    }

    const now = Date.now();
    if (lastCaptureTimeRef.current) {
      const timeSinceLastCapture = now - lastCaptureTimeRef.current;
      console.log(`Time since last capture: ${timeSinceLastCapture}ms`);
    }
    lastCaptureTimeRef.current = now;

    console.log("Capturing frame...");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg");
    setFrames((prev) => {
      console.log(`Total frames: ${prev.length + 1}`);
      return [...prev, imageData];
    });
  };

  const scheduleNextCapture = () => {
    if (!isRecordingRef.current) {
      console.log("Recording stopped, not scheduling next capture");
      return;
    }

    const intervalMs = interval * 1000; // Convert seconds to milliseconds
    console.log(`Scheduling next capture in ${intervalMs}ms`);

    timerRef.current = setTimeout(() => {
      console.log("Timeout triggered, capturing frame");
      captureFrame();
      scheduleNextCapture(); // Schedule the next capture
    }, intervalMs);
  };

  const createVideoFromFrames = async () => {
    if (frames.length === 0) {
      throw new Error("No frames to process");
    }

    setIsProcessing(true);
    console.log("Creating video from frames...");

    try {
      // Create a canvas to process frames
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Load the first frame to get dimensions
      const firstFrame = new Image();
      await new Promise((resolve, reject) => {
        firstFrame.onload = resolve;
        firstFrame.onerror = reject;
        firstFrame.src = frames[0];
      });

      canvas.width = firstFrame.width;
      canvas.height = firstFrame.height;

      // Create a MediaRecorder
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      // Create a promise to handle the recording completion
      const recordingComplete = new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          resolve(blob);
        };
        mediaRecorder.onerror = (error) => reject(error);
      });

      // Start recording
      mediaRecorder.start();

      // Process each frame
      for (const frame of frames) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = frame;
        });

        ctx.drawImage(img, 0, 0);
        await new Promise((resolve) => setTimeout(resolve, 1000 / 30)); // Wait for 1/30th of a second
      }

      // Stop recording and wait for the blob
      mediaRecorder.stop();
      const blob = await recordingComplete;

      // Create and set the preview URL
      const url = URL.createObjectURL(blob);
      setTimelapseVideo(url);
      setIsProcessing(false);

      return blob;
    } catch (error) {
      console.error("Error creating video:", error);
      setIsProcessing(false);
      throw new Error(`Failed to create video: ${error.message}`);
    }
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error("No video stream available");
      alert(
        "No video stream available. Please refresh the page and try again."
      );
      return;
    }

    if (!isVideoReady) {
      console.error("Video not ready");
      alert("Video is not ready. Please wait a moment and try again.");
      return;
    }

    console.log("Starting recording with interval:", interval, "seconds");
    setIsRecording(true);
    isRecordingRef.current = true;
    lastCaptureTimeRef.current = null; // Reset the last capture time
    setTimelapseVideo(null); // Clear previous video

    // Clear any existing timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Capture first frame immediately
    captureFrame();

    // Schedule the next capture
    scheduleNextCapture();
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current) return;

    setIsRecording(false);
    isRecordingRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Check if we have enough frames
    if (frames.length < 4) {
      console.log(
        "Not enough frames to create a video. Minimum required: 4, Current frames:",
        frames.length
      );
      setFrames([]); // Clear the frames
      setIsProcessing(false);
      alert(
        "Recording cancelled: Not enough frames captured. Please record for longer."
      );
      return;
    }

    setIsProcessing(true);
    try {
      const videoBlob = await createVideoFromFrames();
      if (!videoBlob) {
        throw new Error("Failed to create video blob");
      }

      // Upload the recording if user is logged in
      if (user) {
        const formData = new FormData();
        formData.append("recording", videoBlob, "timelapse.webm");
        formData.append("userId", user.email);
        formData.append("title", generateFunnyTitle());

        console.log("Uploading recording...");
        const response = await fetch(
          "https://localhost:3001/api/recordings/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Upload failed with status: ${response.status}`
          );
        }

        const result = await response.json();
        console.log("Recording uploaded successfully:", result);

        // Update recordings list with the new recording
        setRecordings((prev) => [result.recording, ...prev]);
      }

      // Clear frames after successful upload
      setFrames([]);
    } catch (error) {
      console.error("Error processing recording:", error);
      alert(`Failed to process recording: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTimelapse = () => {
    // Create links for each frame
    frames.forEach((frame, index) => {
      const link = document.createElement("a");
      link.href = frame;
      link.download = `timelapse-frame-${index}.jpg`;
      link.click();
    });
  };

  // Add this effect to fetch recordings when user logs in
  useEffect(() => {
    const fetchRecordings = async () => {
      if (user) {
        try {
          const response = await fetch(
            `https://localhost:3001/api/recordings/${user.email}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch recordings");
          }
          const data = await response.json();
          // Ensure isPublic is a boolean for each recording
          const processedRecordings = data.map((recording) => ({
            ...recording,
            isPublic: Boolean(recording.isPublic),
          }));
          setRecordings(processedRecordings);
        } catch (error) {
          console.error("Error fetching recordings:", error);
        }
      }
    };

    fetchRecordings();
  }, [user]);

  // Add this effect to fetch public recordings
  useEffect(() => {
    const fetchPublicRecordings = async () => {
      try {
        const response = await fetch(
          "https://localhost:3001/api/recordings/public"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch public recordings");
        }
        const data = await response.json();
        setPublicRecordings(data);
      } catch (error) {
        console.error("Error fetching public recordings:", error);
      }
    };

    fetchPublicRecordings();
  }, []);

  const handleDeleteRecording = async (recordingId) => {
    if (!user) return;

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this recording? This action cannot be undone."
    );
    if (!isConfirmed) {
      return; // If user cancels, don't proceed with deletion
    }

    try {
      const response = await fetch(
        `https://localhost:3001/api/recordings/${user.email}/${recordingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete recording");
      }

      // Update the recordings list by removing the deleted recording
      setRecordings((prev) => prev.filter((r) => r._id !== recordingId));
    } catch (error) {
      console.error("Error deleting recording:", error);
      alert("Failed to delete recording");
    }
  };

  const handleTogglePublic = async (recordingId, isPublic) => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://localhost:3001/api/recordings/${user.email}/${recordingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPublic }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update recording visibility");
      }

      const data = await response.json();

      // Update the recordings list with the new public status
      setRecordings((prev) =>
        prev.map((r) => {
          if (r._id === recordingId) {
            return { ...r, isPublic: Boolean(isPublic) };
          }
          return r;
        })
      );
    } catch (error) {
      console.error("Error updating recording visibility:", error);
      alert("Failed to update recording visibility");
    }
  };

  const handleUpdateTitle = async (recordingId, newTitle) => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://localhost:3001/api/recordings/${user.email}/${recordingId}/title`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update recording title");
      }

      const data = await response.json();

      // Update the recordings list with the new title
      setRecordings((prev) =>
        prev.map((r) => {
          if (r._id === recordingId) {
            return { ...r, title: newTitle };
          }
          return r;
        })
      );
    } catch (error) {
      console.error("Error updating recording title:", error);
      alert("Failed to update recording title");
    }
  };

  if (isLoading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      {user ? (
        <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Behold the Wormhole Expanse
            </h1>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <img
                  src={user.image_72}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-600">{user.name}</span>
              </div>
              <button
                onClick={handleSlackLogout}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Logout
              </button>
            </div>
          </div>

          <p className="italic text-gray-400 mx-8 mb-8">
            Munch upon the dirt of the cosmos to journey through space and time
            to experience the worlds of other worms and broadcast your own
            tunnels! Tunnels of life!! The life of a worm!!!
            <br />
            <br />
            YOU ARE A WORM, THE TIME TO DIG IS NOW
          </p>

          <PublicRecordingsCarousel recordings={publicRecordings} />

          <RecordingInterface
            videoRef={videoRef}
            interval={interval}
            setInterval={setInterval}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            frames={frames}
            timelapseVideo={timelapseVideo}
            handleVideoLoaded={handleVideoLoaded}
          />

          {/* Add Recordings section */}
          <div className="mt-12">
            <RecordingsList
              recordings={recordings}
              onDeleteRecording={handleDeleteRecording}
              onTogglePublic={handleTogglePublic}
              onUpdateTitle={handleUpdateTitle}
            />
          </div>
        </div>
      ) : (
        <LoginScreen handleSlackLogin={handleSlackLogin} />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
