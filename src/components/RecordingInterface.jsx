import React from "react";

function RecordingInterface({
  videoRef,
  interval,
  setInterval,
  isRecording,
  startRecording,
  stopRecording,
  frames,
  timelapseVideo,
  handleVideoLoaded,
  isProcessing,
  isPublishing,
  publishToSlack,
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-8 rounded-lg overflow-hidden shadow">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video bg-gray-900"
          onLoadedData={handleVideoLoaded}
        />
      </div>

      <div className="flex gap-5 items-center mb-8 p-5 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2.5">
          Interval (seconds):
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            min="1"
            className="w-20 px-2 py-2 border border-gray-300 rounded"
          />
        </label>
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-4 py-2 rounded bg-[#4A154B] text-white hover:bg-[#611f64] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          COMMENCE DIGGING
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="px-4 py-2 rounded bg-[#4A154B] text-white hover:bg-[#611f64] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          CEASE TO DIG
        </button>
      </div>

      {frames.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-gray-800">MOMENTS IN TIME</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5">
            {frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index + 1}`}
                className="rounded shadow"
              />
            ))}
          </div>
        </div>
      )}

      {timelapseVideo && (
        <div className="mt-8">
          <h2 className="mb-4 text-gray-800">GAZE INTO YOUR PAST</h2>
          <video
            src={timelapseVideo}
            controls
            className="w-full rounded-lg shadow"
          />
          <button
            onClick={publishToSlack}
            disabled={isPublishing}
            className="mt-4 px-4 py-2 rounded bg-[#4A154B] text-white hover:bg-[#611f64] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPublishing ? "here we go..." : "BLOW OUR MINDS"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordingInterface;
