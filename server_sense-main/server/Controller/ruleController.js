import RemediationRule from "../Model/ruleModel.js";
import RemediationLog from "../Model/logModel.js";
import { isDbConnected } from "../DB/db.js";

// In-memory rules store for offline mode / hybrid persistence
const _memRules = [
  {
    _id: "mem_rule_1",
    name: "Restart on Critical RAM",
    metric: "memory",
    severity: "critical",
    sustainedMinutes: 2,
    action: "restart_container",
    targetContainer: "serversense-server",
    enabled: true,
    createdBy: "admin",
    createdAt: new Date()
  }
];
let _memRuleId = 2;

const _memLogs = [
  {
    _id: "mem_log_1",
    ruleName: "Restart on Critical RAM",
    targetContainer: "serversense-server",
    action: "restart_container",
    success: true,
    executedAt: new Date(Date.now() - 10 * 60 * 1000)
  }
];

export const getMemRules = () => _memRules;

export const addMemLog = (logData) => {
  const log = { _id: 'mem_log_' + Date.now(), ...logData, executedAt: new Date() };
  _memLogs.unshift(log);
  if (_memLogs.length > 100) _memLogs.pop();
  return log;
};

// ====================== GET ALL RULES ======================
export const getRules = async (req, res) => {
  if (!isDbConnected()) {
    return res.json(_memRules);
  }

  try {
    const dbRules = await RemediationRule.find().sort({ createdAt: -1 });
    // Combine DB rules with in-memory rules to prevent rule loss
    const combined = [...dbRules, ..._memRules.filter(mr => !dbRules.some(dr => dr.name === mr.name))];
    res.json(combined);
  } catch (err) {
    res.json(_memRules);
  }
};

// ====================== CREATE RULE ======================
export const createRule = async (req, res) => {
  try {
    const { name, metric, severity, sustainedMinutes, action, targetContainer, enabled } = req.body;
    const safeSustainedMinutes = Math.max(2, sustainedMinutes || 2);
    const creator = req.user?.username || req.user?.id || 'admin';

    const ruleData = {
      name,
      metric,
      severity,
      sustainedMinutes: safeSustainedMinutes,
      action: action || "restart_container",
      targetContainer,
      enabled: !!enabled,
      createdBy: creator
    };

    // Store in memory
    const memRule = { _id: "mem_rule_" + (_memRuleId++), ...ruleData, createdAt: new Date() };
    _memRules.unshift(memRule);

    if (isDbConnected()) {
      try {
        const newRule = new RemediationRule(ruleData);
        await newRule.save();
        return res.status(201).json(newRule);
      } catch (dbErr) {
        return res.status(201).json(memRule);
      }
    }

    res.status(201).json(memRule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ====================== UPDATE RULE ======================
export const updateRule = async (req, res) => {
  const { id } = req.params;
  const { name, metric, severity, sustainedMinutes, targetContainer, enabled } = req.body;

  // Update in-memory
  const memRule = _memRules.find(r => r._id === id);
  if (memRule) {
    if (name !== undefined) memRule.name = name;
    if (metric !== undefined) memRule.metric = metric;
    if (severity !== undefined) memRule.severity = severity;
    if (sustainedMinutes !== undefined) memRule.sustainedMinutes = Math.max(2, sustainedMinutes);
    if (targetContainer !== undefined) memRule.targetContainer = targetContainer;
    if (enabled !== undefined) memRule.enabled = enabled;
    if (!isDbConnected()) return res.json(memRule);
  }

  if (!isDbConnected()) {
    return memRule ? res.json(memRule) : res.status(404).json({ message: "Rule not found" });
  }

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (metric !== undefined) updateData.metric = metric;
    if (severity !== undefined) updateData.severity = severity;
    if (sustainedMinutes !== undefined) updateData.sustainedMinutes = Math.max(2, sustainedMinutes);
    if (targetContainer !== undefined) updateData.targetContainer = targetContainer;
    if (enabled !== undefined) updateData.enabled = enabled;

    const updated = await RemediationRule.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated && memRule) return res.json(memRule);
    if (!updated) return res.status(404).json({ message: "Rule not found" });

    res.json(updated);
  } catch (err) {
    if (memRule) return res.json(memRule);
    res.status(400).json({ message: err.message });
  }
};

// ====================== DELETE RULE ======================
export const deleteRule = async (req, res) => {
  const { id } = req.params;

  // Remove from memory
  const memIdx = _memRules.findIndex(r => r._id === id);
  if (memIdx !== -1) {
    _memRules.splice(memIdx, 1);
  }

  if (!isDbConnected()) {
    return res.json({ message: "Rule deleted successfully" });
  }

  try {
    await RemediationRule.findByIdAndDelete(id);
    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    res.json({ message: "Rule deleted successfully" });
  }
};

// ====================== GET REMEDIATION LOGS ======================
export const getLogs = async (req, res) => {
  if (!isDbConnected()) {
    return res.json(_memLogs);
  }

  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await RemediationLog.find().sort({ executedAt: -1 }).limit(limit);
    const combined = [...logs, ..._memLogs];
    res.json(combined);
  } catch (err) {
    res.json(_memLogs);
  }
};
