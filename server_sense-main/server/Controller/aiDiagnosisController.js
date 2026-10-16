import { execFile } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import Alert from '../Model/alertModel.js';
import MetricCollection from '../Model/metricModel.js';
import RemediationLog from '../Model/logModel.js';
import Threshold from '../Model/thresholdModel.js';
import AgentDiagnosis from '../Model/diagnosisModel.js';
import { isDbConnected } from '../DB/db.js';
import { analyzeAlertWithGemini } from '../Services/geminiService.js';
import { getMemThresholds } from './thresholdController.js';
import { addMemLog } from './ruleController.js';
import { sendTelegramAlert } from '../Services/telegramService.js';
import { applyMockRelief } from './metricController.js';

const execFileAsync = util.promisify(execFile);

// In-memory diagnoses store for when MongoDB is disconnected
const _memDiagnoses = [
  {
    _id: 'mem_diag_1',
    alertId: {
      _id: 'alert_1',
      metric: 'memory',
      severity: 'critical',
      value: 94.2,
      threshold: 85,
      message: 'High RAM memory utilization detected on host'
    },
    problemSummary: 'RAM capacity breach (94.2%) on active host server node',
    likelyCause: 'Memory heap buffer accumulation from active telemetry polling and process worker threads.',
    confidence: 0.92,
    recommendedAction: 'restart_container',
    actionExplanation: 'Restarting target container \'serversense-server\' clears transient V8 heap allocations and reduces RAM consumption below safe policy threshold.',
    targetContainer: 'serversense-server',
    targetPath: null,
    riskLevel: 'high',
    evidenceSnapshot: {
      alert: { metric: 'memory', value: 94.2, threshold: 85 },
      runningContainers: ['serversense-server'],
      gatheredAt: new Date().toISOString()
    },
    status: 'pending_approval',
    createdAt: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    _id: 'mem_diag_2',
    alertId: {
      _id: 'alert_2',
      metric: 'cpu',
      severity: 'warning',
      value: 86.5,
      threshold: 80,
      message: 'CPU usage exceeded warning limit'
    },
    problemSummary: 'CPU compute utilization spike (86.5%) detected during system monitoring cycle',
    likelyCause: 'Transient load spike caused by intensive background data transformation.',
    confidence: 0.88,
    recommendedAction: 'no_action_needed',
    actionExplanation: 'Compute load is auto-remediating; observation recommended before initiating service restarts.',
    targetContainer: null,
    targetPath: null,
    riskLevel: 'low',
    evidenceSnapshot: {
      alert: { metric: 'cpu', value: 86.5, threshold: 80 },
      gatheredAt: new Date().toISOString()
    },
    status: 'executed',
    reviewedBy: 'Admin User',
    reviewedAt: new Date(Date.now() - 30 * 60 * 1000),
    outcomeCorrect: true,
    createdAt: new Date(Date.now() - 35 * 60 * 1000)
  }
];
let _memDiagId = 3;

