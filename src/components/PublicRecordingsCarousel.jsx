import React from "react";

function PublicRecordingsCarousel({ recordings }) {
  if (!recordings || recordings.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8 flex flex-col">
      <h2 className="">Peruse the Hole Universe</h2>
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-4 scrollbar-hide">
          {recordings.map((recording) => (
            <div
              key={recording._id}
              className="flex-none w-[300px] snap-center bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 relative">
                <video
                  src={`https://localhost:3001/api/recordings/${recording.userId}/${recording._id}`}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">
                  {recording.title}
                </h3>
                <p className="text-sm text-gray-500">
                  by {recording.userId.split("@")[0]}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(recording.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PublicRecordingsCarousel;
