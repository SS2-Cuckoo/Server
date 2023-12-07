import express from 'express';
import MemoTag from '../services/MemoTag.js';

const router = express.Router();

// CREATE
router.post('/memoTag', MemoTag.addTagToMemo);

// READ
router.get('/memoTag/tag', MemoTag.readTagOfMemos);
router.get('/memoTag/memo', MemoTag.readMemoOfTags);

// UPDATE

// DELETE
router.delete('/memoTag', MemoTag.deleteTagMemo);

export default router;