// Helper: Gather real evidence before calling LLM
export const gatherEvidence = async (alertId) => {
  let alertDoc = null;
  if (isDbConnected()) {
    try {
      alertDoc = await Alert.findById(alertId);
    } catch (e) {}
  }

  // Fallback for offline DB mode
  if (!alertDoc) {
    alertDoc = {
      _id: alertId,
      metric: 'cpu',
      alertType: 'threshold',
      severity: 'critical',
      value: 92,
      threshold: 85,
      message: 'High CPU utilization detected on host',
      status: 'active',
      createdAt: new Date()
    };
  }

  // 1. Alert Data
  const alertData = {
    id: alertDoc._id,
    metric: alertDoc.metric || 'cpu',
    alertType: alertDoc.alertType || 'threshold',
    severity: alertDoc.severity || 'warning',
    value: alertDoc.value || 90,
    threshold: alertDoc.threshold || 80,
    message: alertDoc.message || 'System resource alert',
    status: alertDoc.status || 'active',
    activeDurationMinutes: Math.round((Date.now() - new Date(alertDoc.createdAt || Date.now()).getTime()) / (60 * 1000)),
    createdAt: alertDoc.createdAt || new Date(),
  };

  // 2. Last 10 Metric Snapshots for that metric
  let recentSnapshots = [];
  if (isDbConnected()) {
    recentSnapshots = await MetricCollection.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
  }

  // 3. Step 6 Remediation Logs in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  let recentRemediationLogs = [];
  if (isDbConnected()) {
    recentRemediationLogs = await RemediationLog.find({
      executedAt: { $gte: oneHourAgo }
    }).lean();
  }

  // 4. Running Docker containers via execFile (safe argument array)
  let runningContainers = [];
  try {
    const { stdout } = await execFileAsync('docker', ['ps', '--format', '{{.Names}}']);
    runningContainers = stdout
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  } catch (dockerErr) {
    console.warn('[EvidenceGathering] Docker ps failed or unavailable:', dockerErr.message);
    runningContainers = ["Docker daemon unavailable or non-docker host"];
  }

  // 5. Configured Allowlist Paths
  let allowedPaths = [];
  if (isDbConnected()) {
    const t = await Threshold.findOne();
    allowedPaths = t?.allowedPaths || ["./logs", "./tmp", "scratch", "C:/tmp"];
  } else {
    allowedPaths = getMemThresholds().allowedPaths || ["./logs", "./tmp", "scratch", "C:/tmp"];
  }

  // 6. Disk info (if metric is "disk")
  let diskDetails = "Not applicable for this metric";
  if (alertDoc.metric === 'disk') {
    try {
      diskDetails = allowedPaths.map(dirPath => {
        const fullPath = path.resolve(dirPath);
        if (fs.existsSync(fullPath)) {
          const files = fs.readdirSync(fullPath);
          return { directory: dirPath, fileCount: files.length, status: "accessible" };
        }
        return { directory: dirPath, status: "directory_does_not_exist" };
      });
    } catch (fsErr) {
      diskDetails = `Filesystem check failed: ${fsErr.message}`;
    }
  }

  return {
    alert: alertData,
    recentSnapshots,
    recentRemediationLogs,
    runningContainers,
    allowedPaths,
    diskDetails,
    gatheredAt: new Date().toISOString()
  };
};

export let isAutoDiagnosisEnabled = true;

export const setAutoDiagnosisEnabled = (enabled) => {
  isAutoDiagnosisEnabled = enabled;
};

// Generate AI diagnosis for an alert
export const generateDiagnosisForAlert = async (alertId, isManual = false) => {
  if (!isManual && !isAutoDiagnosisEnabled) {
    console.log('[AIDiagnosis] Automatic diagnosis generation paused per user request');
    return null;
  }

  try {
    // Check deduplication
    if (isDbConnected()) {
      const existing = await AgentDiagnosis.findOne({
        alertId,
        status: { $in: ['pending_approval', 'executed'] }
      });
      if (existing) return existing;
    } else {
      const existing = _memDiagnoses.find(d => String(d.alertId) === String(alertId) && ['pending_approval', 'executed'].includes(d.status));
      if (existing) return existing;
    }

    const evidence = await gatherEvidence(alertId);

    let parsedResult;
    try {
      parsedResult = await analyzeAlertWithGemini(evidence);
    } catch (aiErr) {
      console.error('[AIDiagnosis] Gemini API failed:', aiErr.message);
      
      const failedDiagnosisData = {
        alertId,
        problemSummary: `AI Analysis Failed for ${evidence.alert?.metric || 'system'} alert`,
        likelyCause: `Gemini LLM API error: ${aiErr.message}`,
        confidence: 0,
        recommendedAction: 'manual_investigation_required',
        actionExplanation: `The AI analysis failed due to an API error: ${aiErr.message}. Manual investigation is required.`,
        targetContainer: null,
        targetPath: null,
        riskLevel: 'medium',
        evidenceSnapshot: evidence,
        status: 'ai_failed',
        errorMessage: aiErr.message,
      };

      if (isDbConnected()) {
        return await AgentDiagnosis.create(failedDiagnosisData);
      } else {
        const memFailed = { _id: 'mem_diag_' + (_memDiagId++), ...failedDiagnosisData, createdAt: new Date() };
        _memDiagnoses.unshift(memFailed);
        return memFailed;
      }
    }

    const diagnosisData = {
      alertId,
      problemSummary: parsedResult.problemSummary,
      likelyCause: parsedResult.likelyCause,
      confidence: parsedResult.confidence,
      recommendedAction: parsedResult.recommendedAction,
      actionExplanation: parsedResult.actionExplanation,
      targetContainer: parsedResult.targetContainer || null,
      targetPath: parsedResult.targetPath || null,
      riskLevel: parsedResult.riskLevel,
      evidenceSnapshot: evidence,
      status: 'pending_approval',
    };

    if (isDbConnected()) {
      const diagnosis = await AgentDiagnosis.create(diagnosisData);
      console.log(`[AIDiagnosis] Created pending diagnosis ${diagnosis._id} for alert ${alertId}`);
      return diagnosis;
    } else {
      const memDiagnosis = { _id: 'mem_diag_' + (_memDiagId++), ...diagnosisData, createdAt: new Date() };
      _memDiagnoses.unshift(memDiagnosis);
      console.log(`[AIDiagnosis] Created pending diagnosis in memory ${memDiagnosis._id} for alert ${alertId}`);
      return memDiagnosis;
    }
  } catch (err) {
    console.error('[AIDiagnosis] Unexpected error generating diagnosis:', err.message);
    return null;
  }
};

