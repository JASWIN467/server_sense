import express from 'express';
import {
  getDiagnoses,
  manualGenerateDiagnosis,
  approveDiagnosis,
  rejectDiagnosis,
  markDiagnosisOutcome,
  getDiagnosisAccuracy
} from '../Controller/aiDiagnosisController.js';

const router = express.Router();

// GET /api/diagnoses (?status=pending_approval)
router.get('/', getDiagnoses);

// POST /api/diagnoses/generate/:alertId
router.post('/generate/:alertId', manualGenerateDiagnosis);

// PATCH /api/diagnoses/:id/approve
router.patch('/:id/approve', approveDiagnosis);

// PATCH /api/diagnoses/:id/reject
router.patch('/:id/reject', rejectDiagnosis);

// GET /api/diagnoses/accuracy
router.get('/accuracy', getDiagnosisAccuracy);

// PATCH /api/diagnoses/:id/outcome
router.patch('/:id/outcome', markDiagnosisOutcome);

export default router;
