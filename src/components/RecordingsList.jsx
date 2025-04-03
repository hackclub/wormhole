import React, { useState } from "react";

function RecordingsList({
  recordings,
  onPlayRecording,
  onDeleteRecording,
  onTogglePublic,
  onUpdateTitle,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleTitleClick = (recording) => {
    setEditingId(recording._id);
    setEditValue(recording.title);
  };

  const handleTitleBlur = async (recordingId) => {
    if (editValue.trim() !== "") {
      await onUpdateTitle(recordingId, editValue);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, recordingId) => {
    if (e.key === "Enter") {
      e.target.blur();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  if (!recordings || recordings.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No recordings yet. Start recording to see them here!
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="mb-6">Your Holes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.map((recording) => (
          <div
            key={recording._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-gray-100 relative">
              <video
                src={`https://localhost:3001/api/recordings/${recording.userId}/${recording._id}`}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => onDeleteRecording(recording._id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Delete recording"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                {editingId === recording._id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleTitleBlur(recording._id)}
                    onKeyDown={(e) => handleKeyDown(e, recording._id)}
                    className="font-semibold text-gray-800 bg-transparent border-b border-[#4A154B] focus:outline-none px-1 w-full"
                    autoFocus
                  />
                ) : (
                  <h3
                    onClick={() => handleTitleClick(recording)}
                    className="font-semibold text-gray-800 cursor-pointer px-2 py-1 rounded bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 hover:text-[#4A154B] transition-all"
                    title="Click to edit"
                  >
                    {recording.title}
                  </h3>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={recording.isPublic ?? false}
                    onChange={() =>
                      onTogglePublic(
                        recording._id,
                        !(recording.isPublic ?? false)
                      )
                    }
                    className="rounded text-[#4A154B] focus:ring-[#4A154B]"
                  />
                  Public
                </label>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(recording.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecordingsList;
