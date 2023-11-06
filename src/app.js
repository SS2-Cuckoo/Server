import express from "express";
import loaders from "./loaders/index.js";
import config from "./config/index.js";
const { SERVICE_PORT } = config;

// for Debug
console.clear();

async function startServer() {
    const app = express();

    await loaders({ app: app }); // 파라미터 이름 변경

    app.listen(SERVICE_PORT, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Your server is ready !`);
    });
}

startServer();
