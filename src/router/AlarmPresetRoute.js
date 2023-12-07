import express from 'express';
import AlarmPreset from '../services/AlarmPreset.js';

const router = express.Router();

// CREATE
router.post('/preset', AlarmPreset.createAlarmPreset);

// READ
router.get('/preset/:preset_id', AlarmPreset.readAlarmPresetByID);

// UPDATE
router.put('/preset/:preset_id', AlarmPreset.updateAlarmPresetByID);

// DELETE
router.delete('/preset/:preset_id', AlarmPreset.deleteAlarmPreset);

export default router;
