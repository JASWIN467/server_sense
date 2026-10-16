import mongoose from "mongoose";

const thresholdSchema = new mongoose.Schema({
  cpuWarning: { type: Number, default: 70 },
  cpuCritical: { type: Number, default: 90 },
  memWarning: { type: Number, default: 75 },
  memCritical: { type: Number, default: 85 },
  diskWarning: { type: Number, default: 80 },
  diskCritical: { type: Number, default: 95 },
  allowedPaths: { type: [String], default: ["./logs", "./tmp", "scratch", "C:/tmp"] },
});

export default mongoose.model("Threshold", thresholdSchema);
