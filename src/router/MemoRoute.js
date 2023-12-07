import express from 'express';
import Memo from '../services/Memo.js';
// const Module = require("@/services/Module");

const router = express.Router();

// CREATE
router.post('/memo', Memo.createMemo);

// READ
router.get('/memo/user', Memo.readUserAllMemo);
router.get('/memo/:memo_id', Memo.readMemo);

// UPDATE
router.put('/memo/:memo_id', Memo.updateMemo);

// DELETE
router.delete('/memo/:memo_id', Memo.deleteMemo);

export default router;
