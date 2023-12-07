import express from 'express';
import UserPreset from '../services/UserPreset.js';

const router = express.Router();

// CREATE
// router.post('/user', User.createUser);

// READ
router.get('/userPreset', UserPreset.readUserPreset);
// router.get('/user/uuid/:uuid', User.readUserByUUID);

// DELETE
// router.delete('/user/:type/:identifier', User.deleteUser);

export default router;
