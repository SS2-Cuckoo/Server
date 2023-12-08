import express from 'express';
import UserTag from '../services/UserTag.js';

const router = express.Router();

// CREATE
router.post('/userTag', UserTag.addTagToUser);

// READ
router.get('/userTag', UserTag.readTagsOfUser);

// UPDATE

// DELETE
router.delete('/userTag', UserTag.deleteTagOfUser);

export default router;
