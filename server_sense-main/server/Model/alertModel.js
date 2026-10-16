import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  metric:         { type: String, required: true },        // "cpu" | "memory" | "disk"
  alertType:      { type: String, enum: ["threshold", "anomaly"], required: true, default: "threshold" },
  severity:       { type: String, required: true },        // "warning" | "critical"
  value:          { type: Number, required: true },        // current metric value at time of alert
  threshold:      { type: Number, required: true },        // threshold value that was breached
  message:        { type: String, required: true },        // dynamically generated message
  status:         { type: String, enum: ["active", "resolved"], default: "active" },
  resolved:       { type: Boolean, default: false },       // kept for backward compat with existing UI
  resolvedAt:     { type: Date, default: null },
  acknowledgedBy: { type: String, default: null },         // reserved for future use
  acknowledgedAt: { type: Date, default: null },           // reserved for future use
  resolutionNote: { type: String, default: null },         // reserved for future use
  incidentId:     { type: String, default: null },         // reserved for future use
  createdAt:      { type: Date, default: Date.now },
});

export default mongoose.model("Alert", alertSchema);

