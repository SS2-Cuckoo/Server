// loader.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connect from './database.js';
import memoRoutes from '../router/MemoRoute.js';
import userRoutes from '../router/UserRoute.js';
import tagRoutes from '../router/TagRoute.js';
import memoTagRoutes from '../router/MemoTagRoute.js';

// ... 기타 require ...

export default async function ({ app }) {
    // DB Connection
    await connect();

    // Middleware setup
    app.enable('trust proxy');
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Use routers
    app.use('/', userRoutes);
    app.use('/', memoRoutes);
    app.use('/', tagRoutes);
    app.use('/', memoTagRoutes);

    // Error Handling (404)
    app.use((req, res, next) => {
        const err = new Error(`Not Found: ${req.path}`);
        err.status = 404;
        next(err);
    });

    // 일반적인 에러 핸들러 (else)
    app.use((err, req, res, next) => {
        // 설정에 따라 개발 환경에서만 에러 스택을 출력하도록 조정할 수 있습니다.
        const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : {};

        res.status(err.status || 500).json({
            message: err.message,
            ...errorDetails,
        });
    });

    return app;
}
