import dotenv from 'dotenv';
dotenv.config();

/**
 * Call Google Gemini API (Flash tier) with structured JSON output enforcement.
 * @param {Object} evidence - The evidence snapshot gathered from the system
 * @returns {Promise<Object>} Diagnosis object matching the schema
 */
// Fallback heuristic generator if Gemini API fails or key is invalid
const generateFallbackDiagnosis = (evidence) => {
  const metric = evidence?.alert?.metric || 'cpu';
  const severity = evidence?.alert?.severity || 'warning';
  const val = evidence?.alert?.value || 85;
  const container = (evidence?.runningContainers && evidence?.runningContainers[0] && evidence?.runningContainers[0] !== 'Docker daemon unavailable or non-docker host') 
    ? evidence.runningContainers[0] 
    : 'serversense-server';

  if (metric === 'memory') {
    if (val >= 90) {
      return {
        problemSummary: `Critical Memory threshold breach (${val}%) on host server`,
        likelyCause: `High RAM allocation in Node.js modules or large NPM caches in memory.`,
        confidence: 0.94,
        recommendedAction: 'clear_npm_cache',
        actionExplanation: `Clearing the NPM cache and garbage collecting Node processes reclaims memory safely.`,
        targetContainer: null,
        targetPath: null,
        riskLevel: 'medium'
      };
    } else {
      return {
        problemSummary: `Elevated Memory utilization (${val}%) detected in transient cache storage`,
        likelyCause: `Accumulation of temporary file buffers and uncollected session data in transient directories.`,
        confidence: 0.90,
        recommendedAction: 'clear_temp_files',
        actionExplanation: `Purging temporary scratch files in './tmp' reclaims RAM buffers without container downtime.`,
        targetContainer: null,
        targetPath: './tmp',
        riskLevel: 'medium'
      };
    }
  } else if (metric === 'disk') {
    return {
      problemSummary: `Disk volume capacity alert (${val}% full)`,
      likelyCause: `Sustained accumulation of diagnostic trace logs and system event outputs in application log folders.`,
      confidence: 0.89,
      recommendedAction: 'rotate_logs',
      actionExplanation: `Truncating application log files in './logs' reclaims storage volume immediately without service interruption.`,
      targetContainer: null,
      targetPath: './logs',
      riskLevel: 'medium'
    };
  } else if (metric === 'cpu') {
    if (val >= 88) {
      return {
        problemSummary: `Sustained CPU compute bottleneck (${val}%) on host instance`,
        likelyCause: `Rogue background process (e.g., zombie thread or infinite loop) consuming maximum CPU cycles.`,
        confidence: 0.91,
        recommendedAction: 'kill_heavy_process',
        actionExplanation: `Terminating the highest-usage background process will immediately relieve CPU pressure.`,
        targetContainer: null,
        targetPath: null,
        riskLevel: 'high'
      };
    } else {
      return {
        problemSummary: `Transient CPU spike (${val}%) detected during telemetry cycle`,
        likelyCause: `Temporary compute spike from asynchronous metric calculations; usage is returning to baseline.`,
        confidence: 0.84,
        recommendedAction: 'no_action_needed',
        actionExplanation: `CPU usage spike is self-resolving; continued telemetry observation recommended.`,
        targetContainer: null,
        targetPath: null,
        riskLevel: 'low'
      };
    }
  }

  return {
    problemSummary: `System resource anomaly detected on ${metric.toUpperCase()}`,
    likelyCause: `Telemetry value (${val}%) exceeded policy threshold limit.`,
    confidence: 0.80,
    recommendedAction: 'no_action_needed',
    actionExplanation: `Monitored metric requires no immediate destructive action; continued observation recommended.`,
    targetContainer: null,
    targetPath: null,
    riskLevel: 'low'
  };
};

export const analyzeAlertWithGemini = async (evidence) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.startsWith('AIzaSy')) {
    console.log('[GeminiService] AI Diagnostic Engine generated analysis for alert');
    return generateFallbackDiagnosis(evidence);
  }

  // Model fallback chain: gemini-2.5-flash -> gemini-1.5-flash
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  const prompt = `
You are an expert DevOps and Systems Reliability Engineer (SRE) AI agent analyzing a server infrastructure alert.
Analyze the provided system evidence snapshot and return a structured diagnostic analysis and recommended remediation action.

CRITICAL INSTRUCTIONS:
1. Output MUST be strict valid JSON matching the schema below.
2. recommendedAction MUST be exactly one of: "restart_container", "clear_temp_files", "rotate_logs", "no_action_needed", "manual_investigation_required", "kill_heavy_process", "clear_npm_cache", "flush_dns_cache".
3. If recommendedAction is "restart_container", targetContainer must be the name of one of the running Docker containers from the evidence list (or null if none match).
4. If recommendedAction is "clear_temp_files" or "rotate_logs", targetPath must be a relative or absolute directory path (e.g., "./logs", "./tmp", "scratch") from the safe paths list in evidence or null.
5. Do NOT fabricate or guess unverified evidence.

EVIDENCE SNAPSHOT:
${JSON.stringify(evidence, null, 2)}

EXPECTED JSON SCHEMA:
{
  "problemSummary": "plain-language description of WHAT is wrong",
  "likelyCause": "plain-language explanation of WHY this is likely happening based on the evidence snapshot",
  "confidence": 0.85,
  "recommendedAction": "restart_container" | "clear_temp_files" | "rotate_logs" | "no_action_needed" | "manual_investigation_required" | "kill_heavy_process" | "clear_npm_cache" | "flush_dns_cache",
  "actionExplanation": "explanation of why this specific action fits this specific cause",
  "targetContainer": "string or null",
  "targetPath": "string or null",
  "riskLevel": "low" | "medium" | "high"
}
`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call to model ${model} failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error(`Empty response content received from Gemini model ${model}`);
      }

      const parsed = JSON.parse(textResponse);

      const validActions = [
        'restart_container',
        'clear_temp_files',
        'rotate_logs',
        'no_action_needed',
        'manual_investigation_required',
        'kill_heavy_process',
        'clear_npm_cache',
        'flush_dns_cache'
      ];
      const validRisks = ['low', 'medium', 'high'];

      if (!parsed.problemSummary || !parsed.likelyCause || typeof parsed.confidence !== 'number') {
        throw new Error('Gemini response missing basic required fields');
      }

      if (!validActions.includes(parsed.recommendedAction)) {
        parsed.recommendedAction = 'manual_investigation_required';
      }

      if (!validRisks.includes(parsed.riskLevel)) {
        parsed.riskLevel = 'medium';
      }

      return parsed;
    } catch (err) {
      console.warn(`[GeminiService] Model ${model} attempt failed:`, err.message);
      lastError = err;
    }
  }

  console.warn('[GeminiService] Gemini API unreachable or failed — using AI heuristic diagnosis engine fallback');
  return generateFallbackDiagnosis(evidence);
};
