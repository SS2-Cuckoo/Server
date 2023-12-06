import express from 'express';
import Memo from '../services/Memo.js';
// const Module = require("@/services/Module");

const router = express.Router();

router.get('/memo/:userID', Memo.getUserMemo);
// router.get("/:module_idx", Module.getModuleInfo);
// ... 기타 module 라우트 ...

export default router;
