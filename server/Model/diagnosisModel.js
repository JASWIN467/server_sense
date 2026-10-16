import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema({
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  problemSummary: { type: String, required: true },
  likelyCause: { type: String, required: true },
  confidence: { type: Number, required: true }, // 0.0 to 1.0
  recommendedAction: {
    type: String,
    enum: [
      "restart_container",
      "clear_temp_files",
      "rotate_logs",
      "no_action_needed",
      "manual_investigation_required"
    ],
    required: true
  },
  actionExplanation: { type: String, required: true },
  targetContainer: { type: String, default: null },
  targetPath: { type: String, default: null },
  riskLevel: { type: String, enum: ["low", "medium", "high"], required: true },
  evidenceSnapshot: { type: Object, required: true },
  status: {
    type: String,
    enum: ["pending_approval", "approved", "rejected", "executed", "execution_failed", "ai_failed"],
    default: "pending_approval"
  },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  outcomeCorrect: { type: Boolean, default: null },
  errorMessage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AgentDiagnosis", diagnosisSchema);