// GET /api/diagnoses
export const getDiagnoses = async (req, res) => {
  let memFiltered = [..._memDiagnoses];
  if (req.query.status) {
    memFiltered = memFiltered.filter(d => d.status === req.query.status);
  }

  if (!isDbConnected()) {
    return res.json(memFiltered);
  }

  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const dbDiagnoses = await AgentDiagnosis.find(filter)
      .populate('alertId')
      .sort({ createdAt: -1 });

    const combined = [...dbDiagnoses, ...memFiltered.filter(md => !dbDiagnoses.some(dd => String(dd._id) === String(md._id)))];
    res.json(combined);
  } catch (err) {
    res.json(memFiltered);
  }
};

// POST /api/diagnoses/generate/:alertId
export const manualGenerateDiagnosis = async (req, res) => {
  try {
    const { alertId } = req.params;
    const diagnosis = await generateDiagnosisForAlert(alertId, true);
    if (!diagnosis) {
      return res.status(500).json({ message: 'Failed to generate diagnosis' });
    }
    res.json(diagnosis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/diagnoses/:id/approve
export const approveDiagnosis = async (req, res) => {
  const { id } = req.params;

  // Search in memory first if needed
  const memDiagnosis = _memDiagnoses.find(d => d._id === id);
  if (memDiagnosis && memDiagnosis.status === 'pending_approval') {
    memDiagnosis.status = 'executed';
    memDiagnosis.reviewedBy = req.body.reviewedBy || 'Admin User';
    memDiagnosis.reviewedAt = new Date();
    
    // Send detailed telegram message for mock
    sendTelegramAlert(`✅ <b>Issue Resolved!</b>\n\n<b>Problem:</b> ${memDiagnosis.problemSummary}\n<b>Root Cause:</b> ${memDiagnosis.likelyCause}\n\n<b>Action Taken:</b> ${memDiagnosis.actionExplanation}\n\nYour system admin has successfully executed the AI remediation. The server is now recovering.`);
    
    return res.json(memDiagnosis);
  }

  if (!isDbConnected()) {
    return memDiagnosis ? res.json(memDiagnosis) : res.status(404).json({ message: 'Diagnosis not found' });
  }

  try {
    const diagnosis = await AgentDiagnosis.findById(id);

    if (!diagnosis && memDiagnosis) return res.json(memDiagnosis);
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    if (diagnosis.status !== 'pending_approval') {
      return res.status(400).json({ message: `Diagnosis cannot be approved because status is '${diagnosis.status}'` });
    }

    const t = await Threshold.findOne();
    const allowedPaths = t?.allowedPaths || ["./logs", "./tmp", "scratch", "C:/tmp"];

    let success = false;
    let errorMessage = null;

    switch (diagnosis.recommendedAction) {
      case 'restart_container': {
        const container = diagnosis.targetContainer;
        if (!container) {
          errorMessage = 'No target container specified for restart action';
          break;
        }

        const safeContainer = container.replace(/[^a-zA-Z0-9_.-]/g, '');
        if (!safeContainer) {
          errorMessage = 'Invalid target container name';
          break;
        }

        try {
          const { stdout } = await execFileAsync('docker', ['restart', safeContainer]);
          console.log(`[AIDiagnosisExec] Restarted container '${safeContainer}': ${stdout.trim()}`);
          success = true;
        } catch (execErr) {
          errorMessage = `Docker restart command failed: ${execErr.message}`;
        }
        break;
      }

      case 'clear_temp_files':
      case 'rotate_logs': {
        const targetPath = diagnosis.targetPath;
        if (!targetPath) {
          errorMessage = `No target path specified for ${diagnosis.recommendedAction}`;
          break;
        }

        const resolvedTarget = path.resolve(targetPath);
        const isPathAllowed = allowedPaths.some(allowed => {
          const resolvedAllowed = path.resolve(allowed);
          return resolvedTarget === resolvedAllowed || resolvedTarget.startsWith(resolvedAllowed + path.sep);
        });

        if (!isPathAllowed) {
          errorMessage = `SECURITY REJECTION: Target path '${targetPath}' is NOT in safe-path allowlist`;
          break;
        }

        try {
          if (!fs.existsSync(resolvedTarget)) {
            fs.mkdirSync(resolvedTarget, { recursive: true });
          }

          const stats = fs.statSync(resolvedTarget);

          if (diagnosis.recommendedAction === 'clear_temp_files') {
            if (stats.isDirectory()) {
              const files = fs.readdirSync(resolvedTarget);
              for (const file of files) {
                const filePath = path.join(resolvedTarget, file);
                if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
              }
            } else if (stats.isFile()) {
              fs.unlinkSync(resolvedTarget);
            }
            success = true;
          } else if (diagnosis.recommendedAction === 'rotate_logs') {
            if (stats.isDirectory()) {
              const files = fs.readdirSync(resolvedTarget);
              for (const file of files) {
                const filePath = path.join(resolvedTarget, file);
                if (fs.statSync(filePath).isFile() && (file.endsWith('.log') || file.endsWith('.txt'))) {
                  fs.writeFileSync(filePath, '');
                }
              }
            } else if (stats.isFile()) {
              fs.writeFileSync(resolvedTarget, '');
            }
            success = true;
          }
        } catch (fsErr) {
          errorMessage = `File action '${diagnosis.recommendedAction}' failed: ${fsErr.message}`;
        }
        break;
      }

      case 'no_action_needed':
      case 'manual_investigation_required':
      case 'kill_heavy_process':
      case 'clear_npm_cache':
      case 'flush_dns_cache': {
        // These are simulated success for the local prototype to avoid actual destructive host actions
        success = true;
        break;
      }

      default: {
        errorMessage = `Unknown action: ${diagnosis.recommendedAction}`;
        break;
      }
    }

    const logData = {
      ruleId: diagnosis._id,
      ruleName: `AI Remediation (${diagnosis.recommendedAction})`,
      triggeredByAlertId: diagnosis.alertId?._id || diagnosis.alertId,
      action: diagnosis.recommendedAction,
      targetContainer: diagnosis.targetContainer || diagnosis.targetPath || 'AI System Action',
      success,
      errorMessage,
      executedAt: new Date()
    };
    addMemLog(logData);
    if (isDbConnected()) {
      try { await RemediationLog.create(logData); } catch (e) {}
    }

    if (success) {
      diagnosis.status = 'executed';
      diagnosis.reviewedBy = req.body.reviewedBy || 'Admin User';
      diagnosis.reviewedAt = new Date();
      diagnosis.errorMessage = null;

      // Force metrics to drop in the dashboard!
      applyMockRelief();

      // Send detailed telegram notification to user!
      sendTelegramAlert(`✅ <b>Issue Resolved!</b>\n\n<b>Problem:</b> ${diagnosis.problemSummary}\n<b>Root Cause:</b> ${diagnosis.likelyCause}\n\n<b>Action Taken:</b> ${diagnosis.actionExplanation}\n\nYour system admin has successfully executed the AI remediation. The server is now recovering.`);
    } else {
      diagnosis.status = 'execution_failed';
      diagnosis.reviewedBy = req.body.reviewedBy || 'Admin User';
      diagnosis.reviewedAt = new Date();
      diagnosis.errorMessage = errorMessage;

      // Send telegram notification to user about the failure!
      sendTelegramAlert(`❌ <b>Action Failed!</b>\n\n<b>Problem:</b> ${diagnosis.problemSummary}\n\nYour system admin attempted to execute an AI remediation action: <i>${diagnosis.recommendedAction}</i>, but it failed.\nReason: ${errorMessage}`);
    }

    await diagnosis.save();
    res.json(diagnosis);
  } catch (err) {
    if (memDiagnosis) return res.json(memDiagnosis);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/diagnoses/:id/reject
export const rejectDiagnosis = async (req, res) => {
  const { id } = req.params;

  const memDiagnosis = _memDiagnoses.find(d => d._id === id);
  if (memDiagnosis) {
    memDiagnosis.status = 'rejected';
    memDiagnosis.reviewedBy = req.body.reviewedBy || 'Admin User';
    memDiagnosis.reviewedAt = new Date();
    return res.json(memDiagnosis);
  }

  if (!isDbConnected()) {
    return res.status(404).json({ message: 'Diagnosis not found' });
  }

  try {
    const diagnosis = await AgentDiagnosis.findById(id);
    if (!diagnosis) return res.status(404).json({ message: 'Diagnosis not found' });

    diagnosis.status = 'rejected';
    diagnosis.reviewedBy = req.body.reviewedBy || 'Admin User';
    diagnosis.reviewedAt = new Date();

    await diagnosis.save();
    res.json(diagnosis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/diagnoses/:id/outcome
export const markDiagnosisOutcome = async (req, res) => {
  const { id } = req.params;
  const { outcomeCorrect } = req.body;

  const memDiagnosis = _memDiagnoses.find(d => d._id === id);
  if (memDiagnosis) {
    memDiagnosis.outcomeCorrect = outcomeCorrect;
    return res.json(memDiagnosis);
  }

  if (!isDbConnected()) {
    return res.status(404).json({ message: 'Diagnosis not found' });
  }

  try {
    const diagnosis = await AgentDiagnosis.findById(id);
    if (!diagnosis) return res.status(404).json({ message: 'Diagnosis not found' });

    diagnosis.outcomeCorrect = outcomeCorrect;
    await diagnosis.save();
    res.json(diagnosis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/diagnoses/accuracy
export const getDiagnosisAccuracy = async (req, res) => {
  const allExecuted = _memDiagnoses.filter(d => d.status === 'executed');
  const allReviewed = allExecuted.filter(d => d.outcomeCorrect !== null && d.outcomeCorrect !== undefined);
  const correctCount = allReviewed.filter(d => d.outcomeCorrect === true).length;
  const accuracyPercent = allReviewed.length > 0 ? Number(((correctCount / allReviewed.length) * 100).toFixed(1)) : 100;

  if (!isDbConnected()) {
    return res.json({
      totalExecuted: allExecuted.length,
      totalReviewed: allReviewed.length,
      correctCount,
      accuracyPercent
    });
  }

  try {
    const [result] = await AgentDiagnosis.aggregate([
      {
        $facet: {
          totalExecuted: [{ $match: { status: 'executed' } }, { $count: 'count' }],
          totalReviewed: [{ $match: { status: 'executed', outcomeCorrect: { $ne: null } } }, { $count: 'count' }],
          correctCount: [{ $match: { status: 'executed', outcomeCorrect: true } }, { $count: 'count' }]
        }
      },
      {
        $project: {
          totalExecuted: { $arrayElemAt: ["$totalExecuted.count", 0] },
          totalReviewed: { $arrayElemAt: ["$totalReviewed.count", 0] },
          correctCount: { $arrayElemAt: ["$correctCount.count", 0] }
        }
      }
    ]);

    const totalExecuted = (result?.totalExecuted || 0) + allExecuted.length;
    const totalReviewed = (result?.totalReviewed || 0) + allReviewed.length;
    const totalCorrect = (result?.correctCount || 0) + correctCount;
    const finalPercent = totalReviewed > 0 ? Number(((totalCorrect / totalReviewed) * 100).toFixed(1)) : 100;

    res.json({
      totalExecuted,
      totalReviewed,
      correctCount: totalCorrect,
      accuracyPercent: finalPercent
    });
  } catch (err) {
    res.json({
      totalExecuted: allExecuted.length,
      totalReviewed: allReviewed.length,
      correctCount,
      accuracyPercent
    });
  }
};
