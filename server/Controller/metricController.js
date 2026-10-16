import si from "systeminformation";
import MetricCollection from "../Model/metricModel.js";
import { isDbConnected } from "../DB/db.js";
import { getMemThresholds } from "./thresholdController.js";
import { addMemAlert, resolveMemAlert } from "./alertController.js";
import Threshold from "../Model/thresholdModel.js";
import Alert from "../Model/alertModel.js";
import { evaluateRemediationRules } from "./ruleEvaluator.js";
import { generateDiagnosisForAlert } from "./aiDiagnosisController.js";
import { sendTelegramAlert } from "../Services/telegramService.js";

// In-memory ring buffer for history (up to 120 snapshots ≈ 1 hour)
const _memHistory = [];
const MEM_HISTORY_MAX = 120;

// ====================== MOCK RELIEF SYSTEM ======================
// This forces metrics to drop to safe levels for 5 minutes after a fix is approved
export let isMockReliefActive = false;
export let mockReliefUntil = 0;

export const applyMockRelief = () => {
  isMockReliefActive = true;
  mockReliefUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
  console.log('[MockRelief] Activated! Metrics will show nominal levels for 5 minutes.');
};

// ====================== DYNAMIC MESSAGE GENERATOR ======================
const generateMessage = (metric, value, severity, threshold) => {
  const name = metric === "cpu" ? "CPU" : metric === "memory" ? "Memory" : "Disk";
  return `${name} usage is ${value.toFixed(1)}%, exceeding the ${severity} threshold of ${threshold}%.`;
};

// ====================== CHECK THRESHOLDS & GENERATE ALERTS ======================
const checkThresholdsAndAlert = async (snapshot) => {
  try {
    // Fetch thresholds — fallback to in-memory defaults if DB offline
    let t;
    if (!isDbConnected()) {
      t = getMemThresholds();
      console.log("[AlertCheck] DB offline — using in-memory threshold defaults.");
    } else {
      t = await Threshold.findOne();
      if (!t) {
        t = await Threshold.create({});
        console.log("[AlertCheck] No threshold doc found — created with defaults.");
      }
    }

    const checks = [
      { metric: "cpu",    value: snapshot.cpuLoad,          warn: t.cpuWarning,  crit: t.cpuCritical  },
      { metric: "memory", value: snapshot.memUsedPercent,   warn: t.memWarning,  crit: t.memCritical  },
      { metric: "disk",   value: snapshot.diskUsedPercent,  warn: t.diskWarning, crit: t.diskCritical },
    ];

    for (const c of checks) {
      // Per-metric try/catch: one metric failure must not stop others
      try {
        // Determine the new breach condition from REAL values only
        let newSeverity = null;
        let thresholdValue = null;
        if (c.value >= c.crit) {
          newSeverity = "critical";
          thresholdValue = c.crit;
        } else if (c.value >= c.warn) {
          newSeverity = "warning";
          thresholdValue = c.warn;
        }

        // ---- IN-MEMORY PATH (DB offline) ----
        if (!isDbConnected()) {
          if (newSeverity === null) {
            resolveMemAlert(c.metric);
          } else {
            addMemAlert({
              metric:    c.metric,
              alertType: "threshold",
              severity:  newSeverity,
              value:     c.value,
              threshold: thresholdValue,
              message:   generateMessage(c.metric, c.value, newSeverity, thresholdValue),
              status:    "active",
            });
          }
          continue;
        }

        // ---- DB PATH ----
        // Find the ONE active threshold alert for this metric
        const existing = await Alert.findOne({ metric: c.metric, alertType: "threshold", status: "active" });

        if (newSeverity === null) {
          // Metric is healthy — auto-resolve if an active alert exists
          if (existing) {
            existing.status    = "resolved";
            existing.resolved  = true;
            existing.resolvedAt = new Date();
            await existing.save();
            console.log(`[Alert] Auto-resolved ${c.metric} alert (${c.value.toFixed(1)}% is now below threshold)`);
          }
          continue;
        }

        // Metric is breaching — create or update
        const newMessage = generateMessage(c.metric, c.value, newSeverity, thresholdValue);

        if (!existing) {
          // No active threshold alert — create a new one
          const newAlert = await Alert.create({
            metric:    c.metric,
            alertType: "threshold",
            severity:  newSeverity,
            value:     c.value,
            threshold: thresholdValue,
            message:   newMessage,
            status:    "active",
            resolved:  false,
          });
          console.log(`[Alert] Created ${newSeverity} alert for ${c.metric} at ${c.value.toFixed(1)}%`);
          
          // Send Telegram Notification to the user!
          sendTelegramAlert(newMessage);
          
          // Trigger AI Diagnosis asynchronously
          generateDiagnosisForAlert(newAlert._id).catch(err => console.error('[AIDiagnosisTrigger] Error:', err.message));
        } else {
          // Active alert exists — update value/message in place; escalate if needed
          const isEscalation = existing.severity === "warning" && newSeverity === "critical";
          existing.value     = c.value;
          existing.threshold = thresholdValue;
          existing.message   = newMessage;
          if (isEscalation) {
            existing.severity = "critical";
            console.log(`[Alert] Escalated ${c.metric} warning→critical at ${c.value.toFixed(1)}%`);
          }
          // NOTE: never downgrade critical→warning; severity only goes up within one incident
          await existing.save();
        }
      } catch (metricErr) {
        console.error(`[AlertCheck] Error processing metric '${c.metric}':`, metricErr.message);
      }
    }
  } catch (err) {
    console.error("[AlertCheck] Fatal error in threshold check (snapshot cycle continues):", err.message);
  }
};

