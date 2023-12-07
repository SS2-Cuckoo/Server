import express from 'express';
import NotiLog from '../services/NotiLog.js';

const router = express.Router();

// CREATE
router.post('/log', NotiLog.createNotiLog);

// READ
router.get('/log', NotiLog.loadNotiLog);

// UPDATE

// DELETE

export default router;
