import express from "express";
import loaders from "./loaders";
import { SERVICE_PORT } from "./config";

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
