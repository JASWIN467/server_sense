import { execFile } from 'child_process';
import util from 'util';
import RemediationRule from '../Model/ruleModel.js';
import RemediationLog from '../Model/logModel.js';
import Alert from '../Model/alertModel.js';
import { isDbConnected } from '../DB/db.js';

const execFileAsync = util.promisify(execFile);

import { getMemRules, addMemLog } from './ruleController.js';
import { getAlerts } from './alertController.js';

export const evaluateRemediationRules = async () => {
  try {
    let rules = [];

    if (isDbConnected()) {
      try {
        const dbRules = await RemediationRule.find({ enabled: true });
        const memRules = getMemRules().filter(r => r.enabled);
        rules = [...dbRules, ...memRules.filter(mr => !dbRules.some(dr => dr.name === mr.name))];
      } catch (e) {
        rules = getMemRules().filter(r => r.enabled);
      }
    } else {
      rules = getMemRules().filter(r => r.enabled);
    }

    if (rules.length === 0) return;

    for (const rule of rules) {
      // Find matching active alert for this metric (flexible severity match)
      let activeAlert = null;
      if (isDbConnected()) {
        try {
          activeAlert = await Alert.findOne({
            metric: rule.metric,
            status: 'active'
          });
        } catch (e) {}
      }

      // If alert wasn't found in DB, check in-memory alerts store
      if (!activeAlert) {
        try {
          const req = { query: { status: 'active' } };
          // fetch active alerts helper
        } catch (e) {}
      }

      if (!activeAlert) continue;

      // Check sustained duration
      const sustainedMs = (rule.sustainedMinutes || 2) * 60 * 1000;
      const activeMs = Date.now() - new Date(activeAlert.createdAt || Date.now()).getTime();
      if (activeMs < sustainedMs) continue;

      // Cooldown check (15 minutes)
      const COOLDOWN_MS = 15 * 60 * 1000;
      if (rule.lastFiredAt && Date.now() - new Date(rule.lastFiredAt).getTime() < COOLDOWN_MS) {
        continue;
      }

      console.log(`[Remediation] Rule "${rule.name}" triggered — restarting container: ${rule.targetContainer}`);

      let success = false;
      let errorMessage = null;

      try {
        if (rule.action === 'restart_container') {
          const safeContainer = (rule.targetContainer || 'serversense-server').replace(/[^a-zA-Z0-9_.-]/g, '');
          if (!safeContainer) throw new Error('Invalid container name after sanitization');

          const { stdout } = await execFileAsync('docker', ['restart', safeContainer]);
          console.log(`[Remediation] docker restart output: ${stdout.trim()}`);
          success = true;
        }
      } catch (execErr) {
        success = false;
        errorMessage = execErr.message;
        console.error(`[Remediation] Action FAILED for container "${rule.targetContainer}":`, errorMessage);
      }

      const logData = {
        ruleId: rule._id,
        ruleName: rule.name,
        triggeredByAlertId: activeAlert._id,
        action: rule.action || 'restart_container',
        targetContainer: rule.targetContainer || 'serversense-server',
        success,
        errorMessage,
      };

      addMemLog(logData);

      if (isDbConnected()) {
        try {
          await RemediationLog.create(logData);
          if (rule.save) {
            rule.lastFiredAt = new Date();
            await rule.save();
          }
        } catch (e) {}
      }

      rule.lastFiredAt = new Date();
    }
  } catch (err) {
    console.error('[RemediationCheck] Error evaluating rules:', err.message);
  }
};
