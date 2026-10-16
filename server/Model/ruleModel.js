import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  metric: { type: String, enum: ["cpu", "memory", "disk"], required: true },
  severity: { type: String, enum: ["warning", "critical"], required: true },
  sustainedMinutes: { type: Number, required: true, min: 2 },
  action: { type: String, enum: ["restart_container"], required: true, default: "restart_container" },
  targetContainer: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  lastFiredAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RemediationRule", ruleSchema);
