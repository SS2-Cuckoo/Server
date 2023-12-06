import express from 'express';
import User from '../services/User.js';

const router = express.Router();

// CREATE
router.post('/user', User.createUser);

// READ
router.get('/user/:id', User.readUserByID);
router.get('/user/uuid/:uuid', User.readUserByUUID);

// DELETE
router.delete('/user/:type/:identifier', User.deleteUser);

export default router;