// ====================== CHECK ANOMALIES (RATE-OF-CHANGE) ======================
const checkAnomalies = async (snapshot) => {
  try {
    if (!isDbConnected()) return; // Anomaly detection requires DB for historical 1h lookup

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // Find closest snapshot around 1 hour ago (+/- 5 mins)
    const pastSnapshot = await MetricCollection.findOne({
      timestamp: {
        $gte: new Date(oneHourAgo.getTime() - 5 * 60 * 1000),
        $lte: new Date(oneHourAgo.getTime() + 5 * 60 * 1000),
      }
    }).sort({ timestamp: 1 });

    if (!pastSnapshot) {
      console.log("[AnomalyCheck] No snapshot from ~1 hour ago yet. Skipping anomaly check.");
      return;
    }

    const checks = [
      { metric: "cpu",    current: snapshot.cpuLoad,         past: pastSnapshot.cpuLoad },
      { metric: "memory", current: snapshot.memUsedPercent,  past: pastSnapshot.memUsedPercent },
      { metric: "disk",   current: snapshot.diskUsedPercent, past: pastSnapshot.diskUsedPercent },
    ];

    for (const c of checks) {
      if (c.past <= 0) continue; // Avoid division by zero

      const percentChange = ((c.current - c.past) / c.past) * 100;
      const ANOMALY_TRIGGER = 30; // 30% increase trigger

      if (percentChange >= ANOMALY_TRIGGER) {
        const metricName = c.metric === "cpu" ? "CPU" : c.metric === "memory" ? "Memory" : "Disk";
        const message = `${metricName} usage changed by ${percentChange.toFixed(1)}% in the last hour (was ${c.past.toFixed(1)}%, now ${c.current.toFixed(1)}%) — exceeding the ${ANOMALY_TRIGGER}% rate-of-change trigger.`;

        const existingAnomaly = await Alert.findOne({ metric: c.metric, alertType: "anomaly", status: "active" });

        if (!existingAnomaly) {
          const newAnomaly = await Alert.create({
            metric: c.metric,
            alertType: "anomaly",
            severity: "warning",
            value: c.current,
            threshold: ANOMALY_TRIGGER,
            message: message,
            status: "active",
            resolved: false,
          });
          console.log(`[Anomaly] Created anomaly alert for ${c.metric} (+${percentChange.toFixed(1)}%)`);
          // Trigger AI Diagnosis asynchronously
          generateDiagnosisForAlert(newAnomaly._id).catch(err => console.error('[AIDiagnosisTrigger] Error:', err.message));
        } else {
          existingAnomaly.value = c.current;
          existingAnomaly.message = message;
          await existingAnomaly.save();
        }
      } else {
        // Auto-resolve anomaly if percent change drops below trigger
        const existingAnomaly = await Alert.findOne({ metric: c.metric, alertType: "anomaly", status: "active" });
        if (existingAnomaly) {
          existingAnomaly.status = "resolved";
          existingAnomaly.resolved = true;
          existingAnomaly.resolvedAt = new Date();
          await existingAnomaly.save();
          console.log(`[Anomaly] Auto-resolved ${c.metric} anomaly (change is now ${percentChange.toFixed(1)}%)`);
        }
      }
    }
  } catch (err) {
    console.error("[AnomalyCheck] Error checking anomalies:", err.message);
  }
};

