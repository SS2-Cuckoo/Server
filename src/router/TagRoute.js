import express from 'express';
import Tag from '../services/Tag.js';

const router = express.Router();

// CREATE
router.post('/tag', Tag.createTag);

// READ
router.post('/tag/user', Tag.readUserAllTag);
router.get('/tag/:id', Tag.readTag);

// UPDATE
router.put('/tag/:id', Tag.updateTag);

// DELETE
router.delete('/tag/:id', Tag.deleteTag);

export default router;
