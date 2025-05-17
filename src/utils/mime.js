export const mimeTypes = [
  "video/webm; codecs=avc1.42E01E",
  "video/webm; codecs=h264",
  "video/webm; codecs=h.264",
  "video/webm; codecs=av1",
  "video/webm; codecs=h.265",
  "video/webm; codecs=vp9",
  "video/webm; codecs=vp8",
];

export default function bestMime() {
  return mimeTypes.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? "video/webm; codecs=vp8";
}