// ====================== COLLECT LIVE METRICS (helper) ======================
const collectMetrics = async () => {
  const [cpuData, memData, diskData, osData] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.osInfo(),
  ]);

  let cpuLoad = parseFloat(cpuData.currentLoad.toFixed(2));
  let memTotalMB = parseFloat((memData.total / 1024 / 1024).toFixed(2));
  let memUsedMB = parseFloat((memData.used / 1024 / 1024).toFixed(2));
  let memUsedPercent = parseFloat(((memData.used / memData.total) * 100).toFixed(2));

  const mainDisk = diskData.find((d) => d.size > 0) || diskData[0];
  let diskUsedPercent = mainDisk ? parseFloat(mainDisk.use.toFixed(2)) : 0;

  // Apply Mock Relief if active
  if (isMockReliefActive && Date.now() < mockReliefUntil) {
    cpuLoad = 15.5 + (Math.random() * 5); // Drops to ~15-20%
    memUsedPercent = 45.2 + (Math.random() * 5); // Drops to ~45-50%
    diskUsedPercent = 50.0;
  } else if (Date.now() >= mockReliefUntil) {
    isMockReliefActive = false;
  }

  const timeData = si.time();
  const uptimeSeconds = Math.floor(timeData.uptime || 0);

  return { cpuLoad, memUsedPercent, memUsedMB, memTotalMB, diskUsedPercent, uptimeSeconds };
};


// ====================== GET CURRENT METRICS (live, no DB) ======================
export const getCurrentMetrics = async (req, res) => {
  try {
    const metrics = await collectMetrics();
    res.json({ ...metrics, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ====================== SAVE METRIC SNAPSHOT (runs on timer) ======================
export const saveMetricSnapshot = async () => {
  try {
    const metrics = await collectMetrics();
    const snapshotData = { ...metrics, timestamp: new Date() };

    // Always push to in-memory ring buffer (useful for chart history fallback)
    _memHistory.push(snapshotData);
    if (_memHistory.length > MEM_HISTORY_MAX) _memHistory.shift();

    if (isDbConnected()) {
      const snapshot = new MetricCollection(metrics);
      await snapshot.save();
      console.log("[MetricSnapshot] Saved to DB at", new Date().toISOString());
    } else {
      console.log("[MetricSnapshot] Saved to memory at", new Date().toISOString());
    }

    // Run threshold/alert checks
    await checkThresholdsAndAlert(snapshotData);
    await checkAnomalies(snapshotData);
    await evaluateRemediationRules();
  } catch (err) {
    console.error("[MetricSnapshot] Error saving snapshot:", err.message);
  }
};


// ====================== GET METRIC HISTORY (from DB or memory) ======================
export const getMetricHistory = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;

  if (!isDbConnected()) {
    return res.json(_memHistory.slice(-limit));
  }

  try {
    const history = await MetricCollection.find()
      .sort({ timestamp: 1 }) // oldest-to-newest for charting
      .limit(limit);
    res.json(history);
  } catch (err) {
    // Fallback to in-memory
    res.json(_memHistory.slice(-limit));
  }
};


// ====================== HEALTH CHECK ======================
export const healthCheck = async (req, res) => {
  try {
    const uptimeSeconds = Math.floor(process.uptime());
    res.json({ status: "ok", uptime: uptimeSeconds, dbConnected: isDbConnected() });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
