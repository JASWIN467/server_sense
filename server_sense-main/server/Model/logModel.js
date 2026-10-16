import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'RemediationRule', required: true },
  ruleName: { type: String, required: true },
  triggeredByAlertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  action: { type: String, required: true },
  targetContainer: { type: String, required: true },
  success: { type: Boolean, required: true },
  errorMessage: { type: String, default: null },
  executedAt: { type: Date, default: Date.now },
});

export default mongoose.model("RemediationLog", logSchema);
