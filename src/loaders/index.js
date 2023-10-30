// loader.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const deviceRoutes = require("./router/Device"); // Device 라우터 가져오기
// ... 기타 require ...

module.exports = async function ({ app }) {
    // Middleware setup
    app.enable("trust proxy");
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Use routers
    // app.use("/modules", moduleRoutes);
    // ... 기타 라우트 그룹 ...

    // Error Handling (404)
    app.use((req, res, next) => {
        const err = new Error(`Not Found: ${req.path}`);
        err.status = 404;
        next(err);
    });

    // 일반적인 에러 핸들러 (else)
    app.use((err, req, res, next) => {
        // 설정에 따라 개발 환경에서만 에러 스택을 출력하도록 조정할 수 있습니다.
        const errorDetails = process.env.NODE_ENV === "development" ? err.stack : {};

        res.status(err.status || 500).json({
            message: err.message,
            ...errorDetails,
        });
    });

    return app;
};
